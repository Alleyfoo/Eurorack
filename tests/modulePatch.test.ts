import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MODULE_REGISTRY, createModuleInstance, moduleConnectionError, parseModulePatch, resolveModule, serializeModulePatch, validateModulePatch } from '../services/modulePatch.ts';
import { fromModulePatch, toModulePatch } from '../services/patchAdapter.ts';
import { MODULE_DEFINITIONS } from '../services/moduleDefinitions.ts';
import { PATCH_BEHAVIORS } from '../services/patchBehaviors.ts';
import { PATCH_DEFINITIONS, setPatchControl, type SandboxPatch } from '../services/patchModel.ts';
import { currentPatch, closeBranch, forkArchive, missingDependencies, resumeBranch, updatePatch, validateStudioState } from '../services/studioModel.ts';
import { loadStudio, saveStudio, STUDIO_SAVE_KEY } from '../services/studioStorage.ts';
import { sevenBehaviorPatch } from './fixtures/sevenBehaviorPatch.ts';

const fixtureRaw = readFileSync(new URL('./fixtures/studio-v1-pre-r2.json', import.meta.url), 'utf8');
const fixture = () => validateStudioState(JSON.parse(fixtureRaw));

test('seven versioned definitions round-trip an ordinary explicit graph with exact IDs and numeric values', () => {
    assert.equal(Object.keys(MODULE_DEFINITIONS).length, 7);
    assert.equal(Object.keys(PATCH_BEHAVIORS).length, 7);
    assert.deepEqual(parseModulePatch(serializeModulePatch(sevenBehaviorPatch)), sevenBehaviorPatch);
    assert.equal(resolveModule(sevenBehaviorPatch.instances[0]).definition.ports[0].family, 'CV');
    const second = createModuleInstance('prototype.oscillator', 'other-tone');
    const patch = structuredClone(sevenBehaviorPatch); patch.instances.push(second);
    second.controls.frequency = 333;
    validateModulePatch(patch);
    assert.equal(patch.instances[0].controls.frequency, 220);
    assert.equal(second.controls.frequency, 333);
});

test('invalid identities, endpoints, domains, versions and controls fail without altering source records', () => {
    const cases: [string, (p: typeof sevenBehaviorPatch) => void, RegExp][] = [
        ['instance', p => p.instances.push(structuredClone(p.instances[0])), /Duplicate module/],
        ['cable', p => p.cables[1].cableId = p.cables[0].cableId, /duplicate cable/],
        ['blank', p => p.cables[0].cableId = '', /cable ID/],
        ['endpoint', p => p.cables[0].to.instanceId = 'missing', /no longer/],
        ['port', p => p.cables[0].to.portId = 'missing', /no longer/],
        ['domain', p => p.cables[0].to.portId = 'cutoff', /Match the signal/],
        ['direction', p => p.cables[0].to.portId = 'out', /output to an input/],
        ['definition', p => p.instances[0].definitionId = 'missing', /Unknown module definition/],
        ['definition version', p => p.instances[0].definitionVersion = 99, /Unsupported definition version/],
        ['format', p => (p as any).formatVersion = 99, /Unsupported patch format/],
        ['nonfinite', p => p.instances[0].controls.frequency = NaN, /Invalid module control/],
        ['out of range', p => p.instances[5].controls.time = 0, /Invalid module control/],
        ['waveform', p => p.instances[0].controls.waveform = 1.5, /Invalid module control/],
        ['unknown control', p => p.instances[0].controls.future = 5, /Unknown module control/]
    ];
    for (const [label, change, expected] of cases) {
        const patch = structuredClone(sevenBehaviorPatch); change(patch);
        const original = structuredClone(patch);
        assert.throws(() => validateModulePatch(patch), expected, label);
        assert.deepEqual(patch, original, label);
    }
    const definition = structuredClone(MODULE_DEFINITIONS['prototype.oscillator']);
    const registry = { ...MODULE_REGISTRY, definitions: { ...MODULE_DEFINITIONS, [definition.definitionId]: definition } };
    definition.behaviorId = 'unimplemented';
    assert.throws(() => validateModulePatch(sevenBehaviorPatch, registry), /Missing behavior/);
    definition.behaviorId = 's1a.oscillator'; definition.behaviorVersion = 2;
    assert.throws(() => validateModulePatch(sevenBehaviorPatch, registry), /Unsupported behavior version/);
    definition.behaviorVersion = 1; definition.ports[0].binding = 'nonexistent';
    assert.throws(() => validateModulePatch(sevenBehaviorPatch, registry), /port binding/);
    definition.ports[0].binding = 'pitch'; definition.controls[0].binding = 'nonexistent';
    assert.throws(() => validateModulePatch(sevenBehaviorPatch, registry), /control binding/);
});

