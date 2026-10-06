# R2 — Data-driven patch seam

Implemented 2026-10-06 in `421c575`, following explicit user acceptance of R1/R1A
and authorization of the seven-behavior R2 slice. Architectural replacement beneath
existing behavior; no new instrument, catalogue content or DSP was added in R2.

**Accepted and closed by the user on 2026-10-06**, after reviewing `421c575`,
`fd75c89` and `2f46380`. [R3-A design](../plans/R3A_STARTER_SYSTEM_DESIGN.md)
was subsequently accepted in
direction, and the separately authorized [R3-S substrate](R3S_STARTER_SUBSTRATE.md)
is now implemented. That opt-in native registry adds selected modes without
changing these seven definitions, v1 saves or their sample behavior. R3-B remains
unauthorized. This document records R2's historical implementation boundary.

## Runtime authority

```text
v1 UI / Studio records
    -> patchAdapter (explicit frozen kind-to-definition mapping)
    -> ModulePatch / ModuleInstance (definition ID + version)
    -> ModuleDefinition (ports + controls + processor bindings)
    -> behavior registry (behavior ID + version)
    -> existing PatchAudioGraph / Studio-owned context and master
```

- [moduleDefinitions.ts](../../services/moduleDefinitions.ts) contains the minimal
  definition/instance/port/control/cable/patch types and seven fixed definitions.
  IDs are `prototype.oscillator`, `.noise`, `.filter`, `.vca`, `.lfo`, `.delay` and
  `.output`; each definition and behavior is version 1. Behaviors use the explicit
  `s1a.*` namespace. A definition version pins its behavior/version and bindings;
  the patch stores the definition identity/version, not a processor or manifest.
- [patchBehaviors.ts](../../services/patchBehaviors.ts) binds those seven behaviors
  to the lifted Web Audio factories. Factories expose stable processor inputs,
  outputs and controls; definitions map panel IDs onto these bindings. There is
  no dispatch by display text, old rarity or scalar `ModuleType`.
- [modulePatch.ts](../../services/modulePatch.ts) resolves definitions/behaviors
  and validates IDs, versions, controls, endpoints, directions, signal compatibility
  and cycles. Serialization/parse are pure JSON operations with the same checks.
  Complete validation precedes context acquisition or any live graph mutation.
- [patchAudioGraph.ts](../../services/patchAudioGraph.ts) accepts the resolved
  patch format. It creates voices via registry factories, applies control bindings
  and takes route scales from destination ports. Existing voices retain phase on
  control edits. Output alone exposes the shared master input.
- [patchModel.ts](../../services/patchModel.ts) keeps the v1 UI interfaces and
  derives its `PATCH_DEFINITIONS` panel projection from the new definitions. UI
  connection policy and Studio save validation use the new model through the
  [adapter](../../services/patchAdapter.ts). `MASTER_POOL` remains on the legacy side.

Only AUDIO and generic CV are executable domains here. The old dormant GATE type
is retained in v1 metadata compatibility, with no GATE port or behavior registered.
PITCH_CV, event execution, capability inference and asset machinery remain future
design vocabulary, not an R2 implementation requirement.

## Preserved behavior

| Relationship | Preserved binding / behavior |
|---|---|
| LFO -> oscillator pitch | Generic CV to `OscillatorNode.detune`, 1200 cents/unit |
| LFO -> filter cutoff | Generic CV to `BiquadFilterNode.detune`, 2400 cents/unit |
| LFO -> VCA gain | Additive modulation of `GainNode.gain`, 0.5 gain/unit |
| Ordinary audio routes | Unity scale; additive fan-in and transparent free fan-out |
| Oscillator | Same four waveforms, 40–1200 Hz, fixed source level 0.25 |
| Noise | Same two-second mono random loop and level control |
| Filter / VCA / LFO | Same low-pass, resonance, bias, sine LFO and numeric ranges/defaults |
| Delay | Separate input/return trims into Delay, no dry bypass or hidden return; same two-second maximum and tanh/4x output shaper |
| Cycles | Every audio cycle crosses the existing Delay behavior; a Delay elsewhere cannot authorize an instantaneous subcycle |
| Controls / cable edits | Same 0.015-second target smoothing and 100 ms cable-removal fade |
| Output / lifecycle | Same DC-block/listen trim into `openStudioPatchSession`'s compressor/master/limiter/analyser; deliberate Start only |

