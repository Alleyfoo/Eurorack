import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPatchModule, removePatchModule, setPatchControl, type SandboxPatch } from '../services/patchModel.ts';
import { availableModules, closeBranch, createStudio, currentPatch, forkArchive, INSTALLED_CAPACITY, missingDependencies, resumeBranch, startProject, substitutes, updatePatch, validateStudioState, visitStudio, type StudioState } from '../services/studioModel.ts';
import { loadStudio, saveStudio, STUDIO_SAVE_KEY } from '../services/studioStorage.ts';

function installLoans(state: StudioState): StudioState {
    const patch = currentPatch(state);
    return updatePatch(state, { ...patch, modules: [...patch.modules.slice(0, -1), ...structuredClone(state.active!.loans), patch.modules.at(-1)!] });
}
function useLoan(state: StudioState, kind = 'delay'): StudioState {
    const patch = currentPatch(state);
    const loan = state.active!.loans.find(m => m.kind === kind)!;
    const source = patch.modules.find(m => m.kind === state.starter)!;
    return updatePatch(state, { ...patch, cables: [...patch.cables, { id: crypto.randomUUID(), from: { moduleId: source.id, portId: 'out' }, to: { moduleId: loan.id, portId: 'in' } }] });
}
function projectOne(): StudioState { return useLoan(installLoans(startProject(createStudio('oscillator'), 'material-memory'))); }

test('fresh starters own exactly one source, Filter and LFO; fixed unpatched Output', () => {
    for (const source of ['oscillator', 'noise'] as const) {
        const state = createStudio(source);
        assert.deepEqual(state.owned.map(m => m.kind), [source, 'filter', 'lfo']);
        assert.equal(new Set(state.owned.map(m => m.id)).size, 3);
        assert.equal(state.studioPatch.modules.at(-1)!.kind, 'output');
        assert.equal(state.studioPatch.cables.length, 0);
        assert.equal(state.prototypeComplete, false);
        assert.equal(INSTALLED_CAPACITY, 6);
    }
});

test('project and Studio control edits are isolated across pause/resume; closure requires a loan cable', () => {
    let state = createStudio('noise');
    const original = structuredClone(state.studioPatch);
    state = startProject(state, 'material-memory');
    assert.deepEqual(state.active!.loans.map(m => m.kind), ['oscillator', 'delay']);
    assert.throws(() => closeBranch(state, null), /valid cable/);
    const filter = currentPatch(state).modules.find(m => m.kind === 'filter')!;
    state = updatePatch(state, setPatchControl(currentPatch(state), filter.id, 'cutoff', 4321));
    assert.deepEqual(state.studioPatch, original);
    const branch = structuredClone(state.active);
    state = visitStudio(state);
    state = updatePatch(state, setPatchControl(currentPatch(state), filter.id, 'cutoff', 2345));
    assert.deepEqual(state.active, branch);
    state = resumeBranch(state);
    assert.equal(currentPatch(state).modules.find(m => m.id === filter.id)!.controls.cutoff, 4321);
    state = installLoans(state);
    const ownSource = currentPatch(state).modules.find(m => m.kind === 'noise')!;
    const output = currentPatch(state).modules.at(-1)!;
    state = updatePatch(state, { ...currentPatch(state), cables: [{ id: 'own-cable', from: { moduleId: ownSource.id, portId: 'out' }, to: { moduleId: output.id, portId: 'in' } }] });
    assert.equal(state.active!.engaged, false);
    state = useLoan(state);
    assert.equal(state.active!.engaged, true);
    state = updatePatch(state, { ...currentPatch(state), cables: [] });
    assert.equal(state.active!.engaged, true, 'once engaged, silence and removal do not revoke closure');
});

test('closure snapshots exact borrowed instances before return, retaining at most one without changing Studio rack', () => {
    const state = projectOne();
    const studioBefore = structuredClone(state.studioPatch);
    const [other, delay] = state.active!.loans;
    const closed = closeBranch(state, other.id, 'My silence', 'A noisy experiment is still valid.');
    assert.equal(closed.active, null);
    assert.deepEqual(closed.studioPatch, studioBefore);
    assert.equal(closed.owned.some(m => m.id === other.id), true);
    assert.equal(closed.owned.some(m => m.id === delay.id), false);
    assert.deepEqual(closed.archives[0].patch.modules.find(m => m.id === delay.id), state.active!.inventory.find(m => m.id === delay.id));
    assert.equal(closed.archives[0].patch.cables[0].to.moduleId, delay.id);
    assert.deepEqual(closed.unlocked, ['material-memory', 'level-motion']);
    assert.throws(() => closeBranch(state, 'invented-instance'), /offered project loan/);
    state.active!.patch.modules[0].controls.frequency = 999;
    assert.notEqual(closed.archives[0].patch.modules[0].controls.frequency, 999);
});

test('fork resolver preserves original archive and loans exact missing instances without ownership', () => {
    const state = closeBranch(projectOne(), null);
    const archive = state.archives[0];
    const original = JSON.stringify(archive);
    const missing = missingDependencies(state, archive);
    assert.equal(missing.length, 2);
    assert.throws(() => forkArchive(state, archive.id, {}), /Resolve every/);
    const fork = forkArchive(state, archive.id, Object.fromEntries(missing.map(m => [m.id, { mode: 'loan' as const }])));
    assert.deepEqual(fork.active!.patch.cables, archive.patch.cables);
    assert.deepEqual(fork.active!.loans.map(m => m.id), missing.map(m => m.id));
    assert.deepEqual(fork.owned, state.owned);
    assert.equal(JSON.stringify(fork.archives[0]), original);
    assert.throws(() => closeBranch(fork, missing[0].id), /offered project loan/);
    const kept = closeBranch(fork, null);
    assert.equal(kept.archives.length, 2);
    assert.equal(JSON.stringify(kept.archives[0]), original);
    assert.deepEqual(kept.owned, state.owned);
});