test('native graph retains free fan-out, additive fan-in and Delay-only cycles', () => {
    validateModulePatch(sevenBehaviorPatch); // Two signals share Filter input; LFO fans to three destinations.
    const from = { instanceId: 'vca', portId: 'out' };
    assert.match(moduleConnectionError(sevenBehaviorPatch, from, { instanceId: 'filter', portId: 'in' })!, /Put a Delay/);
    assert.match(moduleConnectionError(sevenBehaviorPatch, { instanceId: 'filter', portId: 'out' }, { instanceId: 'filter', portId: 'in' })!, /Put a Delay/);
    assert.equal(moduleConnectionError(sevenBehaviorPatch, { instanceId: 'delay', portId: 'out' }, { instanceId: 'filter', portId: 'in' }), null);
});

test('pre-R2 v1 save metadata and all Studio/project/archive graphs survive the seam exactly', () => {
    const state = fixture(); const original = structuredClone(state);
    const patches: SandboxPatch[] = [state.studioPatch, state.active!.patch, ...state.archives.map(a => a.patch)];
    for (const patch of patches) {
        const native = parseModulePatch(serializeModulePatch(toModulePatch(patch)));
        assert.deepEqual(fromModulePatch(native, patch), patch);
        for (const module of patch.modules) assert.deepEqual((module as any).definition, PATCH_DEFINITIONS[module.kind]);
    }
    assert.deepEqual(state, original);
    assert.deepEqual(state, JSON.parse(fixtureRaw));
    const records = new Map([[STUDIO_SAVE_KEY, fixtureRaw], ['eurorack_inc_save_v1', 'legacy-sentinel']]);
    const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); } };
    const loaded = loadStudio(storage)!;
    saveStudio(storage, loaded);
    assert.deepEqual(JSON.parse(records.get(STUDIO_SAVE_KEY)!), JSON.parse(fixtureRaw));
    assert.equal(records.get('eurorack_inc_save_v1'), 'legacy-sentinel');
});

test('adapted branch edits and explicit reacquisition/substitution leave immutable original archive intact', () => {
    let state = resumeBranch(fixture());
    const original = structuredClone(state.archives[0]);
    state = closeBranch(state, null); // Fixture already proved engagement with VCA loan.
    const dependency = missingDependencies(state, original)[0];
    assert.equal(dependency.kind, 'delay');
    assert.throws(() => forkArchive(state, original.id, {}), /Resolve every/);
    let fork = forkArchive(state, original.id, { [dependency.id]: { mode: 'loan' } });
    const native = toModulePatch(currentPatch(fork));
    native.instances.find(m => m.instanceId === dependency.id)!.controls.return = 0.75;
    fork = updatePatch(fork, fromModulePatch(native, currentPatch(fork)));
    assert.equal(fork.active!.loans[0].controls.return, 0.75);
    assert.deepEqual(fork.archives[0], original);
    assert.deepEqual(fork.owned, state.owned);
    assert.deepEqual(toModulePatch(fork.active!.patch).cables, toModulePatch(original.patch).cables);
    state.owned.push({ ...structuredClone(dependency), id: 'owned-delay' });
    const substituted = forkArchive(state, original.id, { [dependency.id]: { mode: 'substitute', instanceId: 'owned-delay' } });
    const translated = toModulePatch(substituted.active!.patch);
    assert.equal(translated.instances.find(m => m.instanceId === 'owned-delay')!.controls.return, dependency.controls.return);
    assert.equal(translated.cables.find(c => c.cableId === 'loan-return')!.to.instanceId, 'owned-delay');
    assert.equal(translated.cables.find(c => c.cableId === 'loan-return')!.to.portId, 'return');
    assert.deepEqual(substituted.archives[0], original);
});

test('load and pure definition validation never allocate AudioContext, and bad saves stay stored', () => {
    const previous = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
    Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: class { constructor() { throw new Error('Unexpected AudioContext allocation'); } } });
    try {
        validateModulePatch(sevenBehaviorPatch);
        const loaded = loadStudio({ getItem: () => fixtureRaw, setItem: () => assert.fail('load wrote storage') })!;
        assert.equal(loaded.version, 1);
        const broken = JSON.parse(fixtureRaw); broken.archives[0].patch.modules[0].kind = 'future-processor';
        const raw = JSON.stringify(broken);
        const storage = { getItem: () => raw, setItem: () => assert.fail('invalid load wrote storage') };
        assert.throws(() => loadStudio(storage), /Unknown saved module dependency/);
        assert.equal(storage.getItem(), raw);
        const patch = setPatchControl(loaded.studioPatch, loaded.studioPatch.modules[0].id, 'frequency', 222);
        assert.equal(toModulePatch(patch).instances[0].controls.frequency, 222);
    } finally {
        if (previous) Object.defineProperty(globalThis, 'AudioContext', previous); else delete (globalThis as any).AudioContext;
    }
});
