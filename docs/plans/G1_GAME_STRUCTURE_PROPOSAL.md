# G1 — Game Structure / Progression Prototype

**NEXT MILESTONE.** This proposal records the user's revised project sequence.
It scopes inspection and design before implementation; it does not claim that
the run structure is settled or authorize deleting the current game wholesale.

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

Produce a run walkthrough and a system disposition table with a reason for
every keep, cut or transform decision. Do not treat the following questions as
already answered:

| Area | Decision G1 must make |
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

After the structure is decided, scope the smallest playable slice that can test
its transitions with existing crude audio. Prefer a small authored palette and
a few representative opportunities over a catalogue or a complex economy.
Specify the slice's starting state, acquisition/discovery step, unlock, capture
or performance role, recovery path, end condition and save/resume behavior.

Use the S1-A model/runtime boundary for audible relationships. Deck position,
scalar job scoring and old rarity values must not secretly govern the patch.
Preserve the legacy route/save until an explicit integration/migration design
replaces it. Record any required audio capability against a concrete gameplay
need; Clock/GATE is conditional, not the next milestone by default.

G1's first deliverable is the full-run design and scoped prototype plan. This
documentation update does not implement that prototype. Rack polish, broad
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
