# Eurorack Module Master Catalogue — Rehabilitation Audit v1

**Purpose:** recover the original 100-module catalogue, keep its fictional identity, and remap it to the functional vocabulary required by the newer modular-synthesis research.

## Source authority and status

- The **100 names / legacy category ordering / manufacturers / historical rarities** come from the old Eurorack Incremental Game catalogue recovered from project history and corroborated against the current `constants.ts` where available.
- The current code already contains 95 of the old 100 names in `MASTER_POOL`; `Cathedral BBD` and `Rhythm Scratcher` survive in boss decks. `Solar Arc Envelope`, `Cracked Tape Erosion`, and `Sampo Module` are absent from current code.
- **KEEP / REWORK / DUPLICATE** comes from the current archaeology audit: **47 KEEP · 45 REWORK · 8 DUPLICATE**.
- **New functional role / signal domains / notes are v1 design proposals**, derived from the new modular synthesis research. They are not implementation authority yet.
- Historical **rarity is reference metadata only** in this pass. It does not regain progression authority.

## Decision meanings

- **KEEP** — the old concept already maps cleanly to a useful modular function.
- **REWORK** — retain identity/name but change or sharpen its actual signal-processing role.
- **DUPLICATE** — the old role is redundant; keep the catalogue slot/name as a donor for a distinct function.

## Master table

