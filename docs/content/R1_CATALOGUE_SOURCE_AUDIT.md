# R1 catalogue source audit and contradiction report

2026-10-05. Review draft against `2541d6b`. No runtime changes or acceptance of
the new roles. Read with [role review](R1_FUNCTIONAL_ROLE_REVIEW.md),
[behavior vocabulary](../design/MODULE_DEFINITION_DRAFT.md) and
[coverage matrix](R1_PATCH_FAMILY_COVERAGE.md).

## Evidence and verification boundary

The v1 table has exactly 100 unique names and sequential rows, with **47 KEEP,
45 REWORK and 8 DUPLICATE**. All 100 rows were compared by exact Unicode name
against the literal module objects in `constants.ts`. Each match below records
its current ID, type, manufacturer, rarity, description and source location.
Pool definitions take precedence over starter/boss variants for this comparison;
those variants are separate evidence, not replacements for the pool definition.

Result: **95 pool matches, two boss-only matches and three absent names**.
`MASTER_POOL` contains **98** objects: the 95 recovered matches plus Kick-Safe
Ducker (`duck_001`), Vacuum Pump (`duck_002`) and Abyss Swallow (`duck_003`).
Their existence does not authorize deleting them or enlarging the recovered 100.
Keep them on the legacy side of the later adapter until explicitly scoped.

The original consolidated design bible and the original synthesis research are
not checked into this repository or its available Git path history. The recovery
documents are secondary evidence. Historical names, ordering and metadata cannot
be independently certified against the original in this session. In particular,
the three absent entries have **recovery-document evidence only**. Do not call
them source-verified, invent historical IDs, or overwrite conflicting metadata.
The coverage pass uses the roadmap's 15 explicit families and primary manufacturer
manuals for functional distinctions; it does not claim to reproduce the missing
research's full requirements. Original-source corroboration remains an exit item.

## Contradictions and proposed disposition

| Evidence | Conflict / consequence | Recommendation for review |
|---|---|---|
| #63 Cathedral BBD, `b2_3`, `constants.ts:271` | v1 says Rare / Boss-Only / BBD delay; current code says Legendary / Boss Special / infinite reverb tail. | Preserve both records. Treat Boss-Only as acquisition provenance, not a manufacturer. Propose BBD delay as future role; historical maker/rarity unresolved. |
| #84 Rhythm Scratcher, `b3_2`, `constants.ts:283` | v1 says Rare / MPC Boss / sampler; current code says Legendary / Boss Special / polyrhythmic trigger sequencer with no audio output. | Sampler is a substantial redesign, not recovered implemented functionality. Maker/rarity unresolved; MPC Boss is encounter provenance. |
| #77 Clockwork Stepper, `seq_003`, `constants.ts:211` | v1 maker Generic / Boss combines identity with availability. Pool maker is Generic, rarity Uncommon. Boss `b1_3` is Common. | Use Generic as current maker evidence, keep boss provenance separate. Do not merge variant rarity into the canonical definition. |
| #5, #21, #86 boss variants | `b1_1`, `b2_4`, `b2_2` differ in rarity/descriptions from their pool entries. | Use `vco_003`, `lfo_001`, `util_002` as baseline evidence; record variants as aliases with provenance, never additional recovered rows. |
| #28, #59, #100 | Solar Arc Envelope, Cracked Tape Erosion and Sampo Module have no current literal definition. | Reserve catalogue identity; defer legacy-ID mapping. Sampo has no ordinary DSP contract yet and must not count toward coverage. |
| Legacy family column | Envelopes are `UTILITY`; noise spans `VCO` and `LFO`; clock/divider are `UTILITY`. | Column is historical grouping, not an enum parity claim. Never dispatch future processing by that family. |
| Legacy port arrays | Repeated `AUDIO_IN` / `AUDIO_OUT` values encode index positions; `CV` doesn't distinguish pitch, FM, gain or clocks. | Define stable port IDs and semantic domains. Do not map indices to future ports by their position alone. |
| #10, #12, #28, #39, #47, #52, #82, #89, #95, #98, #99 | Proposed role differs materially from legacy description and/or ports. | Record explicit redesign, keeping source text. A name match proves identity only. Review every proposed contract in the role table. |
| #25 / #58; #39 / #89; #18 / #67; #41 / #49 | v1 describes nearly the same function twice. | Distinguish correlated random / random walk; peak latch / window comparator; resonant filter loop / tuned comb delay; ordinary unipolar gain / signed precision gain. |
| #48 | v1's “switch / opto VCA” combines discontinuous routing and opto amplitude response. | Choose opto VCA with explicit response memory. Switch functions belong to #82/#96. |
| #44 | Exponential VCA response and soft clipping are independent axes. | Specify exponential control response plus optional signal clipping separately; don't infer one from the other. |
| #95 | Precision addition cannot maintain a frequency ratio under arbitrary linear FM. | Specify pitch-domain addition/transposition. Ratio controls belong to the oscillator contract, especially #8. |
| #64 / #70 / #71 / #84 | “buffer” alone does not distinguish four processors. | Continuous overlapping grains / clocked slice reordering / contiguous tape looping / independent triggered sample voices. Asset and buffer preservation are separate required state decisions. |
| #42 / master safety | A musical feedback soft limiter could be mistaken for guaranteed speaker protection. | Character limiter is local musical behavior; existing master safety remains mandatory regardless of installed modules. |
| S1-A vs proposed instrument | Current `patchModel.ts` has seven kinds and no active GATE ports. Pitch is CV into `osc.detune` with route scale 1200; filter CV scale 2400; gain CV scale 0.5. | Preserve these exact semantics in R2's first adapter. Future pitch-octave semantics require an explicit versioned conversion, never reinterpret saved values. |
| Capability vs actual runtime | Catalogue descriptions promise many things the current seven-kind graph doesn't implement. | Mark registry entries implemented/planned separately. Never silently render a missing processor as an oscillator or generic gain. |

