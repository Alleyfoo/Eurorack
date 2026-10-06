import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STARTER_REGISTRY } from '../services/starterRegistry.ts';
import { MODULE_REGISTRY, parseModulePatch, serializeModulePatch, validateModulePatch, moduleConnectionError } from '../services/modulePatch.ts';
import { PatchAudioGraph } from '../services/patchAudioGraph.ts';
import type { ModulePatch } from '../services/moduleDefinitions.ts';
import { ADContour, StarterKernel, foldSample } from '../services/starterDsp.js';
import { RecordingContext, RecordingNode, RecordingParam } from './helpers/recordingAudio.ts';

const fixtures: Record<string, ModulePatch> = JSON.parse(readFileSync(new URL('./fixtures/r3sStarterPatches.json', import.meta.url), 'utf8'));
const draft = JSON.parse(readFileSync(new URL('../docs/content/R3A_STARTER_GRAPHS.json', import.meta.url), 'utf8'));
const adjustments = JSON.parse(readFileSync(new URL('./fixtures/r3sAuditionAdjustments.json', import.meta.url), 'utf8'));
const kernel = (kind: string, rate = 1000, controls: Record<string, number> = {}, settings = {}) => new StarterKernel(kind, rate, controls, settings);

test('all four fixtures preserve the accepted graph IDs, controls and settings; parse/load allocates nothing', () => {
    const oldAudio = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
    const oldTimer = globalThis.setTimeout;
    Object.defineProperty(globalThis, 'AudioContext', { configurable: true, value: class { constructor() { assert.fail('context on load'); } } });
    globalThis.setTimeout = (() => assert.fail('timer on load')) as unknown as typeof setTimeout;
    try {
        for (const candidate of draft.candidates) {
            const patch = fixtures[candidate.candidateId];
            assert.deepEqual(parseModulePatch(serializeModulePatch(patch, STARTER_REGISTRY), STARTER_REGISTRY), patch);
            assert.deepEqual(patch.cables, candidate.cables);
            assert.deepEqual(patch.instances.map(i => [i.instanceId, i.controls, i.settings]), candidate.instances.map((i: any) => [i.instanceId, { ...i.controls, ...adjustments[candidate.candidateId]?.[i.instanceId] }, i.settings]));
            assert.equal(patch.instances.length, candidate.installedOrdinaryPositions + 1);
            assert.throws(() => validateModulePatch(patch), /Unknown module definition/);
        }
        assert.equal(Object.keys(MODULE_REGISTRY.definitions).length, 7);
        assert.equal(Object.keys(MODULE_REGISTRY.behaviors).length, 7);
    } finally { globalThis.setTimeout = oldTimer; if (oldAudio) Object.defineProperty(globalThis, 'AudioContext', oldAudio); else delete (globalThis as any).AudioContext; }
});

test('fixed Quad configurations preserve lane domains and strict per-inlet clock acceptance', () => {
    const cross = structuredClone(fixtures.cross), weather = structuredClone(fixtures.weather);
    const mixed = STARTER_REGISTRY.definitions['catalogue.solar-quad.audio-audio-cv-cv'];
    const cv4 = STARTER_REGISTRY.definitions['catalogue.solar-quad.cv4'];
    assert.equal(mixed.productId, cv4.productId);
    assert.ok(Object.isFrozen(mixed) && Object.isFrozen(mixed.ports) && Object.isFrozen(mixed.settings!.laneFamilies.options[0]));
    assert.deepEqual(mixed.ports.filter(p => p.direction === 'in').map(p => p.family), ['AUDIO', 'AUDIO', 'CV', 'CV']);
    assert.deepEqual(cv4.ports.filter(p => p.direction === 'in').map(p => p.family), ['CV', 'CV', 'CV', 'CV']);
    assert.match(moduleConnectionError(cross, { instanceId: 'cross-trim', portId: 'out1' }, { instanceId: 'cross-folder', portId: 'fold' }, STARTER_REGISTRY)!, /Match the signal/);
    cross.instances.find(i => i.instanceId === 'cross-trim')!.settings!.laneFamilies = ['CV', 'CV', 'CV', 'CV'];
    assert.throws(() => validateModulePatch(cross, STARTER_REGISTRY), /Invalid module setting/);
    const rhythm = structuredClone(fixtures.rhythm); rhythm.cables = [];
    const clock = { instanceId: 'rhythm-clock', portId: 'out' };
    assert.equal(moduleConnectionError(rhythm, clock, { instanceId: 'rhythm-body-env', portId: 'trigger' }, STARTER_REGISTRY), null);
    assert.match(moduleConnectionError(rhythm, clock, { instanceId: 'rhythm-output', portId: 'in' }, STARTER_REGISTRY)!, /Match the signal/);
    assert.match(moduleConnectionError(rhythm, { instanceId: 'rhythm-clock', portId: 'reset' }, { instanceId: 'rhythm-div3', portId: 'in' }, STARTER_REGISTRY)!, /Match the signal/);
    weather.instances[0].settings!.colorMode = 'asset'; assert.throws(() => validateModulePatch(weather, STARTER_REGISTRY), /Invalid module setting/);
});

