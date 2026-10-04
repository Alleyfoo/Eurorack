# Pixel art plan

Status: proposal with a working prototype in
[`design/pixel-rack-prototype.html`](../design/pixel-rack-prototype.html).
Open that file directly in a browser. It has no build step and needs no server.

## Verdict: light enough for the web, so no redesign is needed

The prototype draws 44 real modules from `constants.ts` into a 3 x 16 rack. It
also draws cables, a playhead, animated screens and a design sheet. Figures
measured in the browser:

| Measure | Prototype |
| --- | --- |
| Image files downloaded | 0 (every panel is generated from module data) |
| Page size (HTML, JS and sample data) | 43 KB |
| Distinct panel sprites | 64 (rack, design sheet and muted variants) |
| Sprite memory | 384 KB (24 x 64 x 4 bytes each) |
| The same sprites as a PNG atlas | 32 KB, as an alternative to generating them |
| Draw time per frame, full rack at 3x | about 1 ms |
| Rack size on screen at 3x | 1233 x 732 CSS px |

Pixel art makes the game lighter than it is now. The current rack renders 48
DOM cards, each 160 x 256 px. Each card carries Tailwind classes, box-shadows,
blur and grayscale filters and a CSS animation. A full row is about 2700 px wide
and has to scroll. The pixel rack is one canvas, and a full row fits on a
1280 px screen.

The heavy dependency is the Tailwind Play CDN script in `index.html`. It
compiles CSS in the browser on every load. That cost exists today and is
separate from this plan, but removing it belongs to phase 3.

## Art specification

- **Panel grid**: every module is 24 x 64 native pixels. Zoom is always a whole
  number: 1x, 2x, 3x or 4x. The canvas backing store uses
  `round(zoom * devicePixelRatio)` device pixels per art pixel. This keeps
  pixels square at 125 % and 150 % Windows scaling. CSS `image-rendering:
  pixelated` alone does not.
- **Panel layout**: the vertical layout is fixed and shared with hit testing.

  | Rows | Content |
  | --- | --- |
  | 0–3 | Rail and top-left screw |
  | 4–10 | Header band with the type code (`VCO`, `VCF`, `DUCK` and so on) and an LED socket |
  | 12–26 | Screen with the type icon; VCO, LFO, SEQ and junk screens are animated |
  | 29–35 | One or two knobs. The pointer angle comes from `module.settings` |
  | 39–45 | LCD showing the module's voltage value. Green is positive, red is negative |
  | 47–51 | Input jacks |
  | 53–59 | Output jacks on an inverted backplate, the way real panels mark outputs |
  | 59–61 | Manufacturer logo and bottom-right screw |

- **Data drives appearance**: no module is drawn by hand.
  - `type` sets the layout, screen icon, LED colour and knob count.
  - `manufacturer` sets the panel colour, texture and logo. The seven makers
    are brushed cream, starfield navy, wood grain, engraved bronze, vapor
    stripes, steel and plain aluminium.
  - `rarity` sets the trim colour down both edges. Legendary and Mythic panels
    have a spark running round the trim. Cursed panels tear sideways now and
    then.
  - `TRASH` panels get rust, dents and sometimes a missing knob. `CURSE`
    panels get a skull and an eye in place of knobs. `EMPTY` is a vented
    blank.
  - Jack colours follow the existing convention: silver for audio, dark for
    CV and red for gate.
- **Text**: panels use only a 3 x 5 bitmap font for codes and values. Module
  names are too long for a 24 px panel. They go in tooltips, the inspector and
  `ModuleDetailModal`, which keep using the VT323 web font.
- **Palette**: the colours are fixed tokens in one file. Highlights and shadows
  are derived from them with `shade()`, so a new manufacturer is a single line.

## Architecture

Panels are generated once per module at runtime, cached, and drawn with
`drawImage`. Only LEDs, animated screens, sparks, cables and the playhead are
redrawn each frame.

