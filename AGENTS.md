# Repository Guidelines

## Project Structure & Module Organization

This project is a React and TypeScript browser game. `index.tsx` mounts the root
`App.tsx`, which owns player state and coordinates the game views. The alternate
`src/App.tsx` is unused and its relative imports do not match the current layout;
make application changes in the root file.

Reusable controls and module displays live in `components/`. Game calculations,
Web Audio synthesis, and local storage persistence are separated in `services/`.
Shared game data and types live in `constants.ts` and `types.ts`.

## Build, Test, and Development Commands

- `npm install`: install the declared dependencies.
- `npm run dev`: start Vite on port 3000.
- `npm run build`: generate the production bundle in `dist/`.
- `npm run preview`: serve the production bundle locally.

No automated test, lint, or formatting scripts are configured. The production
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