test('Quad lane paths permit delayed mutual FM and reject an instantaneous independent subcycle', () => {
    validateModulePatch(fixtures.cross, STARTER_REGISTRY);
    const patch = structuredClone(fixtures.cross);
    patch.cables = patch.cables.filter(c => c.cableId !== 'cross-c07');
    patch.cables.push({ cableId: 'bypass-delay', from: { instanceId: 'cross-vca', portId: 'out' }, to: { instanceId: 'cross-trim', portId: 'in2' } });
    assert.throws(() => validateModulePatch(patch, STARTER_REGISTRY), /Put a Delay/);
    const rhythm = structuredClone(fixtures.rhythm);
    rhythm.cables.push({ cableId: 'double-event', from: { instanceId: 'rhythm-clock', portId: 'out' }, to: { instanceId: 'rhythm-body-env', portId: 'trigger' } });
    assert.throws(() => validateModulePatch(rhythm, STARTER_REGISTRY), /one cable/);
    const weather = structuredClone(fixtures.weather); weather.cables = [];
    weather.cables.push({ cableId: 'event-loop', from: { instanceId: 'weather-functions', portId: 'a.eoc' }, to: { instanceId: 'weather-functions', portId: 'a.trigger' } });
    assert.throws(() => validateModulePatch(weather, STARTER_REGISTRY), /control\/event loops/);
});

test('clock/dividers count rising edges, respect held pulses and reset before coincident clock', () => {
    const clock = kernel('clock.master', 1000, { rate: 10, pulseWidth: .05 }, { run: true, initialPhase: 0 });
    const div = kernel('clock.divide', 1000, { division: 3, phase: 0 });
    const edges: number[] = []; let previous = 0;
    for (let i = 0; i < 1000; i++) { const [pulse, reset] = clock.sample([], i === 450 ? 1 : 0); const value = div.sample([pulse, reset])[0]; if (value && !previous) edges.push(i); previous = value; }
    assert.deepEqual(edges, [0, 300, 450, 750]);
    const held = kernel('clock.divide', 1000, { division: 2, phase: 0 });
    assert.deepEqual(Array.from({ length: 10 }, () => held.sample([1, 0])[0]), Array(10).fill(1));
    held.sample([0, 0]); assert.equal(held.sample([1, 0])[0], 0);
    assert.equal(held.sample([1, 1])[0], 0, 'reset clears count without inventing an edge in held CLOCK');
    held.sample([0, 0]); assert.equal(held.sample([1, 0])[0], 1, 'first actual post-reset edge emits at phase zero');
    for (let i = 0; i < 100; i++) assert.equal(held.sample([0, 0])[0], 0);
});

