/** R2 definitions remain frozen; R3-S adds only stream TRIG/CLOCK and typed selected settings. */
export type SignalDomain = 'AUDIO' | 'CV' | 'TRIG' | 'CLOCK';
export type SettingValue = string | boolean | number | string[] | number[];
export interface SettingDefinition { initial: SettingValue; options: SettingValue[] }
export interface PortDefinition {
    id: string; label: string; family: SignalDomain; direction: 'in' | 'out';
    binding: string; scale: number;
    accepts?: SignalDomain[]; maxConnections?: number; smoothing?: 'none';
}
export interface ControlDefinition {
    id: string; label: string; min: number; max: number; step: number;
    initial: number; unit: string; binding: string; integer?: boolean;
}
export interface ModuleDefinition {
    definitionId: string; definitionVersion: number;
    behaviorId: string; behaviorVersion: number;
    name: string; subtitle: string;
    ports: PortDefinition[]; controls: ControlDefinition[];
    settings?: Record<string, SettingDefinition>;
    productId?: string;
    initialControlsImmediate?: boolean;
}
export interface ModuleInstance {
    instanceId: string; definitionId: string; definitionVersion: number;
    controls: Record<string, number>;
    settings?: Record<string, SettingValue>;
}
export interface ModuleEndpoint { instanceId: string; portId: string }
export interface ModuleCable { cableId: string; from: ModuleEndpoint; to: ModuleEndpoint }
export interface ModulePatch { formatVersion: 1; instances: ModuleInstance[]; cables: ModuleCable[] }

const port = (id: string, label: string, family: SignalDomain, direction: 'in' | 'out', scale = 1): PortDefinition =>
    ({ id, label, family, direction, binding: id, scale });
const control = (id: string, label: string, min: number, max: number, step: number, initial: number, unit = '', integer = false): ControlDefinition =>
    ({ id, label, min, max, step, initial, unit, binding: id, ...(integer ? { integer: true } : {}) });
const definition = (id: string, name: string, subtitle: string, ports: PortDefinition[], controls: ControlDefinition[]): ModuleDefinition =>
    ({ definitionId: `prototype.${id}`, definitionVersion: 1, behaviorId: `s1a.${id}`, behaviorVersion: 1, name, subtitle, ports, controls });

export const MODULE_DEFINITIONS: Readonly<Record<string, ModuleDefinition>> = {
    'prototype.oscillator': definition('oscillator', 'Oscillator', 'Continuous tone',
        [port('pitch', 'PITCH', 'CV', 'in', 1200), port('out', 'SIGNAL', 'AUDIO', 'out')],
        [control('frequency', 'Frequency', 40, 1200, 1, 110, 'Hz'), control('waveform', 'Waveform', 0, 3, 1, 0, '', true)]),
    'prototype.noise': definition('noise', 'Noise', 'Broadband source', [port('out', 'SIGNAL', 'AUDIO', 'out')],
        [control('level', 'Level', 0, 1, 0.01, 0.3)]),
    'prototype.filter': definition('filter', 'Filter', 'Resonant low-pass',
        [port('in', 'SIGNAL', 'AUDIO', 'in'), port('cutoff', 'CUTOFF', 'CV', 'in', 2400), port('out', 'SIGNAL', 'AUDIO', 'out')],
        [control('cutoff', 'Cutoff', 40, 12000, 1, 800, 'Hz'), control('resonance', 'Resonance', 0.1, 20, 0.1, 1)]),
    'prototype.vca': definition('vca', 'VCA', 'Amplitude / open drone',
        [port('in', 'SIGNAL', 'AUDIO', 'in'), port('gain', 'GAIN', 'CV', 'in', 0.5), port('out', 'SIGNAL', 'AUDIO', 'out')],
        [control('level', 'Bias', 0, 1, 0.01, 0.5)]),
    'prototype.lfo': definition('lfo', 'LFO', 'Slow bipolar motion', [port('out', 'MODULATION', 'CV', 'out')],
        [control('rate', 'Rate', 0.02, 20, 0.01, 0.3, 'Hz'), control('amount', 'Amount', 0, 1, 0.01, 0.5)]),
    'prototype.delay': definition('delay', 'Delay', 'Patch your own feedback',
        [port('in', 'SIGNAL', 'AUDIO', 'in'), port('return', 'RETURN', 'AUDIO', 'in'), port('out', 'SIGNAL', 'AUDIO', 'out')],
        [control('time', 'Time', 0.01, 2, 0.01, 0.25, 's'), control('input', 'Input trim', 0, 1, 0.01, 0.6), control('return', 'Return trim', 0, 1.5, 0.01, 0.4)]),
    'prototype.output': definition('output', 'Output', 'Listen here', [port('in', 'MIX', 'AUDIO', 'in')], [])
};

export const WAVEFORMS: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];
