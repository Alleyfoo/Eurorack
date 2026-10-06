import { WAVEFORMS, type SignalDomain } from './moduleDefinitions.ts';

export interface AudioVoice {
    inputs: Record<string, AudioNode | AudioParam>;
    outputs: Record<string, AudioNode>;
    nodes: AudioNode[];
    sources: AudioScheduledSourceNode[];
    update: (controls: Record<string, number>) => void;
}
export interface BehaviorContext {
    context: AudioContext;
    masterInput: AudioNode;
    smooth: (param: AudioParam, value: number) => void;
}
export interface BehaviorDescriptor {
    behaviorId: string; behaviorVersion: number;
    ports: Record<string, { direction: 'in' | 'out'; family: SignalDomain }>;
    controls: string[];
    breaksAudioCycle: boolean;
    create: (context: BehaviorContext) => AudioVoice;
}

function saturationCurve(amount: number, ceiling = 1): Float32Array<ArrayBuffer> {
    const curve = new Float32Array(4096);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / (curve.length - 1) * 2 - 1) * amount) * ceiling;
    return curve;
}
const audioIn = { direction: 'in', family: 'AUDIO' } as const;
const audioOut = { direction: 'out', family: 'AUDIO' } as const;
const cvIn = { direction: 'in', family: 'CV' } as const;
const cvOut = { direction: 'out', family: 'CV' } as const;

/** Lifted S1-A processors: registry keys, never display names, select factories. */
export const PATCH_BEHAVIORS: Readonly<Record<string, BehaviorDescriptor>> = {
    's1a.oscillator': {
        behaviorId: 's1a.oscillator', behaviorVersion: 1, ports: { pitch: cvIn, out: audioOut },
        controls: ['frequency', 'waveform'], breaksAudioCycle: false,
        create: ({ context: ctx, smooth }) => {
            const osc = ctx.createOscillator(); const level = ctx.createGain();
            osc.connect(level); level.gain.value = 0; osc.start();
            return { inputs: { pitch: osc.detune }, outputs: { out: level }, nodes: [osc, level], sources: [osc],
                update: c => { osc.type = WAVEFORMS[c.waveform]; smooth(osc.frequency, c.frequency); smooth(level.gain, 0.25); } };
        }
    },
    's1a.noise': {
        behaviorId: 's1a.noise', behaviorVersion: 1, ports: { out: audioOut }, controls: ['level'], breaksAudioCycle: false,
        create: ({ context: ctx, smooth }) => {
            const source = ctx.createBufferSource(); const level = ctx.createGain();
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            source.buffer = buffer; source.loop = true; source.connect(level);
            level.gain.value = 0; source.start();
            return { inputs: {}, outputs: { out: level }, nodes: [source, level], sources: [source], update: c => smooth(level.gain, c.level) };
        }
    },
    's1a.filter': {
        behaviorId: 's1a.filter', behaviorVersion: 1, ports: { in: audioIn, cutoff: cvIn, out: audioOut },
        controls: ['cutoff', 'resonance'], breaksAudioCycle: false,
        create: ({ context: ctx, smooth }) => {
            const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
            return { inputs: { in: filter, cutoff: filter.detune }, outputs: { out: filter }, nodes: [filter], sources: [],
                update: c => { smooth(filter.frequency, c.cutoff); smooth(filter.Q, c.resonance); } };
        }
    },
    's1a.vca': {
        behaviorId: 's1a.vca', behaviorVersion: 1, ports: { in: audioIn, gain: cvIn, out: audioOut }, controls: ['level'], breaksAudioCycle: false,
        create: ({ context: ctx, smooth }) => {
            const gain = ctx.createGain();
            return { inputs: { in: gain, gain: gain.gain }, outputs: { out: gain }, nodes: [gain], sources: [], update: c => smooth(gain.gain, c.level) };
        }
    },
    's1a.lfo': {
        behaviorId: 's1a.lfo', behaviorVersion: 1, ports: { out: cvOut }, controls: ['rate', 'amount'], breaksAudioCycle: false,
        create: ({ context: ctx, smooth }) => {
            const osc = ctx.createOscillator(); const level = ctx.createGain();
            osc.connect(level); level.gain.value = 0; osc.start();
            return { inputs: {}, outputs: { out: level }, nodes: [osc, level], sources: [osc],
                update: c => { osc.type = 'sine'; smooth(osc.frequency, c.rate); smooth(level.gain, c.amount); } };
        }
    },
    's1a.delay': {
        behaviorId: 's1a.delay', behaviorVersion: 1, ports: { in: audioIn, return: audioIn, out: audioOut },
        controls: ['time', 'input', 'return'], breaksAudioCycle: true,
        create: ({ context: ctx, smooth }) => {
            const input = ctx.createGain(); const feedback = ctx.createGain();
            const delay = ctx.createDelay(2); const saturator = ctx.createWaveShaper();
            saturator.curve = saturationCurve(2); saturator.oversample = '4x';
            input.connect(delay); feedback.connect(delay); delay.connect(saturator);
            return { inputs: { in: input, return: feedback }, outputs: { out: saturator }, nodes: [input, feedback, delay, saturator], sources: [],
                update: c => { smooth(delay.delayTime, c.time); smooth(input.gain, c.input); smooth(feedback.gain, c.return); } };
        }
    },
    's1a.output': {
        behaviorId: 's1a.output', behaviorVersion: 1, ports: { in: audioIn }, controls: [], breaksAudioCycle: false,
        // Output alone exposes the shared master. No source has an implicit send.
        create: ({ masterInput }) => ({ inputs: { in: masterInput }, outputs: {}, nodes: [], sources: [], update: () => {} })
    }
};