| # | Module | Manufacturer | Old rarity | Legacy family | Decision | New functional role v1 | Signal domains | Notes |
|---:|---|---|---|---|---|---|---|---|
| 1 | Solar Sine | Luminous Forge | Common | Oscillator | **KEEP** | Basic sine VCO | AUDIO, PITCH CV, MOD CV | Foundation periodic source. |
| 2 | Gramps’ Saw | Analog Granny Industries | Common | Oscillator | **KEEP** | Drifting saw VCO | AUDIO, PITCH CV, MOD CV | Richer subtractive source with deliberate analog drift. |
| 3 | Oracle Wavetable | Ancient Circuitry Guild | Rare | Oscillator | **KEEP** | Wavetable oscillator | AUDIO, PITCH CV, MOD CV | Independent pitch and table-position modulation. |
| 4 | Binary Pulse Engine | Starlit Machines | Uncommon | Oscillator | **KEEP** | Digital pulse oscillator | AUDIO, PITCH CV, MOD CV | Precise digital/pulse source; can expose pulse-related CV/gate behavior. |
| 5 | Pulse Driver | Thunderclap Systems | Common | Oscillator | **REWORK** | Pulse/subharmonic oscillator | AUDIO, PITCH CV, MOD CV, SYNC | Differentiate from Binary Pulse via PWM, hard sync and/or subharmonics. |
| 6 | Twin Ember VCO | Luminous Forge | Uncommon | Oscillator | **KEEP** | Dual oscillator | AUDIO, PITCH CV, MOD CV | Two related oscillators for detune, beating and FM. |
| 7 | Relic Harmonic Core | Ancient Circuitry Guild | Legendary | Oscillator | **REWORK** | Harmonic / ensemble oscillator | AUDIO, PITCH CV, MOD CV | Research gap: chord/ensemble/harmonic-bank source. |
| 8 | Vaporline FM Source | Vaporvale Laboratories | Uncommon | Oscillator | **KEEP** | FM/PM oscillator | AUDIO, PITCH CV, AUDIO-RATE CV | Explicit carrier/modulator-friendly source. |
| 9 | Crystal Drone Generator | Starlit Machines | Rare | Oscillator | **REWORK** | Oscillator cluster / drone bank | AUDIO, PITCH CV, MOD CV | Multiple detuned voices / slowly moving spectrum. |
| 10 | Fossil Resonator | Analog Granny Industries | Rare | Oscillator | **REWORK** | Physical resonator | AUDIO EXCITER, PITCH CV, MOD CV, TRIG | Stop treating it as a VCO; exciter-driven modal response. |
| 11 | Fusion Ladder Filter | Luminous Forge | Common | Filter | **KEEP** | Low-pass ladder VCF | AUDIO, MOD CV | Foundation subtractive filter. |
| 12 | Thunderfold VCF | Thunderclap Systems | Uncommon | Filter | **REWORK** | Wavefolder / waveshaper | AUDIO, MOD CV | Research gap; name already fits. |
| 13 | Relic Low-Pass Gate | Ancient Circuitry Guild | Rare | Filter/LPG | **KEEP** | Low-pass gate | AUDIO, CV, TRIG | Coupled amplitude and spectral decay. |
| 14 | Fog SEM Filter | Thunderclap Systems | Common | Filter | **KEEP** | Multimode state-variable VCF | AUDIO, MOD CV | LP/BP/HP/notch family. |
| 15 | Orbit Shaper VCF | Starlit Machines | Uncommon | Filter | **KEEP** | Morphing multimode filter | AUDIO, MOD CV | Continuously morphing filter topology. |
| 16 | Grainwind Triple Filter | Vaporvale Laboratories | Rare | Filter | **REWORK** | Three-band / formant filter bank | AUDIO, MOD CV | Research gap: formant/vocal/filter-bank structures. |
| 17 | Grandma’s Notch Carver | Analog Granny Industries | Common | Filter | **KEEP** | Notch / band-reject filter | AUDIO, MOD CV | Simple spectral carving. |
| 18 | Stasis Resonant Well | Ancient Circuitry Guild | Legendary | Filter | **REWORK** | Tuned feedback / comb resonant processor | AUDIO, MOD CV, FEEDBACK | Unstable resonant/feedback territory distinct from Fossil Resonator. |
| 19 | Solar Crest Bandpass | Luminous Forge | Uncommon | Filter | **KEEP** | Resonant band-pass filter | AUDIO, MOD CV | Useful for noise, vocal-ish and percussion patches. |
| 20 | Ruins Dual Ladder | Starlit Machines | Rare | Filter | **REWORK** | Dual/stereo ladder filter pair | AUDIO L/R, MOD CV | Independent or linked channels; serial/parallel routing. |
| 21 | Grandpa’s Drift LFO | Analog Granny Industries | Common | LFO / Modulation | **KEEP** | Slow drifting LFO | MOD CV | Foundation slow modulation. |
| 22 | Electric Meadow LFO | Thunderclap Systems | Common | LFO / Modulation | **DUPLICATE** | Donor slot: CV recorder / looping modulator | MOD CV, GATE/TRIG | Candidate repurpose; avoid another plain LFO. |
| 23 | Orbit Modulator | Starlit Machines | Uncommon | LFO / Modulation | **KEEP** | Quadrature / cyclic modulator | MOD CV | Several related phase outputs make it meaningfully different. |
| 24 | Ember Curve Shaper | Luminous Forge | Rare | LFO / Modulation | **REWORK** | CV waveshaper / rectifier / curve processor | CV IN/OUT | Transforms modulation rather than generating another basic LFO. |
| 25 | Fluctuation Engine | Vaporvale Laboratories | Uncommon | LFO / Modulation | **REWORK** | Smooth random / fluctuating voltage generator | MOD CV | Research role: slowly varying random control. |
| 26 | Ancient Chaotic Map | Ancient Circuitry Guild | Rare | LFO / Modulation | **KEEP** | Deterministic chaos generator | MOD CV | Structured chaos rather than plain randomness. |
| 27 | Pulse Wander LFO | Thunderclap Systems | Uncommon | LFO / Modulation | **DUPLICATE** | Donor slot: jitter / burst clock modulator | CLOCK, GATE/TRIG, MOD CV | Candidate repurpose; tempo instability and burst timing. |
| 28 | Solar Arc Envelope | Luminous Forge | Rare | LFO / Modulation | **REWORK** | Slew / lag / glide processor | CV IN/OUT, GATE | Research gap; historical missing module restored. |
| 29 | Binary Sync LFO | Starlit Machines | Uncommon | LFO / Modulation | **KEEP** | Clock-synchronised digital LFO | CLOCK, MOD CV | Tempo-related cyclic modulation. |
| 30 | Shattered Wave Modulator | Vaporvale Laboratories | Legendary | LFO / Modulation | **REWORK** | Stepped / sample-rate-reduced CV processor | CV IN/OUT, CLOCK | Breaks continuous modulation into stepped or fragmented control. |
| 31 | Ember ADSR | Luminous Forge | Common | Envelope | **KEEP** | ADSR envelope | GATE, MOD CV | Foundation articulation. |
| 32 | Rustleaf Function Duo | Analog Granny Industries | Uncommon | Envelope | **KEEP** | Dual cycling function generator | GATE/TRIG, CV IN/OUT, EOC | Can envelope, cycle, slew and patch into modulation networks. |
| 33 | Thunderstrike ENV | Thunderclap Systems | Common | Envelope | **KEEP** | Fast AD/percussion envelope | TRIG/GATE, MOD CV | Transient-focused articulation. |
| 34 | Scripted Response Generator | Ancient Circuitry Guild | Rare | Envelope | **REWORK** | Programmable multistage function | GATE/TRIG, CV IN/OUT | Complex envelope / control trajectory. |
| 35 | Moonrise Decay Engine | Starlit Machines | Uncommon | Envelope | **KEEP** | Long decay / AR envelope | GATE/TRIG, MOD CV | Slow tails and evolving articulation. |
| 36 | Vaportrail Envelope | Vaporvale Laboratories | Rare | Envelope | **REWORK** | Loopable AR with delay/hold | GATE/TRIG, MOD CV | Distinct temporal envelope behavior rather than another ADSR. |
| 37 | Elder Bark ADSR | Analog Granny Industries | Common | Envelope | **DUPLICATE** | Donor slot: envelope follower | AUDIO IN, CV OUT | Candidate repurpose; turns patch dynamics into control voltage. |
| 38 | Solar Bloom Generator | Luminous Forge | Rare | Envelope | **REWORK** | Multi-output / phased envelope generator | GATE/TRIG, MOD CV | One event can create several related modulation contours. |
| 39 | Quantum Peak Shaper | Starlit Machines | Legendary | Envelope | **REWORK** | Comparator / window detector | CV IN, GATE OUT | Research gap: threshold/condition logic. |
| 40 | Relic Erosion Envelope | Ancient Circuitry Guild | Legendary | Envelope | **REWORK** | Krell / EOC function generator | TRIG, CV OUT, EOC/EOS | Self-running causal event structures. |
| 41 | Ghost Gate VCA | Generic | Common | VCA | **KEEP** | Basic DC-coupled VCA | AUDIO/CV IN, CV CONTROL, AUDIO/CV OUT | Foundation VCA; must process CV as well as audio. |
| 42 | Rusted VCA | Analog Granny Industries | Uncommon | VCA | **DUPLICATE** | Donor slot: feedback VCA / soft limiter | AUDIO/CV, CONTROL | Candidate repurpose; specifically for controlled feedback loops. |
| 43 | Thunderhold VCA | Thunderclap Systems | Common | VCA | **REWORK** | Drive / saturating VCA | AUDIO/CV, CONTROL | Gain stage with intentional nonlinearity. |
| 44 | Solar Bloom VCA | Luminous Forge | Uncommon | VCA | **REWORK** | Exponential / soft-clipping VCA | AUDIO/CV, CONTROL | Different response law and gentle saturation. |
| 45 | Flare Matrix VCA | Vaporvale Laboratories | Rare | VCA | **REWORK** | Matrix VCA / modulation-depth router | AUDIO/CV, MULTI-CV | Research role: multiple voltage-controlled relationships. |
| 46 | Binary Clamp | Starlit Machines | Common | VCA | **REWORK** | Four-quadrant multiplier / ring modulator | AUDIO/CV x2 | AM, ring modulation and bipolar CV multiplication. |
| 47 | Relic Sustain Cell | Ancient Circuitry Guild | Rare | VCA | **DUPLICATE** | Donor slot: track-and-hold / voltage memory cell | CV IN, TRIG/GATE, CV OUT | Candidate repurpose; persistent control-state memory. |
| 48 | Grandma’s Gatekeeper | Analog Granny Industries | Rare | VCA | **REWORK** | Gate-controlled switch / opto VCA | AUDIO/CV, GATE | Hard/soft gating with character. |
| 49 | Crystal Vein Amplifier | Starlit Machines | Rare | VCA | **REWORK** | Precision linear bipolar VCA | AUDIO/CV, CONTROL | Clean CV/audio scaling distinct from character VCAs. |
| 50 | Echo-Leaf Attenuator | Vaporvale Laboratories | Common | VCA / Utility | **REWORK** | Fine attenuation / level trim | AUDIO/CV IN/OUT | Simple manual scaling; keep separate from voltage-controlled gain. |
| 51 | Dust Engine | Ancient Circuitry Guild | Common | Noise / Random | **KEEP** | Digital dust/noise source | AUDIO | Broadband / textured excitation. |
| 52 | Quantum Sprinkle | Vaporvale Laboratories | Common | Noise / Random | **REWORK** | Sample & hold / track & hold | CV IN, TRIG/CLOCK, CV OUT | Research gap; core generative utility. |
| 53 | Static Orchard | Analog Granny Industries | Uncommon | Noise / Random | **KEEP** | Interference / radio-noise source | AUDIO | Distinct noise texture. |
| 54 | Binary Snowfall | Starlit Machines | Uncommon | Noise / Random | **KEEP** | Shift-register noise / pseudo-random source | AUDIO, CV, CLOCK | Can bridge audio noise and stepped random control. |
| 55 | Thundergrain Burst | Thunderclap Systems | Rare | Noise / Random | **REWORK** | Probability / Bernoulli gate | GATE/TRIG IN/OUT, CV | Research gap: probabilistic event routing. |
| 56 | Relic Ash Generator | Ancient Circuitry Guild | Rare | Noise / Random | **REWORK** | Impulse / click / exciter source | AUDIO, TRIG | Dedicated excitation for resonators and physical modelling. |
| 57 | Solar Wind Noise | Luminous Forge | Uncommon | Noise / Random | **KEEP** | Coloured / filtered noise source | AUDIO, MOD CV | Wind/breath/noise-texture material. |
| 58 | Fluctis Stream | Vaporvale Laboratories | Rare | Noise / Random | **REWORK** | Smooth random CV | MOD CV | Slow stochastic movement. |
| 59 | Cracked Tape Erosion | Analog Granny Industries | Rare | Noise / Random | **DUPLICATE** | Donor slot: tape degradation / dropout processor | AUDIO, MOD CV | Historical missing module restored; candidate unique lo-fi process. |
| 60 | Chaotic Oracle | Ancient Circuitry Guild | Legendary | Noise / Random | **KEEP** | High-order chaotic/random event source | CV, GATE/TRIG | Complex generative decisions rather than raw noise. |
| 61 | Glow Reverb | Luminous Forge | Common | Effect | **KEEP** | Plate / room reverb | AUDIO, MOD CV | Foundation spatial effect. |
| 62 | Void Delay | Starlit Machines | Uncommon | Effect | **KEEP** | Digital delay with feedback | AUDIO, MOD CV, FEEDBACK | Core time/feedback processor. |
| 63 | Cathedral BBD | Boss-Only | Rare | Effect | **KEEP** | BBD / analog-style delay | AUDIO, MOD CV | Distinct noisy/clocked delay character. |
| 64 | Pebble Granulator | Vaporvale Laboratories | Rare | Effect | **KEEP** | Granular processor | AUDIO, MOD CV, TRIG | Position/size/density/pitch style microsound control. |
| 65 | Diffuse Echo | Vaporvale Laboratories | Uncommon | Effect | **REWORK** | Diffusion / all-pass smear network | AUDIO, MOD CV | Temporal diffusion rather than another conventional delay. |
| 66 | Biscuit Bitcrusher | Analog Granny Industries | Common | Effect | **KEEP** | Bit-depth / sample-rate reducer | AUDIO, MOD CV | Digital degradation. |
| 67 | Echo of Ruins | Thunderclap Systems | Rare | Effect | **DUPLICATE** | Donor slot: comb / Karplus feedback processor | AUDIO, MOD CV, FEEDBACK | Candidate repurpose; pitched delay/resonant feedback. |
| 68 | Cloudform Diffuser | Vaporvale Laboratories | Uncommon | Effect | **REWORK** | Stereo diffusion / cloud spatializer | AUDIO L/R, MOD CV | Evolving stereo-space processor. |
| 69 | Resonant Shard Saturator | Luminous Forge | Rare | Effect | **KEEP** | Resonant saturation / distortion | AUDIO, MOD CV | Nonlinear tone shaping. |
| 70 | Grainstorm Cascade | Starlit Machines | Legendary | Effect | **REWORK** | Microsound loop reassembly | AUDIO, CLOCK/TRIG, MOD CV | Research role: sliced/granulated/reordered buffer process. |
| 71 | Elder Tape Ghost | Analog Granny Industries | Legendary | Effect | **REWORK** | Tape buffer / looper | AUDIO, TRIG/CLOCK, MOD CV | Research role: recording/playback window, speed and direction. |
| 72 | Solar Prism Chorus | Luminous Forge | Uncommon | Effect | **KEEP** | Stereo chorus / widening | AUDIO L/R, MOD CV | Slow correlated spatial movement. |
| 73 | Thunderflare Overdrive | Thunderclap Systems | Uncommon | Effect | **KEEP** | Overdrive / saturation | AUDIO | Simple nonlinear drive. |
| 74 | Spectral Grove Splitter | Ancient Circuitry Guild | Rare | Effect | **REWORK** | Multiband / spectral splitter-router | AUDIO IN, MULTI-AUDIO OUT, MOD CV | Parallel processing and frequency-dependent routing. |
| 75 | Void Bloom Reverb | Starlit Machines | Rare | Effect | **DUPLICATE** | Donor slot: freeze / infinite-feedback reverb | AUDIO, GATE/TRIG, MOD CV | Candidate repurpose; captured/frozen space rather than second plain reverb. |
| 76 | Scribe Sequencer | Ancient Circuitry Guild | Common | Sequencer / Clock | **KEEP** | Basic pitch+gate step sequencer | CLOCK, PITCH CV, GATE | Foundation repeatable sequencing. |
| 77 | Clockwork Stepper | Generic / Boss | Uncommon | Sequencer / Clock | **REWORK** | Trigger sequencer | CLOCK, TRIG/GATE | Dedicated event pattern source. |
| 78 | Binary Stepper | Starlit Machines | Uncommon | Sequencer / Clock | **KEEP** | Digital / algorithmic CV sequencer | CLOCK, CV, GATE | Contrasting sequencing logic to Scribe. |
| 79 | Thunderclock Driver | Thunderclap Systems | Common | Sequencer / Clock | **KEEP** | Master clock source | CLOCK/GATE | Foundation timing reference. |
| 80 | Solar Path Sequencer | Luminous Forge | Rare | Sequencer / Clock | **REWORK** | Multi-lane pitch/timbre/gate sequencer | CLOCK, PITCH CV, MOD CV, GATE | Research role: decorrelated lanes. |
| 81 | Driftline Euclid | Analog Granny Industries | Uncommon | Sequencer / Clock | **KEEP** | Euclidean rhythm generator | CLOCK, GATE/TRIG | Patterned event generation. |
| 82 | Grainwheel Rotator | Vaporvale Laboratories | Rare | Sequencer / Clock | **REWORK** | Sequential / rotating switch | CLOCK/GATE, AUDIO/CV IN/OUT | Research gap: structural routing changes. |
| 83 | Oracle Timeline | Ancient Circuitry Guild | Legendary | Sequencer / Clock | **REWORK** | Generative recurrence / probability sequencer | CLOCK, CV, GATE | Memory/recurrence rather than fixed-step sequencing. |
| 84 | Rhythm Scratcher | MPC Boss | Rare | Sequencer / Clock | **REWORK** | Multi-channel sampler / sample sequencer | TRIG/GATE, PITCH CV, AUDIO | Restore beyond boss-only use; research role: modular sample kit. |
| 85 | Lunar Pulse Divider | Starlit Machines | Uncommon | Sequencer / Clock | **KEEP** | Clock divider / multiplier | CLOCK IN/OUT | Timing utility distinct from quantization. |
| 86 | Moonphase Mixer | Starlit Machines | Common | Utility | **REWORK** | Stereo mixer / panner / crossfader | AUDIO L/R, MOD CV | Research gap: spatial and audio crossfading. |
| 87 | Needle Mixer | Generic | Common | Utility | **KEEP** | Basic audio mixer | AUDIO | Foundation summing. |
| 88 | Logic Farmer | Generic | Uncommon | Utility | **KEEP** | Boolean gate logic | GATE IN/OUT | AND/OR/XOR-style event logic. |
| 89 | Stormlogic Gate | Thunderclap Systems | Uncommon | Utility | **REWORK** | CV comparator / window-to-gate | CV IN, GATE OUT | Threshold conditions; complements Logic Farmer. |
| 90 | Relic Router | Ancient Circuitry Guild | Rare | Utility | **KEEP** | Matrix signal router | AUDIO/CV/GATE | Patch-structure routing. |
| 91 | Cloudform Mod Matrix | Vaporvale Laboratories | Rare | Utility | **KEEP** | CV modulation matrix | CV IN/OUT | Many-to-many modulation routing. |
| 92 | Grandma’s Patch Shelf | Analog Granny Industries | Common | Utility | **KEEP** | Passive mult / simple attenuator | AUDIO/CV | Small bread-and-butter utility. |
| 93 | Solar Quad Attenuator | Luminous Forge | Common | Utility | **REWORK** | Quad attenuverter | AUDIO/CV | Research gap: bipolar scaling/inversion. |
| 94 | Thunderclap Mult | Thunderclap Systems | Common | Utility | **KEEP** | Signal multiple / splitter | AUDIO/CV/GATE | Fan-out utility. |
| 95 | Crystal Linker | Starlit Machines | Rare | Utility | **REWORK** | Precision adder / ratio linker | PITCH CV, CV | Pitch sums, transposition and FM-ratio relationships. |
| 96 | Vapor Flux Switch | Vaporvale Laboratories | Uncommon | Utility | **KEEP** | Manual / CV-controlled switch | AUDIO/CV/GATE | Simple routing switch; Grainwheel handles sequential switching. |
| 97 | Elder Chain Mixer | Analog Granny Industries | Uncommon | Utility | **REWORK** | DC-coupled CV/audio mixer | AUDIO/CV | Research gap: combine modulation as well as audio. |
| 98 | Luminous Orbit Link | Luminous Forge | Rare | Utility | **REWORK** | Precision offset / transposer | CV, PITCH CV | Research gap: operating point / pitch offset. |
| 99 | Rune Divider | Ancient Circuitry Guild | Rare | Utility | **REWORK** | Quantizer / scale constraint | CV IN, PITCH CV OUT | Research gap; clock division already covered by Lunar Pulse Divider. |
| 100 | Sampo Module | Unknown / Legendary Maker | Mythic | Utility / Reality Engine | **KEEP** | Reality Engine / capstone meta-module | TBD | Keep the mythology; exact musical behavior should be designed later, not forced into a generic utility. |