test('same-kind substitution explicitly remaps endpoint IDs and preserves topology and original record', () => {
    let state = projectOne();
    const noise = state.active!.loans.find(m => m.kind === 'noise')!;
    const delayModule = state.active!.loans.find(m => m.kind === 'delay')!;
    state = updatePatch(state, { ...currentPatch(state), cables: [...currentPatch(state).cables, { id: 'substitute-route', from: { moduleId: noise.id, portId: 'out' }, to: { moduleId: delayModule.id, portId: 'return' } }] });
    state = closeBranch(state, null);
    const first = state.archives[0];
    const missing = missingDependencies(state, first);
    const other = missing.find(m => m.kind === 'noise')!;
    // Another owned exact instance of this kind is distinct from the preserved dependency.
    state = { ...state, owned: [...state.owned, { ...structuredClone(other), id: 'owned-noise' }] };
    assert.equal(substitutes(state, first, other)[0].id, 'owned-noise');
    const delay = missing.find(m => m.kind === 'delay')!;
    assert.equal(substitutes(state, first, delay).length, 0);
    const resolutions = { [other.id]: { mode: 'substitute' as const, instanceId: 'owned-noise' }, [delay.id]: { mode: 'loan' as const } };
    const fork = forkArchive(state, first.id, resolutions);
    assert.equal(fork.active!.patch.modules.some(m => m.id === other.id), false);
    assert.equal(fork.active!.patch.modules.some(m => m.id === 'owned-noise'), true);
    const remapped = fork.active!.patch.cables.find(c => c.id === 'substitute-route')!;
    assert.equal(remapped.from.moduleId, 'owned-noise');
    assert.equal(remapped.from.portId, 'out');
    assert.equal(remapped.to.moduleId, delay.id);
    assert.equal(remapped.to.portId, 'return');
    assert.equal(first.patch.cables.find(c => c.id === 'substitute-route')!.from.moduleId, other.id);
    assert.deepEqual(state.archives[0], first);
    assert.throws(() => forkArchive(state, first.id, { ...resolutions, [delay.id]: { mode: 'substitute', instanceId: 'owned-noise' } }), /No distinct owned/);
});

test('save/reload entire arc preserves active loans/engagement/archives and never writes the legacy key', () => {
    const records = new Map([['eurorack_inc_save_v1', 'legacy-sentinel']]);
    const storage = { getItem: (key: string) => records.get(key) ?? null, setItem: (key: string, value: string) => { records.set(key, value); } };
    let state = projectOne();
    saveStudio(storage, visitStudio(state));
    state = resumeBranch(loadStudio(storage)!);
    assert.equal(state.active!.engaged, true);
    assert.equal(state.active!.loans.length, 2);
    state = closeBranch(state, null);
    saveStudio(storage, state); state = loadStudio(storage)!;
    state = startProject(state, 'level-motion');
    state = useLoan(installLoans(state), 'vca');
    state = closeBranch(state, state.active!.loans[0].id);
    saveStudio(storage, state); state = loadStudio(storage)!;
    assert.equal(state.prototypeComplete, true);
    assert.equal(state.archives.length, 2);
    assert.equal(state.owned.some(m => m.kind === 'vca'), true);
    assert.equal(records.get('eurorack_inc_save_v1'), 'legacy-sentinel');
    assert.ok(records.has(STUDIO_SAVE_KEY));
    assert.deepEqual(currentPatch(state), state.studioPatch);
    assert.equal(availableModules(state).length, 4);
});

test('capacity, unresolved instances and corrupted saves fail explicitly without pruning stored work', () => {
    const state = createStudio('oscillator');
    const rogue = createPatchModule('delay', 'rogue');
    assert.throws(() => updatePatch(state, { ...state.studioPatch, modules: [rogue, ...state.studioPatch.modules] }), /unavailable dependency/);
    const over: SandboxPatch = { modules: [...Array.from({ length: 7 }, (_, n) => createPatchModule('noise', `n${n}`)), state.studioPatch.modules.at(-1)!], cables: [] };
    assert.throws(() => updatePatch(state, over), /at most six/);
    const closed = closeBranch(projectOne(), null);
    const broken = structuredClone(closed);
    broken.archives[0].patch.cables[0].to.moduleId = 'missing';
    assert.throws(() => validateStudioState(broken), /no longer/);
    assert.throws(() => validateStudioState({ ...state, version: 2 }), /Unsupported/);
    const missingMetadata = structuredClone(state);
    delete (missingMetadata.studioPatch.modules.at(-1)! as any).definition;
    assert.throws(() => validateStudioState(missingMetadata), /definition\/provenance/);
    const raw = JSON.stringify(broken);
    let written = false;
    assert.throws(() => loadStudio({ getItem: () => raw, setItem: () => { written = true; } }), /no longer/);
    assert.equal(written, false);
    assert.equal(closed.archives[0].patch.cables.length, 1);
    const removed = removePatchModule(state.studioPatch, state.owned[0].id);
    assert.equal(updatePatch(state, removed).owned.length, 3);
});
