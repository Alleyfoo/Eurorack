import type { ModuleCable, ModuleInstance, ModulePatch } from './moduleDefinitions.ts';
import { MODULE_REGISTRY, resolveModule, validateModulePatch, type ModuleRegistry } from './modulePatch.ts';
import type { AudioVoice } from './patchBehaviors.ts';

interface Voice extends AudioVoice { instance: ModuleInstance; activatedAt?: number }
interface Route { cable: ModuleCable; source: AudioNode; target: AudioNode | AudioParam; gain: GainNode; immediate: boolean }
export interface StudioPatchSession {
    context: AudioContext;
    destination: AudioNode;
    analyser: AnalyserNode;
    release: () => Promise<void>;
}

/** Versioned definition/behavior authority layered onto Studio's existing master. */
export class PatchAudioGraph {
    private context: AudioContext | null = null;
    private voices = new Map<string, Voice>();
    private routes = new Map<string, Route>();
    private pending = new Map<ReturnType<typeof setTimeout>, Route>();
    private masterNodes: AudioNode[] = [];
    private masterInput: GainNode | null = null;
    private masterVolume: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private volume = 0.15;
    private muted = false;
    private disposed = false;
    private session: StudioPatchSession | null = null;
    private acquireSession: () => StudioPatchSession;
    private registry: ModuleRegistry;
    private failure: Error | null = null;
    private starting = false;

