# State model

Baseline: `96b1008`; schema unchanged in S0. Source: `types.ts:PlayerState`, root
`App` initialization/effects/handlers, and `services/storageService.ts`.

## Persistent object and effective authority

The intended persistent unit is the whole JSON `PlayerState`. Root React state
is the live gameplay authority; localStorage is a periodically written snapshot,
not a transaction log or necessarily the latest state.

| Field | Initial value / meaning / mutation |
|---|---|
| credits | 50; purchases, sales, jobs, quests, bets, repairs/purification, boss grants/defeat |
| ap / maxAp | 3 / 3; jobs, city scavenging and quests spend AP; ordinary sleep/boss outcomes restore; no current maxAp upgrade |
| day / week | 1 / 1; ordinary sleep advances day; nonfinal weekly victory advances both; boss selection uses week modulo boss count |
| reputation | 0; job/performance rewards; studio purchases spend it |
| deck | New games: 48 separately identified EMPTY panels; ordered owned module instances, also the rack/sequence; sell/salvage/purify replace entries with blanks |
| rackCapacity | 10 active nonblank modules; rack_space adds 2 each purchase; distinct from 48 displayed slots |
| quests | Initially []; source generates eligible daily quests; removals on completion, refresh on sleep/boss |
| upgrades | Initially {}; mapping of compressor/cables/rack_space to level |
| hasSeenIntro | Optional; written when closing story, but not used as the actual story-display gate (save existence is used) |
| tutorialStep | Optional; character selection 0, starter scavenging to 4, Inspect Rack to 5; HOME uses `<5` as tutorial flag |
| pendingStarterDeck | Optional; selected character's shuffled starter objects, consumed by tutorial; remainder inserted on fourth reveal |
| characterId | Optional; selected character ID; no ongoing class-specific modifier beyond starter content |

Each `Module` stores id/name/type/value/rarity/cost/description, ports, optional
manufacturer/effect, optional tuning, and optional settings. Displayed settings
are fine, cutoff, resonance, rate, mix, time, level, probability, depth. They are
saved inside deck when a write happens, although most do not influence audio or
score. Static pool IDs identify templates, not safe instance IDs. Acquisition,
padding, replacement and tutorial entry generate instance IDs through
`Math.random().toString(36).substr(2,9)`; uniqueness is assumed, not checked.

## Save key and hydration

`eurorack_inc_save_v1` is localStorage's only save key. `saveGame` serializes
the full object; `loadGame` returns JSON.parse with no schema/field validation;
`clearSave` removes the key. Storage/parse errors are caught and logged.
Different browser origins/profiles have independent saves; there is no cloud
save, patch export, import UI or schema-version migration despite the key suffix.

The lazy state initializer loads a save, fills absent upgrades, pads short decks,
and sets missing tutorialStep to 5 if the padded deck is nonempty. A separate
mount effect loads again, fills upgrades/pads deck, but omits that tutorial
default and overwrites state. Therefore the first initializer's legacy tutorial
normalization can be lost. Arrays longer than 48 are retained; null/malformed
deck data can throw outside storageService's try/catch. No validation restores
missing currencies, quest arrays, module shapes, unique IDs, or invalid indices.

New unsaved state begins with blank deck. Startup selects CHARACTER_SELECT only
when no character ID and no functional modules; otherwise HOME. Fresh save absence
opens story. View is not recalculated as part of the second hydration effect.
StrictMode repeats effects in development; duplicate initialization/load logs
were observed in S0 smoke.

## What actually triggers a save

The combined save/audio-sync effect depends only on
`state.deck`, `state.day`, `state.credits`, and `state.tutorialStep`. It writes
only when `day > 1 || credits !== 50 || tutorialStep === 5`.

Consequences of those exact conditions:

- Character selection and early tutorial changes at day 1, credits 50 and step
  below 5 are not saved. The initial quest generation alone is not a save trigger.
- Completing the tutorial writes the current player object, including character
  and modules. Thereafter deck/settings/reorder changes trigger a full snapshot.
- Spending AP to enter a job does not itself trigger a write. If the job is
  abandoned or fails without another triggering change, reload can restore AP.
- Upgrade purchases change reputation/upgrades/capacity only and do not trigger
  a save. A later deck/day/credit/tutorial change can save them, but immediate
  reload can lose them.
- This is not a claim that all unlisted fields are never saved: the full object
  is written whenever any listed dependency changes and the guard passes.

## Transient state

| Owner | Unsaved state |
|---|---|
| Root App | Current view, logs (last 20), shopInventory, modal selection/context, settings/story visibility, active EARN quest, rack global parameters, muted-module Set |
| JobView | Hand, cables, analysis/result flags, pointer drag, scheduled completion callbacks |
| BossView | Wins/lives/round/intro; no persistent encounter result until parent handler fires |
| PerformanceView | Countdown, targets, stability, knobs/status, animation timing |
| RackView | Recorder UI flag, drag-over index, currentStep |
| Oscilloscope/detail components | Display mode, canvas animation, synthetic visualizer tick |
| Audio singleton | Context/nodes, active row references, scheduler position/timeouts, global params (including noteLength/masterBoost), XY/generative coordinates, mute IDs, overrides, noise state, recorder and chunks |

There is no persistent cable array or PatchState. Cables are local job records
with ID, source/destination module IDs and port indices, plus display color.
They are discarded by reroll, clearing, job deck-prop reset or unmount. The
active deck is copied into audio rows when synchronized; the singleton is an
execution mirror rather than a durable state authority.

Leaving DECK retains root rackParams and mute Set during the same page session,
and the audio singleton continues. Reload resets those controls/mutes and audio
state. Module tuning/settings remain if saved. Settings reset removes local save
and reloads the page; hasSeenIntro does not separately survive that reset.

## S0 persistence evidence

An isolated Chromium context completed Purist tutorial, observed a save with
characterId `char_purist`, tutorialStep 5 and deck length 48, then reloaded and
observed Save game loaded plus normal HOME/job entry. This verifies a save
created by the current build. No personal preexisting save was opened, and old,
corrupt, overlong and duplicate-ID saves remain UNKNOWN — NEEDS BROWSER TEST.
