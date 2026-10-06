# R1 draft — module definitions, ports, controls and capabilities

2026-10-05. **Accepted in direction, amended at the R1 gate.** See the
[acceptance record](../plans/R1_ACCEPTANCE_AMENDMENTS.md). No exported TypeScript types, registry or
save migration is implemented here. Read the [role contracts](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[source audit](../content/R1_CATALOGUE_SOURCE_AUDIT.md) and
[coverage witnesses](../content/R1_PATCH_FAMILY_COVERAGE.md). R2 starts only after
explicit authorization; it adapts only the seven existing S1-A kinds. The broad
shapes and vocabulary below describe future contracts, not the R2 implementation
checklist. Capability ontology, event execution and resource manifests are deferred.

## Identity and ownership

`definitionId` identifies a fictional product; `behaviorId` identifies a reusable
processor contract. `instanceId` identifies one physical item. Two Solar Sines
share a definition and processor but have different instance IDs and controls.
Ownership and loan provenance stay in Studio inventory/branch state, not in a
definition or audio processor. A patch contains installed instances, not all
owned objects. Sampo is reserved content, not a fallback executable behavior.

Keep existing legacy IDs as historical aliases. Proposed stable IDs such as
`solar-sine` need uniqueness validation before registration. Do not derive IDs
from display text on load, use table numbers as identity, or equate boss/starter
variants with the same definition solely because they have the same name.

```ts
// Illustrative shapes: a review target, not ready-to-copy runtime code.
type SignalDomain = 'AUDIO' | 'CV' | 'PITCH_CV' | 'GATE' | 'TRIG' | 'CLOCK';
type ControlValue = number | boolean | string;

interface ModuleDefinition {
  definitionId: string;
  definitionVersion: number;
  displayName: string;
  subtitle: string;
  manufacturerId: string | null; // unknown is explicit, not "Boss-Only"
  behaviorId: string;
  behaviorVersion: number;
  configuration: JsonObject; // processor-validated static options
  ports: PortDefinition[];
  controls: ControlDefinition[];
  capabilities: CapabilityClaim[];
  tags: string[]; // discovery/help metadata; never processing authority
  history: HistoricalRecord[]; // source/version, legacy ID, description/rarity
}
interface ModuleInstance {
  instanceId: string;
  definitionId: string;
  definitionVersion: number;
  controls: Record<string, ControlValue>;
  settings: JsonObject; // validated patterns, segments, routing, asset references
}
interface PatchCable {
  cableId: string;
  from: { instanceId: string; portId: string };
  to: { instanceId: string; portId: string };
}
interface Patch {
  formatVersion: number;
  instances: ModuleInstance[];
  cables: PatchCable[];
}
```

`JsonObject` means finite JSON data validated against the behavior's specific
schema, not arbitrary executable code. An ordinary oscillator needs no settings.
Patterns, function segments and matrix coefficients belong in typed settings,
not stringified slider controls. A separate optional layout maps instance IDs to
positions; layout changes never change audio or timing. Patch data never stores
an AudioNode, AudioContext, callback, analyser value or current ownership grant.

## Port contract and signal vocabulary

Every port needs a stable ID, label, direction, supported domains, channel count,
range/quantity, default when disconnected and combination rule. Semantic target
IDs identify a processor inlet/parameter; the runtime never switches on labels.
The registry checks that the port binding exists on the selected behavior version.

| Domain | Proposed meaning | Input behavior that must be declared |
|---|---|---|
| AUDIO | Continuous sound, nominal normalized samples; mono jack unless explicit stereo bundle. | Channel mapping, DC handling, gain/clipping; out-of-nominal values can be musical. |
| CV | Continuous generic dimensionless control, usually bipolar [-1,1] or unipolar [0,1]. | Range and transfer function; Hz modulation, parameter fraction and gain are different bindings. |
| PITCH_CV | Calibrated logarithmic pitch within the continuous CV family: 1 unit = one octave, 0 = definition's declared reference frequency. | Reference Hz, sum/transpose law and bounds; generic CV also connects using the inlet's declared pitch mapping. Quantization is optional processing. |
| GATE | High/low state with duration. | Sustain/release, threshold/hysteresis when converting an analog waveform, behavior on disconnect. |
| TRIG | Timestamped rising-edge event. | Pulse width if rendered continuously, retrigger policy and response latency. |
| CLOCK | Timestamped pulse stream used for period/advance semantics. | Start/stop/reset policy, missing-clock timeout, ratio and phase semantics. |

EOC/EOS/sync describe a port's **meaning**, not extra signal domains. A completion
port can emit a gate or trigger, but must declare which. Clock is a timing role
with stronger consumer expectations than an arbitrary event. “Audio-rate” is a
processing-rate requirement, not a seventh domain or permission to reinterpret
an audio cable as calibrated pitch. R2 retains the current AUDIO/CV representation;
extended signal/event representation is a later scoped implementation choice.

### Connection policy proposal

| From → to | Default |
|---|---|
| Matching domains | Connect if direction, channels, cardinality and binding agree. |
| PITCH_CV → CV | Patchable continuous CV; the receiving port declares how octave-valued numbers affect its parameter, including depth/bounds. Preserve calibrated metadata where precision is promised. |
| CV → PITCH_CV | Directly patchable using the pitch inlet's declared generic-CV depth/transfer law. No converter or quantizer required for LFO → pitch. |
| AUDIO → modulation/FM/PM | Only an explicit audio-rate input declaring units, depth and processing rate, such as #8. |
| CLOCK → TRIG | Allowed only where the input declares rising-edge consumption; reset/transport metadata does not transfer. |
| GATE → TRIG | Explicit rising-edge adapter on that input. Held high fires once, not every frame. |
| TRIG/CLOCK → GATE | Explicit pulse-duration adapter; never infer indefinite sustain from one event. |
| CV/AUDIO → GATE/TRIG/CLOCK | Explicit detector/comparator with threshold semantics, not an automatic cable color conversion. |
| Mono ↔ stereo | Explicit ports or declared channel mapping; never silent channel discard. |

A port supporting `AUDIO` and `CV` is a DC-coupled signal path with a declared
mode/representation, not an arbitrary polymorphic cable. Domain-preserving routes
and switches (#90/#96) lock their lane domain while connected; mixed incoming
domains need an explicit conversion. Pitch-transparent utilities must additionally
declare unit preservation. A gain stage cannot advertise precision pitch handling
just because its samples happen to include DC.

PITCH_CV is semantic/unit metadata within the continuous CV family, not a separate
class of cable. Pitch-capable catalogue inlets accept generic CV and declare its
mapping as part of their contract. For example, a generic bipolar LFO may map to
`cvDepthOctaves * input`, with default depth one octave per unit, while calibrated
PITCH_CV contributes one octave per unit without normalization. An inlet depth
control or an optional external attenuverter changes the modulation amount; no
utility is required merely to permit the cable. Precision addition/sequencing
retains calibrated units and explicit reference-frequency semantics. No pitch
mapping silently quantizes, makes music "correct", or reinterprets an old save.
Accepting generic CV does not turn that source into calibrated PITCH_CV. Precision
utilities declare octave units and reference semantics for their arithmetic;
a mapped modulation source carries no implied pitch-calibration guarantee.

Default input cardinality is one cable. Summing ports opt into multiple incoming
cables with a documented sum/normalization rule; event inputs explicitly choose
reject, merge or per-lane consumption. Output fan-out is allowed and transparent.
No physical mult is required to split a cable. #94 instead proposes paired pitch
transposition/clock-division lanes; plain buffering/duplication alone adds no value.
R2's compatibility adapter retains S1-A's existing additive fan-in where present.

Disconnected inputs have explicit constants or silence. No hidden sequencer,
exciter, source-to-output route or output normalization is permitted. Internal
oscillators, feedback or mixers are fine when part of the advertised module's
contract. Internal selectable routes are serialized settings and explained in
the panel. They never depend on screen position.

## Controls and modulation bindings

Control definitions need `controlId`, label, kind (number/enum/toggle), typed
default, finite bounds/step for numbers, options for enums, unit, display scale,
processor binding and smoothing policy. Logarithmic slider display does not
change the persisted physical value. A momentary action such as manual trigger
is a separate action definition; do not persist a held button as a sound-start
request. Numeric bounds apply at the UI and runtime boundary.

Each modulated target declares the equation connecting base control and input.
Example proposal: pitch `f = referenceHz * 2 ** (baseOctaves + pitchInput)`;
linear FM adds `depthHz * audioInput` before a declared frequency bound; PM adds
`depthCycles * audioInput` to phase. These are distinct capabilities. Oscillator
ratio is an internal relationship control, not precision addition disguised as
FM. Separate linear/exponential FM inlets are also recognized by real modules.
[DPO manufacturer manual](https://www.makenoisemusic.com/wp-content/uploads/2024/03/dpo-manual.pdf).

Gain uses a declared law (`base + depth * cv`, exponential or signed), not the
old value/rarity multiplier. Clamping, saturation and envelope response are
processor choices exposed in the contract. Random seeds and recurrence settings
are saved when provided; no schema claims exact DSP replay from a seed alone.

## Capabilities and processor registry

This is future design vocabulary. R2 needs only direct bindings for its seven
implemented behaviors; optional descriptive tags do not require a capability
ontology, derivation engine or general claim validator.

A capability is a validated functional assertion with bindings and constraints,
not an inheritance category. For example `pitch.input` points to the pitch inlet,
`modulation.wavetable-position` points to a separate inlet/control,
`event.end-of-cycle` declares event form, and `signal.dc-coupled` declares the
relevant lanes. Contradictory claims fail registration. Capability tags do not
instantiate extra processors or secretly connect ports.

| Vocabulary group | Candidate capability IDs / required evidence |
|---|---|
| Source | `source.periodic`, `source.noise`, `source.exciter`, `source.wavetable`, `source.harmonic-bank`; source outputs and configuration. |
| Pitch/modulation | `pitch.input`, `pitch.add`, `pitch.quantize`, `modulation.linear-fm`, `modulation.phase`, `modulation.wavetable-position`, `modulation.slew`, `modulation.chaos`; explicit bindings and units. |
| Spectrum/gain | `filter.lowpass`, `filter.multimode`, `filter.formant`, `shape.fold`, `gain.dc-coupled`, `gain.signed`, `gain.lpg`, `math.multiply`; inlet/outlet/control evidence. |
| Events/functions | `function.adsr`, `function.cycle`, `event.end-of-cycle`, `event.logic`, `event.probability`, `event.compare`, `clock.source`, `clock.ratio`; duration/order/reset semantics. |
| Sequence/memory | `sequence.pitch-gate`, `sequence.trigger-lanes`, `sequence.multilane`, `sequence.recurrence`, `memory.sample-hold`, `memory.track-hold`, `memory.cv-loop`; typed stored state and ports. |
| Routing | `mix.audio`, `mix.cv`, `route.switch`, `route.sequential`, `route.matrix`, `gain.matrix`, `route.fan-out`; domain, gain and channel preservation. |
| Time/material | `resonance.modal`, `resonance.comb`, `effect.delay`, `effect.diffusion`, `effect.stereo`, `buffer.granular`, `buffer.slice`, `buffer.tape`, `sample.kit`; memory/resource and feedback contracts. |

Registry descriptors bind a versioned behavior to its parameter/port/settings
schema, factory/update/dispose contract, processing-rate support, latency and
state preservation policy. `implemented` and `planned` are separate statuses;
unsupported behavior produces an explanation and preserves the patch data,
never generic fallback sound. There is no requirement for one processor per
catalogue row. Coverage is accepted only when required capabilities actually
exist; static tags are evidence to validate, not proof of implementation.

## Feedback, events and lifecycle

Keep current audio lifecycle and S1-A cycle policy in R2. The event-loop contracts
below constrain later event behaviors; they do not request an R2 event algebra,
scheduler, loop solver or generic timing framework.

Audio cycles require a positive causal delay on every cycle. A behavior descriptor
must identify the actual inlet-to-outlet paths that provide delay; marking a whole
module “delay” is insufficient if a dry bypass path remains instantaneous. R2
retains the narrower tested S1-A policy first. Later filter/comb/internal loops
need separate support and validation; zero-delay algebraic loops are unsupported,
not solved by adding arbitrary invisible cables.

Control/event loops need causal scheduling too. #40's completion loop emits after
its nonzero contour duration. Simultaneous events use a documented deterministic
order; multiple incoming events do not recursively execute in a render frame.
Minimum duration and per-tick event/CPU limits prevent event storms. On exhaustion,
stop/suspend the affected execution with an explanation and preserve all patch
data. This is runtime containment, never progression failure or musical grading.
Audio-clock time, not animation frames, owns musical event scheduling. Muting
doesn't change the logical patch, while switching Studio/project contexts follows
the existing stop-audio lifecycle.

Reuse `audioEngine.openStudioPatchSession` and existing master output safety.
Only Output connects to speakers; character soft limiters do not replace the
master. Load, archive inspection and validation create no AudioContext. Acquire
the shared session only after the deliberate Start gesture; dispose all sources,
routes, timers and buffers that belong to it when released.

## Persistence, dependencies and unavailable behavior

Version identity and immutable preservation apply immediately. Asset manifests,
new substitution machinery and captured-material storage below are future
requirements when those behaviors are introduced, outside the seven-kind R2 seam.

Patch format, definition and behavior versions are separate. Archives pin the
definition versions or embed validated definition manifests so a later port
rename cannot reinterpret an old cable. Ownership/provenance remains distinct
from definition/asset availability. Forking still requires explicit dependency
resolution; same-kind is no longer enough once port semantics differ. A substitute
needs an explicit compatible-port mapping and user-visible control mapping;
two dependencies cannot collapse onto one owned instance. Original archive stays
immutable. Unknown versions/ports/controls remain stored with an error.

Sample assets and frozen buffers are dependencies too. For #3/#84, record stable
asset IDs, content hashes and required slot mappings. Later asset storage can be
local, with authored assets bundled when appropriate. No cloud service is needed.
For #22/#64/#70/#71/#75, distinguish configuration from mutable captured material:
R1 does not authorize recording/storage implementation. Before offering those
modules as persistent playable content, choose and implement a versioned local
resource store or explicitly mark the patch as missing captured material and
resolve it on reopen. Do not present a silently emptied loop as a faithful archive.
DSP phase, live delay tails and exact chaotic state replay remain optional unless
explicitly included; storing a patch does not promise bit-exact performance.

## R2 implementation boundary — seven existing behaviors only

This section is the complete implementation boundary once R2 is explicitly
authorized. The broader conceptual sections above do not expand it.

Start with `prototype.oscillator`, `prototype.noise`, `prototype.filter`,
`prototype.vca`, `prototype.lfo`, `prototype.delay`, `prototype.output` definitions.
These are adapters, not assertions that Solar Sine or Fusion Ladder already has
its final behavior. Preserve current IDs, numeric controls, cables and domains:
oscillator `pitch` remains generic CV with 1200 cents/unit; filter `cutoff` remains
CV with 2400 cents/unit; VCA `gain` remains CV with 0.5 gain/unit; ordinary routes
scale 1. Keep current control defaults/ranges from `PATCH_DEFINITIONS` and Delay's
explicit return path. Current Output is fixed infrastructure outside the 100
fictional catalogue slots. Reserve stereo infrastructure but don't implement it
as a side effect of the first adapter.

Do not reinterpret `eurorack_studio_save_v1` or legacy saves in place. R2 may
use a boundary adapter with round-trip preservation first; any subsequent new
save version/migration needs its own reviewed task. Minimal stable definition/
behavior version fields and resolution checks are enough; retain supported
versions or explain an unsupported one without deleting stored data. No definition
or asset manifest framework is needed for these seven fixed definitions. Existing
same-kind archive resolution remains valid for their unchanged port contracts;
general cross-definition control/port substitution is deferred.

Review/check requirements for that first implementation:

- Minimal definition/behavior/instance/port/control/patch types and a direct
  registry for exactly the seven existing behaviors. No dispatch by display names.
- Unique stable IDs, valid endpoints and current signal compatibility, finite
  numeric controls and existing cycle/fan-in rules checked before graph mutation.
  Unknown behavior/version fails explicitly; no generic audible fallback.
- One ordinary explicit preset fixture round-trips definitions, instances,
  controls and cables and builds through the same visible graph. No new preset
  abstraction, authored starter suite or selection UI required.
- Studio/project/archive round trips preserve exact instance IDs, numeric values,
  every cable and dependency provenance. Forking/loan resolution reuses existing
  explicit behavior and never mutates the original snapshot or grants ownership.
- Definition/behavior version identity is sufficient to detect incompatible
  records; corrupt/unsupported stored data remains intact with an explanation.
- The seven-kind adapter preserves the existing route effects and lifecycle;
  Studio and patch routes still work; legacy default route/save untouched.
- Existing audio cycle checks, failed validation before partial audio mutation, bounded
  output and reliable cleanup. No sound/context allocation on load.
- Tests demonstrate observable contracts (signal mapping, repeated module instances,
  immutable snapshots, existing missing-loan resolution), not only JSON matching
  its own schema.

Explicitly defer the full capability ontology/claim-validation engine, six-domain
event algebra and scheduler, asset/resource manifests or local buffer store,
100-module registration/validation, new DSP and stereo Output. Those enter only
with a later behavior/content need and scoped authorization. R2 may preserve
optional metadata for future use without implementing the machinery behind it.

In particular, R2 adds no sequencer runtime, quantizer, S&H, envelopes or Clock/GATE
behavior; no generalized causal-event network or future feedback architecture;
and no sample/buffer resource service, broad asset manifest system or catalogue
migration. Starter presets remain R3 content. The ordinary preset mentioned above
is a preservation/build test fixture using the seven existing behaviors, not a
new starter instrument or preset feature.

R1 acceptance in direction and this narrowed checklist do not authorize starting
R2. No runtime changes are part of the four-amendment documentation pass.
