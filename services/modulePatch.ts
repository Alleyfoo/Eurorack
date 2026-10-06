import { MODULE_DEFINITIONS, type ModuleDefinition, type ModuleInstance, type ModulePatch, type ModuleEndpoint } from './moduleDefinitions.ts';
import { PATCH_BEHAVIORS, type BehaviorDescriptor } from './patchBehaviors.ts';

/** Direct bindings for seven processors; injectable for contract tests, not a plugin system. */
export interface ModuleRegistry {
    definitions: Readonly<Record<string, ModuleDefinition>>;
    behaviors: Readonly<Record<string, BehaviorDescriptor>>;
}
export const MODULE_REGISTRY: ModuleRegistry = { definitions: MODULE_DEFINITIONS, behaviors: PATCH_BEHAVIORS };
const validId = (id: unknown): id is string => typeof id === 'string' && id.trim().length > 0;

export function resolveModule(instance: ModuleInstance, registry = MODULE_REGISTRY): { definition: ModuleDefinition; behavior: BehaviorDescriptor } {
    if (!instance || !validId(instance.instanceId)) throw new Error('Invalid module instance ID. Stored data is unchanged.');
    const definition = Object.hasOwn(registry.definitions, instance.definitionId) ? registry.definitions[instance.definitionId] : undefined;
    if (!definition || definition.definitionId !== instance.definitionId) throw new Error(`Unknown module definition: ${instance.definitionId}. Stored data is unchanged.`);
    if (instance.definitionVersion !== definition.definitionVersion) throw new Error(`Unsupported definition version: ${instance.definitionId}. Stored data is unchanged.`);
    const behavior = Object.hasOwn(registry.behaviors, definition.behaviorId) ? registry.behaviors[definition.behaviorId] : undefined;
    if (!behavior || behavior.behaviorId !== definition.behaviorId) throw new Error(`Missing behavior: ${definition.behaviorId}. Stored data is unchanged.`);
    if (definition.behaviorVersion !== behavior.behaviorVersion) throw new Error(`Unsupported behavior version: ${definition.behaviorId}. Stored data is unchanged.`);
    const portIds = new Set<string>();
    const portBindings = new Set<string>();
    for (const port of definition.ports) {
        const binding = Object.hasOwn(behavior.ports, port.binding) ? behavior.ports[port.binding] : undefined;
        if (!validId(port.id) || portIds.has(port.id) || portBindings.has(port.binding) || !binding || port.direction !== binding.direction || port.family !== binding.family || !Number.isFinite(port.scale)) throw new Error('Invalid definition port binding.');
        portIds.add(port.id); portBindings.add(port.binding);
    }
    if (portBindings.size !== Object.keys(behavior.ports).length) throw new Error('Missing definition port binding.');
    const controls = instance.controls;
    if (!controls || typeof controls !== 'object' || Array.isArray(controls)) throw new Error('Invalid module controls.');
    const controlIds = new Set<string>();
    const controlBindings = new Set<string>();
    for (const control of definition.controls) {
        if (!validId(control.id) || controlIds.has(control.id) || controlBindings.has(control.binding) || !behavior.controls.includes(control.binding)
            || ![control.min, control.max, control.initial, control.step].every(Number.isFinite) || control.min > control.max || control.step <= 0
            || control.initial < control.min || control.initial > control.max) throw new Error('Invalid definition control binding.');
        const value = controls[control.id];
        if (!Number.isFinite(value) || value < control.min || value > control.max || (control.integer && !Number.isInteger(value))) throw new Error(`Invalid module control: ${control.id}.`);
        controlIds.add(control.id); controlBindings.add(control.binding);
    }
    if (controlBindings.size !== behavior.controls.length) throw new Error('Missing definition control binding.');
    if (Object.keys(controls).some(id => !controlIds.has(id))) throw new Error('Unknown module control. Stored data is unchanged.');
    return { definition, behavior };
}

