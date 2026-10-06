/** Closed R3-S sample processors. Also imported directly by numerical tests.
 * No timers, event queues, UI state or AudioContext allocation in this module.
 */
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const rising = (x, previous) => x >= 0.5 && previous < 0.5;
export function foldSample(x) {
    const p = ((x + 1) % 4 + 4) % 4;
    return p <= 2 ? p - 1 : 3 - p;
}
export class ADContour {
    constructor() { this.position = 0; this.active = false; this.pendingCycle = false; this.previous = 0; this.manual = 0; }
    sample(trigger, manual, attack, decay, curve, cycle, rate) {
        const edge = rising(trigger, this.previous) || rising(manual, this.manual);
        this.previous = trigger; this.manual = manual;
        if (edge || this.pendingCycle) { this.position = 0; this.active = true; this.pendingCycle = false; }
        if (!this.active) return [0, 0];
        const a = Math.max(1, Math.ceil(attack * rate)), d = Math.max(1, Math.ceil(decay * rate));
        const pos = this.position++;
        let value;
        if (pos < a) { const t = (pos + 1) / a; value = curve === 'linear' ? t : Math.expm1(5 * t) / Math.expm1(5); }
        else { const t = (pos - a + 1) / d; value = curve === 'linear' ? 1 - t : (Math.exp(-5 * t) - Math.exp(-5)) / (1 - Math.exp(-5)); }
        if (pos >= a + d - 1) { this.active = false; this.pendingCycle = cycle; return [0, 1]; }
        return [value, 0];
    }
}

const KINDS = ['audio.mix', 'signal.attenuvert', 'signal.attenuvert.cv4', 'function.ad', 'function.cycle-eoc',
    'clock.master', 'clock.divide', 'memory.sample-hold', 'osc.linear-fm', 'shape.wavefolder', 'resonator.modal'];
