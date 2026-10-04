# G1 — Game Structure / Progression Prototype

**NEXT: G1-D — design archaeology and decision packet only. No code.**
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
the chosen alternatives, changes and unresolved items before G1-P begins.

**Accepted so far:** D1-B, persistent studio with finite projects; D8-A for
G1-P, player chooses a result/version to keep and closes the project without
musical grading. Studio, owned modules, discoveries and archive persist; closure
does not reset the studio or destroy a patch. The overall studio ending is
deferred, and G1-P imposes none. Any later chapter/finale leaves the studio usable.
Other choices remain pending; this partial acceptance does not authorize G1-P.

**Also accepted:** D3-A for G1-P, temporary curated modules for unrestricted
audition and optional retention of a selected offer at closure, with no required
currency/rarity hierarchy/blind purchase; other acquisition channels remain open.
D4-A, closure opens specific opportunities/capabilities through structural
progression, without musical scoring; minimal transparent engagement requirements
may apply, while player-chosen closure stays authoritative. D5-B+A, situated
mechanical/material constraints or questions with an open sonic response and
free exploration outside projects. **Projects introduce possibility; they do
not confiscate the studio.** Concrete requirements/unlocks still need review.

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

For each proposed system, name the player action, consequence, reason to repeat
it and interaction with the audible patch. Describe a concrete first session,
middle progression and late-game/completion path. Separate locked decisions,
illustrative content and questions that require playtesting.

## Small progression prototype

Only after the user accepts the structure, G1-P scopes the smallest playable slice that can test
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
