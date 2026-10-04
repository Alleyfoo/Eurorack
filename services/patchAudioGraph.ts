import { connectionError, PATCH_DEFINITIONS, WAVEFORMS, type PatchCable, type PatchModule, type SandboxPatch } from './patchModel.ts';

interface Voice {
    module: PatchModule;
    inputs: Record<string, AudioNode | AudioParam>;
    outputs: Record<string, AudioNode>;
    nodes: AudioNode[];
    sources: AudioScheduledSourceNode[];
    update: (controls: Record<string, number>) => void;
}
interface Route { cable: PatchCable; source: AudioNode; target: AudioNode | AudioParam; gain: GainNode }

function saturationCurve(amount: number, ceiling = 1): Float32Array<ArrayBuffer> {
    const curve = new Float32Array(4096);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / (curve.length - 1) * 2 - 1) * amount) * ceiling;
    return curve;
}

export interface StudioPatchSession {
    context: AudioContext;
    destination: AudioNode;
    analyser: AnalyserNode;
    release: () => Promise<void>;
}

/** Cable authority layered onto Studio's existing context and master output. */
export class PatchAudioGraph {
    private context: AudioContext | null = null;
    private voices = new Map<string, Voice>();
    private routes = new Map<string, Route>();
    private pending = new Map<ReturnType<typeof setTimeout>, Route>();
    private masterInput: GainNode | null = null;
    private masterVolume: GainNode | null = null;
    private analyser: AnalyserNode | null = null;
    private volume = 0.15;
    private muted = false;
    private disposed = false;
    private session: StudioPatchSession | null = null;

    constructor(private acquireSession: () => StudioPatchSession) {}

