import test from 'node:test';
import assert from 'node:assert/strict';
import { PatchAudioGraph } from '../services/patchAudioGraph.ts';
import { MODULE_REGISTRY, createModuleInstance, type ModuleRegistry } from '../services/modulePatch.ts';
import { MODULE_DEFINITIONS, type ModulePatch } from '../services/moduleDefinitions.ts';
import { sevenBehaviorPatch } from './fixtures/sevenBehaviorPatch.ts';
import { RecordingContext, RecordingNode, type RecordingParam } from './helpers/recordingAudio.ts';

function harness(registry?: ModuleRegistry) {
    const context = new RecordingContext();
    const destination = new RecordingNode('studio-master'); const analyser = new RecordingNode('studio-analyser');
    let acquisitions = 0; let releases = 0;
    const graph = new PatchAudioGraph(() => {
        acquisitions++;
        return { context: context as unknown as AudioContext, destination: destination as unknown as AudioNode,
            analyser: analyser as unknown as AnalyserNode, release: async () => { releases++; } };
    }, registry);
    return { graph, context, destination, analyser, acquisitions: () => acquisitions, releases: () => releases };
}
const routeTo = (context: RecordingContext, target: RecordingNode | RecordingParam) =>
    context.nodes.find(n => n.kind === 'gain' && n.connections.includes(target))!;

test('ordinary seven-behavior fixture builds exactly the existing DSP bindings and route scales', async () => {
    const h = harness();
    assert.equal(h.acquisitions(), 0);
    assert.equal(h.graph.getState(), 'idle');
    h.graph.apply(sevenBehaviorPatch);
    assert.equal(h.context.nodes.length, 0, 'validating an idle graph allocates nothing');
    await h.graph.start(sevenBehaviorPatch);
    try {
        assert.equal(h.acquisitions(), 1);
        assert.equal(h.graph.getAnalyser(), h.analyser);
        const oscillators = h.context.nodes.filter(n => n.kind === 'oscillator');
        const tone = oscillators.find(n => n.frequency.value === 220)!;
        const lfo = oscillators.find(n => n.frequency.value === 0.7)!;
        const filter = h.context.nodes.find(n => n.type === 'lowpass')!;
        const delay = h.context.nodes.find(n => n.kind === 'delay')!;
        const shaper = h.context.nodes.find(n => n.kind === 'shaper')!;
        assert.equal(tone.type, 'sawtooth'); assert.equal(lfo.type, 'sine');
        assert.equal((tone.connections[0] as RecordingNode).gain.value, 0.25);
        assert.equal((lfo.connections[0] as RecordingNode).gain.value, 0.3);
        assert.equal(filter.frequency.value, 1500); assert.equal(filter.Q.value, 3);
        assert.equal(delay.delayTime.value, 0.3); assert.equal(delay.maxDelay, 2);
        assert.equal(shaper.oversample, '4x'); assert.equal(shaper.curve!.length, 4096);
        assert.equal(shaper.curve![0], Math.fround(Math.tanh(-2)));
        assert.equal(shaper.curve!.at(-1), Math.fround(Math.tanh(2)));
        const trims = h.context.nodes.filter(n => n.connections.includes(delay));
        assert.deepEqual(trims.map(n => n.gain.value), [0.6, 0.4]);
        assert.equal(delay.connections[0], shaper);
        assert.equal(routeTo(h.context, tone.detune).gain.value, 1200);
        assert.equal(routeTo(h.context, filter.detune).gain.value, 2400);
        const vca = h.context.nodes.find(n => n.gain.value === 0.4 && n !== trims[1])!;
        assert.equal(routeTo(h.context, vca.gain).gain.value, 0.5);
        assert.equal(h.context.nodes.filter(n => n.connections.includes(filter)).length, 2, 'additive audio fan-in');
        assert.equal((lfo.connections[0] as RecordingNode).connections.length, 3, 'free CV fan-out');
        const noise = h.context.nodes.find(n => n.kind === 'buffer-source')!;
        assert.equal(noise.loop, true); assert.equal((noise.connections[0] as RecordingNode).gain.value, 0.12);
        assert.deepEqual(h.context.buffers.map(({ channels, length, sampleRate }) => ({ channels, length, sampleRate })), [{ channels: 1, length: 64, sampleRate: 32 }]);
        assert.ok(h.context.buffers[0].data.every(v => v >= -1 && v <= 1));
        for (const node of h.context.nodes) for (const param of [node.frequency, node.Q, node.gain, node.delayTime])
            assert.ok(param.targets.every(t => t.time === 12 && t.constant === 0.015));
        assert.equal(h.context.nodes.filter(n => n.connections.includes(h.destination)).length, 1);
        assert.equal(h.context.nodes[2].gain.value, 0.15);
    } finally { await h.graph.dispose(); }
});

test('repeated definition instances have independent controls; updates preserve source phase', async () => {
    const h = harness(); const patch = structuredClone(sevenBehaviorPatch);
    const other = createModuleInstance('prototype.oscillator', 'second-tone'); other.controls.frequency = 330;
    patch.instances.push(other);
    await h.graph.start(patch);
    try {
        const oscillators = h.context.nodes.filter(n => n.kind === 'oscillator');
        assert.deepEqual(oscillators.map(n => n.frequency.value), [220, 0.7, 330]);
        other.controls.frequency = 440; h.graph.apply(patch);
        assert.deepEqual(oscillators.map(n => n.frequency.value), [220, 0.7, 440]);
        assert.equal(h.context.nodes.filter(n => n.kind === 'oscillator').length, 3);
        assert.ok(oscillators.every(n => n.starts === 1 && n.stops === 0));
    } finally { await h.graph.dispose(); }
});

