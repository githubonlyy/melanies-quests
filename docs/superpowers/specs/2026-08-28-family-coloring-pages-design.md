# Family Coloring Pages — Design Spec

**Date:** 2026-08-28
**Status:** Approved (brainstorm with Lior, 2026-08-28)
**Affects:** the drawing activity (`app/src/world/draw/`)

## Summary

Melanie can color pages made from family pictures. Lior commissions/draws the line
art himself and commits the image files to the repo; the app discovers them
automatically, cleans them up for use as a coloring overlay, and offers them in the
drawing game's page picker beside the eight built-in templates.

## Locked Decisions

| Topic | Decision | Why |
|---|---|---|
| Source of pages | Image files committed to `app/src/world/draw/family/` | Lior prepares the outlines himself and adds them here, not through the app |
| Photo → line art conversion | **Not built.** The app consumes finished line art | Lior does the conversion externally |
| Discovery | `import.meta.glob`, no manifest | "Drop a file in a directory" was the ask; nothing to keep in sync |
| Page name | Filename stem (`סבתא.png` → "סבתא") | She cannot read; the name is for Lior's ordering, the thumbnail is what she picks by |
| Display modes | `קווים` (opaque lines) and `שקוף` (22% tracing paper), she picks per page | Chosen in brainstorm; outlines suit coloring, faded suits busy pages |
| Where the parent adds pages | Nowhere in the app — it is a git commit | No upload UI, no IndexedDB, no PIN gate needed |
| Privacy | Accepted: files in the repo are served publicly by GitHub Pages | Raised and accepted by Lior; line art, not photographs |

## The input problem

The reference sample is a **photograph of a printed page**, not a clean export:

- paper is cream (~#f2ede4), not white
- a lighting gradient runs across the sheet
- the table is visible past the page edge
- slight perspective and paper texture

The template layer renders **above** the drawing canvas so the black lines stay crisp
while she colors underneath. A raw photo used as that layer would cover her coloring
with an opaque beige rectangle. So every raster page is processed on load.

## Processing pipeline (`pageInk.js`)

Pure functions over `ImageData`-shaped buffers, no DOM, unit-testable.

1. **Downscale** to fit 1400×1400 (done by the caller via canvas; the module works on
   whatever it is handed).
2. **Flat-field correction** — divide each pixel by a heavily blurred copy of itself
   (box blur, radius ≈ `min(w,h)/16`, run twice for a near-Gaussian). This removes the
   lighting gradient and normalises cream paper to white, without touching thin dark
   lines, which survive because the blur radius is far larger than a pen stroke.
3. **Auto-trim** — drop border rows/columns that are less than 60% paper. This removes
   the visible table edge. Trimming stops at the first row/column that qualifies as
   page, and is capped at 15% per side so a legitimately dark drawing is never eaten.
4. **Key to alpha** — map corrected luminance to alpha with a soft ramp:
   `L ≥ paperCut` → transparent, `L ≤ inkCut` → opaque black, between → linear.
   Colour is forced to black so faded pencil still reads as line.

Exported: `boxBlurGray`, `flatField`, `paperLevel`, `autoTrimBounds`, `keyToAlpha`,
and `processPage` composing them. Constants (`PAPER_CUT`, `INK_CUT`, `TRIM_MAX`,
`BLUR_DIVISOR`) are named exports so they can be tuned without hunting.

**SVG inputs skip the pipeline** — vector line art is already transparent and crisp;
it is used directly as an `<img>` source.

## Discovery (`familyPages.js`)

```js
const files = import.meta.glob('./family/*.{png,jpg,jpeg,webp,svg}', {
  eager: true, query: '?url', import: 'default',
})
```

Yields `[{ id, name, url, vector }]` sorted by name, where `id` is the slugged
filename, `name` the stem, `vector` true for `.svg`. `README.md` in that folder
documents how to add a page. The folder ships empty apart from the README, so the
feature is inert until Lior commits artwork.

Pure helper `pagesFromGlob(globResult)` does the mapping so it can be tested without Vite.

## Template model

`templates.js` currently exports objects of SVG path strings. A template becomes a
tagged union:

- `{ kind: 'paths', id, name, emoji, paths: [...] }` — the eight built-ins, unchanged
- `{ kind: 'image', id, name, url, vector }` — family pages

`templateById` searches both lists. Two consumers learn the union:

- **Draw's template layer** — renders the existing `<svg>` for `paths`, or an `<img>`
  (processed bitmap for raster, raw URL for vector) for `image`, at the mode's opacity.
- **`composeDrawing`** — draws the same layer into the saved PNG, so a saved family
  page looks like it did on screen.

## UI

**Picker sheet** gains a second group:

```
ציורים        ⬜ 💗 🌸 🦋 🦄 👗 🌈 🚗 🧁
המשפחה שלי    [thumb] [thumb] [thumb]
```

Empty state: *"אבא יכול להוסיף תמונות של המשפחה"*. Thumbnails are the processed
image, so what she taps is what she gets.

**Mode toggle** appears in the drawing top bar only while a family page is active:
`✏️ קווים` / `👻 שקוף`. Choice is remembered per page id in `localStorage`
(`melanies-quests-page-modes`), wrapped in try/catch like the rest of the app.

**Loading** — processing a 1400px page takes a few hundred milliseconds. The picker
tile shows a spinner while it runs; results are cached in a module-level `Map` for the
session, so re-picking a page is instant.

## Edge cases

- Processing throws or the file fails to decode → fall back to the raw image at 22%
  opacity (trace mode) and log once; never a blank screen.
- A page that is almost entirely dark → `autoTrimBounds` cap prevents trimming it away;
  `keyToAlpha` still yields usable lines.
- No family files committed → the group is hidden entirely, built-ins unaffected.
- Very large source (12 MP) → downscaled before processing; memory bounded.

## Testing

Vitest, pure functions only (no DOM):

- `boxBlurGray` on a known buffer: flat input unchanged, an impulse spreads evenly.
- `flatField` removes a synthetic linear gradient: corrected paper is uniform ±2 levels.
- `paperLevel` finds the bright mode on a cream-paper histogram.
- `autoTrimBounds` crops a synthetic "table band" border but refuses to exceed the cap.
- `keyToAlpha` maps paper → alpha 0, ink → alpha 255, and forces colour to black.
- `processPage` end to end on a **generated fixture that mimics the reference photo**:
  cream background, linear lighting gradient, black strokes, a dark band on one edge.
  Asserts the band is trimmed, the background is fully transparent, and the strokes
  survive as opaque black.
- `pagesFromGlob` name/id derivation, sorting, and vector detection.

## Out of scope

Photo → line art conversion in the app; per-page cropping or rotation UI; syncing
pages between devices; printing.
