# otamasing-broadcast-predict

OBS dock + Browser Source for โอตะม้าซิ่ง: a long runner board (BK, PP, horse, jockey with owner's silks, three recent
races) with prediction columns for 1–4 pundits, from the Figma frame "JRA20261129 TKY G1 Shimbun".

- `#/dock` (OBS Custom Browser Dock): scroll the board row by row (the table header stays on top), edit the race, pundits
  and picks, runners, top-left picture and BK / PP colours; import / export JSON (one race per file); save the full board as JPG or PDF.
- `#/overlay` (Browser Source, 1920×1080): the board scaled to the width.

Static site (Vite + React + Tailwind v4), shared assets from
[otamasing-broadcast-shared](https://github.com/RikiNozomu/otamasing-broadcast-shared); data in the browser's localStorage.
Pushes to `main` deploy to GitHub Pages (Settings → Pages → Source: GitHub Actions).

File format: [docs/board-json.md](docs/board-json.md).

```sh
npm ci
npm run dev        # http://localhost:5173/#/dock
npm test           # unit tests
npm run test:e2e   # Playwright, dock + overlay together
```
