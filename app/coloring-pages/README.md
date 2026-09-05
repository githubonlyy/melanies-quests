# דפי צביעה של המשפחה — family coloring pages

Drop line-art image files in this folder. They show up in the drawing game under
**המשפחה שלי**, next to the built-in coloring pages. No code change, no manifest.

```
app/coloring-pages/
  סבתא.png
  הכלב-שלנו.jpg
  טומי-ומיכאל.svg
```

## Rules

- **The filename is the page name.** `סבתא.png` shows up as "סבתא". Use Hebrew.
- Accepted: `.png` `.jpg` `.jpeg` `.webp` `.svg`
- Commit and push; the next deploy picks them up automatically.

## What the app does to your file

The page is drawn *above* the canvas so the black lines stay crisp while she
colors underneath. Raster files therefore get cleaned up on load
(`../src/world/draw/pageInk.js`):

1. the desk/table around a photographed page is cropped off
2. the lighting gradient is flattened and cream paper is normalised to white
3. paper becomes fully transparent, ink becomes solid black

So a **phone photo of a printed page works** — it does not need to be a clean
scan. A transparent-background PNG or an SVG works too and skips step 1–3.

Rough edges to avoid: keep the whole page in frame, avoid a hard shadow across
the sheet, and do not photograph at a steep angle (perspective is not corrected).

## Privacy

Anything in this folder is bundled into the published site and is publicly
reachable at `githubonlyy.github.io/melanies-quests/...`. Commit line art, not
photographs of the kids.
