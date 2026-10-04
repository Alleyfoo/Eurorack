# G1-D — Game structure decision packet

2026-10-04. Inspected current source at `adf6ab9`.
**FOR REVIEW — no new game-structure decisions are accepted here. No implementation.**

This packet distinguishes source-confirmed behavior from recommendations.
KEEP / CUT / TRANSFORM below are proposed dispositions for the future game,
not instructions to delete or rewrite the existing shell. The governing musical
values and real cable authority remain locked. The shape of the game does not.

## 1. The complete current run

This is a source walkthrough, not a claim that the entire boss chain was
successfully playtested. Earlier browser checks covered tutorial, rack, jobs and
save reload. The boss retry and performance timing defects below remain relevant.

| Stage | What the player does | What actually changes / evidence |
|---|---|---|
| Fresh start | Dismiss story; choose Purist, Glitcher or Weaver. | Starts with 50 credits, 3 AP, day/week 1, reputation 0, capacity 10 and 48 blanks. Character choice supplies a pending starter pool; no ongoing class modifier. `App` initializer, `handleCharacterSelect`; `constants.ts:CHARACTERS`. |
| Starter reveal | Scavenge four times at no AP cost, then Inspect Rack. | First three reveals add one module each; fourth adds all remaining starters. Purist/Glitcher have seven modules, Weaver six. Tutorial reaches step 5 on rack entry. `handleTutorialScavenge`, Inspect Rack handler. |
| Listen/build | Swap rack slots, shuffle, inspect/calibrate modules, change global controls. | Ordered deck is both collection and three 16-step positional audio rows. Rack jacks have no cable handlers. Most stored calibration settings do not affect DSP; moving a module can change its sound role. `RackView`, `handleReorderModule`, `syncLivingRack`. |
| Earn through jobs | Spend 1 AP; draw up to three modules; connect local cables, optionally reroll for 5 credits, then POWER ON. | Scalar score target is `floor(4 + (week - 1) * 1.5)`. Success pays score × 10 credits and +1 reputation; failure pays nothing. `JobView`, `drawCards`, `calculatePatchSynergy`, `handleJobComplete`. |
| Acquire/manage | Buy from six-item shop, sell at half cost, or scavenge city for 1 AP. | Acquisitions fill first blank and are limited by active capacity; no separate inventory. Scrap is a weighted pool. Ordinary sleep does not refresh a nonempty shop; reload or nonfinal boss win does. `handleBuy`, `handleSell`, `handleScavenge`, `generateShopInventory`. |
| Side activities | Do EARN/REPAIR/SALVAGE/PURIFY quests, pay temple fees, or bet credits in club. | Performance matches drifting knob targets and grades stability. Repair randomly replaces trash with a common module; salvage pays 10; purify removes curse. Club wins/loses stake at about 50%. No patch-discovery recognition. `generateDailyQuests`, `PerformanceView`, quest/city handlers. |
| Studio growth | Spend reputation on compressor, cables or rack space. | Compressor boosts master gain; cables boost scalar cable score; rack space adds two active slots. No new signal relationship is guaranteed. `STUDIO_UPGRADES`, `handleBuyUpgrade`. |
| Advance time | Sleep after spending AP, or sleep immediately. | Ordinary sleep increments day, restores AP and regenerates quests. No rent/upkeep. On days divisible by seven, sleep instead opens a boss after a delay. `endDay`. |
| Weekly gate | Win 3/4/5/7 rounds against the four successive bosses, with three local lives. | Each round reuses JobView with week 1, target 4 and cable level 0. Boss deckPool does not participate. A failed round loses a life but does not reset the completed hand, obstructing normal retry. `BossView`. |
| Weekly consequence | Win a nonfinal boss or lose a battle. | Win grants 200 × week credits, advances day/week, restores AP, inserts two trash and one curse if blanks exist, and refreshes shop. Bloat can exceed capacity. Defeat halves credits and restores AP without advancing time. `handleBossEnd`. |
| Current completion | Defeat Voltage Tyrant, the fourth boss. | VICTORY screen appears; final victory skips ordinary grant/bloat updates. Nominal first completion is day 28/week 4 if prior weekly gates succeed. It recognizes score wins, not a recorded work or patch behavior. |
| Continue/reset | Choose NEW GAME+ or reset from Settings. | Continue increments day/week, preserves collection/currencies and cycles boss selection; it is not a fresh run. Reset clears the save and reloads. Victory/view is not a saved field. VictoryView callback, `handleResetGame`, `PlayerState`. |

