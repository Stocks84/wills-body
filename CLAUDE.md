# Will's Body

Mobile-first, offline gym logging PWA. Live: https://stocks84.github.io/wills-body

## Stack
Plain HTML, CSS and vanilla ES2020 JavaScript. No framework, no build step, no backend. History stays in `localStorage`. Hosted on GitHub Pages from `main`.

## Commands
- Install: none (no dependencies)
- Run: `python3 -m http.server 8000` (or `npx serve .`), then open http://localhost:8000. A local server is required for the service worker and `data/*.json`.
- Test: `node rules.test.js` (Node 18+, built-in `assert`, no test framework)
- Build: none

## Layout
- `index.html`, `styles.css`, `app.js` — UI, events, timer, dialogs, preferences
- `rules.js` — pure, DOM-free training logic, shared with the tests
- `rules.test.js` — unit tests, including the `wills-body-vN` cache/version check
- `data/` — exercise JSON per tab; `sw.js` and `manifest.webmanifest` — offline/install
- `icons/`, `fonts/`, `docs/`

## Conventions
- The version in `manifest.webmanifest` must match the `wills-body-vN` cache name in `sw.js`.
- Never commit secrets or `willsto84@gmail.com`. Git author must be `Stocks84 <124254214+Stocks84@users.noreply.github.com>`. Do not push to `main` or merge without Will's approval.

## End-of-job report
Every finished coding job must be reported in this shape. Only list a check under CHECKS RUN if it actually ran; anything untested goes under NOT CHECKED, never left out.

PROJECT: repo and branch
PULL REQUEST: link (or not created)
PREVIEW: link or how to open it (or unavailable)
BUILT: what changed, in plain words
CHECKS RUN: what ran and the result
NOT CHECKED: what nobody tested (e.g. real phone, live data, emails)
KNOWN ISSUES: list, or none
COST / USAGE: where to see it; never guess a number
NEXT DECISION: exactly what Will needs to say yes or no to
