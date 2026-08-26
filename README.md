# Melanie's Quests · המסע של מלאני

Tablet-first homework game for a first grader (כיתה א'). Sister app of
[Tommy's Quests](https://github.com/githubonlyy/tommys-quests): same engine,
first-grade content, Hebrew text-to-speech on every prompt, three pick-each-time
worlds (ברבי / חד-קרן / פרחים), and a dress-up avatar that coins buy clothes for.

- Live: https://githubonlyy.github.io/melanies-quests/
- Design spec: [docs/superpowers/specs/2026-08-26-melanies-quests-design.md](docs/superpowers/specs/2026-08-26-melanies-quests-design.md)

## Develop

```powershell
cd app
npm ci
npm run dev      # http://localhost:5173 — host:true so the tablet on the same WiFi can open it
npm test         # vitest
npm run lint     # oxlint
npm run build
```

Deploys automatically to GitHub Pages on push to `master` (`.github/workflows/ci.yml`).
`deploy.ps1` is a manual fallback.

## Parent notes

- Coach tab PIN defaults to `1234` — change it on first use (Coach → החלפת קוד).
- Subjects and difficulty live in `app/src/data/questions/*.json` — plain JSON, edit freely.
- Real-world rewards are `app/src/data/shop.json`; avatar clothes are `app/src/data/wardrobe.json`.
- Economy knobs: `app/src/data/config.json` (questions per match, win thresholds, daily goal, chest).
- Everything is stored in the browser's localStorage (`melanies-quests-v1`); clearing site data resets progress.
