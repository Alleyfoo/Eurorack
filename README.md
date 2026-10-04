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

## S1-A: Patch / Listen

Choose **PATCH / LISTEN** in the Studio header, or open
http://localhost:3000/?mode=patch. Start audio, then drag between jacks or click
two jacks. Connect an Oscillator SIGNAL output to Output MIX to hear it.
Remove a connection with its × button. Unpatched output is silent.

This experiment reuses Studio's audio context, master compressor/limiter,
analyser and recording path. Its visible AUDIO/CV cables take routing authority;
Studio's positional backing sequence is inactive while the patch owns audio.
Patch Delay SIGNAL back to RETURN for real delayed feedback. Module controls,
addition, removal, reordering, mute and stop/restart are available. Patch state
is session-only; the existing game's save schema is unchanged.

Clock/GATE behavior and capture controls are deferred. See
[S1-A implementation and validation](docs/project/S1_A_PATCH_AUTHORITY.md).

## Production build

```sh
npm run build
npm run preview
```

Vite writes the production build to `dist/`. Graph policy tests run with
`npm run test:patch` (Node.js 22.18+ or 24). The build does not type-check the
whole prototype, and no lint script is configured.

## Code layout

- `index.tsx` mounts the root `App.tsx`, which coordinates the game and views.
- `components/` contains rack controls, module cards, and the oscilloscope.
- `services/` contains game calculations, Web Audio synthesis, and save handling.
- `services/patchModel.ts` defines the visible patch;
  `services/patchAudioGraph.ts` applies its routes to Studio-owned audio.
- `constants.ts` and `types.ts` define game content and shared data structures.

`src/App.tsx` is an alternate, unused copy; the active entry point imports the
root `App.tsx`.