export class StarterKernel {
    constructor(kind, rate, controls, settings = {}) {
        if (!KINDS.includes(kind)) throw new Error(`Unknown selected processor: ${kind}`);
        this.kind = kind; this.rate = rate; this.controls = { ...controls }; this.settings = settings;
        this.phase = settings.initialPhase ?? 0; this.previous = 0; this.resetPrevious = 0;
        this.count = 0; this.selected = false; this.held = controls.initialValue ?? 0;
        this.ad = new ADContour(); this.a = new ADContour(); this.b = new ADContour();
        this.a.pendingCycle = settings.cycleA === true; this.b.pendingCycle = settings.cycleB === true;
        this.modes = [[0, 0], [0, 0], [0, 0]];
    }
    /** One sample, inputs in descriptor order; manual actions are unsaved a-rate pulses. */
    sample(input, manualA = 0, manualB = 0) {
        const c = this.controls, s = this.settings, sr = this.rate;
        switch (this.kind) {
            case 'audio.mix': return [(input[0] * c.aLevel + input[1] * c.bLevel) * c.master];
            case 'signal.attenuvert': case 'signal.attenuvert.cv4':
                return input.map((v, i) => v * c[`gain${i + 1}`]);
            case 'function.ad': return [this.ad.sample(input[0], manualA, c.attack, c.decay, s.curve, false, sr)[0]];
            case 'function.cycle-eoc': {
                const a = this.a.sample(input[0], manualA, c.riseA, c.fallA, s.curveA, s.cycleA, sr);
                const b = this.b.sample(input[1], manualB, c.riseB, c.fallB, s.curveB, s.cycleB, sr);
                return [a[0], b[0], a[1], b[1]];
            }
            case 'clock.master': {
                const reset = rising(manualA, this.resetPrevious); this.resetPrevious = manualA;
                if (reset) this.phase = 0;
                if (!s.run) return [0, reset ? 1 : 0];
                const pulse = this.phase < c.pulseWidth ? 1 : 0;
                this.phase = (this.phase + c.rate / sr) % 1;
                return [pulse, reset ? 1 : 0];
            }
            case 'clock.divide': {
                // Reset before a coincident source edge; phase zero emits on first edge.
                if (rising(input[1], this.resetPrevious)) { this.count = 0; this.selected = false; this.previous = 0; }
                this.resetPrevious = input[1];
                if (rising(input[0], this.previous)) { this.selected = this.count % c.division === c.phase % c.division; this.count = (this.count + 1) % c.division; }
                this.previous = input[0];
                return [input[0] >= 0.5 && this.selected ? 1 : 0];
            }
            case 'memory.sample-hold': {
                if (rising(input[1], this.previous) || rising(manualA, this.resetPrevious)) this.held = input[0];
                this.previous = input[1]; this.resetPrevious = manualA;
                return [this.held];
            }
            case 'osc.linear-fm': {
                const hz = clamp(c.frequency * 2 ** input[0] + c.fmDepth * input[1], s.frequencyBoundsHz[0], Math.min(s.frequencyBoundsHz[1], sr * 0.45));
                const value = 0.25 * Math.sin(2 * Math.PI * this.phase);
                this.phase = (this.phase + hz / sr) % 1;
                return [value];
            }
            case 'shape.wavefolder':
                return [foldSample(input[0] * Math.max(0, c.fold + s.foldCvDepth * input[1]) + c.symmetry)];
            case 'resonator.modal': {
                const damping = clamp(c.damping + s.dampingCvDepth * input[2], 0, 1);
                const r = Math.exp(-(3 + 25 * damping) / sr);
                let sum = 0;
                for (let i = 0; i < 3; i++) {
                    const hz = clamp(c.frequency * 2 ** input[1] * s.modeRatios[i] * (1 + c.structure * i * 0.1), 20, sr * 0.45);
                    const angle = 2 * Math.PI * hz / sr, cos = Math.cos(angle), sin = Math.sin(angle);
                    const [re, im] = this.modes[i];
                    const weight = Math.sin((i + 1) * Math.PI * c.excitationPosition) / (i + 1);
                    // Stable damped quadrature modes; energy only enters through exciter.
                    this.modes[i][0] = r * (cos * re - sin * im) + input[0] * weight * (1 - r) * 8;
                    this.modes[i][1] = r * (sin * re + cos * im);
                    if (Math.abs(this.modes[i][0]) + Math.abs(this.modes[i][1]) < 1e-15) this.modes[i] = [0, 0];
                    sum += this.modes[i][1];
                }
                return [sum];
            }
        }
    }
}

// A single closed dispatcher, not a patch/event scheduler. Web Audio owns routing.
if (typeof registerProcessor === 'function') {
    class SelectedModeProcessor extends AudioWorkletProcessor {
        static get parameterDescriptors() {
            return ['enabled', 'manualA', 'manualB'].map(name => ({ name, defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'a-rate' }));
        }
        constructor(options) {
            super();
            const { kind, controls, settings } = options.processorOptions;
            this.kernel = new StarterKernel(kind, sampleRate, controls, settings);
            this.stopped = false;
            this.port.onmessage = ({ data }) => {
                if (data.type === 'stop') this.stopped = true;
                else if (data.type === 'controls') this.kernel.controls = data.controls;
            };
        }
        process(inputs, outputs, parameters) {
            if (this.stopped) return false;
            const length = outputs[0][0].length;
            const value = (name, i) => parameters[name][parameters[name].length === 1 ? 0 : i];
            for (let i = 0; i < length; i++) {
                // No phase/counter/contour advancement until graph wiring and Start activation.
                if (value('enabled', i) < 0.5) continue;
                const result = this.kernel.sample(inputs.map(channels => channels[0]?.[i] ?? 0), value('manualA', i), value('manualB', i));
                for (let j = 0; j < outputs.length; j++) outputs[j][0][i] = result[j];
            }
            return true;
        }
    }
    registerProcessor('r3s-selected-mode-v1', SelectedModeProcessor);
}
