# Project revival roadmap — from prototype rack to chill Eurorack adventure

2026-10-05; R3-A acceptance and R3-S implementation updated 2026-10-06.

This is the long-horizon execution map after recovering the old design bible,
the 100-module catalogue lineage, the new synthesis research and the implemented
G1-P Studio / Project / Archive slice.

It is intentionally longer than a single work order. Codex should use it to
understand **where the project is going**, while still doing bounded milestones
with evidence and commits. A later phase is not permission to skip the current
phase or invent unresolved design.

## Project direction

The project is a **low-pressure Eurorack adventure game**.

The rack is home. The world introduces people, places, odd machines, damaged
modules, requests and discoveries. The player follows threads because they are
curious, not because an inbox, deadline meter or meeting queue is shouting at them.

**The game waits for the player.**

Nothing important should demand attention while the player is patching and
listening. Opportunities may remain available indefinitely unless a later
explicitly-authored event has a clear reason not to.

The full-game starter experience must not be an impoverished sine-wave tutorial.
The player should begin from a **small but genuinely useful working modular system**,
expressed as a dismantlable preset graph: named module instances plus explicit
cables and control values. The current G1-P Tone/Noise + Filter + LFO and six-slot
limit are retained as prototype evidence, not future capacity authority.

## Authority stack

Read these in this order when planning work:

1. `docs/design/GAME_DESIGN.md` — current governing values and accepted structure.
2. `docs/plans/PROJECT_REVIVAL_ROADMAP.md` — production sequence and milestone boundaries.
3. `docs/content/MODULE_CATALOGUE_REHAB_V1.md` — recovered 100-module content audit.
4. `docs/archive/OLD_DESIGN_BIBLE_RECOVERY.md` — historical world/story identity and superseded mechanics.
5. `docs/project/G1_P_STUDIO_SLICE.md` — what the current persistent prototype actually does.
6. Current source — authority for implemented behavior.

Historical rarity, AP, jobs, weeks, deck values and bosses do not override the
current governing design.

## Execution rules for Codex

- Work **phase by phase**. Do not silently jump ahead because a later feature looks easy.
- At each milestone: read the named governing docs, state scope, implement only that
  scope, run relevant tests, inspect behavior, commit, and update `.handoff.md`.
- A phase can contain several commits. Prefer one logical milestone per commit.
- Do not turn two examples into a generalized framework unless the phase explicitly
  requires one.
- Do not reintroduce musical scoring, genre grading, amplitude grading, AP pressure,
  daily chores, weekly contamination, rarity power or boss-score ladders.
- Preserve `?mode=patch`, `?mode=studio` and the legacy default route until a
  milestone explicitly replaces or retires them.
- Reuse the existing Studio-owned AudioContext/master and visible cable authority.
  Audio fidelity may remain crude until the audio phase; decorative/fake routing may not.
- New module behavior must be expressed through stable behavior/capability IDs,
  ports and controls, not through module display names or old `ModuleType` score categories.
- Do not delete historical content merely because it is superseded. Move or label it
  when necessary so the archaeology remains readable.
- User-facing pressure is a design bug unless it is an explicitly situated optional event.

---

# R0 — Recover project identity and authority

**Status: documentation milestone.**

### Goal

Put the old project back into the current project's memory without restoring its
obsolete mechanics.

### Deliverables

- Record the recovered old design-bible authority map.
- Commit the 100-module rehabilitation audit.
- Update governing docs so G1-P's tiny starter and six-slot limit are clearly
  prototype-only, not full-game targets.
- Record the low-pressure adventure rule.
- Make this roadmap the next-work authority.

### Non-goals

No runtime changes, no new DSP, no catalogue migration in `constants.ts`, no
starter presets yet.

### Exit evidence

A new worker can explain:
- what is historical;
- what is currently implemented;
- what is still governing;
- why the old world/story is being recovered;
- why AP/week/job/boss pressure is not coming back.

---

# R1 — Rehabilitate the 100-module catalogue

