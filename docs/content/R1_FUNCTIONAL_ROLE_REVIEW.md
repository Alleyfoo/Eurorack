# R1 functional role review — all 100 slots

2026-10-05. **Recommendations for review, not accepted runtime definitions.**
The historical 47 KEEP / 45 REWORK / 8 DUPLICATE split stays unchanged.
KEEP means retain a useful concept; it does not certify its legacy ports or DSP.
See [source audit](R1_CATALOGUE_SOURCE_AUDIT.md) for exact names/IDs/provenance,
[schema](../design/MODULE_DEFINITION_DRAFT.md) for signal and control semantics,
and [coverage](R1_PATCH_FAMILY_COVERAGE.md) for composable patch witnesses.

Tables propose a **minimum useful contract**, not a final panel, voltage range,
processor count or implementation order. `A` = mono audio; `C` = generic CV;
`P` = octave-relative pitch CV; `G` = sustained gate; `T` = trigger edge;
`K` = clock pulse stream; `L/R` = two separate audio ports. Arrows give direction.
“depth” is the amount of a named modulation input, not a generic score multiplier.
All controls require typed ranges/defaults during R2; only the existing seven
S1-A kinds receive exact initial adapter contracts in that phase.

Proposed event-inlet adapters used by the coverage witnesses: #13 strike, #33
trigger, #52 sample and #55 event input consume a CLOCK's rising edges; #56 trigger
also consumes a GATE's rising edge. These are explicit per-inlet acceptance rules,
not global conversions. #40 completion remains a TRIG and its start inlet accepts
that directly. Reset actions are separate from these event edges.

Behavior IDs below identify reusable processors. Multiple definitions can share
one with explicit configuration. Capabilities are derived from the actual port/
control contract, never from the historical category or display name.

## Sources and excitation — #1–10

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 1 KEEP | Solar Sine | `osc.basic`; P in, A out | frequency, fine; sine-only configuration. Clean periodic source, not a complete voice. |
| 2 KEEP | Gramps’ Saw | `osc.drift`; P in, C drift in, A out | frequency, drift depth/rate; saw with bounded slow pitch movement, never mandatory random detuning. |
| 3 KEEP | Oracle Wavetable | `osc.wavetable`; P in, C position in, A out | frequency, table, position; pitch and table position independent. Table data is an asset dependency. |
| 4 KEEP | Binary Pulse Engine | `osc.pulse`; P in, A pulse out, G pulse out | frequency, width; stable duty-cycle output and corresponding event stream. #5 adds sync/subharmonics. |
| 5 REWORK | Pulse Driver | `osc.pulse-sync`; P in, C width in, T sync in, A pulse/sub out | frequency, width, sub division; choose PWM plus hard sync and integer sub-output, removing v1 “and/or” ambiguity. |
| 6 KEEP | Twin Ember VCO | `osc.dual`; P a/b in, A a/b/mix out | frequency a/b, detune, blend; two independently patchable oscillators, not only a detuned summed preset. |
| 7 REWORK | Relic Harmonic Core | `osc.harmonic-bank`; P in, C spectrum in, A out | base frequency, partial ratios/levels, spread; harmonic spectrum construction. Not automatically a polyphonic chord player. |
| 8 KEEP | Vaporline FM Source | `osc.fm-pm`; P in, A linear-fm/phase in, C index in, A out | carrier frequency, index, internal modulator ratio/enable; external FM and PM are distinct destinations, not generic pitch modulation. |
| 9 REWORK | Crystal Drone Generator | `osc.cluster`; P in, C spread in, A L/R out | base frequency, voice count, detune spread, slow drift; near-unison cluster, unlike #7's controlled partial bank. |
| 10 REWORK | Fossil Resonator | `resonator.modal`; A exciter in, P in, C damping in, A out | tuning, material/structure, damping, excitation position; silent without excitation. No hidden oscillator or assumed internal strike. |

Modal resonance and external excitation are separate functions: a real resonator
can turn a noise burst into pitched ringing. That supports keeping #10 separate
from VCOs and #56 separate from resonators. [Rings manufacturer manual](https://pichenettes.github.io/mutable-instruments-documentation/modules/rings/manual/).

