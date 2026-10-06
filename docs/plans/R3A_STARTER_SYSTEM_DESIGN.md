# R3-A — Starter systems and required behavior

2026-10-06. The user accepted and closed R2 after reviewing `421c575`, `fd75c89`
and `2f46380`, then requested starter design before additional DSP. This packet
proposes four systems. It authorizes no behavior implementation or executable
starter release. **The game design chooses which synth capabilities we build.**

Subsequent user review of `0207bfa` / `b25d452` accepted the direction and retained
all four graphs as targets for the separately authorized
[R3-S selected behavior substrate](../project/R3S_STARTER_SUBSTRATE.md), now
implemented. This original design dataset remains unchanged; native audition
fixtures record their two level adjustments separately. Eleven versus twelve
positions remains open. R3-B must also resolve starter inventory fairness: three
systems grant seven ordinary modules while Rhythm grants ten. No permanent
progression/class advantage should follow from choosing the larger inventory.

Read with the [governing design](../design/GAME_DESIGN.md),
[accepted role contracts](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[16 research-family witnesses](../content/R1_PATCH_FAMILY_COVERAGE.md) and
[accepted R2 seam](../project/R2_DATA_DRIVEN_PATCH_SEAM.md). The original research
was corroborated by the user, not newly inspected by this agent. No additional
historical research, catalogue reclassification or full registry is needed here.

## Proposed opening

Offer four examples of different relationships, with all ordinary installed
instances owned and dismantlable. A choice is starting material, not a character
class, genre, difficulty level or permanent branch. Every cable can be removed;
silence, unstable changes and abandoned experiments remain normal outcomes.

| Candidate | Initial relationship / intended sound | Ordinary positions + Output | Minimum missing items |
|---|---|---:|---|
| Slow Machine | Two close sources beat while slow control moves brightness/level through a visible echo return | 7 + 1 | Mono audio mixer |
| Three Against Five | Independently decaying pitched body and hiss articulate on divided clocks; no required melody | 10 + 1 | Clock, integer division, AD contours, mixer, simple noise coloration |
| Crossed Embers | Audio-rate FM and folding affect one another through a delayed return; slowly changing metallic/rough sustained sound | 7 + 1 | Linear FM extension, wavefolder, signed trims |
| Wooden Weather | Shaped noise excites a resonator; completion events hold changing pitch while a second contour changes ringing | 7 + 1 | Cycling/EOC extension of AD, S&H, modal resonator, signed trims, noise coloration |

**Recommend all four for design review.** Three Against Five and Wooden Weather
produce articulated systems that the current continuous seven-behavior engine
cannot express. Crossed Embers uses audio-rate transformation and causal coupling,
not merely a more resonant filter. Slow Machine provides the calm, easily unpacked
alternative. Actual character and tuning remain listening hypotheses, not proof
that any candidate is fun or a promise of a particular waveform recording.

## Graph/data contract

[R3A_STARTER_GRAPHS.json](../content/R3A_STARTER_GRAPHS.json) is the authoritative
draft for instance IDs, exact catalogue names, owned/infrastructure membership,
port endpoints, cable IDs, initial controls/settings, transport and slot counts.
The candidate sections below display that data in a reviewable form.

This is **design data**, with `designFormat` and `runtimeEligible: false`, not a
`ModulePatch` load file. `definitionRef` names local draft products, not registered
definition IDs or invented historical IDs. Ports/values are provisional audition
specifications; they do not finalize every future product panel, range or DSP.
Controls use the units listed in the JSON; finite settings describe only the
selected modes. No generic capability ontology or pattern-language schema is added.

The selected draft contracts expose only ports needed by these modes. Full #8 PM,
#32 slew, #85 multiplication, #62 time CV/wet control, optional drift and perfected
ladder character are not prerequisites. This deliberately scoped realization must
be labelled honestly when later registered; it cannot claim the full R1 product
contract has shipped. The 17 selected catalogue identities remain unchanged;
Output is separate infrastructure. R3-B must settle stable definition/version IDs
for the chosen modes rather than silently repurpose R2's frozen `prototype.*` IDs.

Connection rules used here:

- AUDIO feeds AUDIO; CV feeds declared CV targets. Pitch inlets map generic CV
  directly at one octave/unit; they do not certify the source as calibrated pitch.
  All four graphs use uncalibrated modulation and need neither quantizer nor adder.
- #33's trigger and #52's sample inlet explicitly consume CLOCK rising edges or
  TRIG events. Reset remains a separate TRIG port. No global cable conversion.
- #93's lane families are explicit in each instance's `laneFamilies` setting.
  A lane preserves its declared AUDIO or CV domain. The JSON's `lane` field is a
  port-to-setting reference, not a new signal family. No pitch-calibration claim.
- Fan-out is free. Each ordinary inlet below has one incoming cable; two audio
  voices meet in an explicit #87 mixer. No hidden summing or normalization.
- A delay provides every external audio feedback cycle. There is no dry bypass,
  zero-delay solver, control-loop scheduler or new feedback policy proposed here.

On fresh instantiation, all contours/held values/counters have the explicit initial
states shown. One deliberate Start enables the advertised running clock/cycle
modes; sources have no hidden output routes. Load/inspection/selection never starts
audio, advances a pulse counter or progresses the world. Stop disposes session-owned
drivers. Continuity across a later stop/restart needs a bounded transport decision;
R3-A does not promise exact phase or tail replay. Master safety stays Studio-owned.

## Candidate interpretation and dismantling

**Slow Machine:** Solar Sine at 110 Hz and Gramps' Saw at 111 Hz give a 1 Hz beat
component and a rich spectrum for the filter. LFO at 0.06 Hz moves gain and cutoff
together. With gain bias 0.4 and the existing 0.5 CV depth, its 0.35-peak modulation
keeps gain between 0.225 and 0.575. Delay's 0.25 return trim supplies gentle memory.
Optional drift is off; two separate sources avoid requiring a dual-VCO behavior
just to obtain beating. These are two owned instances, not an indivisible voice.
Remove the return cable to hear a single delayed pass; bypass the filter or VCA;
disconnect one source to expose the beating relationship. Every remaining module
is useful independently. Its one missing processor is the two-input mixer.

**Three Against Five:** a 3 Hz patch clock drives division 3 and division 5, yielding
1 Hz body events and 0.6 Hz noise events. Phase zero emits on the first source edge;
the relationship repeats every 15 source ticks (5 seconds), without meter grading.
Both divider reset ports receive the clock's manual reset output. Noise has a
1 ms attack/55 ms decay; the body has a 2 ms attack/180 ms decay. Separate AD/VCA
paths keep noise and body decay independent. Initially the body AD also sweeps
pitch from about 130 Hz toward the 65 Hz base: pitch and body amplitude share one
contour, with no claim of fully independent pitch decay. This is a lean percussion
starter, distinct from the fuller R1 witness; a separate pitch AD is a useful first
added relationship. It uses no samples, dedicated drum machine, LPG or sequencer.
Change ratios, swap trigger cables, disconnect pitch motion, or reuse either AD
and VCA on another source. Removing a division can reconnect its AD to the master
clock directly. Nothing makes these two voices permanent drums or a correct beat.

**Crossed Embers:** one Vaporline source at 113 Hz drives the 220 Hz carrier's
linear-FM input through a 0.4 trim. The carrier's folded, gained, delayed output
returns through a separate 0.22 trim to the modulator's linear-FM input. Thus
the mutual relationship has an explicit 120 ms causal delay. The initial FM law
is `clamp(basePitchHz + depthHz * audioInput, 20, 12000)`; it is not generic CV
detune and does not promise through-zero FM. The internal modulators are disabled.
The carrier path goes through a real wavefolder; its initial drive of 6 makes
the retained 0.25-peak periodic source exceed the proposed ±1 reflection bounds.
A scaled 0.09 Hz LFO changes that drive. No self-return cable is installed on
Delay; return trim is zero.
Breaking the delayed FM return leaves ordinary feed-forward FM, not silence.
Setting trim 1 to zero reveals the folder; removing both FM cables leaves two
individually useful sources. Signed trims let the player change coupling without
a compulsory converter or a new musical correctness rule. Exactly how rough the
initial setting becomes must be measured/listened to later, not assumed chaotic.

**Wooden Weather:** Solar Wind Noise is gated by function channel A into Fossil
Resonator's explicit exciter inlet. A cycles with 4 ms rise/850 ms fall; its EOC
samples the separate 0.037 Hz LFO. S&H initially holds zero and never generates
random values. After a completion it holds new CV through a 0.5 trim into resonator
pitch (at most ±0.4 octave from the 137 Hz reference). Channel B rises for 11 s
and falls for 17 s; through gain 0.7 and damping depth 0.3 it moves damping from
0.55 to 0.76. Proposed mode ratios `[1, 2.76, 5.4]` are an audition configuration,
not source-verified material physics. This is stepped deterministic exploration,
not a falsely advertised random/generative sequencer or full Krell witness.
Remove excitation and the resonator tail must die: no internal strike or oscillator.
Unpatch S&H to return to fixed pitch, sample manually, or reuse the function
channels as independent envelopes. Noise/VCA remain a separate exciter; the
resonator and held control remain separately patchable components.

## Smallest missing behavior set for these four graphs

Eight new processing functions plus three bounded extensions are sufficient for
the **selected modes**; this is not permission to implement all of old R5.
Sharing the AD core matters: #33 and both #32 channels do not need three DSP systems.

| Item | Required by | Smallest truthful contract / omission consequence |
|---|---|---|
| Mono audio mixer | Slow, Rhythm | Two audio lanes, independent gains and master sum. Without it the explicit two-voice balance is absent. |
| AD contour core | Rhythm, Weather | Positive attack/decay, [0,1] CV, explicit retrigger. Without it rhythm is continuous tone/noise and excitation is unshaped. |
| Master pulse clock | Rhythm | Patch-time pulse stream, run/width/manual reset. Without it the starter has no explicit repeating event source. |
| Integer clock divider | Rhythm | Count input rising edges, integer ratio/phase/reset, stop when input stops. Without it two independent temporal relationships disappear. No multiplier. |
| Signed trim lanes | Cross, Weather | Four independent AUDIO/CV lanes with signed manual gain, no offset. Without it coupling depth and held-pitch/damping amounts cannot be set as authored. |
| Wavefolder | Cross | Actual repeated folding, symmetry and fold CV. Without it that spectral mechanism disappears; tanh is insufficient. |
| Edge sample/hold | Weather | Capture the actual connected CV stream at a TRIG edge and retain value. Without it contour completion no longer chooses/holds pitch. |
| Excited modal resonator | Weather | At least the proposed damped mode response, pitch/damping/excitation control, no autonomous source. Without it there is no exciter -> resonator architecture. |
| Linear-FM oscillator extension | Cross | AUDIO-rate input with declared Hz depth and bounds on the periodic core. R2 detune modulation does not substitute. |
| Cycle + completion extension of AD | Weather | Two independent channels, one EOC per completed positive-duration contour and explicit cycle mode. No full slew/function suite. |
| Simple noise-color extension | Rhythm, Weather | Existing noise plus declared low-pass coloration at the authored cutoff. No sample import, recorded buffer or full noise model. |

Reuse periodic sources, low-pass, AUDIO-mode VCA, sine LFO, explicit-return Delay
and Output from R2. Control values/flags and selected port mappings need bounded,
typed persistence for these modes; that is separate from inventing a general
ontology or accepting arbitrary executable settings. No pitch sequencing,
quantization, randomness, gate sustain, ADSR, S&H hidden source, switching, stereo,
granular/sample/tape storage or dual/quadrature oscillator is required here.

The eight/functions + three/extensions count concerns implementation responsibilities,
not an arbitrary count of registry entries. Wrappers/instances may share cores.
This union is minimal **relative to these chosen graphs**, not a claim that no
other starter set could require less work. A three-candidate option that defers
Wooden Weather removes S&H, resonator and cycle/EOC: six new functions plus two
extensions remain. It also postpones the exciter/resonator opening. Dropping Slow
Machine saves no required behavior, since Rhythm still uses the mixer.

## Proposed behavior milestone between R3-A and R3-B

After reviewing/selecting starters, issue a separate bounded implementation order.
Suggested logical bundles, not current authorization:

1. Mixer and signed trims; prove visible connections and controlled mixing.
2. AD, master pulse clock, integer division and noise color; prove the two rhythm
   voices with explicit edge/reset/stop/retrigger behavior.
3. Linear FM and wavefolder; prove feed-forward and delayed coupling with the
   existing audio-cycle policy and output safety.
4. Extend AD for dual cycling/EOC, add S&H and modal resonance; prove real-stream
   sampling and exciter dependence in Wooden Weather.

Build only each selected behavior's scheduling/processing needs. Clock pulses,
AD contours and completion/sample edges require musical audio-time causality,
positive durations and deterministic same-time order. An EOC captures held CV
before the next articulation uses it. No frame-based timers/analyser polling
may masquerade as signal sampling; targeted processors/Worklets are acceptable
if the chosen behavior needs them. No generic event algebra, universal scheduler
or resource store follows from this requirement. Stop/release must clean all drivers.

Preserve R2's old definitions, exact signal mappings and v1 fixture; use new
versioned bindings for new modes. Test the necessary observable behaviors before
authoring runnable starters. Then listen to each and revise its initial values.
If a selected system is uninteresting, change the system; do not fake missing
ports or turn four candidates into whichever drones happen to run first.

## Capacity derived from systems

One ordinary position means one installed module instance, including a dual
function or quad trim as one item. This is current game-position accounting, not
real HP width; physical panel sizing remains later rack/presentation work.

- The exact graphs require 7, 10, 7 and 7 ordinary positions, respectively,
  plus one fixed Output each. All duplicate modules are distinct owned instances.
- **10 + Output** fits the largest untouched starter but leaves no audition space.
- **11 + Output** permits one extra module: Rhythm can acquire an independent
  pitch AD without losing either voice, clock division or articulation.
- **12 + Output** permits that AD plus an optional #93 depth utility while retaining
  the original system. The second module controls the new relationship, rather
  than functioning as a mandatory cable converter.

Recommend testing **11 and 12 ordinary positions, each plus Output**, with 12 as
the initial content-test target because it supports the demonstrated two-module
addition. The arithmetic is `10 + 1 independent contour + 1 optional depth utility`,
not the inherited sandbox capacity. This is a proposal, not a locked full-game
number, runtime change or slot-upgrade ladder. A useful built-in pitch-depth control
could remove the second support-module requirement; compare that design explicitly.
Storage stays generous and ownership survives uninstalling. Do not auto-evict a
module, charge for required room, or count Output as an acquisition obstacle.

R3-B should try every unchanged starter at those capacities, add the authored new
relationship, then deliberately swap/remove a module. Record which limit supports
compositional decisions and which merely blocks an instrument. Actual sound,
layout/gesture cost and playtest evidence may change the recommendation.

The concrete addition experiment is:

1. At 11 ordinary positions, add owned `rhythm-pitch-env` (#33) with attack 0.001 s,
   decay 0.045 s, exponential curve, restart-from-zero retrigger and initial value
   zero. Remove `rhythm-c07`; add `rhythm-add-c01: rhythm-div3.out ->
   rhythm-pitch-env.trigger` and `rhythm-add-c02: rhythm-pitch-env.out ->
   rhythm-body.pitch`. Body amplitude still decays over 0.18 s while pitch has its
   own 0.045 s decay. Existing triggers fan out freely.
2. At 12, optionally add owned `rhythm-pitch-trim` (#93), all four lanes CV,
   gain1=0.5 and gains2–4=1. Replace `rhythm-add-c02` with
   `rhythm-add-c03: rhythm-pitch-env.out -> rhythm-pitch-trim.in1` and
   `rhythm-add-c04: rhythm-pitch-trim.out1 -> rhythm-body.pitch`. This changes the
   pitch excursion from one octave to half an octave (peak about 91.9 Hz), without
   changing body amplitude or contour timing. Other lanes remain freely reusable.

Both additions use functions already required by the four candidates. Compare
the second position against a future explicit pitch-depth control before deciding
that it is useful rack room rather than unnecessary supporting hardware.

## Relationship to all 16 research families

This selection uses the research to choose contrasting entry systems; it does not
claim every family is executable at startup or that four starters replace R1 coverage.

| R1 family | Starter relationship or deliberate deferral |
|---|---|
| Subtractive voice | Slow uses source/filter/VCA; full ADSR voice remains later. |
| Pad / drone | Slow provides the sustained beating/modulation/memory opening. |
| Pluck / LPG | Deferred; Rhythm's AD/VCA is explicitly not an LPG. |
| Complex / percussive synthesis | Rhythm separates pitched body and noisy transient decays; independent pitch contour is the concrete addition. |
| Noise texture | Weather makes noise into excitation; Rhythm articulates hiss. |
| FM / PM | Cross requires real linear FM; PM remains deferred. |
| Wavetable | Deferred rather than introducing table resources for opening breadth. |
| Granular | Deferred; no capture/resource service required. |
| Physical modelling | Weather requires actual external excitation and resonant modes. |
| Vocal / formant | Deferred; no speech/formant capability claim. |
| Evolving modulation network | Slow, Cross and Weather use different continuous/discrete control relationships. |
| Generative sequence | Deferred; periodic-CV sampling is not stochastic recurrence or a sequencer. |
| Structured multi-lane sequence | Deferred; Rhythm has two clock ratios, not a pattern sequencer. |
| Krell / self-running | Weather borrows completion/sampling; a complete external causal-function-loop witness remains separate. |
| Tape / microsound | Deferred; Slow's live Delay is not a tape/captured-material archive. |
| Sample kit | Deferred; Rhythm synthesizes its elements instead of loading samples. |

## Review/exit gate

The packet supplies four explicit graphs, values, expected character, dismantling
examples, shared missing functions and a capacity experiment. Design assertions
check identities, endpoints, domains/adapters, controls, drivers, paths and cycles;
they establish structural consistency only. These values/behaviors are not runnable
in the accepted seven-behavior engine, and no runtime test or sound claim follows.

2026-10-06 design validation passed using a temporary Node assertion script:
four candidates, 17 exact catalogue identities plus Output, 35 distinct instance
IDs and 43 distinct cable IDs. All endpoints/directions/domains and explicit
clock adapters resolve; complete finite controls/settings match the draft modes;
each instance affects the output path; independent trim lanes stay independent;
every external AUDIO cycle is broken by Delay. The four driver/slot declarations,
eleven-item requirement union, 16-family references and displayed graph/control
tables match the data. JSON serialization round-trips exactly. This is structural
design evidence, not runtime DSP validation or listening acceptance.

Before authorizing behavior work, review the four-candidate selection, the eleven
bounded missing items, the deliberately partial catalogue modes and the capacity
experiment. R3-B also needs a separately reviewed persistence boundary for new
definition IDs/settings: R2's frozen v1 adapter cannot save these drafts by calling
them old kinds. Do not rewrite `eurorack_studio_save_v1` in place; preserve old saves,
archive identities and explicit dependencies under any later supported new version.

**Stop after R3-A documentation/data validation.** No behavior, native registry,
starter selection UI, save migration, content release or R3-B work is implemented.

## Explicit candidate graphs and controls

The following tables are transcribed from the draft JSON. All numeric values are
in that product's declared units; every instance includes its complete selected-mode
control/settings snapshot. Transport listen level is 0.15, unmuted, with deliberate
Start required in each candidate. Empty Output controls belong to fixed infrastructure.

### Slow Machine

7 ordinary owned instances + 1 infrastructure Output.

| Instance ID | Catalogue product | Initial controls (units) | Selected settings |
|---|---|---|---|
| `slow-sine` | #1 Solar Sine | frequency=110 Hz | `{"waveform":"sine"}` |
| `slow-saw` | #2 Gramps’ Saw | frequency=111 Hz | `{"waveform":"sawtooth","driftEnabled":false}` |
| `slow-mix` | #87 Needle Mixer | aLevel=0.6 gain; bLevel=0.35 gain; master=0.8 gain | `{}` |
| `slow-filter` | #11 Fusion Ladder Filter | cutoff=600 Hz; resonance=1.6 Q | `{"cutoffCvCentsPerUnit":2400}` |
| `slow-vca` | #41 Ghost Gate VCA | level=0.4 nonnegative gain bias | `{"gainCvPerUnit":0.5}` |
| `slow-lfo` | #21 Grandpa’s Drift LFO | rate=0.06 Hz; amount=0.35 bipolar CV peak | `{"waveform":"sine","driftEnabled":false}` |
| `slow-delay` | #62 Void Delay | time=0.37 s; input=0.8 gain; return=0.25 gain | `{"wet":1}` |
| `slow-output` | Infrastructure Output | — | `{}` |

Explicit cables (ordinary fan-out requires no mult):

```text
slow-c01: slow-sine.out -> slow-mix.a
slow-c02: slow-saw.out -> slow-mix.b
slow-c03: slow-mix.out -> slow-filter.in
slow-c04: slow-filter.out -> slow-vca.in
slow-c05: slow-vca.out -> slow-delay.in
slow-c06: slow-delay.out -> slow-delay.return
slow-c07: slow-delay.out -> slow-output.in
slow-c08: slow-lfo.out -> slow-filter.cutoff
slow-c09: slow-lfo.out -> slow-vca.gain
```

Active on deliberate Start: continuous sources only; no event driver.

### Three Against Five

10 ordinary owned instances + 1 infrastructure Output.

| Instance ID | Catalogue product | Initial controls (units) | Selected settings |
|---|---|---|---|
| `rhythm-clock` | #79 Thunderclock Driver | rate=3 Hz; pulseWidth=0.05 fraction of clock period | `{"run":true,"initialPhase":0}` |
| `rhythm-div3` | #85 Lunar Pulse Divider | division=3 positive integer input-edge count; phase=0 integer tick offset | `{"firstEdgeOnReset":true}` |
| `rhythm-div5` | #85 Lunar Pulse Divider | division=5 positive integer input-edge count; phase=0 integer tick offset | `{"firstEdgeOnReset":true}` |
| `rhythm-body-env` | #33 Thunderstrike ENV | attack=0.002 s; decay=0.18 s | `{"curve":"exponential","retrigger":"restart-from-zero","initialValue":0}` |
| `rhythm-noise-env` | #33 Thunderstrike ENV | attack=0.001 s; decay=0.055 s | `{"curve":"exponential","retrigger":"restart-from-zero","initialValue":0}` |
| `rhythm-body` | #1 Solar Sine | frequency=65 Hz | `{"waveform":"sine"}` |
| `rhythm-noise` | #57 Solar Wind Noise | level=0.45 gain; colorCutoff=6500 Hz | `{"colorMode":"lowpass"}` |
| `rhythm-body-vca` | #41 Ghost Gate VCA | level=0 nonnegative gain bias | `{"gainCvPerUnit":0.5}` |
| `rhythm-noise-vca` | #41 Ghost Gate VCA | level=0 nonnegative gain bias | `{"gainCvPerUnit":0.5}` |
| `rhythm-mix` | #87 Needle Mixer | aLevel=0.8 gain; bLevel=0.45 gain; master=0.8 gain | `{}` |
| `rhythm-output` | Infrastructure Output | — | `{}` |

Explicit cables (ordinary fan-out requires no mult):

```text
rhythm-c01: rhythm-clock.out -> rhythm-div3.in
rhythm-c02: rhythm-clock.out -> rhythm-div5.in
rhythm-c03: rhythm-clock.reset -> rhythm-div3.reset
rhythm-c04: rhythm-clock.reset -> rhythm-div5.reset
rhythm-c05: rhythm-div3.out -> rhythm-body-env.trigger
rhythm-c06: rhythm-div5.out -> rhythm-noise-env.trigger
rhythm-c07: rhythm-body-env.out -> rhythm-body.pitch
rhythm-c08: rhythm-body-env.out -> rhythm-body-vca.gain
rhythm-c09: rhythm-noise-env.out -> rhythm-noise-vca.gain
rhythm-c10: rhythm-body.out -> rhythm-body-vca.in
rhythm-c11: rhythm-noise.out -> rhythm-noise-vca.in
rhythm-c12: rhythm-body-vca.out -> rhythm-mix.a
rhythm-c13: rhythm-noise-vca.out -> rhythm-mix.b
rhythm-c14: rhythm-mix.out -> rhythm-output.in
```

Active on deliberate Start: `rhythm-clock`.

### Crossed Embers

7 ordinary owned instances + 1 infrastructure Output.

| Instance ID | Catalogue product | Initial controls (units) | Selected settings |
|---|---|---|---|
| `cross-carrier` | #8 Vaporline FM Source | frequency=220 Hz; fmDepth=850 Hz per normalized AUDIO unit | `{"waveform":"sine","internalModulatorEnabled":false,"frequencyBoundsHz":[20,12000]}` |
| `cross-modulator` | #8 Vaporline FM Source | frequency=113 Hz; fmDepth=300 Hz per normalized AUDIO unit | `{"waveform":"sine","internalModulatorEnabled":false,"frequencyBoundsHz":[20,12000]}` |
| `cross-trim` | #93 Solar Quad Attenuator | gain1=0.4 signed gain; gain2=0.22 signed gain; gain3=0.25 signed gain; gain4=1 signed gain | `{"laneFamilies":["AUDIO","AUDIO","CV","CV"]}` |
| `cross-folder` | #12 Thunderfold VCF | fold=6 dimensionless fold drive; symmetry=0 normalized input bias | `{"foldCvDepth":0.7}` |
| `cross-vca` | #41 Ghost Gate VCA | level=0.5 nonnegative gain bias | `{"gainCvPerUnit":0.5}` |
| `cross-delay` | #62 Void Delay | time=0.12 s; input=0.7 gain; return=0 gain | `{"wet":1}` |
| `cross-lfo` | #21 Grandpa’s Drift LFO | rate=0.09 Hz; amount=0.6 bipolar CV peak | `{"waveform":"sine","driftEnabled":false}` |
| `cross-output` | Infrastructure Output | — | `{}` |

Explicit cables (ordinary fan-out requires no mult):

```text
cross-c01: cross-modulator.out -> cross-trim.in1
cross-c02: cross-trim.out1 -> cross-carrier.linear-fm
cross-c03: cross-carrier.out -> cross-folder.in
cross-c04: cross-folder.out -> cross-vca.in
cross-c05: cross-vca.out -> cross-delay.in
cross-c06: cross-delay.out -> cross-output.in
cross-c07: cross-delay.out -> cross-trim.in2
cross-c08: cross-trim.out2 -> cross-modulator.linear-fm
cross-c09: cross-lfo.out -> cross-trim.in3
cross-c10: cross-trim.out3 -> cross-folder.fold
```

Active on deliberate Start: continuous sources only; no event driver.

### Wooden Weather

7 ordinary owned instances + 1 infrastructure Output.

| Instance ID | Catalogue product | Initial controls (units) | Selected settings |
|---|---|---|---|
| `weather-noise` | #57 Solar Wind Noise | level=0.4 gain; colorCutoff=3500 Hz | `{"colorMode":"lowpass"}` |
| `weather-exciter-vca` | #41 Ghost Gate VCA | level=0 nonnegative gain bias | `{"gainCvPerUnit":0.5}` |
| `weather-resonator` | #10 Fossil Resonator | frequency=137 Hz reference; damping=0.55 normalized [0,1]; structure=0.3 normalized [0,1]; excitationPosition=0.4 normalized [0,1] | `{"dampingCvDepth":0.3,"modeRatios":[1,2.76,5.4]}` |
| `weather-functions` | #32 Rustleaf Function Duo | riseA=0.004 s; fallA=0.85 s; riseB=11 s; fallB=17 s | `{"cycleA":true,"cycleB":true,"curveA":"exponential","curveB":"linear","initialValueA":0,"initialValueB":0}` |
| `weather-hold` | #52 Quantum Sprinkle | initialValue=0 generic CV | `{}` |
| `weather-lfo` | #21 Grandpa’s Drift LFO | rate=0.037 Hz; amount=0.8 bipolar CV peak | `{"waveform":"sine","driftEnabled":false}` |
| `weather-trim` | #93 Solar Quad Attenuator | gain1=0.5 signed gain; gain2=0.7 signed gain; gain3=1 signed gain; gain4=1 signed gain | `{"laneFamilies":["CV","CV","CV","CV"]}` |
| `weather-output` | Infrastructure Output | — | `{}` |

Explicit cables (ordinary fan-out requires no mult):

```text
weather-c01: weather-noise.out -> weather-exciter-vca.in
weather-c02: weather-functions.a.out -> weather-exciter-vca.gain
weather-c03: weather-exciter-vca.out -> weather-resonator.exciter
weather-c04: weather-resonator.out -> weather-output.in
weather-c05: weather-lfo.out -> weather-hold.value
weather-c06: weather-functions.a.eoc -> weather-hold.sample
weather-c07: weather-hold.out -> weather-trim.in1
weather-c08: weather-trim.out1 -> weather-resonator.pitch
weather-c09: weather-functions.b.out -> weather-trim.in2
weather-c10: weather-trim.out2 -> weather-resonator.damping
```

Active on deliberate Start: `weather-functions.a`, `weather-functions.b`.