test('definition IDs and explicit bindings, including renamed ports/controls, determine behavior', async () => {
    const alias = structuredClone(MODULE_DEFINITIONS['prototype.oscillator']);
    alias.definitionId = 'test.renamed'; alias.name = 'Definitely not an oscillator';
    alias.ports[0].id = 'mod'; alias.ports[1].id = 'signal';
    alias.controls[0].id = 'hz'; alias.controls[1].id = 'shape';
    const registry = { ...MODULE_REGISTRY, definitions: { ...MODULE_DEFINITIONS, [alias.definitionId]: alias } };
    const h = harness(registry);
    const patch: ModulePatch = { formatVersion: 1,
        instances: [createModuleInstance(alias.definitionId, 'renamed', registry), createModuleInstance('prototype.output', 'speakers')],
        cables: [{ cableId: 'hear', from: { instanceId: 'renamed', portId: 'signal' }, to: { instanceId: 'speakers', portId: 'in' } }] };
    patch.instances[0].controls.hz = 444; patch.instances[0].controls.shape = 3;
    await h.graph.start(patch);
    try {
        const tone = h.context.nodes.find(n => n.kind === 'oscillator')!;
        assert.equal(tone.frequency.value, 444); assert.equal(tone.type, 'square');
        assert.equal(h.acquisitions(), 1);
    } finally { await h.graph.dispose(); }
});

test('invalid preflight acquires no session and never partially changes an already running graph', async () => {
    const h = harness(); const invalid = structuredClone(sevenBehaviorPatch);
    invalid.cables.at(-1)!.to.portId = 'missing';
    await assert.rejects(h.graph.start(invalid), /no longer/);
    assert.equal(h.acquisitions(), 0); assert.equal(h.context.nodes.length, 0);
    await h.graph.start(sevenBehaviorPatch);
    try {
        const nodeCount = h.context.nodes.length;
        const connections = h.context.nodes.map(n => [...n.connections]);
        const operations = h.context.nodes.map(n => [n.disconnects, n.starts, n.stops, n.frequency.targets.length, n.gain.targets.length]);
        invalid.instances[0].controls.frequency = 555; // Must not reach DSP before invalid endpoint is rejected.
        assert.throws(() => h.graph.apply(invalid), /no longer/);
        assert.equal(h.context.nodes.length, nodeCount);
        assert.deepEqual(h.context.nodes.map(n => n.connections), connections);
        assert.deepEqual(h.context.nodes.map(n => [n.disconnects, n.starts, n.stops, n.frequency.targets.length, n.gain.targets.length]), operations);
        const cycle = structuredClone(sevenBehaviorPatch);
        cycle.cables.push({ cableId: 'instantaneous', from: { instanceId: 'vca', portId: 'out' }, to: { instanceId: 'filter', portId: 'in' } });
        assert.throws(() => h.graph.apply(cycle), /Put a Delay/);
        const duplicate = structuredClone(sevenBehaviorPatch); duplicate.instances.push(duplicate.instances[0]);
        assert.throws(() => h.graph.apply(duplicate), /Duplicate module/);
        assert.deepEqual(h.context.nodes.map(n => n.connections), connections);
    } finally { await h.graph.dispose(); }
    const definition = { ...MODULE_DEFINITIONS['prototype.noise'], behaviorVersion: 2 };
    const broken = harness({ ...MODULE_REGISTRY, definitions: { ...MODULE_DEFINITIONS, [definition.definitionId]: definition } });
    await assert.rejects(broken.graph.start(sevenBehaviorPatch), /Unsupported behavior version/);
    assert.equal(broken.acquisitions(), 0);
});

test('unpatched sources have no master send, removal cleans sources, disposal clears fades and releases once', async () => {
    const h = harness(); const patch = structuredClone(sevenBehaviorPatch); patch.cables = [];
    await h.graph.start(patch);
    const masterInput = h.context.nodes[0];
    assert.equal(h.context.nodes.some(n => n.connections.includes(masterInput)), false);
    h.graph.apply(sevenBehaviorPatch);
    const tone = h.context.nodes.find(n => n.kind === 'oscillator')!;
    const removed = structuredClone(sevenBehaviorPatch);
    removed.instances = removed.instances.filter(m => m.instanceId !== 'tone');
    removed.cables = removed.cables.filter(c => c.from.instanceId !== 'tone' && c.to.instanceId !== 'tone');
    h.graph.apply(removed);
    assert.equal(tone.stops, 1); assert.equal(tone.connections.length, 0);
    h.graph.setOutput(99, true); assert.equal(h.context.nodes[2].gain.value, 0);
    h.graph.setOutput(99, false); assert.equal(h.context.nodes[2].gain.value, 1);
    h.graph.setOutput(NaN, false); assert.equal(h.context.nodes[2].gain.value, 1);
    await Promise.all([h.graph.dispose(), h.graph.dispose()]);
    assert.equal(h.releases(), 1);
    assert.equal(h.graph.getState(), 'idle'); assert.equal(h.graph.getAnalyser(), null);
    assert.ok(h.context.nodes.every(n => n.connections.length === 0));
    assert.ok(h.context.nodes.filter(n => n.starts).every(n => n.stops === 1));
    const disconnects = h.context.nodes.map(n => n.disconnects);
    await new Promise(resolve => setTimeout(resolve, 125));
    assert.deepEqual(h.context.nodes.map(n => n.disconnects), disconnects, 'disposed fade timers cannot fire later');
    await assert.rejects(h.graph.start(sevenBehaviorPatch), /session has closed/);
});
