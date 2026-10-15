# Will's Body

Offline-first gym log PWA (vanilla HTML/CSS/JS, no build step). Four tabs: Arms, Chest & Back, Shoulders, Bodyweight (incl. rowing).

Features: routine + last session + next-session plan per exercise; big +/- steppers and Ok/Good/Tough effort buttons; auto rest timer (60–90 s, default 75 s, vibrate + soft beep); plateau rules with suggestion cards from an approved library (👍 adds to routine, ✕ dismisses permanently); weekly streak (weeks with a *work* or *holiday* absence are skipped); one-tap **Session complete** that snapshots the next plan; import (JSON/CSV) and export backup. Data lives in `localStorage` under `willsBody.v1`.

The seed files in `data/` are **example routines only** (`"_example": true`, no sessions). Import your real logs per tab.

## Progression rules
- All sets hit target reps, no Tough → +2.5 kg (bodyweight / min / m: +1 rep or unit)
- Target hit but Tough → repeat
- Missed reps → repeat; 2 misses in a row → deload 5% (kg)
- Plateau flags: reps drop after a weight increase; same weight & total reps 3 sessions; effort all "Ok" 3 sessions

Run tests: `node rules.test.js`

## Import schema
JSON (one tab):
```json
{
  "routine": [{"id":"ex-curl","name":"Dumbbell curl","targetSets":3,"targetReps":10,"unit":"kg"}],
  "sessions": [{"date":"2026-10-01","entries":[{"exerciseId":"ex-curl","sets":[{"reps":10,"weight":12,"effort":"Good"}]}]}]
}
```
`unit`: `kg` | `bodyweight` | `m` | `min` (for `m`/`min`, `reps` holds the metres/minutes). `effort`: `Ok` | `Good` | `Tough`. `routine` is optional on import (keeps the current one).

CSV: `date,exercise,set,reps,weight,effort` (header optional). Exercises are matched by name → id `ex-<slug>`; unknown names become routine items (unit `kg` if any weight > 0, else `bodyweight`).

Importing replaces that tab's sessions and clears the example banner.

## Deploy to GitHub Pages
1. Create a repo (e.g. `wills-body`) on GitHub.
2. In this folder: `git init && git add . && git commit -m "Will's Body" && git branch -M main && git remote add origin https://github.com/<user>/wills-body.git && git push -u origin main`
3. Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`** → Save.
4. After ~1 min it's live at `https://<user>.github.io/<repo>/`. All paths are relative, so the subpath works as-is.

## Install to home screen
- **iPhone (Safari):** open the URL → Share → *Add to Home Screen*.
- **Android (Chrome):** open the URL → ⋮ menu → *Install app* / *Add to Home screen*.

## Updates & the service worker
`sw.js` caches the app shell cache-first under a versioned cache (`wills-body-v4`). To ship an update, change files **and bump `CACHE`** in `sw.js`; on next visit the new worker installs, activates, and deletes old caches. Reload once (or close/reopen the app) to see the new version. Your data in localStorage is untouched — still use **Export backup** occasionally.

## 4-exercise cap & seed versions
Each tab has at most 4 active exercises (`active:false` = inactive/optional; exercises sharing a `group`, e.g. rowing time + distance, count as one). A 👍 on a suggestion when 4 are active swaps out the flagged exercise. Seed files carry `seedVersion`; when it increases, the app replaces seeded sessions and keeps sessions logged on the phone (`local:true`).
