# Gameplay map

Baseline: `96b1008`. This is the existing incremental/RPG loop, not the governing
design's future patch-listen loop.

## Status vocabulary

- **IMPLEMENTED**: behavior exists in a handler/service.
- **REACHABLE**: a normal source/UI route reaches it. Browser-confirmed routes are noted separately.
- **DISPLAYED BUT NOT FUNCTIONAL**: a visible claim/control lacks the implied behavior.
- **DEAD / UNUSED**: no active caller or import.
- **UNKNOWN — NEEDS BROWSER TEST**: observed outcome is not established by S0 smoke.

## Player loop and systems

| System | Status and actual behavior |
|---|---|
| Story and character choice | IMPLEMENTED, REACHABLE, smoke-confirmed for Purist. Three character presets provide different starter pools; difficulty/focus labels are presentation rather than a separate difficulty algorithm. Closing the story plays a sound; character choice creates 48 blanks and a shuffled pending pool. |
| Starter tutorial | IMPLEMENTED, REACHABLE, smoke-confirmed. Four scavenges cost no AP. Each reveals a pending module into the first blank; the fourth inserts all remaining starter modules. Inspect Rack at step 4 advances to step 5. No cable tutorial. |
| Module acquisition | IMPLEMENTED, REACHABLE. Buy from shop or scavenge city; acquisition replaces first blank with a new instance ID, bounded by active capacity and available blanks. Repair converts trash into a random common module. |
| Rack construction | IMPLEMENTED, REACHABLE; rack opening smoke-confirmed. Deck order is the construction model. Drag-and-drop swaps slots including blanks; shuffle randomizes the whole deck including rests. Three rows of 16 represent rhythm, bass and texture. No independent storage inventory. |
| Rack jacks | DISPLAYED BUT NOT FUNCTIONAL as patch inputs/outputs: rack cards receive no port connection handlers and there is no rack cable state. Clicking a card opens calibration. |
| Job patching | IMPLEMENTED, REACHABLE; one cable and success smoke-confirmed. Jobs draw up to three distinct nonblank cards. Drag either direction between different modules' input/output ports. Same-module and same-direction connections rejected; signal family, duplicates, fan-in and cycles between modules are not validated. Clear removes all cables; no individual cable removal. |
| Jobs | IMPLEMENTED, REACHABLE. Entering costs 1 AP. POWER ON plays effects, then calculates score after 1 s and returns to HOME 3 s later. Threshold is `floor(4 + (week - 1) * 1.5)`. Success pays `totalOutput * 10` credits plus 1 reputation; failure gives no reward. Reroll costs 5 credits. No compulsory output cable: source modules can score unpatched. |
| Shop | IMPLEMENTED, REACHABLE, not purchase-playtested. Six-item generation attempts one guaranteed VCO and one VCA/filter, then rarity-weighted picks with common fallback. Purchased item removed from session stock. Selling gives `floor(cost * 0.5)` and replaces module with blank; starter modules cost zero. Stock persists in memory and refreshes on reload or nonfinal boss victory, not automatically every ordinary day. |
| Daily quests | IMPLEMENTED, REACHABLE. Generates up to three: EARN always eligible; REPAIR/SALVAGE if trash; PURIFY if curse. Each has AP/credit costs. Repair selects trash then random common replacement; salvage deletes trash for 10 credits; purify replaces curse with blank. Quest removed on completion. Generated on ordinary sleep and nonfinal boss win, or initial empty list. |
| City | IMPLEMENTED, REACHABLE. Temple repairs for 50 credits or purifies for 100 (without AP cost); club bets 10–500 credits, wins/loses the stake at approximately 50%; scrapyard costs 1 AP for uniform selection from the weighted-by-repetition SCRAP_POOL. These are not patch experiments. |
| Studio upgrades | IMPLEMENTED, REACHABLE. Cost `floor(baseCost * 1.5^level)` reputation. Compressor: max 5, +10% master gain per level, not a new compressor node. Cables: max 3, +0.2 scalar bonus per cable per level. Rack expansion: max 5, +2 active capacity per purchase; it does not add displayed rows. |
| Sleep and week | IMPLEMENTED, REACHABLE. Ordinary sleep advances day, restores maxAp, regenerates quests. At days divisible by 7, sleep waits 2 s then enters a boss, without first advancing day. No rent or daily upkeep deduction. |
| Bosses | IMPLEMENTED, REACHABLE from day 7; full battle UNKNOWN — NEEDS BROWSER TEST. Four bosses require 3/4/5/7 wins with 3 local lives. Each round uses player's JobView with week=1 and cableLevel=0: same target 4, no enemy synthesis/comparison. `boss.deckPool` is DEAD / UNUSED by combat. Failure does not increment round, leaving a patched JobView unable to retry normally; see quirks. |
| Weekly outcome | IMPLEMENTED. Nonfinal boss victory gives `200 * week` credits, increments week/day, restores AP, inserts two trash and one curse into available blanks, and refreshes shop. Bloat can exceed active capacity. Defeat halves credits and restores AP without advancing day/week. Final victory switches to VICTORY without the ordinary grant/bloat updates. |
| Victory/New Game+ | IMPLEMENTED, REACHABLE through final boss; UNKNOWN — NEEDS BROWSER TEST. Continue increments week/day and returns HOME; keeps deck and existing currencies, does not perform a fresh reset or usual weekly refresh. Boss selection cycles modulo four. |
| Performance quest | IMPLEMENTED, REACHABLE via EARN; timing completion UNKNOWN — NEEDS BROWSER TEST. Three knobs must match a randomly drifting target within 0.15. Stability rises/falls per animation frame; the nominal 20 s interval restarts on stability changes. Timbre/space/force also override global audio parameters. It measures knob alignment, not musical output. |
| Recording/export | IMPLEMENTED, REACHABLE from rack, export UNKNOWN — NEEDS BROWSER TEST. Tape Rec starts MediaRecorder on the limited master stream; stop downloads a timestamped `.webm`. No patch/state export, timeline, or capture library. |
| Mute/isolation | IMPLEMENTED, REACHABLE: module IDs suppress future slot triggers (and ducker contributions), bus sliders/buttons alter bus levels, settings toggle master mute. No solo command; existing note tails and background noise are not individually module-muted. |
| Blank purchase / left-right movement | Blank insertion button is DISPLAYED BUT NOT FUNCTIONAL: logs an informational message and charges nothing despite 5cr tooltip. `handleMoveModule` is DEAD / UNUSED, an empty deprecated callback. |