```
services/pixelArt/
  palette.ts     manufacturer, rarity, LED, icon and jack colours
  font.ts        3x5 glyphs and text()
  layout.ts      panel layout rows and jackRects(); used by drawing and hit testing
  sprites.ts     buildSprite(module, {muted}) and a cache keyed by id, rarity, maker and settings
  overlay.ts     drawOverlay(): LED, animated screens, rarity effects
  cables.ts      pixel catenary with marching signal pixels
components/
  usePixelCanvas.ts  integer-scale canvas sizing (zoom, devicePixelRatio, resize)
  PixelModule.tsx    drop-in replacement for ModuleCard
  PixelRack.tsx      the whole RackView rack as one canvas (phase 2)
```

The cache key includes `settings`. Turning a knob in `ModuleDetailModal`
rebuilds only that module's sprite, which costs microseconds.

## Phases

**Phase 1 — `PixelModule` as a drop-in for `ModuleCard`.** Low risk, and it is
most of the visual change.

- Same props as `ModuleCard`. `size` maps to zoom: `sm` is 2x, `md` is 3x and
  `lg` is 4x.
- A small canvas draws the sprite and overlay. Transparent `<button>`s are
  placed over the jacks using `jackRects()`. This keeps the existing
  `onPortPointerDown` and `onPortPointerUp` handlers and the `draggable`
  rack slots. Screen readers still get the port buttons.
- `JobView.getPortCoordinates` hard-codes the old card geometry: a 160 px
  card, a 24 px gap, ports 245 px down and 20 px apart. Replace those numbers
  with `jackRects()` multiplied by the zoom, or the SVG cables will miss the
  new jacks.
- All `ModuleCard` call sites switch at once: shop, quests, city, job hand and
  rack. Keep `ModuleCard` behind a setting until the switch has been played
  through.
- One shared `requestAnimationFrame` loop drives every visible `PixelModule`.
  This avoids one loop per card.

**Phase 2 — `PixelRack` canvas for `RackView`.**

- Rails, panels, playhead and cables move into one canvas, as in the
  prototype. Drag-to-reorder and patching use canvas hit testing (`hit()` in
  the prototype) in place of HTML drag and drop. This also makes the rack
  work with touch input; HTML drag and drop does not.
- `subscribeToStep` drives the playhead directly. React no longer re-renders
  48 cards on each sequencer step.
- Restyle the `JobView` SVG cables as pixel cables, or move them to the same
  canvas.

**Phase 3 — interface chrome and cleanup.**

- Pixel-style buttons and panels use chamfered `box-shadow` borders and inset
  bevels; the prototype's HUD shows the style. These replace the rounded
  Tailwind borders.
- Draw the lucide icons as 9 x 9 pixel icons in the same palette.
- Remove the Tailwind Play CDN script. Use a compiled Tailwind build or plain
  CSS tokens. This also fixes the missing `/index.css` warning.
- Restyle the oscilloscope as a 1-pixel trace on a low-resolution canvas.
- Restyle `PerformanceView` knobs with the same `drawKnob` so the game uses one
  visual language.

## Risks and decisions

- **Hand-drawn art, later.** The generator can be replaced one sprite at a
  time. If `public/sprites/<id>.png` exists, `buildSprite` loads it.
  Otherwise it generates one. One artist-drawn 24 x 64 PNG is about 0.5 to
  1 KB, so even 104 bespoke panels stay under about 100 KB.
- **Legibility.** The 3 x 5 font is readable from 2x up; at 1x it is
  decoration. Auto zoom picks the largest whole number that fits. Narrow
  screens scroll the rack sideways inside its container.
- **Accessibility.** The canvas has no text for screen readers. Keep port
  buttons and a visually hidden module list in the DOM. The inspector already
  shows the full data as text.
- **Rejected alternatives.** PixiJS or another WebGL renderer adds several
  hundred KB for a scene that already draws in about 1 ms with Canvas 2D. A
  sprite sheet for every module × rarity × state combination would be large
  and would fall out of date whenever `constants.ts` changes.
