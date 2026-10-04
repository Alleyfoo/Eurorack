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

Audio fidelity is deferred; audio architecture is not. The next priority is
G1 game structure/progression, as scoped in `docs/plans/G1_GAME_STRUCTURE_PROPOSAL.md`.
G1-D is design archaeology and a decision packet only: no runtime changes.
Provide alternatives and recommendations for major choices; do not silently
lock them. G1-P requires recorded user acceptance and implementation authorization.
D1-B (persistent studio/finite projects) and D8-A (player-chosen project closure)
are accepted for the documented scope. Closure preserves the studio and patch;
G1-P has no final studio ending. D3-A for G1-P, D4-A structural progression and
D5-B+A situated constraints/open sonic response are also accepted. Projects
introduce possibility; they do not confiscate the studio. Free exploration stays
available; exact engagement requirements/unlocks and remaining choices stay
pending in the G1-D packet. Do not infer runtime implementation authorization.
D9-A is accepted for G1-P: no destructive failure, explicit revise/retry/abandon/
free-studio recovery. Projects may close doors; they do not erase the player's work.
D9-B is reserved for later optional events with studio/history safe; D9-C is
incompatible. D7/D10 must ensure returned audition modules never silently break
preserved patches/archive items; the preservation mechanism remains open.
Follow the sequence in `docs/design/GAME_DESIGN.md`: structure, rack experience,
content, end-to-end playability, then serious audio refinement. Clock/GATE or
S1-B work needs a concrete gameplay reason; it is not the default next task.

Reusable controls and module displays live in `components/`. Game calculations,
Web Audio synthesis, and local storage persistence are separated in `services/`.
Shared game data and types live in `constants.ts` and `types.ts`.

## Build, Test, and Development Commands

- `npm install`: install the declared dependencies.
- `npm run dev`: start Vite on port 3000.
- `npm run build`: generate the production bundle in `dist/`.
- `npm run preview`: serve the production bundle locally.
- `npm run test:patch`: run graph policy tests (Node.js 22.18+ or 24).

Only graph policy tests are configured; no lint or formatting script exists. The production
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