There is no global game-over from insolvency, silence or lack of AP. Sleep
restores energy; however, boss defeat repeats the same weekly gate, and an
unusable collection may leave it difficult to pass. This is not evidence of a
designed recovery loop. Performance's nominal 20-second countdown can stall
because its interval restarts when stability changes.

Jobs' cables control scalar scoring, not the sound being judged. Source modules
score without a final output route, presence grants topology bonuses, and the
curse sign inversion can reward a supposedly harmful item. This makes the old
economy a poor measure of whether the player discovered anything musically.

### What has changed since S0

`index.tsx` selects a separate S1-A screen at `?mode=patch`. Its six archetypes
plus Output have real AUDIO/CV routes using the Studio-owned engine. It starts
with all six available and no cables; adding/removing modules has no acquisition
cost. It has no progression, save, capture UI or completion. Reload loses the
session patch. It proves cable authority, not the future game loop.

Legacy recording downloads the limited master stream as WebM; it does not store
a patch snapshot or contribute to victory. Legacy localStorage stores PlayerState
under `eurorack_inc_save_v1`; incomplete effect dependencies mean some resource
changes are only saved after another triggering change. Neither legacy save nor
the visual pixel/ambient prototype contains an integrated persistent patch game.

## 2. Proposed disposition of every major system

These recommendations assume the persistent-studio/project option in D1. Choosing
finite runs would change several dispositions, especially resources and loss.
KEEP preserves a useful role, not every current handler or presentation.

| Existing system | Proposal | Player action and reason / implementation or save impact if accepted |
|---|---|---|
| Patch/listen/edit and Studio engine | KEEP | Explore audible consequences; real routing and shared output ownership survive. New progression must use S1-A's seam. |
| Story/world framing | TRANSFORM | Give a reason to begin and return without imposing an unapproved conquest plot. Rewrite framing after D1/D8; existing intro flag is not a project model. |
| Characters/starter pools | TRANSFORM | Choose a starting problem/palette rather than a genre or difficulty identity. Replace nominal DSP claims with available behaviors; old characterId remains legacy data. |
| Four-click scavenging tutorial | TRANSFORM | Teach one audible edit and its reversal, then invite an experiment. Preserve approachable reveal pacing if useful; tutorial steps must follow actual actions. |
| Ordered deck/random job hand/shuffle | TRANSFORM | Separate owned modules from installed rack and persistent cables. Player chooses a working system; random constraints can be optional content. Do not reinterpret old slot order as topology. |
| Module catalogue/names/manufacturers | TRANSFORM | Choose modules for new relationships. Keep useful fiction selectively; behavior IDs replace value/name-driven authority. No promise to implement every catalogue entry. |
| Rarity/value ladder | CUT | No global better-sound tier or purchase power masquerading as discovery. Describe unusual availability/behavior directly if useful; old rarity/value stays in legacy saves. |
| AP/max AP | CUT | Keep listening and editing freely available. Any later expedition stakes need a separate purpose; no energy meter copied into the new loop. |
| Credits | CUT from first prototype | Test module choice without grind first. D3 offers a one-currency alternative if scarcity itself proves fun. Legacy credits are not silently converted. |
| Reputation | CUT as numeric currency | Replace grade-derived status with specific unlocked opportunities only if D4 supports them. No second reward meter by default. |
| Daily clock/sleep/week gates | CUT as mandatory schedule | Let the player close a project deliberately. Time can be a situated request constraint later; no automatic weekly boss ladder. |
| Jobs/scalar score/reroll | TRANSFORM | Requests invite work on the actual persistent patch. Remove generic voltage, cable and topology rewards; D4/D5 settle consequence and recognition. |
| Shop | TRANSFORM | Audition and choose a useful relationship from a small offer; loans/swaps may provide scarcity without currency. Current stock/reload randomness is not a design requirement. |
| City/scrapyard | TRANSFORM | Optional sources of specific modules, stories or constraints. No separate city UI required in G1-P; keep acquisition choices near the rack. |
| Club gambling | CUT | Credit coin-flip adds risk unrelated to patch behavior. No dependency requires retaining it. |
| Daily quest list | TRANSFORM | A few authored opportunities/personal experiments, not replenishing chores. Completion tracks the selected opportunity, not the old daily queue. |
| Knob-matching performance grades | TRANSFORM | Perform or present a chosen system with an optional situated constraint. S/A/B/C/F target chasing does not survive as musical judgment. |
| Trash/repair/salvage | TRANSFORM | Optional unusual/damaged behavior with a tradeoff the player can hear; repair is a choice, not mandatory purification of noise. Defer extra DSP/content until useful. |
| Curses/purification/weekly bloat | CUT as imposed punishment | Consider strange behavior as optional future content; do not auto-contaminate collections or penalize musical instability. No silent replacement of curse save data. |
| Bosses/lives | CUT as score ladder | Names/encounter fiction could later become optional requests. No enemy patch simulation or combat system implied by this packet. |
| Rack capacity/studio expansion | TRANSFORM | Installed space creates a legible compositional choice; storage prevents forced destruction of discoveries. Expand practical possibilities, not score/gain. D6 sets the actual constraint. |
| Compressor/cable upgrades | CUT as progression boosts | Output safety and cables are basic infrastructure. Any future timbral processor is an explicit audible module, not +gain/+score purchased from reputation. |
| Recording | TRANSFORM | Keep a result the player wants to revisit; pair with a patch snapshot if D7 accepts it. Shared output path is reusable; recorder export/UI needs validation. |
| Victory/New Game+ | TRANSFORM | Close a project or run according to D1/D8, retain appropriate artifacts, permit continued exploration. Define an actual saved completion state. |
| Save/reset | KEEP purpose, TRANSFORM model | Resume the chosen patch and progress. Separate versioned new state from legacy data; explicit migration/import only after a design decision. |
| Rack, inspector, controls, scope, mute | KEEP purpose, TRANSFORM integration | Let the player identify, influence and compare behavior. Use truthful controls and live observations. Pixel movement, accessibility and responsive polish belong to the rack stage. |
| Pixel/cellular background | KEEP visual direction | Make the studio feel alive. Integration observes real patch/runtime behavior; it must not grade genre, noise or stability. No gameplay unlock depends on a decorative mood. |