test('AD is positive-duration, unipolar, edge-triggered, restart-from-zero and finishes exactly', () => {
    const ad = new ADContour();
    const values = Array.from({ length: 7 }, (_, i) => ad.sample(i < 6 ? 1 : 0, 0, .002, .003, 'linear', false, 1000));
    const expected = [[.5, 0], [1, 0], [2 / 3, 0], [1 / 3, 0], [0, 1], [0, 0], [0, 0]];
    values.forEach((pair, i) => { assert.ok(Math.abs(pair[0] - expected[i][0]) < 1e-12); assert.equal(pair[1], expected[i][1]); });
    assert.equal(ad.sample(1, 0, .002, .003, 'linear', false, 1000)[0], .5);
    ad.sample(0, 0, .002, .003, 'linear', false, 1000);
    assert.equal(ad.sample(1, 0, .002, .003, 'linear', false, 1000)[0], .5);
    const bad = structuredClone(fixtures.rhythm); bad.instances.find(i => i.instanceId === 'rhythm-body-env')!.controls.attack = 0;
    assert.throws(() => validateModulePatch(bad, STARTER_REGISTRY), /Invalid module control/);
});

test('cycling EOC samples actual CV on completion, holds, and restarts next sample; dual channels independent', () => {
    const fn = kernel('function.cycle-eoc', 1000, { riseA: .002, fallA: .003, riseB: .004, fallB: .006 }, { cycleA: true, cycleB: true, curveA: 'linear', curveB: 'linear' });
    const sh = kernel('memory.sample-hold', 1000, { initialValue: -.7 });
    const ea: number[] = [], eb: number[] = [], held: number[] = [];
    for (let i = 0; i < 20; i++) { const [a, , eocA, eocB] = fn.sample([0, 0]); if (eocA) { ea.push(i); assert.equal(a, 0); } if (eocB) eb.push(i); held.push(sh.sample([i / 20, eocA])[0]); }
    assert.deepEqual(ea, [4, 9, 14, 19]); assert.deepEqual(eb, [9, 19]);
    assert.deepEqual(held.slice(0, 10), [-.7, -.7, -.7, -.7, .2, .2, .2, .2, .2, .45]);
    assert.equal(sh.sample([99, 1])[0], .95, 'held event fires once');
    sh.sample([0, 0]); assert.equal(sh.sample([-.3, 0], 1)[0], -.3, 'manual sample reads connected CV');
});

test('mixing/signed trims preserve actual samples independently; fold really reflects repeatedly', () => {
    assert.deepEqual(kernel('audio.mix', 1000, { aLevel: .5, bLevel: .25, master: .8 }).sample([1, -1]), [.2]);
    assert.deepEqual(kernel('signal.attenuvert', 1000, { gain1: -1, gain2: .5, gain3: 0, gain4: 2 }).sample([.25, -.5, 10, -.2]), [-.25, -.25, 0, -.4]);
    assert.deepEqual([-3, -2, -1, 0, 1, 2, 3, 4, 5].map(foldSample), [1, 0, -1, 0, 1, 0, -1, 0, 1]);
    const folder = kernel('shape.wavefolder', 1000, { fold: 6, symmetry: 0 }, { foldCvDepth: .7 });
    assert.equal(folder.sample([.25, 0])[0], .5);
    assert.notEqual(folder.sample([.25, .5])[0], .5);
});

test('external FM modifies oscillator phase at audio rate with explicit bounds and generic octave CV', () => {
    const plain = kernel('osc.linear-fm', 48000, { frequency: 220, fmDepth: 850 }, { frequencyBoundsHz: [20, 12000] });
    const mod = kernel('osc.linear-fm', 48000, { frequency: 220, fmDepth: 850 }, { frequencyBoundsHz: [20, 12000] });
    plain.sample([0, 0]); mod.sample([1, 0]); assert.equal(mod.phase, 2 * plain.phase);
    mod.sample([0, -999]); assert.ok(Math.abs(mod.phase - (440 + 20) / 48000) < 1e-12);
    const a = Array.from({ length: 1000 }, () => plain.sample([0, 0])[0]);
    const b = Array.from({ length: 1000 }, (_, i) => mod.sample([0, Math.sin(i / 17) * .25])[0]);
    assert.notDeepEqual(a, b); assert.ok(b.every(v => Number.isFinite(v) && Math.abs(v) <= .25));
});

