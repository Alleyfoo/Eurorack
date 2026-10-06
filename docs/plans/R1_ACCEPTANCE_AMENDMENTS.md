# R1 acceptance in direction — four amendments

2026-10-05, following the user's review of `12ee1c2` and `fa04fc0`.

**R1/R1A accepted and closed, with the four amendments below.** The documentation
pass recorded them and required separate R2 authorization.
**Subsequent decision, 2026-10-06:** the user reviewed `2150464` and `7d84109`,
accepted R1A, closed R1 and explicitly authorized only the narrow R2 seam.
[R2 is now implemented and validated](../project/R2_DATA_DRIVEN_PATCH_SEAM.md).
The gate statements below record the earlier review state; R3 remains unstarted.
The user accepts the separation of historical identity, proposed function and
implemented behavior, the module/behavior/instance model, versioning/archive
preservation and the functional distinctions in the role review. Exact future
panel counts, control ranges and DSP are not thereby finalized.

## Source corroboration supplied by the user

The user reports that the recovered consolidated Design Bible explicitly supports
real module functions, inputs/outputs and balanced rack recipes; the former port
experiment was parked, not rejected. The user also corroborates the synthesis
research (`deep-research-report (34)`) signal/control-network vocabulary and the
three architectures:
source → processor → VCA, exciter → resonator, and process controls process.
The research distinguishes synthesized percussion from LPG plucks, physical
modelling and sample kits.

This is **user-supplied source corroboration**, not an agent claim to have opened
the original documents. It closes the general direction/vocabulary evidence gap.
Exact historical metadata for missing/conflicting rows remains annotated in the
[source audit](../content/R1_CATALOGUE_SOURCE_AUDIT.md). Those catalogue-history
annotations do not require another broad research pass before a separately
authorized seven-behavior R2 seam.

## Amendments recorded

1. **Permissive CV-to-pitch.** PITCH_CV retains calibrated octave semantics for
   sequences and precision arithmetic, within the continuous CV family. Generic
   CV connects directly to a pitch inlet using its declared depth/transfer law.
   LFO → pitch needs no quantizer or converter module. Precision and unit metadata
   explain the effect; they do not impose a separate class of cable.
2. **Sixteenth coverage family.** Add complex/percussive synthesis with a pitched
   body and noise/transient elements, independent decay, pitch envelope and an
   optional inharmonic/resonant path. LPG pluck and sample kit remain separate.
3. **Thunderclap Mult #94.** Revise the recommended function to a precision
   pitch/clock distribution bank: four paired lanes with independently chosen
   pitch transposition and integer clock division, plus lane enable/reset.
   Pitch-only and clock-only use are valid. Unity duplication is still freely
   available from any output. Buffering by itself has no added gameplay value in
   an ideal digital patch; the lane relationships justify occupying rack space.
   This is an explicit functional amendment to a historical KEEP row, preserving
   the archaeology count. #95 adds incoming pitches; #98 sets a single operating
   point; #85 changes one clock stream's ratio. #94 pairs several pitch/time
   relationships for simultaneous voices. It adds neither quality bonuses nor
   required cable hardware, and is outside R2 implementation.
4. **Small R2 seam.** Only oscillator, noise, filter, VCA, LFO, Delay and Output
   pass through stable definitions, behavior bindings, instances, ports/controls
   and patch data. Preserve current signal scaling and lifecycle. Prove one
   ordinary explicit preset graph can round-trip through that seam and that
   existing Studio/Project/Archive snapshots retain IDs, controls, cables and
   dependency provenance. A test fixture is sufficient; no starter-selection UI
   or full starter content. Keep minimal version checks and the existing explicit
   dependency resolver. No capability ontology, event algebra/scheduler, resource
   manifest/store or 100-module registration/validation project in R2.

The [module draft](../design/MODULE_DEFINITION_DRAFT.md) separates its conceptual
future vocabulary from the narrow R2 implementation checklist. The
[role review](../content/R1_FUNCTIONAL_ROLE_REVIEW.md) and
[16-family matrix](../content/R1_PATCH_FAMILY_COVERAGE.md) contain the amended
contracts/witnesses; the [roadmap](PROJECT_REVIVAL_ROADMAP.md) governs phase order.

## Gate after this correction pass

Review these amendments, then explicitly authorize the narrowed R2 slice when
ready. Further catalogue archaeology can stay as documented follow-up evidence;
it must not grow into an indefinite prerequisite for adapting seven working
behaviors. No runtime implementation is part of this correction pass.

## R1A work-order completion — 2026-10-06

The R1A work order was checked against the existing amendments in `ad62616`.
All four were already present. This completion pass makes two points explicit:
directly accepting generic CV never certifies its source as calibrated PITCH_CV;
and R2 excludes sequencer runtime, quantizer, S&H, envelopes, Clock/GATE, causal
event networks, future feedback architectures, sample/buffer resource services,
broad asset manifests, starter presets and catalogue migration. The ordinary
seven-behavior preset remains a test fixture, not starter content.

Validation passed: all 100 catalogue identities match the audit and role tables
exactly, with the historical 47 KEEP / 45 REWORK / 8 DUPLICATE decisions unchanged;
the matrix contains 16 distinct families; the independent percussion witness and
#94 transpose/divide bank remain explicit; CV/pitch and R2-boundary assertions
pass; 155 local links resolve; ten packet/navigation files decode as strict UTF-8;
and `git diff --check` passes. Manual wording review found no remaining generic-CV
pitch prohibition or broader R2 authorization. Runtime and protected CI files are
untouched, so no runtime build/test is required by this work order.

No design contradiction currently blocks the small R2 seam. Exact historical
metadata and future panel/DSP details remain annotated follow-up work. R1A's
documentation deliverable is complete; manager review and explicit R2
authorization remain pending. Stop here.

## Manager acceptance and R2 authorization — 2026-10-06

The user independently corroborated the original bible/research direction,
accepted all four amendments including #94's paired pitch/time reinterpretation,
and stated: **R1A passes; R1 is closed; R2 is explicitly authorized.**
The authorization covers only architectural replacement beneath the existing
seven behaviors, stable identities/bindings, preservation of current sound,
v1 saves and lifecycle, preset/archive fixtures and validation. It excludes new
DSP, behaviors, content and future event/resource/capability machinery.

R2 is implemented in `421c575`; its runtime and preservation evidence are recorded
in the implementation document above. Stop after R2 validation, before R3.
