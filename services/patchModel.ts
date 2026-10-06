import { MODULE_DEFINITIONS, WAVEFORMS } from './moduleDefinitions.ts';
import { createModuleInstance, moduleConnectionError, resolveModule } from './modulePatch.ts';
import { toModuleInstance, toModulePatch, V1_DEFINITION_IDS } from './patchAdapter.ts';

/** v1 UI/save records stay intact; definitions and policy come from the R2 seam. */
export type SignalFamily = 'AUDIO' | 'CV' | 'GATE';
export type PatchKind = 'oscillator' | 'noise' | 'filter' | 'vca' | 'lfo' | 'delay' | 'output';
export interface PatchPort { id: string; label: string; family: SignalFamily; direction: 'in' | 'out' }
export interface PatchControl { id: string; label: string; min: number; max: number; step: number; initial: number; unit: string }
export interface PatchDefinition { name: string; subtitle: string; ports: PatchPort[]; controls: PatchControl[] }
export interface PatchModule { id: string; kind: PatchKind; controls: Record<string, number> }
export interface PatchEndpoint { moduleId: string; portId: string }
export interface PatchCable { id: string; from: PatchEndpoint; to: PatchEndpoint }
export interface SandboxPatch { modules: PatchModule[]; cables: PatchCable[] }

// Compatibility projection has the exact old JSON shape, including embedded Studio metadata.
export const PATCH_DEFINITIONS = Object.fromEntries(Object.entries(V1_DEFINITION_IDS).map(([kind, id]) => {
    const definition = MODULE_DEFINITIONS[id];
    return [kind, { name: definition.name, subtitle: definition.subtitle,
        ports: definition.ports.map(({ id, label, family, direction }) => ({ id, label, family, direction })),
        controls: definition.controls.map(({ id, label, min, max, step, initial, unit }) => ({ id, label, min, max, step, initial, unit })) }];
})) as Record<PatchKind, PatchDefinition>;
export { WAVEFORMS };
export const PALETTE: PatchKind[] = ['oscillator', 'noise', 'filter', 'vca', 'lfo', 'delay'];

export function createPatchModule(kind: PatchKind, id: string): PatchModule {
    const instance = createModuleInstance(V1_DEFINITION_IDS[kind], id);
    return { id: instance.instanceId, kind, controls: instance.controls };
}
export function createInitialPatch(): SandboxPatch {
    return { modules: [...PALETTE, 'output' as const].map(kind => createPatchModule(kind, kind)), cables: [] };
}
export function findPort(patch: SandboxPatch, endpoint: PatchEndpoint): PatchPort | undefined {
    const module = patch.modules.find(m => m.id === endpoint.moduleId);
    const port = module && resolveModule(toModuleInstance(module)).definition.ports.find(p => p.id === endpoint.portId);
    if (port?.family === 'TRIG' || port?.family === 'CLOCK') throw new Error('The frozen v1 panel cannot represent native event ports.');
    return port as PatchPort | undefined;
}
export function cableKey(cable: Pick<PatchCable, 'from' | 'to'>): string {
    return JSON.stringify([cable.from.moduleId, cable.from.portId, cable.to.moduleId, cable.to.portId]);
}
export function connectionError(patch: SandboxPatch, from: PatchEndpoint, to: PatchEndpoint): string | null {
    return moduleConnectionError(toModulePatch(patch), { instanceId: from.moduleId, portId: from.portId }, { instanceId: to.moduleId, portId: to.portId });
}
export function removePatchModule(patch: SandboxPatch, id: string): SandboxPatch {
    if (patch.modules.find(m => m.id === id)?.kind === 'output') return patch;
    return { ...patch, modules: patch.modules.filter(m => m.id !== id), cables: patch.cables.filter(c => c.from.moduleId !== id && c.to.moduleId !== id) };
}
export function setPatchControl(patch: SandboxPatch, id: string, key: string, value: number): SandboxPatch {
    if (!Number.isFinite(value)) return patch;
    return { ...patch, modules: patch.modules.map(m => {
        if (m.id !== id) return m;
        const control = resolveModule(toModuleInstance(m)).definition.controls.find(c => c.id === key);
        if (!control) return m;
        const bounded = Math.max(control.min, Math.min(control.max, value));
        return { ...m, controls: { ...m.controls, [key]: control.integer ? Math.round(bounded) : bounded } };
    }) };
}