test('modal resonance has no autonomous output, rings from excitation and decays; pitch/damping affect response', () => {
    const controls = { frequency: 137, damping: .55, structure: .3, excitationPosition: .4 };
    const settings = { dampingCvDepth: .3, modeRatios: [1, 2.76, 5.4] };
    const silent = kernel('resonator.modal', 8000, controls, settings);
    assert.ok(Array.from({ length: 1000 }, () => silent.sample([0, .5, 1])[0]).every(v => v === 0));
    const a = kernel('resonator.modal', 8000, controls, settings), b = kernel('resonator.modal', 8000, controls, settings);
    a.sample([1, 0, 0]); b.sample([1, .5, 1]);
    const tailA = Array.from({ length: 24000 }, () => a.sample([0, 0, 0])[0]);
    const tailB = Array.from({ length: 24000 }, () => b.sample([0, .5, 1])[0]);
    assert.ok(tailA.some(v => Math.abs(v) > .001)); assert.notDeepEqual(tailA.slice(0, 100), tailB.slice(0, 100));
    assert.ok(tailA.slice(-8000).every(v => Math.abs(v) < 1e-12));
});

class WorkletContext extends RecordingContext {
    loads = 0;
    audioWorklet = { addModule: async (_url: string) => { this.loads++; } };
}
class MockWorklet extends RecordingNode {
    parameters = new Map(['enabled', 'manualA', 'manualB'].map(id => [id, new RecordingParam()]));
    messages: any[] = []; closed = false;
    port = { postMessage: (m: any) => this.messages.push(m), close: () => { this.closed = true; } };
    onprocessorerror: (() => void) | null = null;
    options: any;
    constructor(context: WorkletContext, _id: string, options: any) { super('worklet'); context.nodes.push(this); this.options = options; }
}
test('continuous selected routes ramp and fade; event routes connect and disconnect immediately', async t => {
    for (const definition of Object.values(STARTER_REGISTRY.definitions)) {
        for (const port of definition.ports.filter(p => p.direction === 'in')) {
            if (port.family === 'AUDIO' || port.family === 'CV') assert.notEqual(port.smoothing, 'none', `${definition.definitionId}:${port.id}`);
            else assert.equal(port.smoothing, 'none');
        }
    }
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const old = Object.getOwnPropertyDescriptor(globalThis, 'AudioWorkletNode');
    Object.defineProperty(globalThis, 'AudioWorkletNode', { configurable: true, value: MockWorklet });
    try {
        for (const patch of [fixtures.rhythm, fixtures.weather]) {
            const context = new WorkletContext();
            const graph = new PatchAudioGraph(() => ({ context: context as any, destination: new RecordingNode('master') as any, analyser: new RecordingNode('analyser') as any, release: async () => {} }), STARTER_REGISTRY);
            try {
                await graph.start(patch);
                const routes = [...(graph as any).routes.values()];
                for (const route of routes) {
                    const instance = patch.instances.find(i => i.instanceId === route.cable.to.instanceId)!;
                    const port = STARTER_REGISTRY.definitions[instance.definitionId].ports.find(p => p.id === route.cable.to.portId)!;
                    const event = port.family === 'CLOCK' || port.family === 'TRIG';
                    assert.equal(route.immediate, event);
                    assert.deepEqual(route.gain.gain.targets, event ? [] : [{ value: port.scale, time: 12, constant: .015 }]);
                    assert.equal(route.gain.gain.value, port.scale);
                }
                const continuous = routes.filter(r => !r.immediate), events = routes.filter(r => r.immediate);
                assert.ok(continuous.length && events.length);
                graph.apply({ ...patch, cables: [] });
                assert.ok(events.every(r => r.gain.disconnects === 1 && !r.source.connections.includes(r.gain)));
                assert.ok(continuous.every(r => r.gain.disconnects === 0 && r.source.connections.includes(r.gain)));
                assert.ok(continuous.every(r => r.gain.gain.targets.at(-1).value === 0 && r.gain.gain.targets.at(-1).constant === .015));
                assert.equal((graph as any).pending.size, continuous.length);
                t.mock.timers.tick(99);
                assert.ok(continuous.every(r => r.gain.disconnects === 0));
                t.mock.timers.tick(1);
                assert.ok(continuous.every(r => r.gain.disconnects === 1 && !r.source.connections.includes(r.gain)));
                assert.equal((graph as any).pending.size, 0);
                graph.apply(patch); graph.apply({ ...patch, cables: [] });
                assert.equal((graph as any).pending.size, continuous.length);
            } finally { await graph.dispose(); }
            assert.equal((graph as any).pending.size, 0, 'stop clears pending continuous-route fades');
            assert.ok(context.nodes.every(n => n.connections.length === 0));
        }
    } finally {
        t.mock.timers.reset();
        if (old) Object.defineProperty(globalThis, 'AudioWorkletNode', old); else delete (globalThis as any).AudioWorkletNode;
    }
});

