import test from 'node:test';
import assert from 'node:assert/strict';
import { connectionError, createInitialPatch, removePatchModule, setPatchControl, type SandboxPatch } from '../services/patchModel.ts';

const endpoint = (moduleId: string, portId: string) => ({ moduleId, portId });
const add = (patch: SandboxPatch, from: string, fromPort: string, to: string, toPort: string) => {
    const cable = { id: String(patch.cables.length), from: endpoint(from, fromPort), to: endpoint(to, toPort) };
    assert.equal(connectionError(patch, cable.from, cable.to), null);
    return { ...patch, cables: [...patch.cables, cable] };
};

test('a direct oscillator-to-output route needs no conventional voice chain', () => {
    const patch = createInitialPatch();
    assert.equal(patch.cables.length, 0);
    assert.equal(connectionError(patch, endpoint('oscillator', 'out'), endpoint('output', 'in')), null);
});

test('signal family/direction validation and duplicate rejection still allow fan-out', () => {
    let patch = createInitialPatch();
    assert.match(connectionError(patch, endpoint('lfo', 'out'), endpoint('output', 'in'))!, /Match the signal/);
    assert.match(connectionError(patch, endpoint('output', 'in'), endpoint('filter', 'in'))!, /output to an input/);
    assert.match(connectionError(patch, endpoint('missing', 'out'), endpoint('filter', 'in'))!, /no longer/);
    patch = add(patch, 'lfo', 'out', 'filter', 'cutoff');
    assert.match(connectionError(patch, endpoint('lfo', 'out'), endpoint('filter', 'cutoff'))!, /already connected/);
    assert.equal(connectionError(patch, endpoint('lfo', 'out'), endpoint('vca', 'gain')), null);
});

test('self-feedback and longer cycles are permitted through an explicit delay', () => {
    let patch = add(createInitialPatch(), 'oscillator', 'out', 'delay', 'in');
    patch = add(patch, 'delay', 'out', 'delay', 'return');
    patch = add(patch, 'delay', 'out', 'filter', 'in');
    assert.equal(connectionError(patch, endpoint('filter', 'out'), endpoint('delay', 'return')), null);
});

test('a delay elsewhere in the graph cannot authorize an instantaneous subcycle', () => {
    let patch = add(createInitialPatch(), 'delay', 'out', 'filter', 'in');
    patch = add(patch, 'filter', 'out', 'vca', 'in');
    assert.match(connectionError(patch, endpoint('vca', 'out'), endpoint('filter', 'in'))!, /Put a Delay/);
    assert.match(connectionError(createInitialPatch(), endpoint('filter', 'out'), endpoint('filter', 'in'))!, /Put a Delay/);
});

test('module removal removes both incoming and outgoing cables without removing unrelated routes', () => {
    let patch = add(createInitialPatch(), 'oscillator', 'out', 'filter', 'in');
    patch = add(patch, 'filter', 'out', 'output', 'in');
    patch = add(patch, 'lfo', 'out', 'vca', 'gain');
    const removed = removePatchModule(patch, 'filter');
    assert.equal(removed.cables.length, 1);
    assert.equal(removed.cables[0].from.moduleId, 'lfo');
    assert.equal(removed.modules.some(m => m.id === 'filter'), false);
    assert.equal(patch.cables.length, 3);
    assert.equal(removePatchModule(patch, 'output'), patch);
});

test('invalid controls cannot create nonfinite/out-of-range DSP parameters', () => {
    const patch = createInitialPatch();
    assert.equal(setPatchControl(patch, 'delay', 'time', NaN), patch);
    assert.equal(setPatchControl(patch, 'delay', 'time', -5).modules.find(m => m.id === 'delay')!.controls.time, 0.01);
    assert.equal(setPatchControl(patch, 'delay', 'return', 20).modules.find(m => m.id === 'delay')!.controls.return, 1.5);
    assert.deepEqual(setPatchControl(patch, 'filter', 'imaginary', 5), patch);
    assert.equal(patch.modules.find(m => m.id === 'delay')!.controls.time, 0.25);
});