Out-of-range/nonfinite values, unknown controls, missing definitions/behaviors and
unsupported versions fail explicitly. No fallback oscillator or gain is created.
The UI clamps edits within the definition's existing bounds; waveform stays integer.
The workspace releases a failed Start's acquired session so a new attempt can start cleanly.
Disposal disconnects all graph-owned master nodes, clears pending fades, stops
sources and releases the Studio session once; it does not introduce a second engine.

## v1 saves and archives

`eurorack_studio_save_v1`, version 1, stays unchanged. Its `id/kind/controls`,
`moduleId/portId` endpoints, embedded panel metadata, inventory, loans, projects,
archive records and provenance retain their original JSON meaning. The explicit
adapter maps each known v1 kind to its fixed version-1 definition; saved names or
embedded descriptive panels never select DSP. No fields are migrated in place.
`eurorack_inc_save_v1` remains untouched, and `?mode=patch`, `?mode=studio` and the
default legacy route retain their ownership and save boundaries.

`toModulePatch` clones IDs/controls/cables into the seam; `fromModulePatch` reattaches
the original instance metadata/provenance after validation. This reverse adapter
requires matching existing v1 instances; it cannot silently invent an item or
grant ownership. Pure load/validation/serialization allocate no AudioContext.
Invalid stored data stays stored and is visibly explained by the existing save UI.

Archives remain deep snapshots. Exact missing instances still require explicit
temporary reacquisition or a distinct owned same-kind substitute; controls and
port endpoints survive substitution and the original archive stays unchanged.
The frozen [pre-R2 v1 fixture](../../tests/fixtures/studio-v1-pre-r2.json) was generated
using unmodified models from `7d84109`, then given deterministic IDs/timestamp. It
includes owned/retained instances, a returned Delay archive, CV and feedback cables,
and an engaged second project with loans. It is not a newly generated R2 save.

## Validation

- `npm run test:patch`: 17 passing tests, including the six existing policy tests.
  New [model tests](../../tests/modulePatch.test.ts) cover repeated instances,
  invalid IDs/endpoints/domains/controls, missing definitions/behaviors/versions,
  exact serialization, frozen v1 records, archive resolution and no context on load.
  [Audio tests](../../tests/patchAudioGraph.test.ts) record observable Web Audio
  operations, scales, internal Delay paths, independent voices, phase-preserving
  edits, validation before mutation, source removal and idempotent disposal.
- `npm run test:studio`: all seven existing progression/save/archive tests pass.
- `npm run build`: passes; the existing missing `/index.css` warning remains.
- Focused TypeScript check passes for PatchWorkspace/PatchSandbox/StudioPrototype,
  the new services and tests, including their imports. No claim that the unused
  alternate `src/App.tsx` type-checks.
- Isolated headless Chromium compared unmodified `7d84109` PatchAudioGraph against
  R2 using real OfflineAudioContext nodes and identical seeded noise, at 48 kHz:

| Graph | Samples compared | Maximum sample difference | R2 peak |
|---|---:|---:|---:|
| Unpatched silence | 48,000 | 0 | 0 |
| Direct oscillator -> Output | 48,000 | 0 | 0.03938 |
| Seven behaviors, three CV routes and Delay return | 48,000 | 0 | 0.03583 |
| Two instances of one oscillator definition | 48,000 | 0 | 0.07551 |

This is numerical evidence for the exercised graphs, not perfect future DSP replay
or a human listening/fun assessment. The
[ordinary seven-behavior fixture](../../tests/fixtures/sevenBehaviorPatch.ts) is only
serialization/build evidence; it is not an R3 starter rack or user preset feature.

The same Chromium run verified zero contexts before Start/reload, one shared
context after Start, real analyser output from a visible direct cable, exact silence
after clearing cables, stop/restart cleanup, pre-R2 save load, project closure,
archive cancellation/reacquisition/reload, original preservation, context-switch
stop, visible bad-save errors with raw data retained, and the legacy route/sentinel.
No uncaught page errors. All tests used isolated browser storage, not personal saves.
Browser scripts remain temporary files outside the repo per the Playwright skill.

`git diff --check` passes. No protected CI files were touched.

## Stop boundary

R2 validation and user acceptance are complete. R2 did not authorize automatic
R3 work; the user's subsequent R3-A order authorizes design only. No envelopes, S&H,
quantizers, clocks/gates, sequencers, schedulers, sample/buffer resources, stereo
Output, new feedback models, 100-module registration, starter racks or adventure
content were added. Future content and behavior need their own scoped work order.
