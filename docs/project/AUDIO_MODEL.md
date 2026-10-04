# Audio model

Baseline: `96b1008`. Authority: `services/audioEngine.ts`, its call sites in root
`App.tsx`, and `components/Oscilloscope.tsx`.

## Do patch cables define the actual audio graph?

**No.** `playPatch(modules, cables)` ignores both arguments and calls
`playSoundEffect('power')`. `syncLivingRack(deck)` receives no cables. Actual
AudioNode connections are hard-coded when the singleton context and voices are
created. Job cabling can change computed voltage without changing signal routing.

| Layer | Inputs and meaning |
|---|---|
| Displayed patch | JobView's transient cable records and SVG paths; module ports colored by AUDIO/CV/GATE |
| Scoring simulation | Four passes of scalar output propagation; CV and gate merged; source port index ignored; all cable records add bonus |
| Audible synthesis | Three positional 16-step deck rows, name/type/value-selected sounds, fixed buses, global parameters, some settings and overrides |

The job oscilloscope displays the same real master as the rack; it is not a
measurement of the hand's simulated graph or displayed voltage.

## Fixed graph

```text
row 1 scheduled drums / clicks / glitches -> drumBus -------------------+
                                                                      |
row 2 scheduled bass voices / glitches -> bassBus -> bassDuck --+       |
                                                              |       |
row 3 voices / effect glitches + looping noise                 |       |
    -> melodyBus -> melodyDuck -------------------------------+       |
                                                              v       v
                      drive -> tanh waveshaper -> makeup -> lowpass -> compressor
                                                                      |
UI sound effects -------------------------------------------+          |
                                                            v         v
                                                         masterGain (mute/boost)
                                                            |
                                                         final waveshaper
                                                            |           |
                                                         analyser     recording stream
                                                            |
                                                         speakers

unfed delaySend -> delay -> highpass -> feedback gain -> delay
                    |
                    +-> drive (above)
```

The delay loop is connected internally, but `delaySend.gain` is initialized to
zero, no sound node connects into it, and no later code raises its send gain.
`StepContext.delaySendAmt` is declared/passed but never consumed. This is a real
AudioNode loop without a connected excitation path, not currently a functioning
player-patched feedback instrument.

## Sources and row behavior

`syncLivingRack` splits the first 48 deck entries into rows of 16. Row determines
sound role; port arrays and displayed patch do not. All nonblank unmuted slots
are marked active for subscription purposes, even if that row/type combination
has no sound implementation.

| Row | Type dispatch in `scheduleStep` |
|---|---|
| Rhythm, indices 0–15 | VCO/SEQ: synthetic drum hit; TRASH/CURSE: white-noise glitch; LFO/FILTER: short high-pass square click; VCA/EFFECT/UTILITY/MASTER/DUCKER: no direct voice |
| Bass, indices 16–31 | VCO: pitched voice; every other nonblank type: noise glitch |
| Texture, indices 32–47 | VCO: pitched voice with longer envelope; EFFECT: noise glitch; other types: no direct voice |

Blank slots are rests. Deck entries beyond slot 47 are not sequenced, although
all deck entries are counted for duckers and trash/curse background texture.

`playDrumHit` pitches a sine kick down from `120 - value * 5` Hz to 0.01 Hz;
NOISE mode or a Saw name uses square (NOISE starts at 80 Hz). Decay depends on
engine noteLength, not a per-module envelope control. It ignores tuning/fine.
`playClick` uses an 800 Hz square through a 5 kHz high-pass and 50 ms decay.
`playGlitch` generates 100 ms of white noise into the chosen bus.

`playVcoNote` uses saw if the name contains Saw, square for Pulse, otherwise
triangle. Solar Sine is therefore not synthesized as a sine pitched voice;
Dust/Noise-named VCOs use the same dispatch rather than dedicated noise DSP.
Value and tuning select a scale-array index:
`max(0, value * 2 + tuning) % scale.length`. Coarse tuning is thus an index shift,
not a literal semitone offset despite its UI unit. Scales are hard-coded PENT,
DARK, ALIEN, CHRM arrays; root is 55 Hz, bass multiplier 0.25, texture 2.
Fine tuning uses oscillator detune in cents only for pitched voices.

SEQ gives drum hits in rhythm slots, not a patchable gate sequence. No actual
per-module ADSR/function generator, mixer/router, divider, logic gates, random
CV generator, FM input, or audio-rate self-modulation follows catalogue names.

## Generator modes

- SEQ: repeats slot-triggered voices on a fixed 16-step cycle.
- DRONE: same scheduler and rows; pitched voices are shifted down an octave and
  overlap via long envelopes (bass attack 1 s/release 4 s; texture retains its
  0.1/0.5 s times multiplied by decayScale 1.5). It does not create continuous
  patch-connected oscillators. Delay feedback has a floor of 0.6, on the unfed loop.
- NOISE: irregular randomized step duration, square kicks, persistent noise gain
  0.3, minimum global cutoff 2 kHz, and extra global resonance. Tonal VCO voices
  still use scale lookup; it is not a cable-controlled chaos graph.