## Score and reward authority

`calculatePatchSynergy` builds one scalar node per module ID and executes four
passes, routing previous outputs into summed audio inputs or a combined CV/gate
input according to the destination port. It does not model samples, frequencies,
time, envelopes, named commercial-style effects, or the source port's semantics.

Score sums weighted outputs plus `cables.length * (0.5 + cableLevel * 0.2)`.
VCO weight is 1, filter/VCA 1.2, effect 1.5, trash -0.5, curse -2, blank 0;
other modules use 0.5. Output is softened above 20 per node. Architecture bonuses
are presence-based, not proof of topology: VCO+filter+VCA +50%, else VCO+LFO +30%,
else VCO+effect without VCA +40%, else clock-like+VCA/filter +40%. Clock-like means
SEQ or any module with GATE_IN. Total is clamped below at zero and floored to
tenths; `isSilence` means score <=0.5, not measured audio silence.

`baseScore` already equals final multiplied output, so the job breakdown does
not faithfully decompose modules/cables/synergy. A curse produces negative output
and has negative score weight, thus can add positive score. See [audio distinction](AUDIO_MODEL.md).

Performance reward uses stability/100: S >0.9, A >0.7, B >0.5, C >0.3, otherwise F.
Base credits are an integer 25–39, multiplied by 2/1.5/1/0.5/0.1 then floored;
reputation is 5/3/1/0/0. The quest text's 25–40 claim omits grading effects.

## Success, failure, and escape routes

Jobs declare success from numerical target comparison. Boss lives and victory
are numerical job outcomes. Performance declares critical/drifting/stable from
knob distance. There is no global game-over from noise, silence, insolvency,
or lack of AP; ordinary sleep replenishes AP. Return to Studio and Inspect Rack
can unmount activities; pending job/boss callbacks are not cancelled. Treat
abandonment, repeated POWER ON during analysis, and boss retry as browser-test
candidates rather than established coherent rules.
