# Project revival roadmap — from prototype rack to chill Eurorack adventure

2026-10-05.

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

### Exit gate

Stop for design review once the catalogue roles and behavior vocabulary are
coherent. Do **not** implement 100 DSP modules in R1.

---

# R2 — Build the data-driven module foundation

### Goal

Replace name/category-driven patch semantics with a reusable module-definition
layer while keeping existing routes working.

### Deliverables

- Add the canonical `ModuleDefinition` / port / control / capability types.
- Add a registry for reusable runtime behaviors.
- Represent the existing S1-A behaviors through the new registry first:
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

### Non-goals

No broad catalogue DSP implementation. No new adventure UI. No starter selection
until patch serialization is stable.

### Exit evidence

A patch can be described purely as module definitions/instances/cables and built
by the existing visible graph without display-name conditionals.

---

# R3 — Starter racks and preset graphs

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

### Content target

Author **3–4 contrasting starter racks** from the accepted catalogue. Candidate
families to test, not locked names:

- evolving / drone;
- rhythmic / event-driven;
- unstable / cross-mod / feedback;
- optionally a sampled/noise-oriented system if the implemented behavior set supports it.

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

### Exit evidence

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

After R0 documentation is committed, Codex should start **R1 only**:

1. Verify the 100-row rehabilitation table against current `constants.ts` and
   recovered historical evidence.
2. Produce a contradiction report for names, manufacturers, missing entries and
   duplicate identities.
3. Review the 45 REWORK proposals and eight donor slots for functional overlap.
4. Draft the canonical module-definition / port / control vocabulary.
5. Produce the research-family coverage matrix.
6. Stop for review before runtime/catalogue migration.

This is intentionally enough work for a substantial Codex session without giving
it permission to redesign the game or implement a hundred synthesizers.