Looping background noise uses a four-second buffer of smoothed random values,
with gain from trash/curse count, active-module ambience, a 0.002 floor, and
optional force override. Its gain is capped at 0.1 outside NOISE before the
force addition. It can remain audible with all module triggers muted.

## Controls and modulation authority

| Control | Actual reader/effect |
|---|---|
| Module VCO tuning / fine | Scale index and oscillator detune in bass/texture voices; not rhythm kick; not scoring |
| Module DUCKER depth | Adds `depth * 0.6` to global duck depth for each unmuted ducker anywhere in deck |
| Module FILTER cutoff/resonance | Stored/displayed only; neither audio nor scoring reads them |
| Module LFO rate | Stored/displayed only; no module LFO signal |
| Module VCA level | Stored/displayed only; audio envelopes are generated per voice |
| Module EFFECT time/mix | Stored/displayed only; no module-specific delay/reverb/bitcrusher/granulator |
| Module SEQ probability | Stored/displayed only; not trigger probability |
| Module value/type/name | Value affects score and selected pitches/kicks; type/row selects a voice; name selects a waveform. Rarity itself is not read by DSP. |
| Tempo/shuffle | Step durations; delay time is set once at graph init (`45 / tempo`), not updated on later tempo changes |
| Bus volumes / rackVolume | Smoothed bus gains; rackVolume affects rack buses, not direct UI effects |
| Master filter/resonance | Shared low-pass after bass/texture saturation; drums bypass this stage |
| Filter/resonance AUTO | Hard-coded sine functions of audio time (1.5 and 2.1 radians/s), unrelated to LFO modules or cable routes |
| XY pad | X drifts cutoff; Y changes saturation drive/makeup; pad visuals reset on remount but engine coordinates survive |
| Root mouse movement outside DECK | Changes generativeInput; X adds cutoff drift, Y currently unread |
| Performance timbre/space/force | Cutoff/resonance override; unfed delay feedback; drive/noise and faster step duration respectively |
| Compressor upgrade | Master gain boost `1 + level * 0.1`; actual compressor settings stay fixed |
| Cable upgrade | Score bonus only; no audio quality change |

None of the module settings influence `calculatePatchSynergy`. Scoring does
not listen to or analyse generated sound. `StepContext.fmAmount`, filterMod and
delaySendAmt are unused; grit is always initialized to zero, so its optional
per-note distortion branch is not exercised by current scheduling.

## Effects, ducking, and output safety

Bass/texture pass through `tanh(x * 20)` saturation (4x oversampling). XY/force
sets pre-drive `1 + value * 0.8` and makeup `1 - value * 0.3`. The shared filter
cutoff is clamped 50–12000 Hz; resonance is based on 0.5 + control*10, with mode
and AUTO additions. Individual FILTER modules do not configure this filter.

Any nonblank unmuted rhythm slot on steps 0/4/8/12 triggers sidechain, even if
its type makes no voice. Base duck depth 0.3 plus deck ducker depths produces a
gain floor 0.05 on both bass and texture, ramping back to 1 over 0.15 s. No gate
cable controls it. Rhythm sound bypasses the saturation/shared filter.

Rack audio enters a compressor with threshold -20 dB, ratio 12, attack 5 ms,
release 250 ms, then master gain (normally 0.5), then final waveshaper before
speakers/recording. UI effects enter masterGain directly, bypassing compressor
but passing final waveshaper. `makeHardClipCurve` constructs an approximately
identity curve over [-1,1]; endpoint saturation bounds output rather than adding
a calibrated loudness or hearing-safety guarantee. This existing output boundary
is useful, but overload/feedback stress has not been measured in S0.

The analyser uses fftSize 2048 and smoothing 0.85. Oscilloscope renders actual
time-domain or frequency bytes. Module-detail visualizers and card LEDs are
decorative or score/step driven; they are not per-port audio measurements.

## Timing, lifecycle, and capture

Context is lazy but `syncLivingRack` runs in a mount effect, so creation is
attempted before a gesture. `getContext` calls resume when suspended without
awaiting/reject handling; a first-click listener retries with a click effect.
S0 Chromium observed suspended before interaction and running afterward.

Scheduler uses a 25 ms timeout, scheduling 100 ms ahead against currentTime.
Default step duration is a sixteenth note (`60 / tempo * 0.25`), current step
wraps at 16. Swing alternates ±shuffle*0.66; force shortens duration up to 20%.
Visual notifications use separate setTimeouts to align with scheduled time.
A requestAnimationFrame loop continuously updates global modulation parameters.
There is no exported pause/dispose/context-close function or scheduler cleanup.
Rack view unsubscribes its UI callback; that does not stop audio. Long suspension
or background throttling/catch-up, overlapping tails, and reset/hot-reload
lifecycle remain browser-test candidates.

MediaRecorder receives the limited master stream, tries Opus WebM then WebM,
and exports a timestamped `.webm` using an object URL on stop. Unsupported
construction returns false silently; stopping has no rejection/error path.
Rack-local isRecording disappears if the rack unmounts while the engine recorder
continues. Stop/download, repeated recording and browser codec coverage were not
tested. The stream is synthesized output, not microphone input.
