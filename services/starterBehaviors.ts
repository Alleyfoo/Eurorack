import type { AudioVoice, BehaviorContext, BehaviorDescriptor } from './patchBehaviors.ts';
import { PATCH_BEHAVIORS } from './patchBehaviors.ts';
import type { SignalDomain } from './moduleDefinitions.ts';

const loaded = new WeakMap<BaseAudioContext, Promise<void>>();
const ready = new WeakSet<BaseAudioContext>();
async function prepare(context: AudioContext): Promise<void> {
    if (!context.audioWorklet) throw new Error('These selected modes require AudioWorklet support. Patch data is preserved.');
    let promise = loaded.get(context);
    if (!promise) {
        promise = context.audioWorklet.addModule(new URL('./starterDsp.js', import.meta.url).href);
        loaded.set(context, promise);
        promise.catch(() => loaded.delete(context));
    }
    await promise;
    ready.add(context);
}
const inlet = (family: SignalDomain, clock = false) => ({ family, direction: 'in' as const, ...(clock ? { accepts: ['CLOCK' as const] } : {}) });
const outlet = (family: SignalDomain) => ({ family, direction: 'out' as const });
const audio = inlet('AUDIO'), cv = inlet('CV'), trig = inlet('TRIG', true);

function worklet(id: string, ports: BehaviorDescriptor['ports'], controls: string[], actions: string[] = [], signalPaths?: [string, string][]): BehaviorDescriptor {
    const ins = Object.entries(ports).filter(([, p]) => p.direction === 'in').map(([id]) => id);
    const outs = Object.entries(ports).filter(([, p]) => p.direction === 'out').map(([id]) => id);
    return { behaviorId: id, behaviorVersion: 1, ports, controls, actions, signalPaths, breaksAudioCycle: false, prepare, isPrepared: context => ready.has(context),
        create: ({ context, settings, controls: initial, onError }: BehaviorContext): AudioVoice => {
            if (!ready.has(context)) throw new Error('Selected processors are not prepared; start a new patch session.');
            const nodes: AudioNode[] = [];
            let workletNode: AudioWorkletNode | undefined;
            try {
                const node = new AudioWorkletNode(context, 'r3s-selected-mode-v1', {
                    numberOfInputs: ins.length, numberOfOutputs: outs.length, outputChannelCount: outs.map(() => 1),
                    channelCount: 1, channelCountMode: 'explicit', channelInterpretation: 'discrete',
                    processorOptions: { kind: id, settings, controls: initial }
                });
                workletNode = node;
                nodes.push(node);
                node.onprocessorerror = () => onError?.(new Error(`Audio processor failed: ${id}. Patch data is preserved.`));
                const inputs = Object.fromEntries(ins.map((id, index) => { const gain = context.createGain(); nodes.push(gain); gain.connect(node, 0, index); return [id, gain]; }));
                const outputs = Object.fromEntries(outs.map((id, index) => { const gain = context.createGain(); nodes.push(gain); node.connect(gain, index); return [id, gain]; }));
                return { inputs, outputs, nodes, sources: [],
                    update: controls => node.port.postMessage({ type: 'controls', controls }),
                    activate: time => node.parameters.get('enabled')!.setValueAtTime(1, time),
                    action: (action, time) => {
                        const param = node.parameters.get(action.startsWith('b.') ? 'manualB' : 'manualA')!;
                        param.setValueAtTime(1, time); param.setValueAtTime(0, time + 1 / context.sampleRate);
                    },
                    dispose: () => {
                        node.parameters.get('enabled')!.cancelScheduledValues(0); node.parameters.get('enabled')!.value = 0;
                        node.port.postMessage({ type: 'stop' }); node.port.close(); node.onprocessorerror = null;
                    }
                };
            } catch (error) {
                workletNode?.port.postMessage({ type: 'stop' }); workletNode?.port.close();
                for (const node of nodes) node.disconnect(); throw error;
            }
        }
    };
}