**2026-10-06: R1/R1A accepted and closed after manager review.**
See the [acceptance record](R1_ACCEPTANCE_AMENDMENTS.md) and amended packet:
[source audit](../content/R1_CATALOGUE_SOURCE_AUDIT.md),
[role contracts](../content/R1_FUNCTIONAL_ROLE_REVIEW.md),
[behavior vocabulary](../design/MODULE_DEFINITION_DRAFT.md),
[coverage matrix](../content/R1_PATCH_FAMILY_COVERAGE.md).
All 100 current-source rows and 53 rework/donor proposals are reviewed. The user
corroborated the original bible/research's functional direction and added
percussion coverage. Exact historical metadata gaps remain annotated, not a
requirement for another broad research pass. The user reviewed the four amendments
and separately authorized the narrow R2 seam, now implemented and validated.

### Goal

Turn the old catalogue from 100 amusing card objects into 100 fictional modules
that collectively describe a credible modular instrument.

### R1-A — Review the functional map

Use `MODULE_CATALOGUE_REHAB_V1.md` as a proposal, not automatic implementation.

Review all:
- 47 KEEP entries;
- 45 REWORK entries;
- 8 DUPLICATE donor slots.

Resolve overlaps deliberately. In particular, distinguish:
- VCO vs resonator vs excitation source;
- filter vs wavefolder vs resonant feedback processor;
- envelope vs cycling function vs slew;
- LFO vs smooth random vs chaos vs S&H;
- VCA vs bipolar multiplier vs attenuation vs switching;
- audio mixer vs CV mixer vs matrix VCA;
- step sequencing vs trigger sequencing vs probability vs recurrence;
- granular processor vs microsound buffer vs tape loop vs sampler.

### R1-B — Define the module behavior vocabulary

Write a schema/design document before runtime work.

Target conceptual model:

```text
ModuleDefinition
  id
  display identity
  manufacturer
  behaviorId / capabilities
  ports[]
  controls[]
  tags[]
  historical metadata

ModuleInstance
  instanceId
  definitionId
  control values

PatchCable
  from instance/port
  to instance/port

Patch
  instances[]
  cables[]
```

A module may process AUDIO, CV, PITCH_CV, GATE/TRIG or CLOCK according to ports.
Do not force every module into one inheritance family.

### R1-C — Coverage matrix

