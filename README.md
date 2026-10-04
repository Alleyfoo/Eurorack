# Eurorack Incremental

A browser game about building a modular synthesizer rack, patching modules,
completing jobs, and upgrading your studio. Built with React, TypeScript, Vite,
and the Web Audio API. Progress is saved in the browser's local storage.

## Run locally

Install Node.js, then run:

```sh
npm install
npm run dev
```

Open http://localhost:3000. The current game does not call an AI API and does
not require a Gemini API key. Styling and fonts load from external CDNs.

## Production build

```sh
npm run build
npm run preview
```

Vite writes the production build to `dist/`. No automated test script is configured.

## Code layout

- `index.tsx` mounts the root `App.tsx`, which coordinates the game and views.
- `components/` contains rack controls, module cards, and the oscilloscope.
- `services/` contains game calculations, Web Audio synthesis, and save handling.
- `constants.ts` and `types.ts` define game content and shared data structures.

`src/App.tsx` is an alternate, unused copy; the active entry point imports the
root `App.tsx`.