    constructor(acquireSession: () => StudioPatchSession, registry = MODULE_REGISTRY) {
        this.acquireSession = acquireSession; this.registry = registry;
    }
    async start(patch: ModulePatch): Promise<void> {
        if (this.disposed) throw new Error('This audio session has closed. Start a new session.');
        // Unknown dependencies, controls and topology fail before even acquiring a context.
        validateModulePatch(patch, this.registry);
        if (this.starting) throw new Error('Patch Start is already in progress.');
        this.starting = true;
        try {
            if (!this.context) {
                this.session = this.acquireSession();
                const ctx = this.session.context; this.context = ctx;
                const preparations = new Set(patch.instances.map(i => resolveModule(i, this.registry).behavior.prepare).filter(p => p !== undefined));
                for (const prepare of preparations) await prepare!(ctx);
                if (this.disposed) return;
                this.masterInput = ctx.createGain(); this.masterNodes.push(this.masterInput);
                const dcBlock = ctx.createBiquadFilter(); this.masterNodes.push(dcBlock);
                dcBlock.type = 'highpass'; dcBlock.frequency.value = 20;
                this.masterVolume = ctx.createGain(); this.masterNodes.push(this.masterVolume);
                this.masterVolume.gain.value = this.muted ? 0 : this.volume;
                this.analyser = this.session.analyser;
                this.masterInput.connect(dcBlock); dcBlock.connect(this.masterVolume);
                this.masterVolume.connect(this.session.destination);
                this.apply(patch);
            }
            const ctx = this.context;
            await ctx.resume();
            if (this.disposed) return;
            if (ctx.state !== 'running') throw new Error('Audio is suspended. Press Start audio again.');
        } catch (error) { await this.dispose(); throw error; }
        finally { this.starting = false; }
    }
    getAnalyser(): AnalyserNode | null { return this.analyser; }
    getState(): AudioContextState | 'idle' { return this.context?.state ?? 'idle'; }
    getError(): Error | null { return this.failure; }
    trigger(instanceId: string, actionId: string): void {
        const voice = this.voices.get(instanceId);
        if (!this.context || this.disposed || !voice) throw new Error('Start this patch before a manual action.');
        const { behavior } = resolveModule(voice.instance, this.registry);
        if (!behavior.actions?.includes(actionId) || !voice.action) throw new Error('Unknown selected-mode action.');
        voice.action(actionId, Math.max(this.context.currentTime + 0.005, voice.activatedAt ?? 0));
    }
    setOutput(volume: number, muted: boolean): void {
        if (!Number.isFinite(volume)) return;
        this.volume = Math.max(0, Math.min(1, volume)); this.muted = muted;
        if (this.context && this.masterVolume) this.smooth(this.masterVolume.gain, muted ? 0 : this.volume);
    }
    private smooth(param: AudioParam, value: number): void {
        param.setTargetAtTime(value, this.context!.currentTime, 0.015);
    }
    apply(patch: ModulePatch): void {
        // Complete pure preflight before any removal, allocation, update or audio startup.
        validateModulePatch(patch, this.registry);
        if (!this.context || this.disposed) return;
        for (const instance of patch.instances) {
            const behavior = resolveModule(instance, this.registry).behavior;
            if (behavior.isPrepared && !behavior.isPrepared(this.context)) throw new Error('Selected processors are not prepared; start a new patch session.');
        }
        const instances = new Map(patch.instances.map(m => [m.instanceId, m]));
        const cables = new Map(patch.cables.map(c => [c.cableId, c]));
        const replaced = new Set([...this.voices].filter(([id, voice]) => {
            const next = instances.get(id);
            return !next || next.definitionId !== voice.instance.definitionId || next.definitionVersion !== voice.instance.definitionVersion
                || JSON.stringify(next.settings) !== JSON.stringify(voice.instance.settings);
        }).map(([id]) => id));
        for (const [id, route] of this.routes) {
            const cable = cables.get(id);
            if (!cable || JSON.stringify(cable) !== JSON.stringify(route.cable) || replaced.has(route.cable.from.instanceId) || replaced.has(route.cable.to.instanceId)) this.removeRoute(id);
        }
        for (const id of replaced) { this.destroyVoice(this.voices.get(id)!); this.voices.delete(id); }
        const activate: Voice[] = [];
        for (const instance of patch.instances) {
            let voice = this.voices.get(instance.instanceId);
            if (!voice) { voice = this.createVoice(instance); this.voices.set(instance.instanceId, voice); activate.push(voice); }
            voice.update(instance.controls);
        }
        for (const cable of patch.cables) {
            if (this.routes.has(cable.cableId)) continue;
            const source = this.voices.get(cable.from.instanceId)!.outputs[cable.from.portId];
            const target = this.voices.get(cable.to.instanceId)!.inputs[cable.to.portId];
            const destination = resolveModule(instances.get(cable.to.instanceId)!, this.registry).definition;
            const port = destination.ports.find(p => p.id === cable.to.portId)!;
            const scale = port.scale;
            const immediate = port.smoothing === 'none' || port.family === 'TRIG' || port.family === 'CLOCK';
            const gain = this.context.createGain(); gain.gain.value = 0;
            source.connect(gain); gain.connect(target as AudioNode);
            if (immediate) gain.gain.value = scale; else this.smooth(gain.gain, scale);
            this.routes.set(cable.cableId, { cable: structuredClone(cable), source, target, gain, immediate });
        }
        const activationTime = this.context.currentTime + 0.025;
        for (const voice of activate) { voice.activate?.(activationTime); voice.activatedAt = activationTime; }
    }
    private removeRoute(id: string): void {
        const route = this.routes.get(id)!; this.routes.delete(id);
        if (route.immediate) { this.disconnectRoute(route); return; }
        this.smooth(route.gain.gain, 0);
        const timer = setTimeout(() => { this.disconnectRoute(route); this.pending.delete(timer); }, 100);
        this.pending.set(timer, route);
    }
    private disconnectRoute(route: Route): void {
        try { route.source.disconnect(route.gain); } catch { /* Source may already be disposed. */ }
        route.gain.disconnect();
    }
    private createVoice(instance: ModuleInstance): Voice {
        const { definition, behavior } = resolveModule(instance, this.registry);
        let initializing = true;
        const bindControls = (controls: Record<string, number>) => Object.fromEntries(definition.controls.map(c => [c.binding, controls[c.id]]));
        const processor = behavior.create({ context: this.context!, masterInput: this.masterInput!, settings: instance.settings,
            controls: bindControls(instance.controls),
            onError: error => { this.failure = error; void this.dispose(); },
            smooth: (param, value) => { if (initializing && definition.initialControlsImmediate) param.value = value; else this.smooth(param, value); } });
        return { ...processor, instance: structuredClone(instance),
            inputs: Object.fromEntries(definition.ports.filter(p => p.direction === 'in').map(p => [p.id, processor.inputs[p.binding]])),
            outputs: Object.fromEntries(definition.ports.filter(p => p.direction === 'out').map(p => [p.id, processor.outputs[p.binding]])),
            update: controls => { processor.update(bindControls(controls)); initializing = false; } };
    }
    private destroyVoice(voice: Voice): void {
        voice.dispose?.();
        for (const source of voice.sources) source.stop();
        for (const node of voice.nodes) node.disconnect();
    }
    async dispose(): Promise<void> {
        this.disposed = true;
        for (const [timer, route] of this.pending) { clearTimeout(timer); this.disconnectRoute(route); }
        this.pending.clear();
        for (const route of this.routes.values()) this.disconnectRoute(route);
        this.routes.clear();
        for (const voice of this.voices.values()) this.destroyVoice(voice);
        this.voices.clear();
        for (const node of this.masterNodes) node.disconnect();
        this.masterNodes = [];
        this.context = null; this.masterInput = null; this.masterVolume = null; this.analyser = null;
        // Clear ownership synchronously so overlapping disposal cannot release twice.
        const session = this.session; this.session = null;
        await session?.release();
    }
}