test('all fixtures build through PatchAudioGraph with exact routes, deliberate activation and complete idempotent cleanup', async () => {
    const old = Object.getOwnPropertyDescriptor(globalThis, 'AudioWorkletNode');
    Object.defineProperty(globalThis, 'AudioWorkletNode', { configurable: true, value: MockWorklet });
    try {
        for (const patch of Object.values(fixtures)) {
            const context = new WorkletContext(); let acquired = 0, released = 0;
            const graph = new PatchAudioGraph(() => { acquired++; return { context: context as any, destination: new RecordingNode('master') as any, analyser: new RecordingNode('analyser') as any, release: async () => { released++; } }; }, STARTER_REGISTRY);
            graph.apply(patch); assert.equal(acquired, 0); assert.equal(context.loads, 0); assert.equal(context.nodes.length, 0);
            await graph.start(patch); assert.equal(acquired, 1); assert.equal(context.loads, 1);
            assert.deepEqual([...((graph as any).voices as Map<string, any>).keys()], patch.instances.map(i => i.instanceId));
            assert.deepEqual([...((graph as any).routes as Map<string, any>).values()].map(r => r.cable), patch.cables);
            const worklets = context.nodes.filter(n => n.kind === 'worklet') as MockWorklet[];
            assert.ok(worklets.length);
            assert.ok(worklets.every(n => n.parameters.get('enabled')!.events[0].time === 12.025));
            if (patch.instances.some(i => i.instanceId === 'rhythm-clock')) {
                graph.trigger('rhythm-clock', 'reset'); const clock = worklets.find(n => n.options.processorOptions.kind === 'clock.master')!;
                assert.deepEqual(clock.parameters.get('manualA')!.events.map(e => e.value), [1, 0]);
                assert.throws(() => graph.trigger('rhythm-clock', 'sample'), /Unknown selected/);
            }
            const empty = { ...patch, cables: [] }; graph.apply(empty);
            assert.equal((graph as any).routes.size, 0, 'sources do not secretly send to master');
            await Promise.all([graph.dispose(), graph.dispose()]); assert.equal(released, 1);
            assert.ok(worklets.every(n => n.closed && n.messages.at(-1).type === 'stop'));
            assert.ok(context.nodes.every(n => n.connections.length === 0));
            assert.ok(context.nodes.filter(n => n.starts).every(n => n.stops === 1));
        }
    } finally { if (old) Object.defineProperty(globalThis, 'AudioWorkletNode', old); else delete (globalThis as any).AudioWorkletNode; }
});

