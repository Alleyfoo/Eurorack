# R1 draft — module definitions, ports, controls and capabilities

2026-10-05. **Design proposal only.** No exported TypeScript types, registry or
save migration is implemented here. Read the [role contracts](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[source audit](../content/R1_CATALOGUE_SOURCE_AUDIT.md) and
[coverage witnesses](../content/R1_PATCH_FAMILY_COVERAGE.md). R2 starts only after
review; initially it adapts the seven existing S1-A kinds, not the entire catalogue.

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
| PITCH_CV | Continuous logarithmic pitch: 1 unit = one octave, 0 = definition's declared reference frequency. | Reference Hz, sum/transpose law and bounds; quantization is optional processing. |
| GATE | High/low state with duration. | Sustain/release, threshold/hysteresis when converting an analog waveform, behavior on disconnect. |
| TRIG | Timestamped rising-edge event. | Pulse width if rendered continuously, retrigger policy and response latency. |
| CLOCK | Timestamped pulse stream used for period/advance semantics. | Start/stop/reset policy, missing-clock timeout, ratio and phase semantics. |

EOC/EOS/sync describe a port's **meaning**, not extra signal domains. A completion
port can emit a gate or trigger, but must declare which. Clock is a timing role
with stronger consumer expectations than an arbitrary event. “Audio-rate” is a
processing-rate requirement, not a seventh domain or permission to reinterpret
an audio cable as calibrated pitch. Internal signal representation is an R2/R5
implementation choice, constrained by these meanings.

### Connection policy proposal

| From → to | Default |
|---|---|
| Matching domains | Connect if direction, channels, cardinality and binding agree. |
| PITCH_CV → CV | Only a port explicitly accepting pitch units; no normalized-CV assumption. |
| CV → PITCH_CV | Only an explicit pitch-mapping inlet or a converter such as #99. No mandatory scale quantization. |
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

Default input cardinality is one cable. Summing ports opt into multiple incoming
cables with a documented sum/normalization rule; event inputs explicitly choose
reject, merge or per-lane consumption. Output fan-out is allowed and transparent.
This makes the physical mult optional grouping rather than a special access gate.
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

## R2 adapter boundary and acceptance checks

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
save version/migration needs its own reviewed task. Definition manifests may
prepare future archives without turning historical cards into audible processors.

Review/check requirements for that first implementation:

- Unique stable definition, instance, port, control and cable IDs; endpoint
  direction/channel/domain/cardinality validation before live graph mutation.
- Registry binding and capability validation; no missing-processor fallback;
  finite controls and behavior-specific settings, assets/version errors explained.
- Serialization round trips preserve exact IDs and all cables; corrupt/unsupported
  data remains stored. Archive manifests and dependency mappings remain immutable.
- The seven-kind adapter preserves the existing route effects and lifecycle;
  Studio and patch routes still work; legacy default route/save untouched.
- Causal cycle checks, failed validation before partial audio mutation, bounded
  output and reliable cleanup. No sound/context allocation on load.
- Tests demonstrate observable contracts (signal mapping, repeated module instances,
  immutable snapshots, missing dependencies), not only JSON matching its own schema.

This document proposes semantics to review. It authorizes none of the future
100-module implementations, sequencer runtime, recording service or content UI.
