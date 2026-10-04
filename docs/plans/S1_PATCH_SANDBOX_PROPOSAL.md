# S1 patch sandbox proposal

**OPEN QUESTION — full S1 proposal. S1-A was separately authorized and implemented.**
Based on baseline `96b1008`, [audio archaeology](../project/AUDIO_MODEL.md), and
[governing design](../design/GAME_DESIGN.md). S0 changes documentation only.

**LOCKED DESIGN — revised integration framing:** reuse the working Studio audio
engine and gradually make the visible patch graph take authority over it.
[S1-A](../project/S1_A_PATCH_AUTHORITY.md) implements AUDIO/CV routing, delayed
feedback, direct controls and shared Studio output ownership. Clock/GATE,
function generator, capture UI and progression integration remain future work.
The remainder is a proposal, not authorization to implement all S1 examples.

## Experiment purpose and scope

**LOCKED DESIGN:** patch → listen → change → discover → capture/perform;
noise, silence, irregularity and instability are valid. Audible relationships
must not be a disguised scalar bonus system.

**ILLUSTRATIVE:** build one opt-in sandbox screen within the existing app, with a
small fixed palette, no AP/credits/shop requirements, and a distinct session patch
state. Keep the legacy game and save unchanged. The experiment tests whether
patching itself is engaging, and whether the player understands consequences
without a reward number telling them what to like. It is not an application rewrite.

## 1. Smallest useful module set

**ILLUSTRATIVE:** eight archetypes, with only one implementation of each behavior.
Do not repurpose the whole MASTER_POOL or promise named granular/FM/reverb DSP.
One fixed output strip is infrastructure, not an additional acquisition archetype.

| Archetype | Minimal behavior and meaningful ports |
|---|---|
| Oscillator | Continuous audible source; frequency/waveform, AUDIO out, pitch CV in. No forced scale quantization or implicit sequence. |
| Noise | Continuous broadband source; level/color, AUDIO out. Not a failure or damaged oscillator tier. |
| Resonant filter | AUDIO in/out, cutoff and resonance controls, cutoff CV in; useful on tone/noise and in a feedback path. |
| VCA | AUDIO in/out, bias/level and gain CV in; open bias permits drone, modulation articulates level. |
| Function generator | GATE trigger in, CV envelope out, rise/fall controls; no catalogue-sized envelope modes. |
| LFO | CV out, rate/amount; rate CV or reset gate input allows relationship changes/self-modulation. Simple waveform initially. |
| Clock | GATE out, rate and rate CV in; optional divided output is a separate hypothesis, not required for the first test. |
| Delay with input trims | Two summed AUDIO inputs, AUDIO out, delay-time CV in, time and per-input level controls. An explicit output-to-input cable makes feedback real; no invisible always-on feedback path. |

This palette supports direct oscillator/effect paths, noise shaping, breathing
VCA envelopes, unsynchronized modulation and delay feedback. A seven-archetype
variant could omit Function or Clock for an even smaller pilot, but then cannot
adequately test clock-to-envelope GATE semantics together; prefer eight for
the proposed combined experiment. Divider/logic, sequencer, extra chaos DSP,
stereo spatial effects and progression can wait. Noise, drones and silence do
not depend on obtaining an expensive module.

## 2. Minimum signal model

**ILLUSTRATIVE:** a patch owns instance IDs, module behavior IDs, positions,
controls and typed cable endpoints. A runtime registry owns each instance's
nodes/control targets/event handlers. Keep UI positions out of DSP decisions;
moving a module must not change its voice into a drum by row.

- AUDIO is a real continuous source/processor path; disconnected sources do
  not reach the output. Input summing and trims are explicit where supported.
- CV is continuous modulation of a declared target with a visible amount/bias.
  Baseline knob and incoming modulation have explicit combination rules;
  show bounded effective values without erasing deliberate fluctuations.
- GATE/CLOCK are timed edges that trigger/reset modules. A clock does not itself
  become a bonus or an audible kick unless routed to a behavior that makes sound.
- Initial connection policy accepts the same signal family and direction. Any
  AUDIO-to-CV or CV-to-GATE conversion needs an explicit designed adapter/behavior
  later, rather than silent coercion. Fan-out is useful; duplicate identical edges
  should be idempotent. Self-connections may be meaningful, unlike current jobs.
