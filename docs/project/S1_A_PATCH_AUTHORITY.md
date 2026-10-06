# S1-A: visible patch authority

Implemented 2026-10-04, feature commit `e0762b1`. This document supersedes the
S0 baseline only for the new patch experiment and its shared audio integration.
The existing job score simulation and PlayerState save schema remain unchanged.

## Integration direction

**LOCKED DESIGN:** reuse the working Studio audio engine and gradually make the
visible patch graph take authority over it. S1-A adds the missing per-module
node registry and cable routes; it does not create a second AudioContext/master
engine or rewrite Studio's positional playback and RPG systems.

`index.tsx` still mounts root App by default. Choose PATCH / LISTEN in its header
or navigate to `?mode=patch` to mount `components/PatchSandbox.tsx`. The explicit
route prevents the root's deck-sync effect from starting backing audio beneath
the experiment. Full-page navigation between modes keeps their UI state ownership
separate. The patch is session-only and writes no localStorage.

## What now controls sound

`services/patchModel.ts` defines module instances, control values and cables.
The same state drives jacks/SVG and `services/patchAudioGraph.ts:PatchAudioGraph`.
Module order affects display only. Actual port locations determine cable geometry;
no old hard-coded card coordinates are reused.

R2 now supplies versioned definition/behavior authority beneath these unchanged
records. `patchAdapter` maps the v1 UI data into `ModulePatch`; registry factories
and destination-port bindings build the same graph. See
[R2 implementation and preservation evidence](R2_DATA_DRIVEN_PATCH_SEAM.md).

Studio's `services/audioEngine.ts:openStudioPatchSession` owns context creation
and the existing compressor → master gain → limiter → analyser/speakers and
recording-stream paths. It pauses the positional scheduler/modulation loop,
mutes and disconnects backing DSP outputs, and disconnects sound effects.
Graph output enters the existing compressor through a DC-block filter and its
own listen-level trim. The shared analyser measures the result; the existing
recorder destination is available for a later capture UI.

This also supports taking over an existing Studio context: a prior Studio
mute/boost cannot silently override the graph's listen control. Only one graph
session can own Studio at a time. Release closes the owned context and resets
Studio's node references; restart creates a fresh shared Studio session and
reapplies the retained patch. No separate hidden sequence or ambience is added.

## Module/control behavior

| Module | Actual S1-A behavior |
|---|---|
| Oscillator | Continuous sine/triangle/saw/square, frequency 40–1200 Hz, source level 0.25; CV pitch adds detune at 1200 cents per unit |
| Noise | Two-second looping white-noise buffer, level 0–1; no implied tonal source or damage tier |
| Filter | Low-pass, cutoff 40–12000 Hz, Q 0.1–20; CV cutoff adds 2400 cents per unit to filter detune |
| VCA | Gain bias 0–1 plus bipolar CV at 0.5 gain per unit; negative effective gain inverts phase, rather than declaring failure |
| LFO | Sine CV, rate 0.02–20 Hz, bipolar amount 0–1; can fan out to several declared targets |
| Delay | Two trimmed summed audio inputs, time 0.01–2 seconds; input trim 0–1 and return trim 0–1.5; output passes through tanh saturation |
| Fixed Output | Explicit AUDIO summing input, listen level (initially 15%), mute and scope; no automatic source connection |

Enabled controls affect sound directly. There are no score, rarity, AP or
conventional-chain bonuses in the experiment. Sources start only after the
explicit Start audio gesture. Unpatched output is silent, though disconnected
sources remain available internally for later connections.

## Routing and feedback policy

- AUDIO connects only to AUDIO inputs; CV only to declared CV targets. GATE is
  reserved in the model but has no exposed port/module behavior in S1-A.
- Output-to-input direction, endpoint existence, and duplicate rejection are
  enforced in both UI and runtime. Fan-out and summed audio fan-in are supported.
- Every AUDIO cycle must cross a Delay. A delay elsewhere in a larger graph
  does not authorize an instantaneous subcycle. Delay self-feedback is supported.
- Delay SIGNAL → RETURN is an actual routed loop. Return gain can exceed unity;
  its local tanh stage bounds internal amplitude while permitting sustained,
  unstable and nonlinear behavior. No invisible feedback edge is created.
- CV is continuous AudioNode-to-AudioParam modulation, added to the base control.
  Clock/gate scheduling, CV self-modulation and cross-family conversion are deferred.
- Cable deletion briefly fades its gain before disconnecting (100 ms cleanup).
  Deleting a module removes incident cables and stops/disconnects its sources.
  Editing other routes/controls preserves existing source phase.

A reused limiter-curve defect was corrected: symmetric endpoints now map zero
input to zero. A reused Studio backing waveshaper can emit DC with muted inputs;
its master-bound path is therefore disconnected during graph ownership rather
than merely muted. The rest of Studio synthesis is preserved.

## Interaction and scope

Drag between jacks, click two jacks, or focus/activate jacks with a keyboard.
Escape or release outside a jack cancels a pending route. Remove an individual
cable with its connection-list ×, or clear all. Add/remove modules; drag headers
to reorder them. Rack is bounded to twelve modules plus Output for this pilot.
Direct patch→output, noise, drones and silence are valid choices.

Capture controls, clocks/envelopes/gates, patch persistence, full Studio module
catalogue adoption, score/objective changes, and pixel-rack/ambient-field integration
are outside S1-A. The alternate `src/App.tsx` and the visual prototype remain intact.
The player has not yet evaluated whether patching itself is fun.

## Validation

- `npm run test:patch`: six passing graph-policy tests, including direct output,
  families/directions/duplicates/fan-out, delayed cycles, instantaneous subcycles,
  module removal and finite/bounded controls. Requires Node.js 22.18+ or 24.
- `npm run build`: pass; existing missing `/index.css` warning remains.
- Focused TypeScript check passed for PatchSandbox, patchAudioGraph and patchModel
  and their imports. This is not a claim that the unused legacy App copy type-checks.
- Isolated Chromium UI tests passed: no AudioContext before Start, one shared
  context/analyser afterward, zero unpatched output, direct oscillator signal
  (~0.025 peak at default level), cable-removal silence, filter cutoff difference,
  CV-driven VCA signal, signal mismatch/instantaneous-loop rejection, delay loop,
  mute, module cleanup, stop/restart and legacy entry.
- Mobile viewport 390px had no horizontal page overflow; cable anchors remained
  aligned with real jack centers after reflow. Desktop/mobile screenshots inspected.
- Shared-context stress took over an already-created/muted Studio engine and
  verified analyser identity. At full listen level, feedback peaked around 0.54,
  sustained around 0.54 after removal of its seed cable, remained finite, and
  became exactly zero after removing Output routes. Twenty-five connect/remove
  cycles left zero active/pending routes; disposal returned to idle.
- Existing-game smoke verified tutorial, rack, user-gesture audio, current-schema
  save reload, a job cable between distinct modules and normal job completion
  (that random hand failed its numerical target, as permitted). No uncaught page
  errors. Existing autoplay/CDN warnings and StrictMode duplicate logs remain.

Browser measurements verify the exercised graphs, not perceptual quality or all
possible overloads/browsers. Tests used temporary scripts and isolated storage,
not the user's personal save. A listening playtest, touch-device gestures,
long-duration feedback/background operation and later capture export still need
evaluation. Future slices should extend this shared Studio ownership boundary.
