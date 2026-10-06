import type { ModuleCable, ModuleInstance, ModulePatch } from './moduleDefinitions.ts';
import { MODULE_REGISTRY, resolveModule, validateModulePatch, type ModuleRegistry } from './modulePatch.ts';
import type { AudioVoice } from './patchBehaviors.ts';

interface Voice extends AudioVoice { instance: ModuleInstance }
interface Route { cable: ModuleCable; source: AudioNode; target: AudioNode | AudioParam; gain: GainNode }
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

    constructor(acquireSession: () => StudioPatchSession, registry = MODULE_REGISTRY) {
        this.acquireSession = acquireSession; this.registry = registry;
    }
    async start(patch: ModulePatch): Promise<void> {
        if (this.disposed) throw new Error('This audio session has closed. Start a new session.');
        // Unknown dependencies, controls and topology fail before even acquiring a context.
        validateModulePatch(patch, this.registry);
        if (!this.context) {
            try {
                this.session = this.acquireSession();
                const ctx = this.session.context; this.context = ctx;
                this.masterInput = ctx.createGain(); this.masterNodes.push(this.masterInput);
                const dcBlock = ctx.createBiquadFilter(); this.masterNodes.push(dcBlock);
                dcBlock.type = 'highpass'; dcBlock.frequency.value = 20;
                this.masterVolume = ctx.createGain(); this.masterNodes.push(this.masterVolume);
                this.masterVolume.gain.value = this.muted ? 0 : this.volume;
                this.analyser = this.session.analyser;
                this.masterInput.connect(dcBlock); dcBlock.connect(this.masterVolume);
                this.masterVolume.connect(this.session.destination);
                this.apply(patch);
            } catch (error) {
                await this.dispose(); throw error;
            }
        }
        const ctx = this.context;
        await ctx.resume();
        if (this.disposed) return;
        if (ctx.state !== 'running') throw new Error('Audio is suspended. Press Start audio again.');
    }
    getAnalyser(): AnalyserNode | null { return this.analyser; }
    getState(): AudioContextState | 'idle' { return this.context?.state ?? 'idle'; }
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
        const instances = new Map(patch.instances.map(m => [m.instanceId, m]));
        const cables = new Map(patch.cables.map(c => [c.cableId, c]));
        const replaced = new Set([...this.voices].filter(([id, voice]) => {
            const next = instances.get(id);
            return !next || next.definitionId !== voice.instance.definitionId || next.definitionVersion !== voice.instance.definitionVersion;
        }).map(([id]) => id));
        for (const [id, route] of this.routes) {
            const cable = cables.get(id);
            if (!cable || JSON.stringify(cable) !== JSON.stringify(route.cable) || replaced.has(route.cable.from.instanceId) || replaced.has(route.cable.to.instanceId)) this.removeRoute(id);
        }
        for (const id of replaced) { this.destroyVoice(this.voices.get(id)!); this.voices.delete(id); }
        for (const instance of patch.instances) {
            let voice = this.voices.get(instance.instanceId);
            if (!voice) { voice = this.createVoice(instance); this.voices.set(instance.instanceId, voice); }
            voice.update(instance.controls);
        }
        for (const cable of patch.cables) {
            if (this.routes.has(cable.cableId)) continue;
            const source = this.voices.get(cable.from.instanceId)!.outputs[cable.from.portId];
            const target = this.voices.get(cable.to.instanceId)!.inputs[cable.to.portId];
            const destination = resolveModule(instances.get(cable.to.instanceId)!, this.registry).definition;
            const scale = destination.ports.find(p => p.id === cable.to.portId)!.scale;
            const gain = this.context.createGain(); gain.gain.value = 0;
            source.connect(gain); gain.connect(target as AudioNode);
            this.smooth(gain.gain, scale);
            this.routes.set(cable.cableId, { cable: structuredClone(cable), source, target, gain });
        }
    }
    private removeRoute(id: string): void {
        const route = this.routes.get(id)!; this.routes.delete(id);
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
        const processor = behavior.create({ context: this.context!, masterInput: this.masterInput!, smooth: (param, value) => this.smooth(param, value) });
        return { ...processor, instance: structuredClone(instance),
            inputs: Object.fromEntries(definition.ports.filter(p => p.direction === 'in').map(p => [p.id, processor.inputs[p.binding]])),
            outputs: Object.fromEntries(definition.ports.filter(p => p.direction === 'out').map(p => [p.id, processor.outputs[p.binding]])),
            update: controls => processor.update(Object.fromEntries(definition.controls.map(c => [c.binding, controls[c.id]]))) };
    }
    private destroyVoice(voice: Voice): void {
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