## Spectral and resonant processing — #11–20

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 11 KEEP | Fusion Ladder Filter | `filter.ladder`; A in/out, C cutoff in | cutoff, resonance, drive; four-pole low-pass character is a future target, not the current biquad's claimed fidelity. |
| 12 REWORK | Thunderfold VCF | `shape.wavefolder`; A in/out, C fold in | fold amount, symmetry; nonlinear folding rather than cutoff filtering. Keep the legacy VCF name with a clear future subtitle. |
| 13 KEEP | Relic Low-Pass Gate | `gain.lpg`; A in/out, C level in, T strike in | opening, decay, damping; coupled brightness/amplitude fall, no requirement to sound tonal. |
| 14 KEEP | Fog SEM Filter | `filter.state-variable`; A in, A lp/bp/hp/notch out, C cutoff in | cutoff, resonance; simultaneous mode outputs instead of #15's continuous output morph. |
| 15 KEEP | Orbit Shaper VCF | `filter.morph`; A in/out, C cutoff/morph in | cutoff, resonance, morph; continuous LP/BP/HP blend, no topology scoring. |
| 16 REWORK | Grainwind Triple Filter | `filter.formant-bank`; A in/out, C vowel/shift in | three band centers/levels/Q, linked vowel position; impose audible linked formant motion, not simply three unrelated low-passes. |
| 17 KEEP | Grandma’s Notch Carver | `filter.notch`; A in/out, C center in | center, width; dedicated rejection with simple controls. May reuse a configured multimode core. |
| 18 REWORK | Stasis Resonant Well | `filter.feedback-resonant`; A in/return/out, C cutoff in | cutoff, resonance, return level; revise v1 comb role to a resonant filter feedback process. Internal loop needs declared delay; not a pitch-tracking comb. |
| 19 KEEP | Solar Crest Bandpass | `filter.bandpass`; A in/out, C center in | center, bandwidth, resonance; single narrow band, especially useful for noise. Not a complete vocal synthesizer. |
| 20 REWORK | Ruins Dual Ladder | `filter.dual-ladder`; A a/b in/out, C cutoff a/b in | cutoff a/b, resonance, link; independent channels with optional linked control. Serial/parallel routing uses visible cables. |

## Cyclic, random and transformed control — #21–30

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 21 KEEP | Grandpa’s Drift LFO | `mod.lfo-drift`; C rate in/out | rate, amount, drift; continuous periodic modulation with optional slow wander, unlike a pure random walk. |
| 22 DUPLICATE | Electric Meadow LFO | `memory.cv-loop`; C in/out, G record in, K advance in | length, record/overdub, playback rate; sampled time history and repeatable contour. Donor retained; not a fresh random source. |
| 23 KEEP | Orbit Modulator | `mod.quadrature`; C rate in, C phase0/90/180/270 out | rate, amount; simultaneous phase relationships, unlike duplicated ordinary LFOs. |
| 24 REWORK | Ember Curve Shaper | `cv.curve`; C in/out | curve, rectify mode, bias; transform an incoming CV without independent oscillation. |
| 25 REWORK | Fluctuation Engine | `random.correlated`; K update in, C a/b out | rate, correlation, spread, seed; two smoothly interpolated random targets with tunable relation. Distinct from #58's drifting single trajectory. |
| 26 KEEP | Ancient Chaotic Map | `mod.chaos`; C rate/parameter in, C x/y out | rate, coupling, initial seed/state; deterministic bounded state evolution, not independent random draws. |
| 27 DUPLICATE | Pulse Wander LFO | `clock.jitter-burst`; K in/out, C jitter in, T burst in | jitter, burst count, spacing; perturbs incoming event timing; no silent replacement of the master clock. Donor retained. |
| 28 REWORK | Solar Arc Envelope | `cv.slew`; C in/out | rise/fall time, curve; asymmetrical tracking lag/glide. Omit v1's unspecified gate port; no triggered-envelope identity implied by the name. |
| 29 KEEP | Binary Sync LFO | `mod.lfo-sync`; K in, T reset in, C out | clock ratio, phase, shape; explicit reset and period relationship, including clock-stop behavior to define. |
| 30 REWORK | Shattered Wave Modulator | `cv.sample-crush`; C in/out, K sample in | sample rate, bit steps, smoothing; quantized stepped waveform processing, unlike #52's precise held CV. |

