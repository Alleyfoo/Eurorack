/** Session-only sandbox graph. The legacy PlayerState/save is deliberately separate. */
export type SignalFamily = 'AUDIO' | 'CV' | 'GATE';
export type PatchKind = 'oscillator' | 'noise' | 'filter' | 'vca' | 'lfo' | 'delay' | 'output';
export interface PatchPort { id: string; label: string; family: SignalFamily; direction: 'in' | 'out' }
export interface PatchControl { id: string; label: string; min: number; max: number; step: number; initial: number; unit: string }
export interface PatchDefinition { name: string; subtitle: string; ports: PatchPort[]; controls: PatchControl[] }
export interface PatchModule { id: string; kind: PatchKind; controls: Record<string, number> }
export interface PatchEndpoint { moduleId: string; portId: string }
export interface PatchCable { id: string; from: PatchEndpoint; to: PatchEndpoint }
export interface SandboxPatch { modules: PatchModule[]; cables: PatchCable[] }

const port = (id: string, label: string, family: SignalFamily, direction: 'in' | 'out'): PatchPort => ({ id, label, family, direction });
const control = (id: string, label: string, min: number, max: number, step: number, initial: number, unit = ''): PatchControl => ({ id, label, min, max, step, initial, unit });

export const PATCH_DEFINITIONS: Record<PatchKind, PatchDefinition> = {
    oscillator: {
        name: 'Oscillator', subtitle: 'Continuous tone',
        ports: [port('pitch', 'PITCH', 'CV', 'in'), port('out', 'SIGNAL', 'AUDIO', 'out')],
        controls: [control('frequency', 'Frequency', 40, 1200, 1, 110, 'Hz'), control('waveform', 'Waveform', 0, 3, 1, 0)]
    },
    noise: {
        name: 'Noise', subtitle: 'Broadband source', ports: [port('out', 'SIGNAL', 'AUDIO', 'out')],
        controls: [control('level', 'Level', 0, 1, 0.01, 0.3)]
    },
    filter: {
        name: 'Filter', subtitle: 'Resonant low-pass',
        ports: [port('in', 'SIGNAL', 'AUDIO', 'in'), port('cutoff', 'CUTOFF', 'CV', 'in'), port('out', 'SIGNAL', 'AUDIO', 'out')],
        controls: [control('cutoff', 'Cutoff', 40, 12000, 1, 800, 'Hz'), control('resonance', 'Resonance', 0.1, 20, 0.1, 1)]
    },
    vca: {
        name: 'VCA', subtitle: 'Amplitude / open drone',
        ports: [port('in', 'SIGNAL', 'AUDIO', 'in'), port('gain', 'GAIN', 'CV', 'in'), port('out', 'SIGNAL', 'AUDIO', 'out')],
        controls: [control('level', 'Bias', 0, 1, 0.01, 0.5)]
    },
    lfo: {
        name: 'LFO', subtitle: 'Slow bipolar motion', ports: [port('out', 'MODULATION', 'CV', 'out')],
        controls: [control('rate', 'Rate', 0.02, 20, 0.01, 0.3, 'Hz'), control('amount', 'Amount', 0, 1, 0.01, 0.5)]
    },
    delay: {
        name: 'Delay', subtitle: 'Patch your own feedback',
        ports: [port('in', 'SIGNAL', 'AUDIO', 'in'), port('return', 'RETURN', 'AUDIO', 'in'), port('out', 'SIGNAL', 'AUDIO', 'out')],
        controls: [control('time', 'Time', 0.01, 2, 0.01, 0.25, 's'), control('input', 'Input trim', 0, 1, 0.01, 0.6), control('return', 'Return trim', 0, 1.5, 0.01, 0.4)]
    },
    output: {
        name: 'Output', subtitle: 'Listen here', ports: [port('in', 'MIX', 'AUDIO', 'in')], controls: []
    }
};

export const PALETTE: PatchKind[] = ['oscillator', 'noise', 'filter', 'vca', 'lfo', 'delay'];
export const WAVEFORMS: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];

export function createPatchModule(kind: PatchKind, id: string): PatchModule {
    return { id, kind, controls: Object.fromEntries(PATCH_DEFINITIONS[kind].controls.map(c => [c.id, c.initial])) };
}

export function createInitialPatch(): SandboxPatch {
    return { modules: [...PALETTE, 'output' as const].map(kind => createPatchModule(kind, kind)), cables: [] };
}

export function findPort(patch: SandboxPatch, endpoint: PatchEndpoint): PatchPort | undefined {
    const module = patch.modules.find(m => m.id === endpoint.moduleId);
    return module && PATCH_DEFINITIONS[module.kind].ports.find(p => p.id === endpoint.portId);
}

export function cableKey(cable: Pick<PatchCable, 'from' | 'to'>): string {
    return JSON.stringify([cable.from.moduleId, cable.from.portId, cable.to.moduleId, cable.to.portId]);
}

/** Every AUDIO cycle must cross an explicit Delay. CV cycles are not offered in S1-A. */
export function connectionError(patch: SandboxPatch, from: PatchEndpoint, to: PatchEndpoint): string | null {
    const source = findPort(patch, from);
    const target = findPort(patch, to);
    if (!source || !target) return 'That port is no longer in the rack.';
    if (source.direction !== 'out' || target.direction !== 'in') return 'Connect an output to an input.';
    if (source.family !== target.family) return 'Match the signal: AUDIO to AUDIO, CV to CV.';
    if (patch.cables.some(c => cableKey(c) === cableKey({ from, to }))) return 'Those ports are already connected.';
    const candidate = [...patch.cables, { id: 'candidate', from, to }];
    const edges = candidate.filter(c => {
        const module = patch.modules.find(m => m.id === c.from.moduleId);
        return findPort(patch, c.from)?.family === 'AUDIO' && module?.kind !== 'delay';
    });
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const cycle = (id: string): boolean => {
        if (visiting.has(id)) return true;
        if (visited.has(id)) return false;
        visiting.add(id);
        if (edges.some(c => c.from.moduleId === id && cycle(c.to.moduleId))) return true;
        visiting.delete(id);
        visited.add(id);
        return false;
    };
    if (patch.modules.some(m => cycle(m.id))) return 'Put a Delay in this audio loop, then patch its return.';
    return null;
}

export function removePatchModule(patch: SandboxPatch, id: string): SandboxPatch {
    if (patch.modules.find(m => m.id === id)?.kind === 'output') return patch;
    return { modules: patch.modules.filter(m => m.id !== id), cables: patch.cables.filter(c => c.from.moduleId !== id && c.to.moduleId !== id) };
}

export function setPatchControl(patch: SandboxPatch, id: string, key: string, value: number): SandboxPatch {
    if (!Number.isFinite(value)) return patch;
    return { ...patch, modules: patch.modules.map(m => {
        const control = PATCH_DEFINITIONS[m.kind].controls.find(c => c.id === key);
        return m.id === id && control ? { ...m, controls: { ...m.controls, [key]: Math.max(control.min, Math.min(control.max, value)) } } : m;
    }) };
}