- Master strip sums declared audible inputs and exposes level, mute and scope.
  No output connection means silence, including no hidden ambience or UI clicks
  mixed into the experiment's recording.

**OPEN QUESTION:** normalized CV ranges, frequency mapping, bipolar versus
unipolar controls, sample/control-rate implementation, gate threshold/pulse
width, fan-in policy and individual port UX. These need a small technical spike
and listening comparison. They are not electrical voltage calibration requirements.

## 3. Can the existing audioEngine support it?

**Source finding:** not through its present public API. It creates a fixed
three-row positional scheduler, shared DSP and independent ambience. playPatch
does not connect anything; no per-instance graph registry, route edits, gate
network or cleanup exists. Global controls do not substitute for module DSP.

**LOCKED DESIGN:** reuse the Studio engine and introduce cable authority at its
ownership boundary. S1-A adds a per-module routing layer with explicit start,
apply-edit and disposal, hosted by Studio's existing context, master chain,
analyser and recording destination. Further Studio synthesis capabilities should
be reused where their behavior fits the visible graph. Do not rewrite the RPG
or introduce a competing audio engine.

## 4. Reuse and 5. isolation/replacement

| Piece | Proposed action and reason |
|---|---|
| Knob/Button and visual vocabulary | Reuse with meaningful control labels/units and port semantics. ModuleCard can inspire a simplified faceplate without score/rarity dominating it. |
| Cable record/gesture/SVG idea | Adapt to the authoritative patch state; derive endpoints from rendered geometry, provide individual removal and compatible-port feedback. |
| Oscilloscope rendering | Reuse with analyser injection so mounting it does not initialize the legacy singleton. |
| Compressor/clamp/capture approach | Extract into a runtime-owned output boundary; measure limiter behavior and record from the same final stream heard by the player. |
| Noise/oscillator/filter/gain primitives | Reuse construction ideas and curves selectively; continuous module lifetimes replace slot-triggered drum/voice helpers where incompatible. |
| Living rack scheduler/buses/background texture | Isolate from sandbox; no implicit backing track, row remapping or forced 16-step cycle. |
| Scalar scoring and job rewards | Remain legacy-only. No authority over sandbox graph, silence, music quality or success. |
| PlayerState/deck/shop/bosses | Keep intact. New session patch is distinct; serialization/migration is deferred. |

**S1-A decision:** route `?mode=patch` before root App's deck-sync effects mount.
`openStudioPatchSession` grants source/routing ownership to the visible graph,
pauses Studio timers and detaches its backing/SFX paths, while retaining the
shared output chain. Tests also exercise takeover of an existing Studio context.
Same-screen game-state integration remains OPEN QUESTION; this boundary does
not authorize broader lifecycle or progression refactors.

## 6. Cables become audible authority

**ILLUSTRATIVE implementation contract:** one patch state drives display and
runtime routes. Adding/removing a cable connects/disconnects that exact module
output and destination input/control/event target. Adjusting a module parameter
updates its own runtime object with smoothed transitions. Removing a module
removes incident cables and disposes nodes/handlers. Port LEDs/meters reflect
runtime activity rather than module.value or mere playhead membership.

A graph edit should preserve unaffected voices and avoid complete restart/pop
on each knob change. Output connection is explicit. No automatic VCO/filter/VCA
completion, sequence backing or ambience is permitted to disguise silence.
Mute/isolate, if provided, are listening tools rather than progression rewards.

## 7. Permit feedback safely

**LOCKED DESIGN:** intentional feedback and self-modulation are supported; final
browser output is safety-limited without making the internal behavior polite.

**ILLUSTRATIVE:** in the initial audio model, allow a visible loop containing the
Delay module, with a nonzero minimum delay and an attenuated return input. Permit
the return gain to approach and exceed unity within tested internal bounds so
resonance/instability can emerge; do not automatically mute a loop for being noisy.
Reject instantaneous AUDIO cycles with a clear explanation to insert Delay,
rather than secretly rerouting them or rejecting all feedback. This is a causal
execution policy for the pilot, not an assertion that all real modular feedback
requires a physical delay module.