## Articulation, detection and causal events — #31–40

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 31 KEEP | Ember ADSR | `function.adsr`; G in, C out | attack, decay, sustain, release; follows sustained gate, with explicit retrigger behavior. |
| 32 KEEP | Rustleaf Function Duo | `function.dual`; T a/b in, C a/b in/out, T eoc a/b out | rise/fall a/b, curve, cycle; envelope, cycle or slew per channel. Each mode advertises its own contract. |
| 33 KEEP | Thunderstrike ENV | `function.ad`; T in, C out | attack, decay, curve; fast transient articulation with retrigger, no sustain segment. |
| 34 REWORK | Scripted Response Generator | `function.multistage`; G in, C value in/out, T segment-end out | finite segment values/durations, loop region; authored trajectory with typed segment data, not arbitrary code or quest scripting. |
| 35 KEEP | Moonrise Decay Engine | `function.ar`; G in, C out | slow attack/release, curve; sustained slow gate articulation. Shares AR core with distinct range/configuration. |
| 36 REWORK | Vaportrail Envelope | `function.delayed-ar`; G in, C out, T eoc out | delay, attack, hold, release, cycle; delayed held contour, unlike #35's direct gate-following AR. |
| 37 DUPLICATE | Elder Bark ADSR | `detector.envelope`; A in, C envelope out | attack/release smoothing, sensitivity; audio dynamics become control, no trigger required. Donor retained. |
| 38 REWORK | Solar Bloom Generator | `function.phased`; T in, C a/b/c out | rise/fall, phase delays, shape; one event produces staggered contours, not independent dual channels or sequencer lanes. |
| 39 REWORK | Quantum Peak Shaper | `detector.peak-latch`; C in, T reset in, C peak out, G above out | threshold, hysteresis; latch maximum until reset, with threshold condition. Revise duplicate window proposal; deliberately relinquishes legacy probability-envelope claim. |
| 40 REWORK | Relic Erosion Envelope | `function.causal`; T start in, C rise/fall in, C envelope out, T eoc out | rise/fall, variation amount, manual start; emits one completion edge per finished contour. Self-running structure is visible EOC feedback, not an internal invisible sequence. |

