# R3-S — Starter-required behavior substrate

2026-10-06. Implemented in `5edcace`, with divider reset correction `6b3f4d5`,
following the user's review of `0207bfa`
and `b25d452`. R3-A passes in direction; all four graphs are accepted as behavior
targets. Initial audition values remain provisional. R3-B gameplay, inventory,
capacity changes and save migration are not authorized by this work order.

**Technical implementation accepted by the user on 2026-10-06**, after review of
`5edcace`, `6b3f4d5`, `af77d97` and `076f8df`. Follow-up `3762d37` narrows immediate
routing to event inputs: ordinary AUDIO/CV cables use the existing route ramp/fade.
Human listening remains outstanding. Persistence and inventory convergence need
design review after listening; R3-B is still not authorized.

Read the [starter designs](../plans/R3A_STARTER_SYSTEM_DESIGN.md),
[R1 roles](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[conceptual schema](../design/MODULE_DEFINITION_DRAFT.md) and
[accepted R2 boundary](R2_DATA_DRIVEN_PATCH_SEAM.md).

## Implemented contracts and stable identity

[starterRegistry.ts](../../services/starterRegistry.ts) is an explicit opt-in native
registry. Studio, patch UI and the frozen v1 adapter still use the seven-entry
`MODULE_REGISTRY`. No starter UI or new save format is present.
[starterDefinitions.ts](../../services/starterDefinitions.ts) adds 18 immutable
selected definitions for 17 catalogue identities. All new definition and behavior
versions are **1**. Each product ID is `catalogue.<draft-ref>`; definition IDs pin
the selected mode, not the eventual complete R1 panel.

| Function / product | Definition ID | Behavior ID / actual selected processing |
|---|---|---|
| Needle Mixer | `catalogue.needle-mixer.selected` | `audio.mix`: two mono inputs, separate trims, master sum |
| Thunderstrike ENV | `catalogue.thunderstrike-ad.selected` | `function.ad`: positive AD contour, exponential/linear, restart-from-zero |
| Thunderclock Driver | `catalogue.thunderclock.selected` | `clock.master`: audio-time pulse, run/width, unsaved manual reset |
| Lunar Pulse Divider | `catalogue.lunar-divider.selected` | `clock.divide`: actual rising-edge counts, integer phase/ratio, reset; no multiplication |
| Solar Quad, A/A/C/C | `catalogue.solar-quad.audio-audio-cv-cv` | `signal.attenuvert`: four independent signed lanes |
| Solar Quad, CV×4 | `catalogue.solar-quad.cv4` | `signal.attenuvert.cv4`: configured wrapper over the same signed-lane kernel |
| Thunderfold VCF | `catalogue.thunderfold.selected` | `shape.wavefolder`: repeated reflection at ±1 after drive/bias, fold CV; not tanh |
| Quantum Sprinkle | `catalogue.quantum-hold.selected` | `memory.sample-hold`: actual connected CV capture on edge; initial value and manual sample |
| Fossil Resonator | `catalogue.fossil-modal.selected` | `resonator.modal`: three damped modes driven only by external excitation; pitch/damping/structure/position |
| Vaporline FM Source | `catalogue.vapor-fm.selected` | `osc.linear-fm`: sine periodic core with external Hz-depth FM; bounded 20–12000 Hz and below 0.45×sample rate |
| Rustleaf Function Duo | `catalogue.rustleaf-functions.selected` | `function.cycle-eoc`: two independent channels sharing the AD core; cycle and one-sample EOC |
| Solar Wind Noise | `catalogue.solar-wind.selected` | `noise.color`: the existing generated two-second noise loop plus low-pass coloration |
| Solar Sine / Gramps' Saw | `catalogue.solar-sine.selected`, `catalogue.gramps-saw.selected` | `osc.periodic-selected`: configuration wrapper over unchanged R2 oscillator, 0.25 peak |
| Fusion Ladder Filter | `catalogue.fusion-filter.selected` | Reuses `s1a.filter`; crude low-pass, 2400-cent cutoff CV |
| Ghost Gate VCA | `catalogue.ghost-vca.selected` | Reuses `s1a.vca`; AUDIO mode, 0.5 gain CV |
| Void Delay | `catalogue.void-delay.selected` | Reuses `s1a.delay`; unchanged explicit input/return/saturation, no dry bypass |
| Grandpa's Drift LFO | `catalogue.drift-lfo.selected` | Reuses `s1a.lfo`; sine, optional drift off |
| Output | Existing `prototype.output` | Existing `s1a.output`; fixed mono infrastructure |

The eleven implementation responsibilities require thirteen new descriptors:
eleven selected functions/extensions plus the periodic configuration and Quad CV×4
wrappers. They are not thirteen independent DSP cores. AD and both Duo channels
share `ADContour`; both Quad modes share sample multiplication. Unimplemented PM,
through-zero FM, slew, ADSR, multiplication, drift, advanced noise, full ladder and
Delay time-CV/wet control are not advertised as shipped.

## Domain and configuration boundary

The native seam now supports only AUDIO, continuous CV, TRIG and CLOCK. Event
signals are mono 0/1 streams; an edge is a transition from below 0.5 to at least
0.5. Held high fires once. Specifically declared AD/Duo trigger and S&H sample
inputs accept CLOCK rising edges. There is no global event equivalence or AUDIO/CV
conversion. Generic CV maps directly into pitch without acquiring calibration.

Solar Quad uses two **immutable configured definitions**, with a common
`productId: catalogue.solar-quad`. A/A/C/C and CV×4 have fixed inlet/outlet families
and matching validated `laneFamilies` settings. Changing that setting to a different
mode fails; explicitly changing the definition reconfigures the item. Each lane
only multiplies its own signal, never converts domains or crosses into another lane.

Selected settings have bounded exact option sets; all authored settings must be
present and unknown/nonfinite values fail. Curves and run/cycle flags expose only
the selected alternatives. Controls retain declared numeric bounds. New inlets
accept one cable; free fan-out remains free. R2 retains its additive fan-in.

Port dependency paths keep independent lanes independent during feedback checks.
Every external AUDIO cycle still crosses the existing Delay. Unsupported external
control/event cycles fail visibly; selected internal positive-duration cycle mode
is supported. There is no general causal-loop solver or event scheduler.

## Musical time and lifecycle

[starterDsp.js](../../services/starterDsp.js) contains closed per-sample kernels
executed by `r3s-selected-mode-v1`; [starterBehaviors.ts](../../services/starterBehaviors.ts)
binds actual visible inlets/outlets. Each processor reads incoming sample arrays,
not animation frames or analyser values. AudioWorklet processes render-thread
blocks; the implementation uses each buffer's actual length and supports both
constant and sample-array a-rate parameters. See the
[MDN process contract](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process)
and [Web Audio rendering rules](https://webaudio.github.io/web-audio-api/#rendering-loop).

- Parsing, validation, instantiation of data and serialization are pure. Module
  preparation and context acquisition happen only in `PatchAudioGraph.start`.
- After module preparation and complete wiring, newly created worklets activate
  at a common audio time 25 ms ahead. Before activation they output zero and advance
  no phase, contour or counter. Native selected controls initialize immediately;
  R2's control smoothing remains unchanged. CLOCK/TRIG routes connect and disconnect
  immediately, without smoothing pulses. AUDIO/CV routes use the existing 15 ms
  `setTargetAtTime` constant on connection/removal and disconnect after 100 ms.
  These ramps are for continuous cable repatching; they do not detect or schedule
  events. Stop clears outstanding fade timers and disconnects everything immediately.
- Clock phase zero emits on its first active sample. Divider phase zero emits on
  the first actual input edge, then every Nth edge. Reset clears counter/output
  before a coincident rising edge. It does not turn an already-held CLOCK into a
  new edge. With no new input edges the divider cannot free-run.
- AD durations are `ceil(seconds × sampleRate)`, at least one sample per segment.
  Trigger/manual edges coalesce into one restart; retrigger abandons the old contour.
  On completion CV is exactly zero and EOC is high for exactly one sample. Cycling
  restarts on the next sample. A retrigger on the finishing sample takes priority,
  cancelling that old completion.
- Downstream S&H captures the connected CV on that EOC sample and holds it before
  the next rise. It generates no random value. Separate Duo channels stay independent.
- Manual trigger/reset/sample actions are unsaved a-rate pulses, scheduled 5 ms
  ahead and no earlier than activation. Controls update at render-block boundaries;
  changing settings deliberately recreates only that configured processor.
- Stop disconnects all routes/nodes, stops reused sources, disables worklets,
  sends stop, closes message ports, clears fades and releases Studio once. Failed
  preparation/start and processor errors clean up and retain patch data.
  `getError()` exposes processor failure; there is no fallback sound.
- A fresh session starts fresh phase/contour/held state from authored configuration.
  Exact stop/restart tails or live phase replay are not promised.

## Native fixture and rendered evidence

[r3sStarterPatches.json](../../tests/fixtures/r3sStarterPatches.json) contains four
ordinary native patches. All 35 instance IDs and 43 cable IDs/endpoints match
R3-A exactly; settings are retained in serialization. These fixtures are not
imported by Studio or its save serializer. The R3-A design dataset remains unchanged
and explicitly ineligible for direct runtime loading.

Two audition changes are explicit in
[r3sAuditionAdjustments.json](../../tests/fixtures/r3sAuditionAdjustments.json):
Rhythm mixer master 0.8 → 1.5 (+5.46 dB); Weather noise level 0.4 → 1 (+7.96 dB).
Initial renders were substantially quieter than the continuous systems. These
changes strengthen existing paths without adding modules or changing relationships.
Final balance is still a listening/playtest question.

Chromium rendered actual native graphs at 48 kHz, listen level 0.15, using seed
12345 for the reused noise generation. The session adapter uses OfflineAudioContext
only in the test harness; live checks separately use `openStudioPatchSession`.
No hidden oscillator, sequence or exciter was used. The
[durable numerical evidence](R3S_AUDIO_EVIDENCE.json) records samples, per-second
RMS, every ordinary-module ablation, event traces, lifecycle and recording hashes.
Its original evidence is retained; `postRouting` records refreshed renders and
native/lifecycle checks after `3762d37`. All fixture values remain unchanged.
Initial transients can differ because continuous routes now ramp at startup.

| Fixture | Render duration | Peak / RMS before Studio compressor | Observed relationship evidence |
|---|---:|---:|---|
| Slow Machine | 20 s | 0.02535 / 0.00717 | One-second RMS varies roughly 0.00389–0.00955; LFO ablation changes output. Both source ablations differ. |
| Three Against Five | 12 s | 0.03721 / 0.00221 | Separate clock/divider streams have 3/5 edge relationships; body/noise ablations both differ. Manual reset reaches both dividers at the same frame. |
| Crossed Embers | 12 s | 0.10587 / 0.06207 | FM/folder/trim/LFO ablations alter output; delayed cycle builds and bypassing Delay fails. No nonfinite or runaway samples. |
| Wooden Weather | 30 s | 0.00990 / 0.00119 | Exciter/resonator/functions/held-control ablations differ; actual CV capture error is zero. Resonator is silent without excitation and decays after an impulse in numerical tests. |

Every ordinary authored module has a nonzero four-second output difference when
its incident cables are disconnected. This proves participation in the exercised
signal path, not musical quality. Reset cables are additionally exercised by an
explicit manual reset, since untouched initial patches emit no manual reset.

At 48 kHz with activation frame 1200, Weather channel A emits first EOC at frame
42191 and every 40992 samples thereafter: 36 completions in 31 s. Channel B emits
at frame 1345199. On every A completion, held output equals actual connected CV
exactly; envelope output is zero, then rises next sample. Rhythm manual reset at
frame 102576 resets both divisions before their coincident source edge.
An additional reset at frame 49440 occurs during a held CLOCK pulse: neither
divider invents an edge at reset, and both emit on the next actual clock rise,
frame 65441. This native stream regression matches the numerical edge test.

Live isolated browser checks used the actual Studio session owner. All four
fixtures produced signal, cable clearing yielded zero, and all four contexts
closed after stop. There were zero real contexts on initial load, native parse,
or reload; the frozen v1 save and legacy sentinel remained exact. Production
bundling of the opt-in registry emitted its worklet asset and loaded/ran it
successfully from an isolated local HTTP server. The current game does not ship
that opt-in registry as starter content.

## Audition recordings and evidence limits

Local PCM16 mono recordings are under
`C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing`.
The original accepted-substrate recordings remain in the parent directory.
Raw WAVs preserve the listen level above. Playback copies below are independently
normalized to about 0.3 peak solely to make listening easier; this normalization
is not runtime DSP or a proposed starter-volume rule.

- [Slow Machine audition](C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing/slow-audition.wav)
- [Three Against Five audition](C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing/rhythm-audition.wav)
- [Crossed Embers audition](C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing/cross-audition.wav)
- [Wooden Weather audition](C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing/weather-audition.wav)

Use those normalized copies to examine timbre and relationships. Use the
[raw same-gain comparison](C:/Users/pertt/.codex/visualizations/2026/10/06/01a10fab-b65f-71b2-9858-37f06fa564e0/r3s-auditions/post-routing/same-gain-comparison.wav)
to compare starter levels: Slow 0–20 s, Rhythm 21–33 s, Cross 34–46 s, Weather
47–77 s, with one second of silence between segments. PCM samples are copied
exactly from the raw WAVs at gain 1; no per-segment normalization, fades or limiting
are applied. Individual raw files are `slow.wav`, `rhythm.wav`, `cross.wav` and
`weather.wav` in the same directory. Keep playback volume constant across this
comparison; normalized copies cannot establish relative starter loudness.

No human listening judgment was performed in this environment. Rendered audio
and measured relationships are supplied for auditory review; they are not a
claim of listened-to timbre, fun or final presets. Weather remains quieter, and
Cross is substantially louder; level balance, roughness/aliasing and perceived
resonator character remain open. Initial structure is retained rather than
changed to satisfy a sound-quality score. Longer real-time/browser coverage and
serious DSP fidelity remain later work.

## Regression and stop boundary

- `npm run test:patch`: all 17 R2 tests pass.
- `npm run test:studio`: all seven progression/save/archive tests pass.
- `npm run test:substrate`: 14 tests pass, covering settings/identity preservation,
  strict configured domains, event/reset/retrigger/capture semantics, actual DSP,
  cycles, unavailable versions, preflight, cleanup/cancellation and processor errors.
  The routing regression verifies continuous ramping, 100 ms removal grace, immediate
  event removal, reconnection and Stop cleanup while fades are pending.
- Production build and focused TypeScript checks pass. Existing `/index.css`
  warning remains unrelated. No claim about unused alternate `src/App.tsx`.
- Four old graphs compared with accepted `b25d452` code using actual
  OfflineAudioContext, identical seed and 48,000 samples each: silence, direct
  tone, all seven behaviors/CV/Delay, and repeated oscillators. Maximum sample
  difference is **zero for all four**. Frozen v1 fixture/archive tests still pass.
- Protected CI, inventory/capacity, index/routes, legacy Apps, audioEngine,
  patchAdapter and Studio storage/models are unchanged.

**Stop before R3-B.** Required review gates are auditory review of these fixtures,
capacity playtesting (11 versus 12 still open), a separately reviewed persistence
boundary, and **starter inventory fairness/convergence**. Three designs contain
seven ordinary owned modules and Rhythm contains ten. R3-B must decide how
inventories converge or demonstrate that the count difference grants no permanent
progression/class advantage. This milestone records that gate without solving it.
