# Current system

Baseline: `96b1008`; source-confirmed unless browser evidence is explicitly stated.

## Active entry and runtime

`index.html` loads `index.tsx`, which imports `./App` and mounts root `App.tsx`
under `React.StrictMode`. The HTML contains two module script tags pointing to
the same entry through relative/absolute paths. No active file imports
`src/App.tsx`; that alternate file has imports such as `./types` that cannot
resolve from `src/`. It is DEAD / UNUSED in this application's import graph,
not a second authoritative implementation. S0 does not delete it.

The browser supplies Web Audio, Canvas, requestAnimationFrame, timers, pointer
events, HTML drag-and-drop, localStorage, Blob/object URLs, and MediaRecorder.
React 19, ReactDOM, and lucide-react are package dependencies. Tailwind is loaded
by CDN; fonts use Google Fonts. An AI Studio CDN import map remains in the HTML.
There is no backend, network save, or AI service call in the game source.

`package.json` defines `npm run dev`, `npm run build`, and `npm run preview`.
Run `npm install` first. Vite's development configuration binds `0.0.0.0:3000`
and aliases `@` to the repository root. Build output is `dist/`; the build does
not run a type checker. No test/lint/format script is configured. `bun.lock` is
an empty file, so it does not currently provide a reproducible dependency lock.
S0 used the already-installed dependencies and passed `npm run build` with Vite
6.4.3; see the validation record for the separate smoke port.

## Ownership map

| Owner | Current authority |
|---|---|
| Root `App` | `PlayerState`, hydration, save triggers, view selection, economy/day/week, acquisition/removal, module updates, upgrades, logs, selected-module modal, root audio parameters and mute IDs |
| `CharacterSelectView`, `ShopView`, `QuestView`, `CityView`, `StudioView` in `App.tsx` | Presentation and local selection; parent callbacks mutate player state |
| `JobView` in `App.tsx` | Three-card hand, transient cables, drag state, numerical patch result, analysis/completion timeouts |
| `BossView` in `App.tsx` | Local wins, three lives, round, introduction; delegates each round to `JobView` |
| `RackView` in `App.tsx` | Deck rendered as 48 slots, reorder gestures, playhead subscription, recording UI flag; deck/control changes delegated to root |
| `PerformanceView` in `App.tsx` | Knob-matching minigame, stability and countdown; writes temporary audio overrides |
| `components/ModuleCard.tsx` | Module/port presentation and optional pointer callbacks; owns no cable graph or synth voice |
| `components/ModuleDetailModal.tsx` | Calibration sliders and decorative visualization; emits updated module objects |
| `components/Knob.tsx`, `Button.tsx` | Input/display primitives |
| `components/Oscilloscope.tsx` | Real master analyser display, local time/frequency mode, animation cleanup |
| `services/gameLogic.ts` | Random hand/shop/quest generation and four-pass scalar scoring simulation |
| `services/storageService.ts` | JSON serialization to a single localStorage key; no validation/migration layer |
| `services/audioEngine.ts` | Module-level singleton AudioContext, fixed buses, scheduled sounds, global modulation, analyser and recorder; lifetime exceeds any individual view |

## Screens and routes

Initial route is CHARACTER_SELECT only when there is no character ID and no
nonblank module. Otherwise it is HOME. A story modal overlays the initial fresh
session. HOME contains tutorial scavenging until tutorialStep 5, then jobs,
shop, side quests, city, studio upgrades, and sleep. DECK is available from the
sidebar even outside HOME; JOB, SHOP, CITY, QUESTS, STUDIO, PERFORMANCE, BOSS,
and VICTORY are conditionally rendered in the same root shell.

The root header offers Return to Studio on most non-HOME screens. BOSS and
VICTORY omit it, but the Inspect Rack sidebar remains available. Settings can
toggle global mute or clear the save and reload. Its displayed master-volume
percentage is static. VICTORY is a local view outside the declared `ViewState`
union, permitted by the root's additional literal type.

## Data and signal boundaries

There is no persistent separate rack: `PlayerState.deck` is both owned-module
inventory and positional rack/sequence. Root pads short decks with uniquely
generated blank panels to 48, without truncating longer decks. Active-count
capacity initially limits acquisition to 10, independently of the 48 physical
slots. Jobs draw from nonblank deck entries rather than from a separately
assembled performance patch.

Module settings reside on deck objects. Job cables reside only inside `JobView`;
they do not reach storage or `syncLivingRack`. Progression resides in player
currencies, day/week, quests, upgrades, character and tutorial fields. All of
these share root state, but persistence is conditional and incomplete as
described in [State model](STATE_MODEL.md).

Root effects sync deck changes to `audioEngine.syncLivingRack`, update ambience
from active count, and set compressor-upgrade gain boost. Neither opening a job
nor pressing POWER ON replaces the living rack graph. The oscilloscope shows
the actual combined master signal, not the computed job voltage.