test('failed or cancelled worklet preparation releases the acquired session without allocating voices', async () => {
    for (const cancel of [false, true]) {
        const context = new WorkletContext(); let released = 0; let reject!: (error: Error) => void;
        context.audioWorklet.addModule = () => new Promise((_resolve, fail) => { reject = fail; });
        const graph = new PatchAudioGraph(() => ({ context: context as any, destination: new RecordingNode('master') as any, analyser: new RecordingNode('analyser') as any, release: async () => { released++; } }), STARTER_REGISTRY);
        const starting = graph.start(fixtures.weather);
        if (cancel) await graph.dispose();
        reject(new Error('worklet unavailable')); await assert.rejects(starting, /worklet unavailable/);
        assert.equal(released, 1); assert.equal(context.nodes.length, 0);
    }
    const context = new WorkletContext(); let released = 0; let finish!: () => void;
    context.audioWorklet.addModule = () => new Promise(resolve => { finish = resolve; });
    const graph = new PatchAudioGraph(() => ({ context: context as any, destination: new RecordingNode('master') as any, analyser: new RecordingNode('analyser') as any, release: async () => { released++; } }), STARTER_REGISTRY);
    const starting = graph.start(fixtures.cross); await graph.dispose(); finish(); await starting;
    assert.equal(released, 1); assert.equal(context.nodes.length, 0); assert.equal(context.resumes, 0);
});

test('selected settings, controls, endpoints and unavailable versions fail visibly before allocation, retaining source data', async () => {
    const cases: ((patch: ModulePatch) => void)[] = [
        p => p.instances[0].definitionVersion = 99,
        p => p.instances[0].settings!.waveform = 'pm',
        p => p.instances[0].settings!.frequencyBoundsHz = [20, Infinity],
        p => p.instances[0].controls.fmDepth = -1,
        p => p.cables[0].to.portId = 'missing'
    ];
    for (const change of cases) {
        const patch = structuredClone(fixtures.cross); change(patch); const original = structuredClone(patch);
        const graph = new PatchAudioGraph(() => assert.fail('invalid patch allocated'), STARTER_REGISTRY);
        await assert.rejects(graph.start(patch)); assert.deepEqual(patch, original);
    }
    const definition = structuredClone(STARTER_REGISTRY.definitions[fixtures.cross.instances[0].definitionId]);
    for (const mode of ['missing', 'version']) {
        if (mode === 'missing') definition.behaviorId = 'future.pm'; else { definition.behaviorId = 'osc.linear-fm'; definition.behaviorVersion = 99; }
        const registry = { ...STARTER_REGISTRY, definitions: { ...STARTER_REGISTRY.definitions, [definition.definitionId]: definition } };
        const graph = new PatchAudioGraph(() => assert.fail('unavailable behavior allocated'), registry);
        await assert.rejects(graph.start(fixtures.cross), /behavior/);
    }
});

test('settings changes restart only the configured processor; processor errors stop/release visibly', async () => {
    const old = Object.getOwnPropertyDescriptor(globalThis, 'AudioWorkletNode');
    Object.defineProperty(globalThis, 'AudioWorkletNode', { configurable: true, value: MockWorklet });
    try {
        const context = new WorkletContext(); let released = 0;
        const graph = new PatchAudioGraph(() => ({ context: context as any, destination: new RecordingNode('master') as any, analyser: new RecordingNode('analyser') as any, release: async () => { released++; } }), STARTER_REGISTRY);
        await graph.start(fixtures.weather);
        const voices = new Map((graph as any).voices), patch = structuredClone(fixtures.weather);
        patch.instances.find(i => i.instanceId === 'weather-functions')!.settings!.cycleA = false;
        graph.apply(patch);
        assert.notEqual((graph as any).voices.get('weather-functions'), voices.get('weather-functions'));
        assert.equal((graph as any).voices.get('weather-hold'), voices.get('weather-hold'));
        const first = context.nodes.find(n => n.kind === 'worklet') as MockWorklet;
        first.onprocessorerror!(); await graph.dispose();
        assert.match(graph.getError()!.message, /Audio processor failed/); assert.equal(released, 1);
        assert.ok(context.nodes.every(n => n.connections.length === 0));
    } finally { if (old) Object.defineProperty(globalThis, 'AudioWorkletNode', old); else delete (globalThis as any).AudioWorkletNode; }
});
