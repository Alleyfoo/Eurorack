import type { ModulePatch } from '../../services/moduleDefinitions.ts';

/** Ordinary R2 serialization/build fixture, never offered as a starter rack. */
export const sevenBehaviorPatch: ModulePatch = {
    formatVersion: 1,
    instances: [
        { instanceId: 'tone', definitionId: 'prototype.oscillator', definitionVersion: 1, controls: { frequency: 220, waveform: 2 } },
        { instanceId: 'noise', definitionId: 'prototype.noise', definitionVersion: 1, controls: { level: 0.12 } },
        { instanceId: 'filter', definitionId: 'prototype.filter', definitionVersion: 1, controls: { cutoff: 1500, resonance: 3 } },
        { instanceId: 'vca', definitionId: 'prototype.vca', definitionVersion: 1, controls: { level: 0.4 } },
        { instanceId: 'lfo', definitionId: 'prototype.lfo', definitionVersion: 1, controls: { rate: 0.7, amount: 0.3 } },
        { instanceId: 'delay', definitionId: 'prototype.delay', definitionVersion: 1, controls: { time: 0.3, input: 0.6, return: 0.4 } },
        { instanceId: 'output', definitionId: 'prototype.output', definitionVersion: 1, controls: {} }
    ],
    cables: [
        { cableId: 'tone-filter', from: { instanceId: 'tone', portId: 'out' }, to: { instanceId: 'filter', portId: 'in' } },
        { cableId: 'noise-filter', from: { instanceId: 'noise', portId: 'out' }, to: { instanceId: 'filter', portId: 'in' } },
        { cableId: 'filter-vca', from: { instanceId: 'filter', portId: 'out' }, to: { instanceId: 'vca', portId: 'in' } },
        { cableId: 'vca-delay', from: { instanceId: 'vca', portId: 'out' }, to: { instanceId: 'delay', portId: 'in' } },
        { cableId: 'delay-return', from: { instanceId: 'delay', portId: 'out' }, to: { instanceId: 'delay', portId: 'return' } },
        { cableId: 'delay-output', from: { instanceId: 'delay', portId: 'out' }, to: { instanceId: 'output', portId: 'in' } },
        { cableId: 'lfo-pitch', from: { instanceId: 'lfo', portId: 'out' }, to: { instanceId: 'tone', portId: 'pitch' } },
        { cableId: 'lfo-cutoff', from: { instanceId: 'lfo', portId: 'out' }, to: { instanceId: 'filter', portId: 'cutoff' } },
        { cableId: 'lfo-gain', from: { instanceId: 'lfo', portId: 'out' }, to: { instanceId: 'vca', portId: 'gain' } }
    ]
};