    async start(patch: SandboxPatch): Promise<void> {
        if (this.disposed) throw new Error('This audio session has closed. Start a new session.');
        if (!this.context) {
            this.session = this.acquireSession();
            const ctx = this.session.context;
            this.context = ctx;
            this.masterInput = ctx.createGain();
            const dcBlock = ctx.createBiquadFilter();
            dcBlock.type = 'highpass'; dcBlock.frequency.value = 20;
            this.masterVolume = ctx.createGain();
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

    apply(patch: SandboxPatch): void {
        if (!this.context || this.disposed) return;
        // Validate the same topology policy used by the UI before touching the live graph.
        const accepted: SandboxPatch = { modules: patch.modules, cables: [] };
        for (const cable of patch.cables) {
            const error = connectionError(accepted, cable.from, cable.to);
            if (error) throw new Error(error);
            accepted.cables.push(cable);
        }
        const ids = new Set(patch.modules.map(m => m.id));
        const cables = new Map(patch.cables.map(c => [c.id, c]));
        for (const [id, route] of this.routes) {
            const cable = cables.get(id);
            if (!cable || JSON.stringify(cable) !== JSON.stringify(route.cable)) this.removeRoute(id);
        }
        for (const [id, voice] of this.voices) {
            if (!ids.has(id)) { this.destroyVoice(voice); this.voices.delete(id); }
        }
        for (const module of patch.modules) {
            let voice = this.voices.get(module.id);
            if (!voice) { voice = this.createVoice(module); this.voices.set(module.id, voice); }
            voice.update(module.controls);
        }
        for (const cable of patch.cables) {
            if (this.routes.has(cable.id)) continue;
            const source = this.voices.get(cable.from.moduleId)!.outputs[cable.from.portId];
            const destination = this.voices.get(cable.to.moduleId)!;
            const target = destination.inputs[cable.to.portId];
            const gain = this.context.createGain();
            const scale = cable.to.portId === 'pitch' ? 1200 : cable.to.portId === 'cutoff' ? 2400 : cable.to.portId === 'gain' ? 0.5 : 1;
            gain.gain.value = 0;
            source.connect(gain);
            if (target instanceof AudioParam) gain.connect(target); else gain.connect(target);
            this.smooth(gain.gain, scale);
            this.routes.set(cable.id, { cable, source, target, gain });
        }
    }

    private removeRoute(id: string): void {
        const route = this.routes.get(id)!;
        this.routes.delete(id);
        this.smooth(route.gain.gain, 0);
        // Brief fade prevents cable removal clicks; other voices keep their phase.
        const timer = setTimeout(() => { this.disconnectRoute(route); this.pending.delete(timer); }, 100);
        this.pending.set(timer, route);
    }

    private disconnectRoute(route: Route): void {
        try { route.source.disconnect(route.gain); } catch { /* Source may already be disposed. */ }
        route.gain.disconnect();
    }

    private createVoice(module: PatchModule): Voice {
        const ctx = this.context!;
        const nodes: AudioNode[] = []; const sources: AudioScheduledSourceNode[] = [];
        const inputs: Voice['inputs'] = {}; const outputs: Voice['outputs'] = {};
        let update: Voice['update'] = () => {};
        if (module.kind === 'oscillator' || module.kind === 'lfo') {
            const osc = ctx.createOscillator(); const level = ctx.createGain();
            osc.connect(level); nodes.push(osc, level); sources.push(osc); outputs.out = level;
            if (module.kind === 'oscillator') inputs.pitch = osc.detune;
            update = c => {
                osc.type = module.kind === 'lfo' ? 'sine' : WAVEFORMS[Math.round(c.waveform)];
                this.smooth(osc.frequency, module.kind === 'lfo' ? c.rate : c.frequency);
                this.smooth(level.gain, module.kind === 'lfo' ? c.amount : 0.25);
            };
            level.gain.value = 0; osc.start();
        } else if (module.kind === 'noise') {
            const source = ctx.createBufferSource(); const level = ctx.createGain();
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            source.buffer = buffer; source.loop = true; source.connect(level);
            nodes.push(source, level); sources.push(source); outputs.out = level;
            level.gain.value = 0; update = c => this.smooth(level.gain, c.level);
            source.start();
        } else if (module.kind === 'filter') {
            const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; nodes.push(filter);
            inputs.in = filter; inputs.cutoff = filter.detune; outputs.out = filter;
            update = c => { this.smooth(filter.frequency, c.cutoff); this.smooth(filter.Q, c.resonance); };
        } else if (module.kind === 'vca') {
            const gain = ctx.createGain(); nodes.push(gain);
            inputs.in = gain; inputs.gain = gain.gain; outputs.out = gain;
            update = c => this.smooth(gain.gain, c.level);
        } else if (module.kind === 'delay') {
            const input = ctx.createGain(); const feedback = ctx.createGain();
            const delay = ctx.createDelay(2); const saturator = ctx.createWaveShaper();
            saturator.curve = saturationCurve(2); saturator.oversample = '4x';
            input.connect(delay); feedback.connect(delay); delay.connect(saturator);
            nodes.push(input, feedback, delay, saturator);
            inputs.in = input; inputs.return = feedback; outputs.out = saturator;
            update = c => { this.smooth(delay.delayTime, c.time); this.smooth(input.gain, c.input); this.smooth(feedback.gain, c.return); };
        } else {
            // Output is the only path to speakers. Sources have no implicit master send.
            inputs.in = this.masterInput!;
        }
        const voice = { module, inputs, outputs, nodes, sources, update };
        // Clamp all controls at the runtime boundary as well as in the UI.
        const rawUpdate = update;
        voice.update = c => rawUpdate(Object.fromEntries(PATCH_DEFINITIONS[module.kind].controls.map(def => {
            const value = c[def.id];
            return [def.id, Number.isFinite(value) ? Math.max(def.min, Math.min(def.max, value)) : def.initial];
        })));
        return voice;
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
        const ctx = this.context;
        this.masterInput?.disconnect(); this.masterVolume?.disconnect();
        this.context = null; this.masterInput = null; this.masterVolume = null; this.analyser = null;
        if (ctx) await this.session?.release();
        this.session = null;
    }
}