## 3. Major decisions for us to review

All options below are OPEN. Recommendations form one coherent candidate, not a
set of accepted requirements. No counts, timers, currency amounts or unlock tree
are locked by these examples.

### D1. Is this a run, or a studio that grows?

- **A — Finite runs:** start with a constrained rack, encounter a sequence of
  acquisition situations, finish a chosen brief, then restart with a new system.
  Strong arc and replay constraints; risks making long-lived patches disposable.
- **B — Persistent studio, finite projects:** collection and discoveries persist;
  each project supplies a beginning, situation and deliberate closing point.
  Supports attachment and return visits; needs projects that feel distinct.
- **C — Open studio:** growth and a personal archive, with no authored end state.
  Maximizes autonomy; risks being a synth sandbox with acquisition chores.

**Recommend B.** It offers things that can finish without requiring the instrument
or player's practice to end. A genuinely good finite-run design is still possible;
choose A if changing limited systems and restarting is the main attraction.

### D2. What does the first rack give the player?

- **A — One small common kit:** source choice (tone or noise), filter and LFO,
  plus Output; a new relationship arrives soon. Clear teaching, less starter variety.
- **B — Choose contrasting kits:** for example a source/filter/modulation system
  versus a source/delay system. Different first questions; more onboarding/content.
- **C — All S1-A modules available:** easy experimentation and no onboarding lock;
  acquisition needs a purpose beyond unlocking the existing palette.

**Recommend A for the first prototype, B only if starter choice becomes central.**
Tone and noise are equally valid starting material. Output safety, mute and useful
listening controls are available immediately. No clock or envelope is required.

### D3. Why does the player want another module, and how do they obtain it?

- **A — Curated loan/choice:** a situation offers alternatives to audition; choose
  one to keep after engaging with the project. Desire comes from a relationship
  the current patch cannot produce, not a price/rarity number.
- **B — One currency and small shop:** requests pay a single resource; save for
  a wanted behavior. Creates tradeoffs, but can turn requests into grind.
- **C — Scavenge and repair:** uncertain finds and understandable defects create
  attachment. Requires genuine damaged behaviors and stronger recovery design.

**Recommend A.** It tests whether an extra relationship is desirable before
building an economy. A VCA can let an LFO move level while filter movement remains
different; a delay can add memory/feedback. Those are examples of capability,
not a required purchase path. Let the player defer an offer and keep exploring.

### D4. What progresses, and what triggers progression?

- **A — Complete an opportunity:** take a concrete offered experiment, work on
  the patch and explicitly close it; unlock a specific next opportunity/choice.
  Transparent, minimal grading, but closure may become checkbox clicking.
- **B — Register discoveries:** recognise declared relationships/actions such as
  comparing a route with it removed. Can make cause/effect legible; can also make
  players perform a prescribed checklist for rewards.
- **C — Commit scarce choices:** acquisition itself changes what future situations
  are available. Progress comes from studio configuration, not task completion;
  risks hiding unlock consequences and making experimentation costly.