export function createModuleInstance(definitionId: string, instanceId: string, registry = MODULE_REGISTRY): ModuleInstance {
    const definition = Object.hasOwn(registry.definitions, definitionId) ? registry.definitions[definitionId] : undefined;
    if (!definition) throw new Error(`Unknown module definition: ${definitionId}.`);
    const instance = { instanceId, definitionId, definitionVersion: definition.definitionVersion,
        controls: Object.fromEntries(definition.controls.map(c => [c.id, c.initial])) };
    resolveModule(instance, registry);
    return instance;
}

export function modulePort(patch: ModulePatch, endpoint: ModuleEndpoint, registry = MODULE_REGISTRY) {
    const instance = patch.instances.find(m => m.instanceId === endpoint?.instanceId);
    return instance && resolveModule(instance, registry).definition.ports.find(p => p.id === endpoint.portId);
}
const cableKey = (from: ModuleEndpoint, to: ModuleEndpoint) => JSON.stringify([from.instanceId, from.portId, to.instanceId, to.portId]);

/** Preserve additive fan-in, free fan-out and the existing Delay-only audio cycle policy. */
export function moduleConnectionError(patch: ModulePatch, from: ModuleEndpoint, to: ModuleEndpoint, registry = MODULE_REGISTRY): string | null {
    const source = modulePort(patch, from, registry); const target = modulePort(patch, to, registry);
    if (!source || !target) return 'That port is no longer in the rack.';
    if (source.direction !== 'out' || target.direction !== 'in') return 'Connect an output to an input.';
    if (source.family !== target.family) return 'Match the signal: AUDIO to AUDIO, CV to CV.';
    if (patch.cables.some(c => cableKey(c.from, c.to) === cableKey(from, to))) return 'Those ports are already connected.';
    const delayed = new Set(patch.instances.filter(m => resolveModule(m, registry).behavior.breaksAudioCycle).map(m => m.instanceId));
    const edges = [...patch.cables, { from, to }].filter(c => modulePort(patch, c.from, registry)?.family === 'AUDIO' && !delayed.has(c.from.instanceId));
    const visiting = new Set<string>(); const visited = new Set<string>();
    const cycle = (id: string): boolean => {
        if (visiting.has(id)) return true;
        if (visited.has(id)) return false;
        visiting.add(id);
        if (edges.some(c => c.from.instanceId === id && cycle(c.to.instanceId))) return true;
        visiting.delete(id); visited.add(id); return false;
    };
    return patch.instances.some(m => cycle(m.instanceId)) ? 'Put a Delay in this audio loop, then patch its return.' : null;
}

export function validateModulePatch(value: unknown, registry = MODULE_REGISTRY): asserts value is ModulePatch {
    const patch = value as ModulePatch;
    if (!patch || patch.formatVersion !== 1) throw new Error('Unsupported patch format version. Stored data is unchanged.');
    if (!Array.isArray(patch.instances) || !Array.isArray(patch.cables)) throw new Error('Invalid patch data.');
    const ids = new Set<string>();
    for (const instance of patch.instances) {
        resolveModule(instance, registry);
        if (ids.has(instance.instanceId)) throw new Error('Duplicate module instance ID.');
        ids.add(instance.instanceId);
    }
    const accepted: ModulePatch = { formatVersion: 1, instances: patch.instances, cables: [] };
    const cables = new Set<string>();
    for (const cable of patch.cables) {
        if (!cable || !validId(cable.cableId) || cables.has(cable.cableId) || !cable.from || !cable.to) throw new Error('Invalid or duplicate cable ID.');
        const error = moduleConnectionError(accepted, cable.from, cable.to, registry);
        if (error) throw new Error(error);
        cables.add(cable.cableId); accepted.cables.push(cable);
    }
}

export function serializeModulePatch(patch: ModulePatch, registry = MODULE_REGISTRY): string {
    validateModulePatch(patch, registry); return JSON.stringify(patch);
}
export function parseModulePatch(raw: string, registry = MODULE_REGISTRY): ModulePatch {
    const patch: unknown = JSON.parse(raw); validateModulePatch(patch, registry); return patch;
}