For every research patch family, prove that the catalogue has the necessary
functional roles. At minimum cover:
- subtractive voice;
- pad / drone;
- pluck / LPG;
- noise texture;
- FM / PM;
- wavetable;
- granular;
- physical modelling;
- vocal/formant;
- evolving modulation network;
- generative sequence;
- structured multi-lane sequence;
- Krell/self-running patch;
- tape/microsound;
- sample kit.
- complex / percussive synthesis (added by the user's R1 review).

### Exit gate

Stop for design review once the catalogue roles and behavior vocabulary are
coherent. Do **not** implement 100 DSP modules in R1.
That review gate is met: direct mapped CV → pitch, the 16th percussion witness,
useful #94 pitch/clock distribution and narrowed R2 were explicitly accepted.

---

# R2 — Build the data-driven module foundation

**Accepted and closed by the user 2026-10-06**, after review of `421c575`,
`fd75c89` and `2f46380`. See
[R2 implementation evidence](../project/R2_DATA_DRIVEN_PATCH_SEAM.md). The scope
below supersedes broader suggestions in the conceptual schema. R2 does not start R3.

### Goal

Replace name/category-driven patch semantics with a reusable module-definition
layer while keeping existing routes working.

### Deliverables

- Add minimal `ModuleDefinition` / behavior / instance / port / control / patch
  types, stable IDs and version identity. Optional descriptive metadata is enough;
  no capability ontology or generic claim-validation engine.
- Add a direct registry/binding seam for exactly the existing S1-A behaviors:
  oscillator, noise, filter, VCA, LFO, delay and Output.
- Keep module identity separate from behavior: several fictional modules may
  later use related processors with different controls/character.
- Add validation for:
  - stable IDs;
  - valid port references;
  - signal-family compatibility;
  - serialization round trips;
  - duplicate instance IDs;
  - missing behavior definitions.
- Provide an adapter boundary so legacy `MASTER_POOL` does not suddenly become
  the new audio authority.
- Prove one explicit ordinary preset fixture round-trips and builds through the
  seam. Prove existing Studio/project/archive round trips preserve exact IDs,
  controls, cables and dependency provenance, with immutable originals and
  unchanged explicit loan/substitution handling. No starter-selection UI needed.
- Preserve S1-A numeric ranges, CV scaling (including LFO → pitch), audio cycle
  policy and Studio context/master lifecycle. Loading never starts sound.

### Non-goals

No full capability ontology, event algebra/scheduler, resource manifests/store,
100-module registry/validation universe, new DSP, stereo Output, broad catalogue
migration, new adventure UI or starter-selection/content suite. Minimal version
checks and existing archive preservation are required; future asset/buffer and
cross-definition compatibility machinery wait for the behavior that needs them.

Specifically exclude sequencer runtime, quantizer, S&H, envelopes, Clock/GATE
behavior, generalized causal-event networks, future feedback architectures,
sample/buffer resource services and broad asset manifest systems. No starter
presets or catalogue migration in R2. The single ordinary preset fixture above
uses only current behavior to verify the seam; starter content remains R3.

### Exit evidence

A patch can be described purely as module definitions/instances/cables and built
by the existing visible graph without display-name conditionals. An ordinary
preset fixture and existing archive/dependency flows preserve their exact data
through that seam. All three routes and save boundaries retain current behavior.

---

# R3 — Design starters, derive behavior, then make them executable

**Ordering amended by the user's R2 acceptance.** The seven current behaviors
can prove the seam but cannot determine the opening's full musical vocabulary.
R3-A passes in direction, and all four graphs are accepted as behavior targets.
The separately authorized R3-S substrate is now implemented; R3-B remains a
separate work order after its review.

### Goal

Make a new game begin with a real little instrument instead of isolated parts.

### Preset rule

**A starter preset is an example, not an answer.**

It is ordinary patch data:
- named module instances;
- initial control values;
- explicit cables;
- optional rack layout.

Every cable can be removed. Every module can be repatched. No topology bonus,
protected connection or hidden "correct" chain exists.

### R3-A — Starter-system design and capability requirements

Design **3–4 contrasting starter racks on paper/data** from the accepted catalogue
and 16 research families, without requiring the current engine to run them.
For each, supply owned module instances, explicit cable endpoints, initial
controls/settings, intended audible character, dismantling examples, missing
runtime behaviors and installed-position count. Derive the minimum shared behavior
set and useful capacity additions from those graphs.

[R3-A design packet](R3A_STARTER_SYSTEM_DESIGN.md) and its
[draft graph dataset](../content/R3A_STARTER_GRAPHS.json) propose:

- Slow Machine: beating sources, slow movement and visible echo return (7 + Output).
- Three Against Five: two independently articulated synthesized percussion paths
  on divided clocks (10 + Output).
- Crossed Embers: audio-rate FM/folding coupled through Delay (7 + Output).
- Wooden Weather: cycling functions, held control and noise excitation of a modal
  resonator (7 + Output).

Their union requires eight new processing functions and three bounded extensions,
not the full R5 list. Review the selection and requirements before implementation;
draft values and sound descriptions remain audition hypotheses. Design-only data
is explicitly ineligible for runtime loading and does not redefine R2 IDs.

### R3-S — Starter-required behavior substrate

**Explicitly authorized after R3-A review; technically accepted by the user.**
See [contracts, IDs, fixtures and evidence](../project/R3S_STARTER_SUBSTRATE.md).
Only selected modes are exposed through an opt-in native registry. The seven
R2 definitions and v1 save meanings remain intact. Rendered audition recordings
are available; human listening judgment is still outstanding. Continuous AUDIO/CV
routes use the existing ramp/fade; CLOCK/TRIG routes remain sample-exact. Review
timbre using normalized copies and relative levels using raw same-gain recordings.

Pull forward only the necessary subset of old R5 proven by selected graphs.
Implement in bounded bundles through the accepted definition/behavior seam;
prove explicit signal/event relationships, stop/cleanup and listening behavior.
Do not implement broad synthesis breadth, generic event/resource frameworks or
the 100-module catalogue because later phases mention them.

Preserve R2's sound and v1 save meanings. New modes require reviewed stable IDs
and typed state, with an explicit persistence boundary before new starter saves;
the frozen v1 adapter cannot represent them by substituting old kinds.

### R3-B — Executable starter racks

Only after required behaviors are implemented and validated, author selected
starters in the actual graph format and tune them by listening. Use the ordinary
visible graph with no protected cables or hidden sequence. Starter selection,
new persistence and any runtime capacity change need explicit scope in this order.

**Inventory fairness/convergence is a review gate, not R3-S work.** Three starters
have seven owned ordinary modules and Rhythm has ten. R3-B must decide how quickly
inventories converge or demonstrate that the count difference does not create a
permanent strategic class/progression advantage. No inventory changes are implied
by implementing their required behaviors.

Each must already produce a recognizably different, interesting result with one
deliberate Start gesture. None should require the player to earn basic articulation
or listen to a bare sine indefinitely.

### Rack-capacity test

Derive installed capacity from the starter systems and useful patch families.
Do not inherit six, ten, twelve, sixteen or any other historical number by fiat.

Test:
- largest starter rack;
- ability to add at least one newly discovered relationship;
- whether removing/replacing a module creates an interesting decision rather than
  simply blocking a viable patch.

R3-A's graphs use 7/10/7/7 ordinary positions plus Output. Its proposed experiment
compares 11 and 12 ordinary positions: the largest system plus an independent
pitch contour, and optionally a separate depth utility. This is a measured design
proposal, not a fixed number or a change to the current prototype.

### Exit evidence

R3-A: reviewable draft graphs answer which opening systems, minimum missing
behaviors and required room. Stop for selection/review before coding new behavior.

R3-B:
A fresh player can choose a starter, hear something meaningful immediately, then
dismantle it and understand that the game permits other relationships.

---

# R4 — Rack and player experience

### Goal

Turn the proven graph into a place the player wants to inhabit.

### Deliverables

- Rack presentation suitable for the chosen installed capacity.
- Clear storage vs installed-rack distinction.
- Module browser/inspector that exposes useful ports and controls without becoming
  a spreadsheet.
- Fast cable creation/removal, module swapping and patch comparison.
- Starter selection and reset-to-template as convenience, never as correctness.
- Responsive desktop/mobile layout.
- Preserve deliberate silence and stopped audio as normal states.
- Integrate the pixel-rack direction where useful.
- Integrate the cellular background only as a **read-only observer** of real patch/runtime
  activity. It never grades the music or controls progression.

### Playtest questions

Can the player spend twenty minutes changing one system without the UI nagging?
Can they understand cause/effect? Is module storage calm and legible rather than
inventory work?

---

# R5 — Expand crude behavior breadth

The starter-required subset may be pulled forward between R3-A and R3-B under
its own scoped authorization. The remaining list below is later breadth, not a
requirement to finish before starters and not implied by R3-A design authorization.

### Goal

Implement enough modular functions to make the starter racks and several research
architectures genuinely different **before** chasing high audio fidelity.

Prioritize behavior gaps that unlock relationships:

- envelope / AD / ADSR;
- cycling function + EOC;
- audio/CV mixer;
- attenuator / attenuverter / offset;
- clock, trigger and gate paths;
- S&H / smooth random;
- quantizer;
- slew;
- switching;
- second oscillator / audio-rate modulation;
- wavefolder;
- LPG / resonator if needed by starter/content tests.

Implement in small behavior bundles with listening evidence. Crude but truthful is
acceptable. Fake ports or score-only effects are not.

### Exit evidence

At least three master architectures work audibly:
1. source → processor → VCA;
2. exciter → resonator;
3. process controls process.

---

# R6 — Revive the adventure shell

### Goal

Bring back the old project's world as a **quiet place to explore**, not a schedule.

### World structure

Start small:
- Home / Studio;
- Workshop / module shop or maker space;
- City streets;
- second-hand market;
- repair/DIY location;
- one unusual/night location such as black market or ModCon.

The map can be compact and Helsinki-inspired. Locations are selected by the player.
Nothing advances merely because time passed while they were patching.

### Interaction principles

- No AP.
- No mandatory day/week loop.
- No replenishing chore list.
- No meeting/message queue demanding response.
- No punishment for ignoring an opportunity.
- A location may quietly gain a new person/object/event after progression.
- Optional situated one-shot events can exist later if clearly authored.

### Acquisition

Reintroduce buying, finding, borrowing, repairing and swapping only where each has
a distinct player experience. Do not rebuild the old economy automatically.

### Exit evidence

The player can leave the rack, discover one meaningful opportunity/module/story
thread, and return without feeling that the game became a task manager.

---

# R7 — Projects become adventures

### Goal

Connect the accepted Studio / Project / Archive structure to the revived world.

Projects should arise from:
- a person;
- a place;
- a strange machine;
- a found/damaged module;
- a performance invitation;
- a mystery tied to Grandfather's rack.

They should not arrive as a productivity inbox.

### Content target

Build a small authored set spanning different relationships, for example:
- memory/feedback;
- level/modulation depth;
- noise/excitation;
- timing without 4/4 assumptions;
- physical resonance;
- random/recurrence;
- sampling or tape memory.

Player-chosen closure and immutable archives remain authoritative.

### Exit evidence

Several adventures lead back to patching for different reasons, and progression
feels like the world becoming stranger rather than the player's workload increasing.

---

# R8 — First complete playable chapter

### Goal

Prove the actual game, not just its subsystems.

A fresh save should support:

```text
choose working starter rack
→ explore and repatch
→ encounter first world thread
→ audition/find/repair a new relationship
→ complete several finite adventures
→ preserve/archive meaningful patches
→ reveal a stronger Grandfather/reality thread
→ reach a deliberate chapter closing point
→ continue using the Studio afterward
```

### Required playtest

Human playthrough from fresh save to chapter close. Record:
- boring stretches;
- confusing transitions;
- pressure/nagging;
- modules nobody wants to use;
- starter racks that collapse into the same sound;
- archive features that are useful vs administrative;
- whether the world actually makes the rack more desirable to return to.

Do not solve these with additional currencies or notifications by default.

---

# R9 — Serious audio pass

Only after the game works end-to-end.

Improve:
- oscillator character and modulation;
- audio-rate FM/PM;
- filters and resonance;
- envelopes and VCAs;
- wavefolding/nonlinear processors;
- delay/BBD/feedback behavior;
- resonators/physical modelling;
- granular/tape/sampling;
- clock/event precision;
- aliasing and overload behavior;
- output safety and browser stability;
- optional recording/capture fidelity.

Preserve deterministic/state boundaries where the game depends on them, but do not
turn the project into an electrical-engineering simulator.

---

# R10 — Catalogue completion, art and later mythology

### Goal

Expand breadth after the core game proves itself.

- Gradually realize more of the rehabilitated 100-module catalogue.
- Give repeated functional families meaningful architectural differences rather
  than rarity-only reskins.
- Add manufacturer identity, module art and descriptions.
- Expand city locations and authored adventures.
- Add later story escalation only when the main chapter works.
- Kalevala / Aino / Sampo belongs here unless an earlier story test demonstrates
  a compelling reason to seed it quietly.

The Sampo remains a special mythic capstone idea. Do not reduce it to “Utility +8”.

---

# Immediate next work order

R1/R1A and R2 are accepted and closed. R3-A passes in direction, retaining all four
systems. The separately authorized [R3-S substrate](../project/R3S_STARTER_SUBSTRATE.md)
is technically accepted with native audition fixtures and rendered evidence.
Complete actual listening before tuning initial values, then design persistence
and starter inventory convergence rules before any R3-B order. Crossed Embers
must not be softened solely because of aggressive numerical levels.
**Stop before R3-B gameplay, save migration, inventory or capacity changes.**
Capacity (11/12), starter inventory fairness/convergence and persistence remain
explicit decisions for that future scope. Broader old R5 remains later work.
Exact catalogue-history annotations remain follow-up evidence, without requiring
broad research or future-phase infrastructure to use the seven working behaviors.