/** Intentionally separate from the frozen seven-entry PATCH_BEHAVIORS registry. */
export const STARTER_BEHAVIORS: Readonly<Record<string, BehaviorDescriptor>> = {
    'osc.periodic-selected': { ...PATCH_BEHAVIORS['s1a.oscillator'], behaviorId: 'osc.periodic-selected', controls: ['frequency'],
        create: context => {
            const voice = PATCH_BEHAVIORS['s1a.oscillator'].create(context);
            return { ...voice, update: controls => voice.update({ ...controls, waveform: context.settings!.waveform === 'sawtooth' ? 2 : 0 }) };
        }
    },
    'noise.color': { behaviorId: 'noise.color', behaviorVersion: 1, ports: { out: outlet('AUDIO') }, controls: ['level', 'colorCutoff'], breaksAudioCycle: false,
        create: context => {
            const voice = PATCH_BEHAVIORS['s1a.noise'].create(context);
            try {
                const filter = context.context.createBiquadFilter(); filter.type = 'lowpass'; filter.Q.value = Math.SQRT1_2;
                voice.outputs.out.connect(filter);
                return { ...voice, nodes: [...voice.nodes, filter], outputs: { out: filter }, update: c => { voice.update({ level: c.level }); context.smooth(filter.frequency, c.colorCutoff); } };
            } catch (error) { for (const source of voice.sources) source.stop(); for (const node of voice.nodes) node.disconnect(); throw error; }
        }
    },
    'audio.mix': worklet('audio.mix', { a: audio, b: audio, out: outlet('AUDIO') }, ['aLevel', 'bLevel', 'master']),
    'signal.attenuvert': worklet('signal.attenuvert', {
        in1: audio, out1: outlet('AUDIO'), in2: audio, out2: outlet('AUDIO'), in3: cv, out3: outlet('CV'), in4: cv, out4: outlet('CV')
    }, ['gain1', 'gain2', 'gain3', 'gain4'], [], [['in1', 'out1'], ['in2', 'out2'], ['in3', 'out3'], ['in4', 'out4']]),
    'signal.attenuvert.cv4': worklet('signal.attenuvert.cv4', {
        in1: cv, out1: outlet('CV'), in2: cv, out2: outlet('CV'), in3: cv, out3: outlet('CV'), in4: cv, out4: outlet('CV')
    }, ['gain1', 'gain2', 'gain3', 'gain4'], [], [['in1', 'out1'], ['in2', 'out2'], ['in3', 'out3'], ['in4', 'out4']]),
    'function.ad': worklet('function.ad', { trigger: trig, out: outlet('CV') }, ['attack', 'decay'], ['trigger']),
    'function.cycle-eoc': worklet('function.cycle-eoc', { 'a.trigger': trig, 'b.trigger': trig, 'a.out': outlet('CV'), 'b.out': outlet('CV'), 'a.eoc': outlet('TRIG'), 'b.eoc': outlet('TRIG') }, ['riseA', 'fallA', 'riseB', 'fallB'], ['a.trigger', 'b.trigger'], [['a.trigger', 'a.out'], ['a.trigger', 'a.eoc'], ['b.trigger', 'b.out'], ['b.trigger', 'b.eoc']]),
    'clock.master': worklet('clock.master', { out: outlet('CLOCK'), reset: outlet('TRIG') }, ['rate', 'pulseWidth'], ['reset']),
    'clock.divide': worklet('clock.divide', { in: inlet('CLOCK'), reset: inlet('TRIG'), out: outlet('CLOCK') }, ['division', 'phase']),
    'memory.sample-hold': worklet('memory.sample-hold', { value: cv, sample: trig, out: outlet('CV') }, ['initialValue'], ['sample']),
    'osc.linear-fm': worklet('osc.linear-fm', { pitch: cv, 'linear-fm': audio, out: outlet('AUDIO') }, ['frequency', 'fmDepth']),
    'shape.wavefolder': worklet('shape.wavefolder', { in: audio, fold: cv, out: outlet('AUDIO') }, ['fold', 'symmetry']),
    'resonator.modal': worklet('resonator.modal', { exciter: audio, pitch: cv, damping: cv, out: outlet('AUDIO') }, ['frequency', 'damping', 'structure', 'excitationPosition'])
};