**Recommend A, with a readable record of what opened and why.** The player may
describe a discovery; the game does not certify its musical merit. Do not add a
hidden analyser judge. If closure is player-declared, say so honestly and accept
that it can be rushed. If we want mechanically verified conditions instead, we
must choose and review them explicitly before G1-P.

### D5. What makes an objective or request meaningful?

- **A — Open invitation:** “Find a change you want to return to.” Player chooses
  the response, including silence; meaning rests on curiosity and keeping work.
- **B — Situated constraint:** a request supplies a limited palette or an explicit
  action/relationship to explore. The constraint can be checked without judging
  genre; needs a free exploration route for players who dislike it.
- **C — Personal project:** player names an intention and decides when it is done.
  Strong ownership, weak guidance for a newcomer who does not yet know what to ask.

**Recommend a small B invitation with A freedom in how it sounds.** For example,
compare how one CV source changes pitch versus cutoff, then keep whichever result
interests you. This is a possible authored situation, not a locked detector or
required topology. The game can describe an offered constraint without claiming
the resulting music is correct. D4 decides whether it is checked or self-declared.

### D6. What is scarce, and what does studio growth change?

- **A — Installed space, separate storage:** choose a small working set; park
  owned modules and preserve patch snapshots. Expansion allows more relationships.
- **B — Per-project palette:** studio storage is generous; projects lend a limited
  set. Growth opens different situations rather than more rack capacity.
- **C — No space limit:** growth consists only of new behavior and archive tools.
  Freer exploration; acquisition choices may feel less consequential.

**Recommend B for the first prototype; review A for the larger game.** It creates
a clear constraint without inventing slot prices or forcing collection cleanup.
Existing 48 slots, capacity 10 and S1-A's twelve-module limit are implementation
facts, not proposed progression rules. Store owned/offered/installed distinctions
only as far as the accepted model needs them.

### D7. What does the player capture?

- **A — Patch snapshot and short note:** keeps modules, controls and routes for
  revisiting; cheap to test, but cannot promise the exact same evolving sound.
- **B — Snapshot plus optional audio:** retains the system and a moment it made.
  Better fit for ephemeral feedback/noise; requires recording/export checks.
- **C — Audio only:** keeps the result without managing patch versions, but loses
  the relationship the player learned and cannot restore the instrument.

**Recommend B as the direction, A as G1-P's minimum if we accept that limit.**
Sound is not deterministic replay; snapshots and recordings serve different
purposes. Never require high fidelity or audible loudness to preserve a project.
Recording capability must be verified before it becomes a progression gate.

### D8. What finishes, and why keep going afterward?

- **A — Close a piece/project:** choose a version to keep and mark this project
  finished. New opportunities open; the studio persists. Risks weak finale.
- **B — Finish an authored chapter:** resolve a small set of situations, then
  choose a closing work. Gives stronger pacing; risks becoming task-ladder grind.
- **C — Finish a finite run:** commit a final work under that run's constraints,
  archive it and restart. Fits D1-A; requires explicit carryover/reset rules.

**Recommend A for G1-P; consider B for the full-game arc if playtests need it.**
“Finished” means the player chose to keep and close a response, not that the game
approved its beauty. Ugly noise, instability and silence can be that response.
New modules should make a new question interesting, not merely prolong a ladder.

### D9. Can the player fail or lose anything?

- **A — No destructive progression failure:** abandon, revise or revisit projects;
  opportunities remain available. Stakes come from choosing and performing.
- **B — Optional situated stakes:** a loan expires or an event attempt ends, but
  the core collection/patch archive survives and another route remains available.
- **C — Run loss/reset:** losing a finite-run opportunity can end the run. Fits
  D1-A, but needs careful boundaries so sound quality is never the fail condition.

**Recommend A for G1-P, B only if a specific event benefits.** Unplugging a source,
making silence or overdriving a bounded loop is not a failure. A request condition
can be unmet without condemning the patch. No half-wallet penalty, lives meter,
forced bloat or permanent module loss by inheritance from the old shell.

### D10. What persists, and what happens to old saves?

- **A — Separate new studio save:** persist accepted progression, owned modules,
  installed graph and captures; leave the legacy save/route usable. Safest prototype
  boundary, but players have two separate experiences during development.
- **B — Explicit selective import:** offer to bring compatible collection items
  into the new model with a preview. Requires mapping behavior, not just names/types.
- **C — Replace/migrate in place:** translate the whole old economy and deck.
  High risk of importing systems we chose to cut and pretending positions are cables.

**Recommend A.** Define the accepted fields before schema work. Later import, if
wanted, requires a user-facing choice and validated compatibility mapping. Restore
state without autoplay; audible ownership starts from a gesture as in S1-A.