## The eight duplicate donor slots

These are not proposed deletions. They are the eight catalogue slots where the old role buys us the least, so they are the easiest places to add missing or more interesting system behavior without expanding beyond 100 modules.

- **#22 Electric Meadow LFO** → Donor slot: CV recorder / looping modulator. Candidate repurpose; avoid another plain LFO.
- **#27 Pulse Wander LFO** → Donor slot: jitter / burst clock modulator. Candidate repurpose; tempo instability and burst timing.
- **#37 Elder Bark ADSR** → Donor slot: envelope follower. Candidate repurpose; turns patch dynamics into control voltage.
- **#42 Rusted VCA** → Donor slot: feedback VCA / soft limiter. Candidate repurpose; specifically for controlled feedback loops.
- **#47 Relic Sustain Cell** → Donor slot: track-and-hold / voltage memory cell. Candidate repurpose; persistent control-state memory.
- **#59 Cracked Tape Erosion** → Donor slot: tape degradation / dropout processor. Historical missing module restored; candidate unique lo-fi process.
- **#67 Echo of Ruins** → Donor slot: comb / Karplus feedback processor. Candidate repurpose; pitched delay/resonant feedback.
- **#75 Void Bloom Reverb** → Donor slot: freeze / infinite-feedback reverb. Candidate repurpose; captured/frozen space rather than second plain reverb.

