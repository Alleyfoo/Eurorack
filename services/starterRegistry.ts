import { MODULE_REGISTRY, type ModuleRegistry } from './modulePatch.ts';
import { STARTER_DEFINITIONS } from './starterDefinitions.ts';
import { STARTER_BEHAVIORS } from './starterBehaviors.ts';

/** Explicit opt-in for native R3-S fixtures. Studio and the v1 adapter use MODULE_REGISTRY. */
export const STARTER_REGISTRY: ModuleRegistry = {
    definitions: { ...MODULE_REGISTRY.definitions, ...STARTER_DEFINITIONS },
    behaviors: { ...MODULE_REGISTRY.behaviors, ...STARTER_BEHAVIORS }
};
