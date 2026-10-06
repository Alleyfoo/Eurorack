# G1-P — Persistent Studio / Project / Archive slice

Implemented 2026-10-05 in `9dc4a0d`, following the user's eight-part working-slice
order after D1–D10 acceptance. This is the small authored prototype, not a general
quest/content engine. Open `?mode=studio`; default legacy and `?mode=patch` remain.

## Play the slice

1. Choose **Tone** or **Noise**. Owned storage contains that source, Filter and
   LFO. Output is fixed infrastructure. The rack starts unpatched; the other
   source is not secretly owned. Six ordinary modules plus Output is provisional
   installed capacity, with no upgrade ladder.
2. Start audio deliberately and patch a source to Output. Direct routes, filter
   transformations, CV modulation, noise and unplugged silence are legitimate.
3. Start **Material / Memory** below the rack. Its branch copies the Studio patch,
   offering the other source and Delay as loans. Install a loan from the rack
   toolbar, then make at least one valid cable involving a loan. That is the entire
   engagement requirement; it is explained in the UI and does not require audio.
4. Return to **Free Studio** or **Leave / abandon for now**, then resume. Each
   patch remains independent. Context switches stop audio; press Start to listen
   again. The project branch and loan controls survive leaving and reloading.
5. **Keep result & close** permits an optional title/note and retention of one
   offered loan or none. Snapshot first, then return loans. Retained modules enter
   storage without changing the Studio rack. Closure opens **Level in Motion**.
6. That project loans VCA, with the same explicit cable engagement requirement.
   Closing it displays **Prototype arc complete**. Studio remains fully usable;
   this is a development milestone, not an overall game ending.

The first project introduces material/memory; the second introduces level control.
`PROJECTS` contains two plain typed objects. Closure/unlocks are straightforward
transitions, not a quest DSL, analyser detector, score ladder or content editor.

## State, identity and preservation

`studioModel.ts` owns the state transitions; `studioStorage.ts` stores version 1
under `eurorack_studio_save_v1`. Nothing here reads/writes the legacy
`eurorack_inc_save_v1` save. The new record includes starter choice, owned instances,
Studio patch, active project/working-copy branch, branch inventory/loans/engagement,
unlocked and closed projects, archives, current context and prototype completion.
Loading creates no AudioContext and does not start sound.

The separately authorized [R2 seam](R2_DATA_DRIVEN_PATCH_SEAM.md) now validates
and builds these unchanged v1 records through versioned definitions/behaviors.
The save key/schema, archive metadata and explicit loan/substitution flows remain
as described here; there is no in-place migration or additional content.

| Layer | Behavior |
|---|---|
| Studio | Owned instances in generous storage, plus the current installed patch. Uninstalling removes live incident cables deliberately but preserves the owned instance/controls. |
| Project | Deep-cloned Studio patch and branch-local inventory, plus offered loans. Edits do not mutate the Studio patch or owned control values. Only one active branch is supported; leaving preserves it. |
| Archive | Deep snapshot of installed instances, controls, cables, definition/kind and provenance, with title/note and creation/project identity. Later work creates a new entry rather than editing this record. |

Stable UUIDs identify individual modules, not just kinds. Ownership is a separate
membership decision. An archived borrowed Delay retains its exact ID and cables
even if returned; its archive record does not make it freely available in Studio.
Only installed modules belong to the closed patch snapshot; unused tools stay in
storage or return as loans. Once a loan cable has proved engagement, removing it,
uninstalling the loan or making silence does not revoke closure eligibility.

## Archive working copies

**Make working copy** checks exact instance availability. Missing dependencies
open the resolver; nothing is pruned or replaced automatically.

- **Reacquire temporarily:** recreates that exact dependency as a loan in the new
  copy. It is unavailable to arbitrary free Studio patches and cannot be retained
  through working-copy closure as though it were a project acquisition reward.
- **Substitute:** uses a distinct owned instance of the same kind, preserving the
  archived control values and explicitly remapping module IDs on compatible port
  endpoints. No valid substitute is stated explicitly. Two dependencies cannot
  collapse into the same owned instance.
- **Retain as archive:** cancels the fork without state changes.

The original archive never changes. A resolved working copy can be edited and
closed into another snapshot; it grants no new project unlock or ownership.
An existing active branch must be closed before starting a second branch; it
is not silently discarded to make room.

## Reused implementation boundary

`PatchWorkspace.tsx` is extracted from S1-A's UI and owns the shared cable gestures,
geometry, controls, transport and `PatchAudioGraph` lifecycle. `PatchSandbox.tsx`
is now its session-state wrapper. `StudioPrototype.tsx` supplies persistent state,
available instances and capacity to that same workspace. No cable/audio code was
copied into a competing implementation. Studio's existing context/master remains
authoritative; no new DSP or Clock/GATE behavior was added.

The scope canvas now has its requested dimensions even while audio is off,
avoiding the browser's default 300×150 canvas spilling outside the Output panel.

## Validation

| Check | Result |
|---|---|
| `npm run test:studio` | Seven passing tests: both starters, branch/control isolation, engagement, closure/retention, exact dependency loans, same-kind endpoint substitution, save/reload arc, capacity and bad-save preservation. |
| `npm run test:patch` | Six existing graph-policy tests pass. |
| Focused TypeScript | StudioPrototype, PatchWorkspace, PatchSandbox, studioModel/studioStorage and their imports pass; unused legacy copy is not included. |
| `npm run build` | Pass. Existing missing `/index.css` warning remains. |
| Isolated Chromium full arc | Fresh Tone choice → direct audible route → Project 1 → invalid family rejection and valid loan cable → leave/edit Studio/resume → active-branch reload → retain one/close/archive → reload/unlock Project 2 → loan engagement/closure → arc complete → free Studio edits still usable. |
| Dependency resolver | Returned Delay preserved in archive; cancel fork, temporary reacquisition, copy reload/closure and immutable original all pass. A separate valid save fixture with another owned same-kind instance tests explicit substitution/port remapping. |
| Audio/save boundary | Zero AudioContexts before gesture and after reload; one after Start, with measured nonzero direct-source output. Legacy sentinel save untouched through the arc. |
| Save error | Unsupported version is visibly explained, with raw stored data unchanged and no audio startup. |
| Reference/mobile | Fresh Noise starter, seven-module S1-A reference and legacy story route pass. No uncaught page errors. Desktop/mobile/rack/archive captures inspected; 390px layout has no horizontal document overflow. |

Playwright scripts/screenshots are temporary files outside the repo, using fresh
browser contexts rather than personal saves. An initial overly strict text selector
for the invalid-route notice was corrected in the helper; final runs pass.

## Scope limits and next playtest

No audio recording, exact replay, migration, long-term DSP compatibility, pixel/
cellular integration, new DSP, catalogue, economy, AP, reputation, bosses, daily
cycle, rack upgrade ladder, musical scoring or generalized project editor.
Only save version 1 is supported; malformed/unsupported data is retained and
explained instead of silently repaired. One live project or archive working copy
is supported at a time. Abandoning for now preserves that branch for later.

The mechanical arc is verified; the human fun/pacing test is still next. Play it
without a score: does an offered module answer a desired relationship, does
closing feel meaningful, is six installed modules a useful boundary, and does
the archive invite revisiting? Change content/clarity based on that evidence before
expanding the slice or improving audio fidelity.