End-of-cycle signaling is a real function-generator relationship, but hardware
EOC may be a sustained gate rather than a short pulse. Here #32/#40 explicitly
propose completion triggers; the schema must not treat those event forms as
interchangeable. [MATHS manufacturer manual](https://www.makenoisemusic.com/wp-content/uploads/2024/03/MATHSmanual2013.pdf).

## Gain, multiplication and held state — #41–50

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 41 KEEP | Ghost Gate VCA | `gain.linear`; A/C signal in/out, C gain in | bias, gain depth; DC-coupled linear scaling with nonnegative gain. Does not imply signed four-quadrant operation. |
| 42 DUPLICATE | Rusted VCA | `gain.feedback-limit`; A/C signal in/out, C gain in | gain, ceiling, knee; local soft bounding designed for feedback character. Donor retained; never replaces master safety. |
| 43 REWORK | Thunderhold VCA | `gain.drive`; A/C signal in/out, C gain in | bias, drive, symmetry; hard driven harmonics, unlike #44's soft knee. |
| 44 REWORK | Solar Bloom VCA | `gain.exponential-soft`; A/C signal in/out, C gain in | bias, response curvature, clip amount; exponential control law and optional gentle signal saturation are independent controls. |
| 45 REWORK | Flare Matrix VCA | `gain.matrix`; A/C inputs1–4, A/C outputs1–4, C cell-gain inputs | per-cell gain; voltage-controlled crosspoint amounts. Route creation remains visible; #90 switches cells, #91 combines CV manually. |
| 46 REWORK | Binary Clamp | `math.multiply`; A/C x/y in, A/C product out | x/y trim, bias; signed product, ring modulation and CV multiplication. Not a unipolar gain or Boolean clamp. |
| 47 DUPLICATE | Relic Sustain Cell | `memory.track-hold`; C in/out, G track in | initial held value, manual capture; follows while gate high, holds when low. Donor retained; #52 samples only at edges. |
| 48 REWORK | Grandma’s Gatekeeper | `gain.opto`; A in/out, C gain in | opening, attack/recovery, memory amount; opto amplitude response with temporal lag. Drop hard-switch alternative and avoid promising DC precision. |
| 49 REWORK | Crystal Vein Amplifier | `gain.signed`; A/C signal in/out, C gain in | bipolar bias/depth, trim; precision negative gain/inversion. Reuses multiplier core with an explicit gain control path; #46 exposes both equal operands. |
| 50 REWORK | Echo-Leaf Attenuator | `cv.attenuate`; A/C in/out | fine/coarse unipolar trim; manual precision level reduction. No CV gain input, inversion or offset. |

## Noise, random decisions and excitation — #51–60

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 51 KEEP | Dust Engine | `noise.dust`; C density in, A out | density, level, pulse width; sparse stochastic impulses extending toward noise; not just duplicate white noise. |
| 52 REWORK | Quantum Sprinkle | `memory.sample-hold`; C sample in/out, T sample in | manual sample, initial value; external edge captures CV and holds it. Select S&H only; track-and-hold is #47. No hidden random input needed. |
| 53 KEEP | Static Orchard | `noise.interference`; C tuning in, A out | tuning, crackle, level; fictional generated radio interference, no external radio/network requirement. |
| 54 KEEP | Binary Snowfall | `noise.shift-register`; K advance in, A bitstream out, C word out | clock rate, taps, seed; coupled audio noise and stepped digital state, unlike smooth random or independent draws. |
| 55 REWORK | Thundergrain Burst | `event.bernoulli`; T in, C probability in, T a/b out | probability, seed; route each incoming event to complementary outputs. Burst timing belongs to #27 despite the retained name. |
| 56 REWORK | Relic Ash Generator | `exciter.impulse`; T in, C strength in, A out | click/noise-burst mode, duration, strength; deliberate excitation event, not continuously autonomous noise. |
| 57 KEEP | Solar Wind Noise | `noise.colored`; C color in, A out | color, bandwidth, level; continuous wind/breath spectrum. Filtering is declared internal processing, not hidden patch topology. |
| 58 REWORK | Fluctis Stream | `random.walk`; C speed in, C out | speed, step size, bounds, seed; bounded slowly wandering state, not #25's interpolated correlated targets. |
| 59 DUPLICATE | Cracked Tape Erosion | `effect.tape-degrade`; A in/out, C wear in | dropout probability, flutter, hiss, wear; degradation of supplied audio, no recorder/looper. Donor retained, historical record still uncorroborated. |
| 60 KEEP | Chaotic Oracle | `event.chaos`; K advance in, C state out, T event out | map parameter, threshold, seed; clocked deterministic chaotic decisions. #26 supplies continuous multidimensional motion, #83 recurrence memory. |

## Space, time and recorded material — #61–75

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 61 KEEP | Glow Reverb | `effect.reverb`; A in, A L/R out, C decay in | decay, damping, wet; ordinary bounded decaying space. |
| 62 KEEP | Void Delay | `effect.delay`; A in/return/out, C time in | time, input/return trim, wet; external visible feedback. Existing S1-A Delay lacks time CV and wet control; retain that adapter separately. |
| 63 KEEP | Cathedral BBD | `effect.bbd`; A in/out, C time in | delay time, clock noise, bandwidth, internal feedback; short clock-colored repeats. Proposed character needs later listening; legacy definition is reverb. |
| 64 KEEP | Pebble Granulator | `buffer.granular`; A record in/out, C position/size/density/pitch in, T grain in, G freeze in | grain parameters, wet; continuous overlapping windowed grains from a finite capture buffer. Freeze stops writes, not playback. |
| 65 REWORK | Diffuse Echo | `effect.diffusion`; A in/out, C spread in | smear time, stage spread, wet; all-pass temporal diffusion, not conventional tape echo or self-running loop. |
| 66 KEEP | Biscuit Bitcrusher | `effect.crush`; A in/out, C rate/bits in | sample rate, bit depth, wet; reduced resolution/rate without loop recording. |
| 67 DUPLICATE | Echo of Ruins | `resonator.comb`; A excitation/return in, P in, A out | tuning, feedback, damping; pitch-tracking short comb loop, plucked or externally excited. Donor retained; #10 is a modal bank, #18 a resonant filter loop. |
| 68 REWORK | Cloudform Diffuser | `effect.stereo-diffusion`; A L/R in/out, C motion in | spread, decorrelation, motion, wet; changing stereo field, distinct from mono #65 and chorus #72. |
| 69 KEEP | Resonant Shard Saturator | `effect.resonant-drive`; A in/out, C frequency/drive in | resonance frequency, drive, damping; resonant nonlinear coloring rather than #73's broadband overdrive. |
| 70 REWORK | Grainstorm Cascade | `buffer.slice-reorder`; A record in/out, K advance in, C slice in | slice count/order, window, overlap; clocked buffer fragments with editable ordering. Not #64's independent grain cloud. |
| 71 REWORK | Elder Tape Ghost | `buffer.tape-loop`; A record in/out, G record in, T reset in, C speed in | loop length, signed speed, overdub, playback window; contiguous looping recorded material and reverse playback. |
| 72 KEEP | Solar Prism Chorus | `effect.chorus`; A L/R in/out, C depth in | rate, depth, spread, wet; correlated short modulated-delay widening, not all-pass diffusion. |
| 73 KEEP | Thunderflare Overdrive | `effect.overdrive`; A in/out | drive, tone, wet; broadband static saturation. A second legacy audio input needs an explicit summing decision, not guessed mapping. |
| 74 REWORK | Spectral Grove Splitter | `filter.split-bank`; A in, A low/mid/high out, C crossover in | crossover frequencies, band trims; actual separate processing paths. #16 remixes linked formant bands into one voice. |
| 75 DUPLICATE | Void Bloom Reverb | `effect.reverb-freeze`; A in, A L/R out, G freeze in | decay, damping, freeze, wet; latch circulating space while suppressing new injection as configured. Donor retained; not mathematical infinite unbounded gain. |

Overlapping grains extracted from a capture buffer differ from contiguous tape
playback or a kit's independently triggered samples. These distinctions inform
the proposals; commercial panels are not copied.
[Clouds manual](https://pichenettes.github.io/mutable-instruments-documentation/modules/clouds/manual/),
[Make Noise tape/microsound system](https://www.makenoisemusic.com/systems/tape-microsound-music-machine/).

## Timing, sequence and samples — #76–85

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 76 KEEP | Scribe Sequencer | `sequence.pitch-gate`; K in, T reset in, P pitch out, G gate out | finite step pitches/gate lengths, length, direction; ordinary eight-step configuration, clocked explicitly. |
| 77 REWORK | Clockwork Stepper | `sequence.trigger`; K in, T reset in, T lanes1–4 out | lane patterns, lengths, pulse duration; events only, no automatic pitch. Explicit lane count is a proposal. |
| 78 KEEP | Binary Stepper | `sequence.algorithmic`; K in, T reset in, C value out | bit pattern, rule, length; deterministic word/rule sequence, not randomly mutated history or an assumed gate output. |
| 79 KEEP | Thunderclock Driver | `clock.master`; C tempo in, K out, T reset out | tempo, run, pulse width; one timing source with manual reset. Tempo is patch time, never world deadlines. |
| 80 REWORK | Solar Path Sequencer | `sequence.multilane`; K in, T reset in, P/C/G lanes out | per-lane values, lengths, advance ratios; decorrelated pitch, timbre and articulation. Exact lane configurations are typed state. |
| 81 KEEP | Driftline Euclid | `sequence.euclidean`; K in, T reset in, T out | steps, hits, rotation; distributed rhythm, not a conventional-song validator. |
| 82 REWORK | Grainwheel Rotator | `route.sequential`; K advance in, T reset in, A/C inputs1–4, A/C out | order, stage count, direction; routing changes at edges. Revise legacy position-sequencer role; no gain interpolation unless explicitly provided. |
| 83 REWORK | Oracle Timeline | `sequence.recurrence`; K in, T reset in, C/P value out, G gate out | history length, mutation probability, value range, seed; replay/mutate prior choices. Quantized pitch output requires declared quantizer settings or external #99. |
| 84 REWORK | Rhythm Scratcher | `sample.kit`; T lanes1–4 in, P transpose in, A lanes/mix out | per-lane asset, trim, start/end, playback mode; independent voices with choke/retrigger rules. Major redesign from legacy event source; assets cannot be silently omitted on save. |
| 85 KEEP | Lunar Pulse Divider | `clock.divide-multiply`; K in/out, T reset in | integer ratio, phase; subdivision needs causal period estimation and a specified stop timeout. No future-time knowledge or free-running world progression. |

Recurrence uses stored prior choices; independent random sampling does not.
Marbles documents that distinction and separately clocked random voltages. This
motivates #83 without making it a hardware clone.
[Marbles manufacturer manual](https://pichenettes.github.io/mutable-instruments-documentation/modules/marbles/manual/).

## Routing, scaling and pitch — #86–100

| # / decision | Module | Proposed behavior ID; minimum ports | Controls / useful distinction |
|---|---|---|---|
| 86 REWORK | Moonphase Mixer | `mix.stereo-crossfade`; A pair-a/pair-b L/R in, A L/R out, C position/pan in | input trims, crossfade, pan; stereo motion. No implicit extra gain or #68 diffusion. |
| 87 KEEP | Needle Mixer | `mix.audio`; A a/b in, A out | a/b level, master; simple mono summing. Never claim precision pitch addition. |
| 88 KEEP | Logic Farmer | `event.logic`; G a/b in, G out | AND/OR/XOR mode; Boolean level logic. Turning input triggers into deliberate pulse logic needs an explicit adapter, not guessed duration. |
| 89 REWORK | Stormlogic Gate | `detector.window`; C in, G above/below/inside out | low/high threshold, hysteresis; continuous conditions. Not #39 peak memory or #55 Bernoulli routing. |
| 90 KEEP | Relic Router | `route.matrix`; A/C/G inputs/outputs1–4 | route cells on/off; unity switching/fan-out without adjustable gain. Stored routes are explicit module state, not extra invisible patch cables. |
| 91 KEEP | Cloudform Mod Matrix | `mix.cv-matrix`; C inputs/outputs1–4 | manual signed cell coefficients, output offsets; many-to-many CV combination, no per-cell gain-CV ports as in #45. |
| 92 KEEP | Grandma’s Patch Shelf | `route.mult-trim`; A/C in, A/C copies out | manual trim per copy; simple mult plus attenuation. Ideal digital duplication, no simulated passive loading. |
| 93 REWORK | Solar Quad Attenuator | `cv.attenuvert-quad`; A/C inputs/outputs1–4 | signed gain per lane; independent attenuation/inversion with no offset. |
| 94 KEEP | Thunderclap Mult | `route.mult`; A/C/G in, copies out | none; pure transparent fan-out, including events. Branching cables may already perform this; retain a physical grouping role without claiming a unique DSP necessity. |
| 95 REWORK | Crystal Linker | `pitch.add`; P a/b in, P sum out | transpose; precise octave-domain sum. A constant offset implies transposition, not multiplication of linear FM frequencies. |
| 96 KEEP | Vapor Flux Switch | `route.switch`; A/C/G a/b in, G select in, same-domain out | manual selection, switching fade policy; two-way selected route, unlike clock-advanced #82. |
| 97 REWORK | Elder Chain Mixer | `mix.dc`; A/C a/b in/out | signed levels, master; DC-coupled modulation/audio sum. Does not advertise pitch calibration unless that is explicitly tested. |
| 98 REWORK | Luminous Orbit Link | `cv.offset`; C/P in/out | offset, signed gain; establish operating point or transpose. Domain-preserving mode defines offset units. |
| 99 REWORK | Rune Divider | `pitch.quantize`; C in, P out, T note-change out | allowed intervals, root, octave range; optional pitch constraint. No clock division and no musical success grading. |
| 100 KEEP | Sampo Module | `story.sampo` RESERVED; ports TBD | Fictional capstone preserved. No registered processor, silent fallback or coverage credit until later authored scope. |

## Decisions proposed at this gate

1. Retain all 100 identities and the historical split. Approve the eight donor
   directions as revised here, without deleting or renaming slots by accident.
2. Prefer composable distinctions over rarity-based versions: #39 peak latch,
   #89 window detector, #25 correlated targets, #58 walk, #18 resonant filter loop,
   #67 tuned comb, #47 track/hold, #52 edge sample/hold, #48 opto gain.
3. Allow processor reuse: #17/#19 can configure a filter core; #35 configures AR;
   #46/#49 share a multiplier core; #92/#94 share fan-out; #61/#75 share reverb.
   Useful controls and routing distinguish fictional products. A catalogue slot
   need not justify a wholly separate DSP implementation.
4. Keep manufacturer/history independent of acquisition provenance. Resolve #63/
   #84 historical evidence before claiming canonical maker or rarity.
5. Reserve Sampo. Treat assets, buffers, event execution and feedback as explicit
   contracts in the schema, not deductions from marketing descriptions.

These are worker recommendations. Review may accept a subset or revise a role;
neither this document nor a coverage witness authorizes runtime implementation.