Bound internal parameter values, prevent non-finite propagation, smooth graph
edits and keep final output gain/compression/clamping independent from score.
Provide a fast master mute/stop and visible overload indication. Apply safety
after the patch so the recorded and audible signals share the boundary. Establish
an attenuation-first listening procedure during the later test, then measure
overload responses; the current prototype has not proved feedback safety.

CV self-modulation should use defined causal evaluation (for example, a small
control-step delay for cycles). Gate feedback must not recurse synchronously or
create an unbounded event queue; bounded scheduling must report its constraint
without inventing an audible conventional pulse. Whether gate-cycle feedback
is included in S1 is OPEN QUESTION; audio feedback and some self-modulation are
enough for this proposed first pilot.

## 8. Exact proposed browser experiment

**ILLUSTRATIVE protocol:** use a clean isolated context; preserve the user's
legacy save. Log browser errors, audio state, event queue/load and final output
peak bounds. Begin at low output. Run the same paths in normal SEQ-free sandbox
operation, with no hidden tonal or rhythmic generation.

1. Open the one screen; start audio with a deliberate gesture. Unpatched output
   is silent. Reload/navigation lifecycle leaves no orphaned scheduler/audio.
2. Place oscillator and connect directly to output. Change pitch/waveform;
   disconnect/reconnect and hear the difference. Add/remove a module/cable and
   verify the runtime registry and displayed edges agree.
3. Connect oscillator → Delay → output without filter/VCA. It must be meaningful
   on its own, with no correctness bonus or penalty for its topology.
4. Connect noise → filter → output, sweep cutoff/resonance. Replace/add modulation
   with LFO → cutoff. Fan that LFO to VCA gain and listen for different consequences.
5. Connect clock → function trigger → VCA gain with noise or oscillator audio.
   Compare unplugging gate versus unplugging CV. Change clock rate independently
   of LFO; the result is not forcibly quantized into 16 steps/4/4.
6. Patch Delay output back to its trimmed input, optionally through filter;
   raise return from decay through resonance/instability at low master level.
   Change time/return/timbre and verify actual audible response and final bounds.
7. Try LFO self-modulation/reset where the selected implementation supports it.
   Remove a critical route and verify the relationship disappears. Set very slow
   motion, then deliberately make silence; neither action reports failure.
8. Mute/stop; confirm output and runtime activity stop as defined. If capture is
   included, record a short stable-to-unstable performance, stop, and verify the
   exported file is playable and matches limited output. Capture is an explicit
   scope choice, not a reason to implement a library/cloud store.
9. After technical checks, give a player 10–15 minutes without score/jobs. Ask
   them to find two different behaviors they want to revisit, explain which edit
   changed each, and capture or describe one result. Do not prescribe genre.

## 9. Pass/fail questions and decision gate

**ILLUSTRATIVE technical pass questions:**

- Does every displayed cable/control tested have its stated audible/control
  effect, and does removal remove that effect without unrelated voice changes?
- Are AUDIO, CV and GATE consequences distinguishable without numeric bonuses?
- Can noise, drone, irregular rhythm, slow evolution and intentional silence
  exist without automatic error/genre normalization?
- Is feedback an audible relationship, with useful unstable behavior and measured
  final output bounds, rather than a DSP crash, silent loop or decorative score?
- Do repeated edits, mute/stop, teardown and return avoid duplicate voices,
  orphaned timers, stuck gates and uncontrolled resource growth?
- If capture is included, is export valid and taken after output safety?

**ILLUSTRATIVE experiential pass questions:** does the player voluntarily change
relationships, hear a consequence, discover at least two contrasting behaviors,
and want to listen/revisit without economic rewards? Can they explain one causal
relationship and use uncertainty as material rather than interpret it as a bug?
These are qualitative learning criteria, not a global musical score threshold.

**OPEN QUESTION:** a technically functioning screen may still fail the fun test.
If relationships are hard to hear/understand, simplify ports/controls or improve
feedback before adding module count or progression. If safety erases instability,
revisit gain staging/output boundary. If only forced tonal sequences feel useful,
revisit the palette and routing. Record outcomes and seek a next design decision;
do not solve a failed pilot by adding economy, bosses, backend or AI composition.