## Review gate

All 100 current-source comparisons and all 53 rework/donor recommendations are
recorded. The split is preserved as archaeology, not reclassified to disguise
role changes. Proposed contracts are reviewable but unapproved. R2 remains gated
on acceptance plus original-source corroboration or an explicit decision to
proceed with documented provenance gaps. No `constants.ts`, runtime/save schema,
DSP, starter presets or adventure UI changes belong to this pass.

## Row evidence

Generated from the v1 Markdown rows and one-line literal definitions in
`constants.ts` at the baseline above, without evaluating TypeScript. A missing
match means absent from these literal definitions, not absent from all history.
Line links are navigation aids at this unchanged source baseline.

| # | Recovered name / decision | Current ID / source | Current type / maker / rarity | Current description / metadata comparison |
|---:|---|---|---|---|
| 1 | Solar Sine / **KEEP** | [vco_001](../../constants.ts#L123) (pool) | VCO / Luminous Forge / COMMON | Pure analog sine wave. Maker/rarity match. |
| 2 | Gramps’ Saw / **KEEP** | [vco_002](../../constants.ts#L124) (pool) | VCO / Analog Granny Industries / COMMON | Buzzing saw wave with vintage drift. Maker/rarity match. |
| 3 | Oracle Wavetable / **KEEP** | [vco_007](../../constants.ts#L129) (pool) | VCO / Ancient Circuitry Guild / RARE | Predicts the voltage you need. Maker/rarity match. |
| 4 | Binary Pulse Engine / **KEEP** | [vco_005](../../constants.ts#L127) (pool) | VCO / Starlit Machines / UNCOMMON | Precise digital oscillation source. Maker/rarity match. |
| 5 | Pulse Driver / **REWORK** | [vco_003](../../constants.ts#L125) (pool) | VCO / Thunderclap Systems / COMMON | High-current oscillator with aggressive pulse. Maker/rarity match. |
| 6 | Twin Ember VCO / **KEEP** | [vco_004](../../constants.ts#L126) (pool) | VCO / Luminous Forge / UNCOMMON | Dual oscillator for detuned warmth. Maker/rarity match. |
| 7 | Relic Harmonic Core / **REWORK** | [vco_010](../../constants.ts#L132) (pool) | VCO / Ancient Circuitry Guild / LEGENDARY | Generates sound from lost eras. Maker/rarity match. |
| 8 | Vaporline FM Source / **KEEP** | [vco_006](../../constants.ts#L128) (pool) | VCO / Vaporvale Laboratories / UNCOMMON | Glassy FM tones. Maker/rarity match. |
| 9 | Crystal Drone Generator / **REWORK** | [vco_008](../../constants.ts#L130) (pool) | VCO / Starlit Machines / RARE | Sustained harmonic textures. Maker/rarity match. |
| 10 | Fossil Resonator / **REWORK** | [vco_009](../../constants.ts#L131) (pool) | VCO / Analog Granny Industries / RARE | Ancient acoustic modeling. Maker/rarity match. |
| 11 | Fusion Ladder Filter / **KEEP** | [vcf_001](../../constants.ts#L135) (pool) | FILTER / Luminous Forge / COMMON | Creamy 4-pole lowpass filter. Maker/rarity match. |
| 12 | Thunderfold VCF / **REWORK** | [vcf_004](../../constants.ts#L138) (pool) | FILTER / Thunderclap Systems / UNCOMMON | Wavefolding filter. Maker/rarity match. |
| 13 | Relic Low-Pass Gate / **KEEP** | [vcf_007](../../constants.ts#L141) (pool) | FILTER / Ancient Circuitry Guild / RARE | Organic, plucky low-pass gate. Maker/rarity match. |
| 14 | Fog SEM Filter / **KEEP** | [vcf_002](../../constants.ts#L136) (pool) | FILTER / Thunderclap Systems / COMMON | Variable state filter, thick and hazy. Maker/rarity match. |
| 15 | Orbit Shaper VCF / **KEEP** | [vcf_005](../../constants.ts#L139) (pool) | FILTER / Starlit Machines / UNCOMMON | Morphing filter topology. Maker/rarity match. |
| 16 | Grainwind Triple Filter / **REWORK** | [vcf_008](../../constants.ts#L142) (pool) | FILTER / Vaporvale Laboratories / RARE | Three filters in parallel. Maker/rarity match. |
| 17 | Grandma’s Notch Carver / **KEEP** | [vcf_003](../../constants.ts#L137) (pool) | FILTER / Analog Granny Industries / COMMON | Passive notch filter for sculpting. Maker/rarity match. |
| 18 | Stasis Resonant Well / **REWORK** | [vcf_010](../../constants.ts#L144) (pool) | FILTER / Ancient Circuitry Guild / LEGENDARY | Self-oscillating infinity filter. Maker/rarity match. |
| 19 | Solar Crest Bandpass / **KEEP** | [vcf_006](../../constants.ts#L140) (pool) | FILTER / Luminous Forge / UNCOMMON | Resonant bandpass for vocal tones. Maker/rarity match. |
| 20 | Ruins Dual Ladder / **REWORK** | [vcf_009](../../constants.ts#L143) (pool) | FILTER / Starlit Machines / RARE | Stereo ladder filter. Maker/rarity match. |
| 21 | Grandpa’s Drift LFO / **KEEP** | [lfo_001](../../constants.ts#L147) (pool) | LFO / Analog Granny Industries / COMMON | Slow, unpredictable wandering voltage. Maker/rarity match. |
| 22 | Electric Meadow LFO / **DUPLICATE** | [lfo_002](../../constants.ts#L148) (pool) | LFO / Thunderclap Systems / COMMON | Self-generating nature modulation. Maker/rarity match. |
| 23 | Orbit Modulator / **KEEP** | [lfo_003](../../constants.ts#L149) (pool) | LFO / Starlit Machines / UNCOMMON | Planetary gravitational LFO. Maker/rarity match. |
| 24 | Ember Curve Shaper / **REWORK** | [lfo_007](../../constants.ts#L153) (pool) | LFO / Luminous Forge / RARE | Customizable modulation shapes. Maker/rarity match. |
| 25 | Fluctuation Engine / **REWORK** | [lfo_004](../../constants.ts#L150) (pool) | LFO / Vaporvale Laboratories / UNCOMMON | Random voltage source. Maker/rarity match. |
| 26 | Ancient Chaotic Map / **KEEP** | [lfo_008](../../constants.ts#L154) (pool) | LFO / Ancient Circuitry Guild / RARE | Deterministic chaos generator. Maker/rarity match. |
| 27 | Pulse Wander LFO / **DUPLICATE** | [lfo_005](../../constants.ts#L151) (pool) | LFO / Thunderclap Systems / UNCOMMON | Stepped random voltages. Maker/rarity match. |
| 28 | Solar Arc Envelope / **REWORK** | Absent | Unverified historical metadata | Recovery document only. |
| 29 | Binary Sync LFO / **KEEP** | [lfo_006](../../constants.ts#L152) (pool) | LFO / Starlit Machines / UNCOMMON | Tempo-synced digital LFO. Maker/rarity match. |
| 30 | Shattered Wave Modulator / **REWORK** | [lfo_009](../../constants.ts#L155) (pool) | LFO / Vaporvale Laboratories / LEGENDARY | Breaks LFOs into tiny shards. Maker/rarity match. |
| 31 | Ember ADSR / **KEEP** | [env_001](../../constants.ts#L158) (pool) | UTILITY / Luminous Forge / COMMON | Classic 4-stage envelope. Maker/rarity match. |
| 32 | Rustleaf Function Duo / **KEEP** | [env_004](../../constants.ts#L161) (pool) | UTILITY / Analog Granny Industries / UNCOMMON | Dual function generator. Maker/rarity match. |
| 33 | Thunderstrike ENV / **KEEP** | [env_002](../../constants.ts#L159) (pool) | UTILITY / Thunderclap Systems / COMMON | Fast attack percussion envelope. Maker/rarity match. |
| 34 | Scripted Response Generator / **REWORK** | [env_006](../../constants.ts#L163) (pool) | UTILITY / Ancient Circuitry Guild / RARE | Complex multistage envelope. Maker/rarity match. |
| 35 | Moonrise Decay Engine / **KEEP** | [env_005](../../constants.ts#L162) (pool) | UTILITY / Starlit Machines / UNCOMMON | Long, lunar decay times. Maker/rarity match. |
| 36 | Vaportrail Envelope / **REWORK** | [env_007](../../constants.ts#L164) (pool) | UTILITY / Vaporvale Laboratories / RARE | Envelope with reverb-like release. Maker/rarity match. |
| 37 | Elder Bark ADSR / **DUPLICATE** | [env_003](../../constants.ts#L160) (pool) | UTILITY / Analog Granny Industries / COMMON | Wooden, organic decay. Maker/rarity match. |
| 38 | Solar Bloom Generator / **REWORK** | [env_008](../../constants.ts#L165) (pool) | UTILITY / Luminous Forge / RARE | Expanding envelope curves. Maker/rarity match. |
| 39 | Quantum Peak Shaper / **REWORK** | [env_009](../../constants.ts#L166) (pool) | UTILITY / Starlit Machines / LEGENDARY | Probability-based envelopes. Maker/rarity match. |
| 40 | Relic Erosion Envelope / **REWORK** | [env_010](../../constants.ts#L167) (pool) | UTILITY / Ancient Circuitry Guild / LEGENDARY | Envelopes that degrade over time. Maker/rarity match. |
| 41 | Ghost Gate VCA / **KEEP** | [vca_001](../../constants.ts#L170) (pool) | VCA / Generic / COMMON | Basic VCA. Maker/rarity match. |
| 42 | Rusted VCA / **DUPLICATE** | [vca_005](../../constants.ts#L174) (pool) | VCA / Analog Granny Industries / UNCOMMON | Adds harmonic distortion. Maker/rarity match. |
| 43 | Thunderhold VCA / **REWORK** | [vca_002](../../constants.ts#L171) (pool) | VCA / Thunderclap Systems / COMMON | VCA with integrated drive. Maker/rarity match. |
| 44 | Solar Bloom VCA / **REWORK** | [vca_006](../../constants.ts#L175) (pool) | VCA / Luminous Forge / UNCOMMON | VCA with soft clipping. Maker/rarity match. |
| 45 | Flare Matrix VCA / **REWORK** | [vca_007](../../constants.ts#L176) (pool) | VCA / Vaporvale Laboratories / RARE | 4x4 Mixing VCA. Maker/rarity match. |
| 46 | Binary Clamp / **REWORK** | [vca_003](../../constants.ts#L172) (pool) | VCA / Starlit Machines / COMMON | Digital logic VCA. Maker/rarity match. |
| 47 | Relic Sustain Cell / **DUPLICATE** | [vca_008](../../constants.ts#L177) (pool) | VCA / Ancient Circuitry Guild / RARE | Infinite sustain VCA. Maker/rarity match. |
| 48 | Grandma’s Gatekeeper / **REWORK** | [vca_009](../../constants.ts#L178) (pool) | VCA / Analog Granny Industries / RARE | Opto-isolator VCA. Maker/rarity match. |
| 49 | Crystal Vein Amplifier / **REWORK** | [vca_010](../../constants.ts#L179) (pool) | VCA / Starlit Machines / RARE | Transparent digital gain. Maker/rarity match. |
| 50 | Echo-Leaf Attenuator / **REWORK** | [vca_004](../../constants.ts#L173) (pool) | VCA / Vaporvale Laboratories / COMMON | Passive attenuation. Maker/rarity match. |
| 51 | Dust Engine / **KEEP** | [noi_001](../../constants.ts#L182) (pool) | VCO / Ancient Circuitry Guild / COMMON | Digital dust noise. Maker/rarity match. |
| 52 | Quantum Sprinkle / **REWORK** | [noi_002](../../constants.ts#L183) (pool) | LFO / Vaporvale Laboratories / COMMON | Random granular triggers. Maker/rarity match. |
| 53 | Static Orchard / **KEEP** | [noi_003](../../constants.ts#L184) (pool) | VCO / Analog Granny Industries / UNCOMMON | Radio interference noise. Maker/rarity match. |
| 54 | Binary Snowfall / **KEEP** | [noi_004](../../constants.ts#L185) (pool) | VCO / Starlit Machines / UNCOMMON | Shift-register noise. Maker/rarity match. |
| 55 | Thundergrain Burst / **REWORK** | [noi_006](../../constants.ts#L187) (pool) | LFO / Thunderclap Systems / RARE | Burst generator. Maker/rarity match. |
| 56 | Relic Ash Generator / **REWORK** | [noi_007](../../constants.ts#L188) (pool) | VCO / Ancient Circuitry Guild / RARE | Lo-fi textural noise. Maker/rarity match. |
| 57 | Solar Wind Noise / **KEEP** | [noi_005](../../constants.ts#L186) (pool) | VCO / Luminous Forge / UNCOMMON | Filtered white noise. Maker/rarity match. |
| 58 | Fluctis Stream / **REWORK** | [noi_008](../../constants.ts#L189) (pool) | LFO / Vaporvale Laboratories / RARE | River-like random voltages. Maker/rarity match. |
| 59 | Cracked Tape Erosion / **DUPLICATE** | Absent | Unverified historical metadata | Recovery document only. |
| 60 | Chaotic Oracle / **KEEP** | [noi_009](../../constants.ts#L190) (pool) | LFO / Ancient Circuitry Guild / LEGENDARY | Predicts future random states. Maker/rarity match. |
| 61 | Glow Reverb / **KEEP** | [eff_001](../../constants.ts#L193) (pool) | EFFECT / Luminous Forge / COMMON | Simple plate reverb. Maker/rarity match. |
| 62 | Void Delay / **KEEP** | [eff_003](../../constants.ts#L195) (pool) | EFFECT / Starlit Machines / UNCOMMON | Dark digital delay. Maker/rarity match. |
| 63 | Cathedral BBD / **KEEP** | [b2_3](../../constants.ts#L271) (boss) | EFFECT / Boss Special / LEGENDARY | Infinite reverb tail. Maker/rarity conflict; see report. |
| 64 | Pebble Granulator / **KEEP** | [eff_008](../../constants.ts#L200) (pool) | EFFECT / Vaporvale Laboratories / RARE | Micro-sampling engine. Maker/rarity match. |
| 65 | Diffuse Echo / **REWORK** | [eff_004](../../constants.ts#L196) (pool) | EFFECT / Vaporvale Laboratories / UNCOMMON | Smeared tape delay. Maker/rarity match. |
| 66 | Biscuit Bitcrusher / **KEEP** | [eff_002](../../constants.ts#L194) (pool) | EFFECT / Analog Granny Industries / COMMON | Sample rate reducer. Maker/rarity match. |
| 67 | Echo of Ruins / **DUPLICATE** | [eff_009](../../constants.ts#L201) (pool) | EFFECT / Thunderclap Systems / RARE | Broken tape echo. Maker/rarity match. |
| 68 | Cloudform Diffuser / **REWORK** | [eff_005](../../constants.ts#L197) (pool) | EFFECT / Vaporvale Laboratories / UNCOMMON | Texture cloud generator. Maker/rarity match. |
| 69 | Resonant Shard Saturator / **KEEP** | [eff_010](../../constants.ts#L202) (pool) | EFFECT / Luminous Forge / RARE | Resonant distortion. Maker/rarity match. |
| 70 | Grainstorm Cascade / **REWORK** | [eff_013](../../constants.ts#L205) (pool) | EFFECT / Starlit Machines / LEGENDARY | Massive granular cloud. Maker/rarity match. |
| 71 | Elder Tape Ghost / **REWORK** | [eff_014](../../constants.ts#L206) (pool) | EFFECT / Analog Granny Industries / LEGENDARY | Haunted tape loop. Maker/rarity match. |
| 72 | Solar Prism Chorus / **KEEP** | [eff_006](../../constants.ts#L198) (pool) | EFFECT / Luminous Forge / UNCOMMON | Stereo widener. Maker/rarity match. |
| 73 | Thunderflare Overdrive / **KEEP** | [eff_007](../../constants.ts#L199) (pool) | EFFECT / Thunderclap Systems / UNCOMMON | Aggressive saturation. Maker/rarity match. |
| 74 | Spectral Grove Splitter / **REWORK** | [eff_011](../../constants.ts#L203) (pool) | EFFECT / Ancient Circuitry Guild / RARE | Spectral band processing. Maker/rarity match. |
| 75 | Void Bloom Reverb / **DUPLICATE** | [eff_012](../../constants.ts#L204) (pool) | EFFECT / Starlit Machines / RARE | Infinite space generator. Maker/rarity match. |
| 76 | Scribe Sequencer / **KEEP** | [seq_001](../../constants.ts#L209) (pool) | SEQ / Ancient Circuitry Guild / COMMON | Simple 8-step sequencer. Maker/rarity match. |
| 77 | Clockwork Stepper / **REWORK** | [seq_003](../../constants.ts#L211) (pool) | SEQ / Generic / UNCOMMON | Mechanical trigger sequencer. Maker/rarity conflict; see report. |
| 78 | Binary Stepper / **KEEP** | [seq_004](../../constants.ts#L212) (pool) | SEQ / Starlit Machines / UNCOMMON | Bit-flipping sequencer. Maker/rarity match. |
| 79 | Thunderclock Driver / **KEEP** | [seq_002](../../constants.ts#L210) (pool) | UTILITY / Thunderclap Systems / COMMON | Master clock source. Maker/rarity match. |
| 80 | Solar Path Sequencer / **REWORK** | [seq_006](../../constants.ts#L214) (pool) | SEQ / Luminous Forge / RARE | Light-guided sequencing. Maker/rarity match. |
| 81 | Driftline Euclid / **KEEP** | [seq_005](../../constants.ts#L213) (pool) | SEQ / Analog Granny Industries / UNCOMMON | Euclidean rhythm generator. Maker/rarity match. |
| 82 | Grainwheel Rotator / **REWORK** | [seq_007](../../constants.ts#L215) (pool) | SEQ / Vaporvale Laboratories / RARE | Granular position sequencer. Maker/rarity match. |
| 83 | Oracle Timeline / **REWORK** | [seq_009](../../constants.ts#L217) (pool) | SEQ / Ancient Circuitry Guild / LEGENDARY | Non-linear time sequencer. Maker/rarity match. |
| 84 | Rhythm Scratcher / **REWORK** | [b3_2](../../constants.ts#L283) (boss) | SEQ / Boss Special / LEGENDARY | Impossible polyrhythms. Maker/rarity conflict; see report. |
| 85 | Lunar Pulse Divider / **KEEP** | [seq_008](../../constants.ts#L216) (pool) | UTILITY / Starlit Machines / UNCOMMON | Clock divider/multiplier. Maker/rarity match. |
| 86 | Moonphase Mixer / **REWORK** | [util_002](../../constants.ts#L221) (pool) | UTILITY / Starlit Machines / COMMON | Stereo panning mixer. Maker/rarity match. |
| 87 | Needle Mixer / **KEEP** | [util_001](../../constants.ts#L220) (pool) | UTILITY / Generic / COMMON | 2-channel mixer. Maker/rarity match. |
| 88 | Logic Farmer / **KEEP** | [util_006](../../constants.ts#L225) (pool) | UTILITY / Generic / UNCOMMON | AND/OR/XOR logic gates. Maker/rarity match. |
| 89 | Stormlogic Gate / **REWORK** | [util_007](../../constants.ts#L226) (pool) | UTILITY / Thunderclap Systems / UNCOMMON | Probability logic. Maker/rarity match. |
| 90 | Relic Router / **KEEP** | [util_010](../../constants.ts#L229) (pool) | UTILITY / Ancient Circuitry Guild / RARE | Matrix signal router. Maker/rarity match. |
| 91 | Cloudform Mod Matrix / **KEEP** | [util_011](../../constants.ts#L230) (pool) | UTILITY / Vaporvale Laboratories / RARE | Floating modulation points. Maker/rarity match. |
| 92 | Grandma’s Patch Shelf / **KEEP** | [util_003](../../constants.ts#L222) (pool) | UTILITY / Analog Granny Industries / COMMON | Passive mult and attenuator. Maker/rarity match. |
| 93 | Solar Quad Attenuator / **REWORK** | [util_004](../../constants.ts#L223) (pool) | UTILITY / Luminous Forge / COMMON | Active attenuation. Maker/rarity match. |
| 94 | Thunderclap Mult / **KEEP** | [util_005](../../constants.ts#L224) (pool) | UTILITY / Thunderclap Systems / COMMON | Signal splitter. Maker/rarity match. |
| 95 | Crystal Linker / **REWORK** | [util_012](../../constants.ts#L231) (pool) | UTILITY / Starlit Machines / RARE | Optical signal distribution. Maker/rarity match. |
| 96 | Vapor Flux Switch / **KEEP** | [util_008](../../constants.ts#L227) (pool) | UTILITY / Vaporvale Laboratories / UNCOMMON | Sequential switch. Maker/rarity match. |
| 97 | Elder Chain Mixer / **REWORK** | [util_009](../../constants.ts#L228) (pool) | UTILITY / Analog Granny Industries / UNCOMMON | Daisy-chain mixer. Maker/rarity match. |
| 98 | Luminous Orbit Link / **REWORK** | [util_013](../../constants.ts#L232) (pool) | UTILITY / Luminous Forge / RARE | Rotating signal path. Maker/rarity match. |
| 99 | Rune Divider / **REWORK** | [util_014](../../constants.ts#L233) (pool) | UTILITY / Ancient Circuitry Guild / RARE | Divides voltage by runes. Maker/rarity match. |
| 100 | Sampo Module / **KEEP** | Absent | Unverified historical metadata | Recovery document only. |
