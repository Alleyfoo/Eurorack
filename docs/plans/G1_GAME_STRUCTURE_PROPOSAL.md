# G1 — Game Structure / Progression Prototype

**D1–D10 directions accepted; next scope a concrete G1-P task. No runtime work
requested by this document update.**
G1 is split into two stages. The worker must not silently decide the game because
systems happen to exist in the old shell.

- **G1-D — Game structure decision packet:** inspect the old shell, describe its
  complete current run, recommend KEEP / CUT / TRANSFORM for every major system
  with rationale, and give 2–3 concrete alternatives plus a recommendation for
  unresolved major choices. No runtime implementation or deletion.
- **G1-P — Progression prototype:** only after the user reviews and accepts the
  decisions, implement the smallest slice proving the chosen loop:
  start → acquire/discover → patch → consequence → progression → small completion.

The [G1-D decision packet](G1_D_DECISION_PACKET.md) is a review artifact.
Recommendations are not locked design. User acceptance must be recorded with
the chosen alternatives, changes and unresolved items before G1-P begins. The
directions are now accepted for the recorded scope; concrete content and the
implementation task remain to scope.

**Accepted so far:** D1-B, persistent studio with finite projects; D8-A for
G1-P, player chooses a result/version to keep and closes the project without
musical grading. Studio, owned modules, discoveries and archive persist; closure
does not reset the studio or destroy a patch. The overall studio ending is
deferred, and G1-P imposes none. Any later chapter/finale leaves the studio usable.
Concrete prototype choices remain to scope; design acceptance alone is not an
implementation request.

**D2-A accepted for G1-P:** one chosen source (tone or noise), Filter, LFO and
Output. This is starting material, not class/genre/difficulty/permanent branch;
the other source remains obtainable/auditionable very early. No startup
Purist/Glitcher/Weaver classes. **The starter kit teaches relationships, not a
canonical signal chain.** VCA/Delay remain possible early project offers, not
settled content.

**D6-A+B accepted for G1-P:** generous persistent storage and finite installed
working space. Project palettes constrain their response, not the entire studio;
owned modules stay accessible. No automatic eviction, forced selling, slot prices
or module destruction. **Rack space is a compositional constraint, not a progression
currency.** G1-P has a fixed modest capacity; expansion as a progression driver is
deferred, with no repeating +2-slot ladder. Exact capacity is prototype tuning:
starter system, auditioned module and potentially one additional relationship.
The existing 10/12/48 limits have no design authority. Later occasional expansion
needs playtest evidence of interesting additional simultaneous relationships.

**Also accepted:** D3-A for G1-P, temporary curated modules for unrestricted
audition and optional retention of a selected offer at closure, with no required
currency/rarity hierarchy/blind purchase; other acquisition channels remain open.
D4-A, closure opens specific opportunities/capabilities through structural
progression, without musical scoring; minimal transparent engagement requirements
may apply, while player-chosen closure stays authoritative. D5-B+A, situated
mechanical/material constraints or questions with an open sonic response and
free exploration outside projects. **Projects introduce possibility; they do
not confiscate the studio.** Concrete requirements/unlocks still need review.

**D9-A accepted for G1-P:** no destructive progression failure. Explicit project
conditions can leave an attempt incomplete; owned modules, saved patches,
discoveries, archive and studio remain safe. Silence, noise, instability, feedback,
low amplitude, unconventional routing and unwanted aesthetics are never failure.
Recovery is explicit: revise, retry, abandon, or return to free exploration.
D9-B remains a later optional situated-event pattern with the studio/history safe;
D9-C is incompatible with the chosen structure. **Projects may close doors; they
do not erase the player's work.** D7/D10 must resolve how temporary audition
modules return without ever silently breaking a preserved patch or archive item;
the requirement is locked and the accepted preservation model follows below.

**D7 accepted:** B long-term, A required in G1-P. Every closed project stores a
patch snapshot plus optional title/note. Optional audio comes later when reliable;
recording is never required for closure. **D10-A accepted:** separate versioned
new-studio save, leaving legacy save untouched; persist owned modules, current
studio patch, active project/loans, structural progression/unlocks and archived
snapshots. Loading never autostarts audio.

The preservation model is now accepted: **Studio** is what the player owns and
freely uses; **Project** is its own working branch that may contain loans;
**Archive** is the immutable record including borrowed dependencies even when
not retained as owned. **Archives preserve dependencies without granting ownership.**
On reopen/fork, unavailable dependencies are shown with reacquire/substitute/
retain-as-archive choices. **A missing dependency is a state to explain, never
a cable to silently delete.** Never remove the module/cables silently or grant
general studio use merely by archiving. No perfect replay, legacy migration or
long-term DSP compatibility required for G1-P. Exact schema/UI remain to scope.