## Research coverage after this remap

The 100-slot catalogue now has explicit homes for the major research roles: basic/complex/wavetable/FM sources; noise and excitation; multimode filtering; LPG; wavefolding; physical resonators; audio and CV mixing; DC-coupled VCAs; envelopes/function generators; LFOs and chaotic/random CV; sample & hold; probability; clocks/gates/triggers; pitch sequencing; quantization; slew; attenuation/attenuversion; offset/transposition; precision addition; comparators; switches; routing matrices; granular/microsound; tape looping; multi-channel sampling; stereo/spatial processing; and several deliberately unstable feedback-oriented processors.

## Architecture consequence

Do **not** encode these as a deep class hierarchy such as `Quantizer extends Utility extends Module`. The catalogue should become data-driven:

```text
ModuleDefinition
  -> ports
  -> controls
  -> capabilities / reusable functional processor

ModuleInstance + PatchCable[]
  -> Patch

Patch + metadata
  -> StarterPreset / StudioPatch / ProjectPatch / ArchiveSnapshot
```

That lets one behavior be reused by several fictional modules without pretending that all `UTILITY` modules are functionally identical.

## Next pass

Before starter presets are authored, review the **45 REWORK** roles and the **8 donor proposals** for musical identity. Once those are accepted, define ports and controls for each functional behavior, then build 3–4 starter patches as explicit module-instance + cable graphs.

R1 review drafts now record the [100-row source audit and contradictions](R1_CATALOGUE_SOURCE_AUDIT.md),
[all role recommendations](R1_FUNCTIONAL_ROLE_REVIEW.md),
[module vocabulary](../design/MODULE_DEFINITION_DRAFT.md) and
[15-family coverage witnesses](R1_PATCH_FAMILY_COVERAGE.md).
They preserve this v1 table as recovery evidence. Proposed revisions are unapproved;
the original bible and research sources still need independent corroboration.
