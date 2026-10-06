# Repository Guidelines

## Project Structure & Module Organization

This project is a React and TypeScript browser game. `index.tsx` mounts the root
`App.tsx`, which owns player state and coordinates the game views. The alternate
`src/App.tsx` is unused and its relative imports do not match the current layout;
make application changes in the root file.

`index.tsx` selects `components/PatchSandbox.tsx` for `?mode=patch`; default
navigation still mounts root App. S1-A routes use `services/patchModel.ts` and
`services/patchAudioGraph.ts`. Reuse `audioEngine.openStudioPatchSession` for
context/master ownership; do not create a competing engine or hidden backing
sequence. Module positions must not determine DSP behavior. Patch state remains
separate from the legacy save schema.

The recovered project identity and long-horizon production order are now recorded in
`docs/plans/PROJECT_REVIVAL_ROADMAP.md`. Read it after the governing design.
`docs/archive/OLD_DESIGN_BIBLE_RECOVERY.md` records which old world/story ideas
survive and which incremental mechanics are superseded.
`docs/content/MODULE_CATALOGUE_REHAB_V1.md` is the 100-module rehabilitation
proposal; read it with the amended R1 role review and acceptance record. Functional
direction is accepted; exact future panels/DSP and runtime implementation remain scoped.

Audio fidelity is deferred; audio architecture is not. D1–D10 acceptance is
recorded in `docs/plans/G1_D_DECISION_PACKET.md`. A subsequent user work order
authorized the concrete G1-P slice, now implemented and documented in
`docs/project/G1_P_STUDIO_SLICE.md`; consult it for scope and validation.

`?mode=studio` mounts `StudioPrototype` and the shared `PatchWorkspace`, using
`studioModel.ts` and `studioStorage.ts`. The prototype starts with Tone or Noise,
Filter, LFO and Output; six ordinary installed modules plus Output is a tuning
limit. Owned storage persists. Two authored projects offer loans and structural
unlocks; do not broaden this into an economy, quest framework or expansion ladder.
A valid new cable involving a loan enables player-chosen closure even with audio
off. Closure snapshots the branch and optionally retains one offered module in
storage, without replacing the free Studio patch. Projects remain isolated working
branches and can be left and resumed. No destructive progression failure or
musical scoring is allowed; completing the prototype arc leaves Studio usable.

The versioned `eurorack_studio_save_v1` save is separate from the legacy key.
Loading never creates an AudioContext or starts sound. Exact module instance IDs,
controls, cables and dependency provenance survive archive capture. Immutable
archives preserve dependencies without granting ownership. Missing dependencies
must be explained and explicitly resolved by temporary reacquisition, same-kind
owned substitution, or retaining the archive; never silently remove cables.
Unsupported/corrupt saves remain stored and show an error instead of resetting.
Only one working branch is supported in this slice. Optional audio recording,
legacy migration and perfect DSP replay remain outside scope.

**R1 is accepted in direction with four amendments**, recorded in
`docs/plans/R1_ACCEPTANCE_AMENDMENTS.md`: directly mapped CV → pitch, 16-family
coverage including synthesized percussion, #94 pitch/clock distribution with
free fan-out, and a narrow R2 boundary. **R1/R1A are closed; the user explicitly
authorized R2 on 2026-10-06. R2 is implemented and validated**, documented in
`docs/project/R2_DATA_DRIVEN_PATCH_SEAM.md`. Seven existing behaviors now use the
definition/behavior/instance/port/control seam with a frozen v1 compatibility
adapter and preset/archive preservation fixtures. **Stop before R3** unless the
user authorizes further scoped work. Do not migrate v1 saves in place.
Do not build the full capability ontology, event algebra/scheduler, resource
manifest/store or 100-module validation universe in R2. Historical metadata gaps
remain annotated; don't restart broad research as a prerequisite for that seam.

The current G1-P tiny starter and six ordinary-module limit are historical
prototype evidence, not the target full-game onboarding. The full game is now
directed toward several working, dismantlable starter patch graphs and a rack
capacity derived from useful systems rather than an inherited number.

Preserve the accepted design rules; serious DSP still follows a playable game.
Clock/GATE should be implemented only when an accepted module behavior or starter/
content need requires it, not as an isolated milestone.

Reusable controls and module displays live in `components/`. Game calculations,
Web Audio synthesis, and local storage persistence are separated in `services/`.
Shared game data and types live in `constants.ts` and `types.ts`.

## Build, Test, and Development Commands

- `npm install`: install the declared dependencies.
- `npm run dev`: start Vite on port 3000.
- `npm run build`: generate the production bundle in `dist/`.
- `npm run preview`: serve the production bundle locally.
- `npm run test:patch`: run graph policy tests (Node.js 22.18+ or 24).
- `npm run test:studio`: run progression, ownership, archive and save tests.

Graph policy and Studio model tests are configured; no lint or formatting script exists. The production
build bundles the active application; it does not perform TypeScript checking.
Browser audio uses the Web Audio API, and saved progress uses local storage.

## Commit & Pull Request Guidelines

Commit and push completed code changes before ending a session. Use conventional
commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, or `chore:`.
Prefer a commit for each logical milestone. Keep dependency folders, generated
builds, and local environment files out of commits.

If introduced later, never stage `.github/workflows/ci-full.yml`,
`scripts/ci_build_smoke.py`, `scripts/smoke/ci_gui_smoke.py`, or
`scripts/checks/check_update_correctness_signatures.py` without explicit user
confirmation; they require GitHub Actions environment data.

## Session Handoff

Read `.handoff.md` at session start and summarize its state before other work.
At session end, update it with completed work and commit hashes, uncommitted
changes and their reasons, known issues or failing checks, and the recommended
next task. Prefer local or self-hosted services when adding tools unless the
user requests a cloud service. Focus requested feedback on code quality and logic.
