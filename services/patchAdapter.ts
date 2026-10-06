import type { PatchKind, PatchModule, SandboxPatch } from './patchModel.ts';
import type { ModuleInstance, ModulePatch } from './moduleDefinitions.ts';
import { resolveModule, validateModulePatch } from './modulePatch.ts';

/** Frozen v1 meaning: never infer definitions from saved labels, rarity or MASTER_POOL. */
export const V1_DEFINITION_IDS: Readonly<Record<PatchKind, string>> = {
    oscillator: 'prototype.oscillator', noise: 'prototype.noise', filter: 'prototype.filter',
    vca: 'prototype.vca', lfo: 'prototype.lfo', delay: 'prototype.delay', output: 'prototype.output'
};

export function toModuleInstance(module: PatchModule): ModuleInstance {
    if (!module || !Object.hasOwn(V1_DEFINITION_IDS, module.kind)) throw new Error('Unknown saved module dependency. Stored data has been preserved.');
    const instance = { instanceId: module.id, definitionId: V1_DEFINITION_IDS[module.kind], definitionVersion: 1, controls: structuredClone(module.controls) };
    resolveModule(instance);
    return instance;
}
export function toModulePatch(patch: SandboxPatch): ModulePatch {
    if (!patch || !Array.isArray(patch.modules) || !Array.isArray(patch.cables)) throw new Error('Invalid saved patch.');
    const result: ModulePatch = { formatVersion: 1, instances: patch.modules.map(toModuleInstance), cables: patch.cables.map(c => {
        if (!c || !c.from || !c.to) throw new Error('Invalid cable record.');
        return { cableId: c.id, from: { instanceId: c.from.moduleId, portId: c.from.portId }, to: { instanceId: c.to.moduleId, portId: c.to.portId } };
    }) };
    validateModulePatch(result);
    return result;
}

/** Reattach exact v1 metadata/provenance. No in-place save migration or ownership grant. */
export function fromModulePatch(patch: ModulePatch, original: SandboxPatch): SandboxPatch {
    validateModulePatch(patch);
    return { ...structuredClone(original), modules: patch.instances.map(instance => {
        const source = original.modules.find(m => m.id === instance.instanceId);
        if (!source || V1_DEFINITION_IDS[source.kind] !== instance.definitionId) throw new Error('No matching v1 instance; explicit resolution is required.');
        return { ...structuredClone(source), controls: structuredClone(instance.controls) };
    }), cables: patch.cables.map(c => ({ id: c.cableId, from: { moduleId: c.from.instanceId, portId: c.from.portId }, to: { moduleId: c.to.instanceId, portId: c.to.portId } })) };
}