Governing rule: **Audio fidelity is deferred; audio architecture is not.**
Reuse the working Studio engine and S1-A's authoritative visible graph. Crude
module behavior is acceptable; decorative cables or score-derived sound are not.
See [governing design](../design/GAME_DESIGN.md#development-priority--locked-design).

## Question to answer

What does the player actually do from starting a run to completing it, and why
do they want to continue? Define a coherent outer loop around
PATCH → LISTEN → CHANGE → DISCOVER → CAPTURE / PERFORM. Acquisition and progression
must open relationships rather than substitute shopping or numerical rewards
for exploration.

## Inspect the existing shell

Start with [Gameplay map](../project/GAMEPLAY_MAP.md),
[State model](../project/STATE_MODEL.md), [Known quirks](../project/KNOWN_QUIRKS.md)
and the RPG system assessment in [GAME_DESIGN](../design/GAME_DESIGN.md).
Verify relevant behavior against root `App.tsx`, `types.ts`, `constants.ts`,
`services/gameLogic.ts`, `services/storageService.ts` and the active views.
The S0 map describes a historical baseline; use current source for decisions.

The current shell has character starters, scavenging, jobs, shop purchases,
quests, city actions, studio upgrades, day/week progression, bosses and a victory
screen. Its score loop and ordered deck do not yet represent persistent audible
patches. S1-A supplies real routing but has no progression or patch persistence.
The pixel/ambient prototype supplies a visual direction, not integrated gameplay.

## Decisions and design artifacts

Produce a current-run walkthrough and a proposed future walkthrough, clearly
separated. Produce a system disposition table with a reason for every recommended
keep, cut or transform. Give alternatives for major open choices, including
whether the game should have runs at all. Do not treat the following questions
as already answered or turn a worker recommendation into implementation authority:

| Area | Decision G1-D must present for user review |
|---|---|
| Start | Starting rack/palette, character choice, first meaningful action and onboarding into listening. |
| Acquisition | How modules become available, how players choose them, where owned modules live, and whether shops/currency/scavenging earn their place. |
| Discovery/objectives | What counts as discovery, what prompts invite exploration, and how completion is legible without judging genre or rewarding amplitude/rarity. |
| Progression | What opens next, why it matters, what studio growth changes, and which relationships each unlock adds. |
| Time and resources | Whether days, weeks, AP, credits or reputation serve meaningful choices; patching/listening must remain accessible. |
| Events and encounters | What survives from quests, city activities, performances and bosses; distinguish useful situations from score checks. |
| Strange modules | Whether trash/curses become damaged, unusual or unpredictable behavior; noise and instability remain valid musical material. |
| Failure/non-failure | Stakes, recovery, abandonment and retries; distinguish failing a situated request from declaring a sound musically wrong. Prevent progression dead ends. |
| Capture | What the player keeps: recording, patch snapshot or another artifact; how it supports discovery and the run. Specify minimum needs before choosing storage/UI. |
| End state | What a completed run means, how the player recognizes it, and whether continued exploration or a new run follows. |
| Save/resume | What must persist across the run, how patch and progression state relate, and how existing saves are preserved or explicitly migrated. |

This table records the original G1-D review areas. D1–D10 now answer their
structural direction for G1-P; use the acceptance record rather than reopening
those choices or treating the table as permission to design replacements.

For each proposed system, name the player action, consequence, reason to repeat
it and interaction with the audible patch. Describe a concrete first session,
middle progression and late-game/completion path. Separate locked decisions,
illustrative content and questions that require playtesting.

## Small progression prototype

With the structural directions accepted, scope the smallest G1-P slice that can test
its transitions with existing crude audio. Prefer a small authored palette and
a few representative opportunities over a catalogue or a complex economy.
Specify the slice's starting state, acquisition/discovery step, unlock, capture
or performance role, recovery path, end condition and save/resume behavior.

Use the S1-A model/runtime boundary for audible relationships. Deck position,
scalar job scoring and old rarity values must not secretly govern the patch.
Preserve the legacy route/save until an explicit integration/migration design
replaces it. Record any required audio capability against a concrete gameplay
need; Clock/GATE is conditional, not the next milestone by default.

G1-D's deliverable is the decision packet, including a conditional prototype
outline. G1-P requires an explicit acceptance record and work authorization;
elapsed time or lack of objection is not acceptance. Rack polish, broad
content authoring, a complete end-to-end playthrough and fidelity follow in the
order recorded in the governing design.

## Review criteria

- A reader can walk from fresh start to completion and explain each transition.
- Every retained/transformed RPG system has a purpose in that walkthrough;
  every cut has a reason and an implementation/save impact recorded.
- Progression expands meaningful choices and does not require musical score,
  conventional topology, high amplitude or genre conformity.
- Capture, failure/recovery and continuation are explicit rather than inferred
  from the old victory screen or numerical jobs.
- The proposed slice can test the structure with current crude DSP; missing
  audio features are justified by gameplay needs.
- Remaining uncertainties have concrete playtest questions, including where
  choices may feel boring, confusing or pointless.