## 4. A candidate start-to-completion walkthrough

**ILLUSTRATIVE — assumes the recommendations above.** This demonstrates their
combined consequences so we can reject or revise them. It is not the chosen game.

1. **First visit:** arrive in a small studio and choose tone or noise as material.
   Start audio, route it to Output, change a control, unplug it and hear silence.
   No AP or credits interrupt this. Keep exploring as long as wanted.
2. **First project:** take a short invitation to investigate a moving sound with
   a source, filter and LFO. Try CV on pitch or cutoff and compare removing it.
   No score prefers one result; even a result you dislike can teach the relation.
3. **Acquire/discover:** audition an offered VCA or delay with the same material.
   One changes how level moves; the other introduces memory/feedback. Choose the
   relationship you want to keep. Declining does not strand the studio.
4. **Consequence/progression:** close the opportunity deliberately and retain the
   selected module and a snapshot/note. A visible next opportunity opens because
   this project was closed, not because amplitude or rarity passed a threshold.
5. **Middle growth:** later projects offer contrasting palettes/constraints using
   available behaviors. Revisit a saved system or begin another; collection and
   personal archive persist. Broader content is authored after structure/rack work.
6. **Project completion:** choose a version as this project's closing work, keep
   it, and optionally record a moment. It may be awkward, noisy or deliberately
   silent. Show what was kept and why this project is now marked closed.
7. **Continuation / later end:** reopen the studio freely. Another project asks a
   different question. Whether a larger chapter or overall game has an authored
   final closing point is still D8, not decided by this example.

This gives a complete project arc, not a secretly chosen whole-game ending.
If we choose finite runs instead, rewrite it with the starting constraints,
acquisition sequence, final brief, archive and explicit restart/carryover rules.

## 5. Conditional G1-P outline and risks to test

After acceptance, the smallest candidate slice is one fresh studio/project,
one small kit, one offered new relationship, real patch edits, a legible consequence,
one next opportunity and a closing snapshot/state that survives reload. Implement
only the accepted decisions. No requirement for Clock/GATE, new DSP, city map,
economy, combat, pixel polish, catalogue expansion or advanced recording.

Test the chosen loop with questions that can change the design:

- Does the offered module answer something the player wants to try, or do they
  acquire it only because the UI says to? If the latter, revise acquisition/prompt.
- Does closing a project feel like a decision, or an arbitrary unlock button?
  Player-declared progress intentionally permits rushing; do not conceal this
  weakness with unreviewed musical grading.
- Does a limited palette invite investigation or just obstruct an intended patch?
  Can players freely explore and return without losing their work?
- Does a saved snapshot make the player want to revisit? Would an audio moment
  matter more? Does a silent result remain understandable and preservable?
- Do consecutive projects feel different enough to justify continuation?
  The full-game/chapter ending remains unresolved until we choose and test it.

## 6. Acceptance record — pending

No D1–D10 options or system dispositions have been accepted yet. Recommended
review order: D1 (form), D3/D4/D5 (desire and consequence), D8/D9 (closure/stakes),
then starter palette, constraints, capture and saves. Choices are coupled:
finite runs need different loss/carryover rules; a credit shop needs an actual
earning loop; audio-required completion needs verified recording.

Record the user's choices and changes here or in a linked accepted structure
document before G1-P starts. Identify intentionally deferred choices and the
limits they impose on the slice. Silence, a commit, or a worker recommendation
does not constitute user acceptance.

## Source references

- [App.tsx](../../App.tsx): active initializer, JobView/BossView/PerformanceView,
  acquisition/quest/upgrade/day/boss handlers and VictoryView callback.
- [constants.ts](../../constants.ts): CHARACTERS, STUDIO_UPGRADES, pools and BOSSES.
- [types.ts](../../types.ts): PlayerState, Module, Quest and Boss.
- [gameLogic.ts](../../services/gameLogic.ts): drawCards, scalar patch score,
  quest and shop generation.
- [storageService.ts](../../services/storageService.ts): legacy JSON storage.
- [index.tsx](../../index.tsx), [PatchSandbox.tsx](../../components/PatchSandbox.tsx),
  [patchModel.ts](../../services/patchModel.ts), [audioEngine.ts](../../services/audioEngine.ts):
  separate authoritative session patch and shared Studio audio ownership.
- [Gameplay map](../project/GAMEPLAY_MAP.md), [State model](../project/STATE_MODEL.md),
  [Known quirks](../project/KNOWN_QUIRKS.md), [S1-A validation](../project/S1_A_PATCH_AUTHORITY.md):
  earlier evidence and its limits. No full-run browser test was added for G1-D.
