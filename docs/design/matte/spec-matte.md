# Will's Body — visual redesign: Matte (visual/copy pass)

Status: **Approved by Will on 13 Nov 2026 (Europe/London)** for the polished v2 matte set.

- Paper file (visual source of truth): [Will's Body · Matte](https://app.paper.design/file/01M79HA07JYZCMTX6AC0YWRNTK)
- Approved PNG mocks (2×): `docs/design/matte/mocks/`
  - `tokens.png`
  - `home-390.png`
  - `logging-390.png`
  - `logging-390-light.png`
  - `home-1440.png`
- Repo this pass lands in: [Stocks84/wills-body](https://github.com/Stocks84/wills-body), branch from `main` at `a9a3cc3` (v1.18.0). Live site today: https://stocks84.github.io/wills-body (GitHub Pages from `main`).
- This document is the implementation contract. The PNGs settle look and layout; this file names the real files, selectors, tokens, and acceptance checks. If a PNG and this file disagree on a colour or type size, follow this file (tokens were measured and locked). If they disagree on composition, follow the PNG and file a note in the PR.

Stack (do not change): plain HTML / CSS / JS PWA. No framework, no bundler, no backend. Files you will touch: `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`. Optionally add `fonts/*.woff2` plus the OFL licence file. Do **not** rewrite `rules.js` training logic (see §0). Existing tests: `node rules.test.js` (114 assertions in `rules.test.js`).

## 0. Hard constraints (read first, re-check before every commit)

This is a visual and copy pass on the existing chrome. It is not a rewrite, a framework migration, or a new product.

- **Do not change** progression maths, storage keys, import / export behaviour, draft persistence, typed steppers, or PWA install behaviour in `rules.js` / `app.js`, except the UI-only items listed under "Allowed behaviour tweaks" below.
- **Do not weaken or delete tests** in `rules.test.js`. `node rules.test.js` must stay green. Behaviour assertions (week-strip `neglected` *data*, manifest / service-worker version sync, splash skeleton, `touch-action:manipulation`, 16px fields, discard copy, draft persistence, typable steppers, and the rest) stay as they are.
- Keep `class="sk"` on the inline splash skeleton in `index.html`, and keep `id="ver"` on the footer version node. Tests read those.
- Keep `touch-action:manipulation` in `styles.css`. Keep `textarea` and `.libcard select` at `font-size:16px` (stops iOS focus-zoom).
- Keep pinch-zoom: do not add `user-scalable=no` or a maximum-scale under 5.
- WCAG 2.x AA on every text / control pairing in §2.1. Large text (18px+ or 14px+ bold) may use 3:1; body and UI text need 4.5:1. Non-text boundaries (current-cell outline, focus ring, selected effort) need 3:1 against the adjacent background.
- Gym targets are 48px minimum (prefer 56–64px for primary and stepper hit areas). The close control on `.inprog` is already corrected to 48px in a later rule in `styles.css` (`.inprog-x{width:48px;height:48px}`); delete the earlier `40px` rule so it cannot regress.
- Honour `prefers-reduced-motion: reduce` (already disables confetti, the record animation, skeleton pulse, and toast motion). Do not add new motion that ignores it.
- Git author for every commit: `124254214+Stocks84@users.noreply.github.com`.
- Ship as a **PR against `main` only**. Do not merge, do not push to `main`, do not deploy, and do not touch GitHub Pages settings, without Will's own words.
- After the PR exists, file the house-rule 11 handoff report (see §8). The `NOT CHECKED` line is required; do not omit it.

### Allowed behaviour tweaks (UI only)

These are in scope because they are how the approved mocks and the bugs below are fixed. They must not change stored data or `rules.js` return shapes.

1. Human `en-GB` dates in the UI (see §4). ISO strings may stay in storage and in `rules.js`.
2. Week-strip *presentation*: stop rendering the word "neglected" (and any scolding equivalent). `rules.weekStrip()` may still return `neglected: true` — tests assert that property. Only the CSS / copy changes.
3. Compact home cards (name, last chips, Next, trend) as in `home-390.png` / `home-1440.png`. Full Strong-style loggers belong in the in-progress workout UI (`logging-390.png`) and in the start-workout sheet.
4. Docked rest timer with a safe-area inset, and enough `body` padding that the last card is never hidden under the bar.
5. Sticky `Finish` in the start-workout `#dlg` sheet, and no doubled `.card` inside the dialog.
6. Self-hosted woff2 fonts, precached by the service worker, plus a cache / manifest version bump so those files are fetched (see §2.3). Recommended: `CACHE = 'wills-body-v19'` in `sw.js` and `"version": "1.19.0"` in `manifest.webmanifest`. The existing test requires the middle number of the manifest version to equal the `wills-body-vN` suffix.
7. `applyTheme()` / `applyShine()` must write the new `--bg` hex into `meta[name=theme-color]` (today they still write `#131519` / `#e9ecf0`). Shine on: `#000000` / `#FFFFFF`.

### Out of scope

- New exercises, new tabs, or invented IA (there is no Legs tab; keep Arms, Chest & Back, Shoulders, Bodyweight, Equipment).
- Switching icon sets (no Font Awesome, no emoji-as-icons). Keep the custom stroke SVGs in `app.js`.
- A backend, accounts, or a build step.
- Merging or deploying this PR.

## 1. Direction

A matte training notebook: graphite and chalk, one plate-rust accent, no chrome, no glass, no glow, no noise, no gradient type. Dark is the default. Light is a first-class theme, not an afterthought. Reduce shine stays a real high-contrast theme (black / white, thicker ink borders, the same rust primary — never a green recolour and never a polarity flip of the primary button).

The current "brushed metal" look in `styles.css` (`--brush`, `--bgrad`, `--cardg`, `--btng`, `--chrome`, `--hdrg`, `--edge`, `--rim`, `--shade`, `backdrop-filter`, `background-clip: text` on `h1`) is what this pass removes. The accent today is Tailwind `#22c55e` / `#15803d` (and `#4ade80` / `#166534` in Reduce shine). That green is banned.

## 2. Tokens: implement exactly in `styles.css`, then use only these

Set them on `:root` / `html` (dark default), `html[data-theme=light]`, `html[data-shine=reduced]`, and `html[data-shine=reduced][data-theme=light]`. The head script in `index.html` already applies `data-theme` and `data-shine` from `localStorage` (`willsBody.v1.theme`, `willsBody.v1.reduceShine`) before paint; if the shine key is `null`, it follows `prefers-contrast: more`. Keep that boot script, and point its fallback colours at the new `--bg` / `--txt` so the splash does not flash the old grey.

You may keep familiar variable *names* (`--bg`, `--card`, `--txt`, `--mut`, `--line`, `--acc`, `--input`, `--tbar`, `--warn`, `--bad`, `--btn`, `--chip`, `--ring`, `--on`) if that reduces churn, but the values below replace the current ones, and the metallic variables must go. Prefer also adding the clearer aliases `--ink`, `--mute`, `--surface`, `--raised`, `--acc-text`, `--on-acc` and mapping the old names onto them so existing selectors keep working during the sweep.

### 2.1 Colour

**Dark (default)**

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#14130F` | Page |
| `--card` / `--surface` | `#1C1B17` | Cards, dialog, header, nav, toast |
| `--btn` / `--raised` | `#27261F` | Raised chips, unselected tabs, fields, stepper wells, header buttons |
| `--line` | `#807C72` | All 1px edges (must hold ≥3:1 on bg, surface, and raised) |
| `--txt` / `--ink` | `#F4F0E6` | Primary text (chalk) |
| `--mut` / `--mute` | `#B7B2A6` | Secondary text, labels, captions |
| `--acc` | `#B8432F` | Solid primary fill (Start, Finish, selected tick). **Not** a text colour on dark — it is 3.19:1 on surface. |
| `--acc-text` | `#D4785A` | Accent used *as text or a 2px outline* on dark surfaces (Next numbers, selected effort outline, in-progress cue) |
| `--on` / `--on-acc` | `#F4F0E6` | Text and icon on `--acc` (and on `--danger`) |
| `--warn` | `#E0B15A` | Warning text |
| `--bad` | `#E07A6A` | Error / destructive *text* (distinct from `--acc-text`) |
| `--danger` | `#8B2A22` | Destructive *fill* (Discard). Chalk on this fill is 7.53:1. Do not use `--acc` for destructive actions. |
| `--ban-bg` | `#2A2418` | Warning banner ground |
| `--ban-txt` | `#E8C36A` | Warning banner text (9.12:1 on `--ban-bg`) |
| `--trend-2` | `#8A9BB0` | Second sparkline series (not Tailwind blue) |
| `--input` | `#27261F` | Field fill (= raised) |
| `--tbar` | `#1C1B17` | Timer bar fill (= surface) |
| `--chip` | `#27261F` | Chip fill (= raised) |
| `--ring` | `#F4F0E6` | Focus ring (= ink) |
| `--plan` | `#D4785A` | Alias of `--acc-text` (today "Next" numbers use `--plan`) |

**Light**

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F3F0E8` | Page |
| `--card` / `--surface` | `#FFFCF6` | Cards, dialog, header, nav, toast |
| `--btn` / `--raised` | `#EBE6DA` | Raised surfaces, fields, unselected tabs |
| `--line` | `#6F6C64` | 1px edges (≥3:1 on bg, surface, and raised) |
| `--txt` / `--ink` | `#1A1916` | Primary text |
| `--mut` / `--mute` | `#5E5A54` | Secondary text |
| `--acc` | `#B8432F` | Same primary fill as dark — **do not invert it** |
| `--acc-text` | `#B8432F` | Accent as text. 4.75:1 on bg, 5.28:1 on surface. **Do not place accent text on `--raised`** (4.34:1, fails AA). Put it on `--bg` or `--card` only. |
| `--on` / `--on-acc` | `#F4F0E6` | Text on `--acc` (chalk, not ink — this is the polarity bug) |
| `--warn` | `#5C4A1A` | Warning text |
| `--bad` | `#8B2A22` | Error / destructive text |
| `--danger` | `#8B2A22` | Destructive fill; chalk on fill |
| `--ban-bg` | `#F3E6C8` | Warning banner ground |
| `--ban-txt` | `#5C4A1A` | Warning banner text (6.93:1 on `--ban-bg`) |
| `--trend-2` | `#3A4A5C` | Second sparkline series |
| `--input` / `--tbar` / `--chip` | raised / surface / raised | Same mapping as dark |
| `--ring` | `#1A1916` | Focus ring (= ink) |
| `--plan` | `#B8432F` | Alias of `--acc-text` |

**Reduce shine (high-contrast theme, not a palette swap)**

Keep `html[data-shine=reduced]`. It is a first-class theme, not "dark but flatter". No shadows, no dim fills, 2px borders in ink / line, same `--acc` `#B8432F` primary in both polarities.

| Token | Shine + dark | Shine + light |
|---|---|---|
| `--bg`, `--card` / `--surface` | `#000000` | `#FFFFFF` |
| `--btn` / `--raised` / `--input` / `--chip` | `#151515` | `#F0F0F0` |
| `--line`, `--txt` / `--ink`, `--ring` | `#FFFFFF` | `#000000` |
| `--mut` / `--mute` | `#E2E2E2` | `#1F1F1F` |
| `--acc` | `#B8432F` | `#B8432F` |
| `--acc-text` / `--plan` | `#D4785A` | `#B8432F` |
| `--on` / `--on-acc` | `#F4F0E6` | `#F4F0E6` |
| `--warn` | `#E0B15A` | `#5C4A1A` |
| `--bad` | `#E07A6A` | `#8B2A22` |
| `--danger` | `#8B2A22` | `#8B2A22` |
| `--ban-bg` / `--ban-txt` | `#000000` / `#E0B15A` | `#FFFFFF` / `#5C4A1A` |
| `--trend-2` | `#8A9BB0` | `#3A4A5C` |
| `--tbar` | `#000000` | `#FFFFFF` |

Borders under Reduce shine are **2px** (`html[data-shine=reduced] button, … .card, dialog, .toast, .strip .cell, nav button { border-width:2px }`). Do not reintroduce `box-shadow` or `backdrop-filter` in this theme.

### 2.2 Measured contrast (WCAG 2.x)

Ratios computed from the sRGB relative-luminance formula. AA body text is 4.5:1; large / UI boundary is 3:1. "Fail as text" means do not use that pairing for glyphs or essential icons.

**Dark**

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#F4F0E6` ink | `#14130F` bg | 16.33:1 | Page text |
| `#F4F0E6` ink | `#1C1B17` surface | 15.14:1 | Card text |
| `#F4F0E6` ink | `#27261F` raised | 13.34:1 | Field / chip text |
| `#B7B2A6` mute | `#14130F` / `#1C1B17` / `#27261F` | 8.79 / 8.15 / 7.18:1 | Secondary text |
| `#807C72` line | `#14130F` / `#1C1B17` / `#27261F` | 4.46 / 4.14 / 3.65:1 | Edges (passes 3:1) |
| `#D4785A` acc-text | `#14130F` / `#1C1B17` / `#27261F` | 5.87 / 5.44 / 4.80:1 | Accent *text* on dark |
| `#B8432F` acc fill | `#1C1B17` surface | 3.19:1 | **Fail as text.** Fill only. |
| `#F4F0E6` on `#B8432F` | — | 4.75:1 | Primary button label |
| `#E0B15A` warn | `#14130F` / `#1C1B17` / `#27261F` | 9.39 / 8.70 / 7.67:1 | Warning text |
| `#E07A6A` bad | `#14130F` / `#1C1B17` / `#27261F` | 6.34 / 5.88 / 5.18:1 | Error text |
| `#F4F0E6` on `#8B2A22` | — | 7.53:1 | Discard label |

**Light**

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `#1A1916` ink | `#F3F0E8` / `#FFFCF6` / `#EBE6DA` | 15.44 / 17.17 / 14.12:1 | Text |
| `#5E5A54` mute | `#F3F0E8` / `#FFFCF6` / `#EBE6DA` | 6.01 / 6.69 / 5.50:1 | Secondary text |
| `#6F6C64` line | `#F3F0E8` / `#FFFCF6` / `#EBE6DA` | 4.60 / 5.12 / 4.21:1 | Edges |
| `#B8432F` acc / acc-text | `#F3F0E8` / `#FFFCF6` | 4.75 / 5.28:1 | Accent text on page or card |
| `#B8432F` on `#EBE6DA` raised | — | 4.34:1 | **Fail as text.** Do not put accent text on light raised. |
| `#F4F0E6` on `#B8432F` | — | 4.75:1 | Primary button label (same in light — do not switch to ink-on-light or chalk-on-dark-chrome) |
| `#5C4A1A` warn | `#F3F0E8` / `#FFFCF6` / `#EBE6DA` | 7.53 / 8.37 / 6.88:1 | Warning text |
| `#8B2A22` bad | `#F3F0E8` / `#FFFCF6` / `#EBE6DA` | 7.52 / 8.36 / 6.88:1 | Error text |

**Reduce shine**

| Pairing | Ratio |
|---|---|
| White on black, black on white (ink) | 21.00:1 |
| `#E2E2E2` mute on `#000000` / `#151515` | 16.21 / 14.10:1 |
| `#1F1F1F` mute on `#FFFFFF` / `#F0F0F0` | 16.48 / 14.46:1 |
| `#D4785A` acc-text on shine dark `#000000` / `#151515` | 6.63 / 5.77:1 |
| `#B8432F` acc-text on shine light `#FFFFFF` / `#F0F0F0` | 5.41 / 4.75:1 |
| `#B8432F` as *text* on shine dark `#000000` | 3.88:1 — **fail as text**, fill only (same rule as regular dark) |
| `#F4F0E6` on `#B8432F` | 4.75:1 — primary label in every theme |

Current-set / current-tab / current-week-cell outline is a **2px ink** (`--txt`) stroke. Ink on surface is well above 3:1 in every theme (dark 15.14, light 17.17, shine 21). Do not use a 1px mute line for "current".

### 2.3 Fonts (self-hosted woff2, no Google CDN)

The live app must not request fonts from `fonts.googleapis.com`, `fonts.gstatic.com`, or any other CDN. This is an offline-first PWA; a network font will fail in the gym.

Add three files under the app root (paths may sit in a `fonts/` folder):

- `fonts/barlow-condensed-600.woff2` — Barlow Condensed 600 (semi-bold)
- `fonts/source-sans-3-400.woff2` — Source Sans 3 400
- `fonts/source-sans-3-600.woff2` — Source Sans 3 600

Source them from the official upstream (Google Fonts GitHub or fontsource), subset if you like, and commit the SIL Open Font Licence (OFL) text next to them (`fonts/OFL.txt` or a short note in the README pointing at the bundled OFL). Do not convert through a random web tool that drops the licence.

`@font-face` in `styles.css` (all three), with `font-display: swap` and `font-style: normal`. Example:

```css
@font-face{
  font-family:"Barlow Condensed";
  font-style:normal;
  font-weight:600;
  font-display:swap;
  src:url("./fonts/barlow-condensed-600.woff2") format("woff2");
}
@font-face{
  font-family:"Source Sans 3";
  font-style:normal;
  font-weight:400;
  font-display:swap;
  src:url("./fonts/source-sans-3-400.woff2") format("woff2");
}
@font-face{
  font-family:"Source Sans 3";
  font-style:normal;
  font-weight:600;
  font-display:swap;
  src:url("./fonts/source-sans-3-600.woff2") format("woff2");
}
```

Optional `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html` for the two regular faces used on first paint (Source Sans 3 400 and Barlow Condensed 600). `crossorigin` is required for font preloads even on same origin.

**Service worker:** add the three woff2 URLs (and the OFL file only if you want it offline — not required) to the `SHELL` array in `sw.js`. Bump `CACHE` from `'wills-body-v18'` to `'wills-body-v19'` and set `manifest.webmanifest` `"version"` to `"1.19.0"` so the existing version-sync test passes and installed clients fetch the new fonts. Keep the cache-first behaviour; do not rewrite the worker into a different strategy.

Body stack: `"Source Sans 3", "Source Sans Pro", system-ui, sans-serif`. Display stack: `"Barlow Condensed", "Arial Narrow", sans-serif`. Every display / numeric use of Barlow Condensed also sets `font-variant-numeric: tabular-nums` (and `font-feature-settings: "tnum"` if you want a broader fallback).

### 2.4 Type scale

Floor is **13px**. Nothing in the UI is smaller, including legal-looking captions, week-cell labels, and tab labels.

| Use | Face | Size / line / weight | Where |
|---|---|---|---|
| Wordmark `h1` | Barlow Condensed | 28px / 32px / 600, tabular, `letter-spacing: 0.02em` | Header. Solid `--txt` fill. **No** `background-clip: text`, no gradient, no metallic shine. |
| Desktop session title | Barlow Condensed | 28px / 32px / 600, tabular | Right pane heading at ≥1024px |
| Screen / logger title | Barlow Condensed | 22px / 24px / 600, tabular | "Arms", workout heading inside the logger |
| Card exercise name | Barlow Condensed | 20px / 24px / 600, tabular | `.card` titles on home and in the logger |
| Rest timer digits `#timer .count` | Barlow Condensed | 44px / 48px / 600, tabular | Docked and floating timer |
| Stepper values, Previous column, kg / reps | Barlow Condensed | 20px / 24px / 600, tabular | Strong-style set rows |
| Section labels ("THIS WEEK", "NEXT", "SET", "KG", "REPS") | Source Sans 3 | 13px / 16px / 600, `letter-spacing: 0.06em`, `text-transform: uppercase` | Overlines and column headers |
| Tab labels `nav button` | Barlow Condensed | 13px / 16px / 600, `white-space: nowrap`, **no hyphenation** | `Arms`, `Chest & Back`, `Shoulders`, `Bodyweight`, `Equipment` — these fit at 360 and 390 without shortening "Equipment" to "Equip" and without soft hyphens |
| Body, dialog copy, notes | Source Sans 3 | 16px / 24px / 400 | Default `body` |
| Primary / ghost button labels | Source Sans 3 | 16px / 24px / 600 | `button.primary`, `button.ghost` |
| Chips, meta, last-session sentence, footer | Source Sans 3 | 13px / 16px / 400 (600 for emphasis) | `#stats`, week line, `.chip`, `#ver` |
| Suggestion / Next note | Source Sans 3 | 14px / 20px / 400 | `.sugg`, the line under Next |

Do not use italic as a substitute for mute, and do not introduce a third family.

### 2.5 Spacing, radius, borders, elevation, motion

- **Grid:** 4 / 8. Allowed steps: 4, 8, 16, 24, 32, 40, 48. No 10 / 12 / 14 / 18 / 20 padding (20 appears only as a *type* line-height, not as a spacing token). Card padding is 16px. Section gaps are 16 or 24. The home header row is 16px padding; the docked timer has 24px vertical inset plus `env(safe-area-inset-bottom)` (see §5).
- **Radius:** 8px for cards, dialogs, primary / ghost buttons, tabs, the timer bar, and the start-workout sheet. 4px for chips, text fields, stepper wells, and week cells. Not the current 12px / 16px mix, and not fully pill-shaped primaries (`border-radius: 999px` is banned).
- **Borders:** 1px `solid var(--line)` on cards, fields, ghost buttons, unselected tabs, and week cells. 2px `solid var(--txt)` (ink) for the *current* tab, the *current* week cell, the *current* set row / kg / reps cell, and the focus ring. 2px `solid var(--acc-text)` for a selected effort. Under Reduce shine, every chrome border is 2px (see §2.1).
- **Elevation:** none. No `box-shadow`, no `--shade`, no gradient faux-bevel. Separation is background + border only. `body` is a flat `--bg`. Cards sit on `--card` with a 1px `--line`.
- **Focus:** `outline: 2px solid var(--ring); outline-offset: 2px`. On a primary fill, the ring is still ink (or chalk in dark) so it remains visible against rust. Do not use a coloured glow.
- **Motion:** no new decorative motion. Existing short colour / opacity transitions (≤150ms, `ease`) may stay. `@media (prefers-reduced-motion: reduce)` already zeroes the record animation, skeleton pulse, toast animation, and confetti; keep those guards. Do not add `backdrop-filter` transitions or shimmer.

### 2.6 Components (selectors that already exist)

Restyle these in place. Do not invent a component library.

- **`button.primary`** (Start workout, Finish, save actions): solid `--acc` `#B8432F`, label and icon `--on-acc` `#F4F0E6`, radius 8px, height 56–64px, width 100% in a single column, Source Sans 3 600 16px. This value set is **identical** in dark, light, and both Reduce-shine polarities. Today light and shine reassign `--chrome` so the primary becomes a dark (or green) slab with inverted type — that is the polarity bug, and it is forbidden.
- **`button.ghost`** and toolbar icon buttons (`#themeBtn`, `#shineBtn`, `#floatBtn`, close): transparent or `--raised` fill, 2px (icon buttons: 1px, 2px in shine) `--line` border, `--txt` icon, 48×48px minimum. No bevel, no `backdrop-filter`.
- **Destructive** (`[data-act=discard]`, delete-type actions): `--danger` fill, `--on-acc` label. Not `--acc`, not Tailwind red.
- **`nav` tabs** (`#tabs[role=tablist] nav button[aria-selected]`): row of five, radius 8px, 48px min height, Barlow Condensed 13px nowrap. Selected: `--raised` fill + **2px ink outline**. Unselected: transparent + 1px `--line`. The selected outline must remain visible next to the week strip and the header.
- **`.card`**: `--card` fill, 1px `--line`, 8px radius, 16px padding. No `--cardg`, no `--rim`, no `--shade`. Compact on home (see §5).
- **`.chip`**: `--raised`, 4px radius, 13px Source Sans 3, mute or ink text. Used for last-set summaries (`3×11`, `20kg`).
- **`.banner` / `.plan`**: banner uses `--ban-bg` / `--ban-txt`. "Next" target uses Barlow Condensed 20px tabular in `--acc-text` (on `--card` or `--bg`, never on light `--raised`).
- **`.sugg`**: 14px / 20px mute body. Let the suggestion wrap; do not truncate with ellipsis. On the 1440 two-pane, the suggestion stays inside the left column's card width.
- **Effort `.eff button`**: three equal columns (`flex: 1; min-width: 0`), 48px min height, 2px border in *every* state (transparent or `--line` when idle, `--acc-text` when `.on`) so a selected 2px border cannot overflow the card. No `width: 33.33%` plus gap plus an extra selected border — that overflowed "Tough" on the 1440 mock and must not return. Do not fill a selected effort with green (`--on` is no longer `#163d26`).
- **`.tick` / `.tick.on`**: 48×48px hit target. On: `--acc` fill, `--on-acc` check (custom stroke, not an emoji). Off: 1px `--line` on `--raised`.
- **Steppers `.step` / `.step-in`**: minus / value / plus. Value is a typable input (do not regress the typable-stepper tests), Barlow Condensed 20px tabular, 48px tall controls. The value cell of the *current* set uses the 2px ink outline (see current-cell rule in §5).
- **`.toast`**: surface + 1px line, 8px radius, no shadow. Reduced-motion already disables its animation.
- **`#dlg` / `dialog`**: surface, 1px line, 8px radius, `width: min(560px, 94vw)`. `::backdrop` is a simple dim (`rgb(0 0 0 / 0.6)`), not a blur. **Do not also apply `.card` styles inside it** (see §5 bug fix).
- **`.toolbar` / footer `#ver`**: mute 13px. Version string is still filled from `manifest.webmanifest` by the existing fetch in `app.js`.
- **`.inprog` banner**: in-progress workout cue at the top of home. Use `--acc-text` / surface, not Tailwind green. Close button `.inprog-x` stays 48×48px.

### 2.7 Remove (old tokens, utilities, and effects)

Delete the variables and the rules that exist only to serve them:

- `--brush`, `--bgrad`, `--cardg`, `--btng`, `--chrome`, `--chrome-txt`, `--hdrg`, `--edge`, `--rim`, `--shade`, `--navbg`
- Any `backdrop-filter`
- The gradient `h1` wordmark (`background-clip: text` / `-webkit-text-fill-color: transparent` / `--brush`)
- Chrome bevels, inner highlights, noise overlays, and glow / `box-shadow` "shine"
- Hard-coded Tailwind greens and their friends, including but not limited to `#22c55e`, `#15803d`, `#4ade80`, `#166534`, `#16a34a`, `#163d26`, and the confetti colours `#f472b6`, `#facc15`, `#38bdf8` (confetti is removed, see §2.8)
- Body / header background images or layered gradients; `body` is flat `--bg`

A PR is not done if a repo-wide search still finds `--brush`, `--bgrad`, `backdrop-filter`, `background-clip:\s*text`, or `#22c55e`.

### 2.8 Confetti on a personal record: REMOVE (decided by Will, 13 Nov 2026)

Will decided: "Remove the confetti". Delete the `.confetti` burst from `app.js`, along with its CSS, its palette (`#22c55e`, `#f472b6`, `#facc15`, `#38bdf8`) and any reduced-motion rule that only exists for it. A personal record keeps its existing non-confetti feedback (for example the record badge or toast), restyled to the matte tokens. Add no replacement animation.

## 3. Icons

Keep the custom 24×24 stroke SVGs already drawn in `app.js` (`IP`, `ic()`, and the `ICONS` map: arms dumbbell, chest-back barbell, shoulders press, bodyweight jump, equipment bike). They use `currentColor`, `stroke-width: 2`, and round caps / joins.

- Do **not** switch to Font Awesome, Material, Lucide, or emoji used as icons.
- Recolour only through `currentColor` so they follow `--txt` / `--on-acc`.
- Header theme / shine / more-menu controls stay as these strokes (or equally simple custom strokes), 48×48 hit targets.
- Do not add filled "glossy" icon treatments.

## 4. Copy rules

- **No "neglected" wording** in the UI, CSS class-as-label, `aria-label`, title tooltip, or banner. The week model in `rules.js` may still compute `neglected`; do not surface that word. Prefer a neutral week line, for example: `Last session Wed 30 Sep · 44 days ago` plus optional quiet counts (`2 sessions this week`). Empty state: `0 sessions in the last 30 days` — not `0 in 30d · 0%`.
- **Dates are human `en-GB`**, not machine ISO. `2026-09-30` is a Wednesday, so the correct string is `Wed 30 Sep` (or `Wednesday 30 September` in long form). Week ranges in the weekly report use `9–15 Nov`, not `2026-11-09 → 2026-11-15` (the ISO form currently wraps mid-date in the dialog). Apply one helper in `app.js` (e.g. `fmtDate(iso, {weekday, month, day})`) to: the tab-head last session, `Last:` lines, last-session buttons, history rows, trend range, the weekly report title, and "Same as last time". Leave storage and `rules.js` on ISO.
- **Tab labels** are the real IA, unshortened and unhyphenated: `Arms`, `Chest & Back`, `Shoulders`, `Bodyweight`, `Equipment`. Remove any soft hyphen (`\u00AD` / `&shy;`) that `app.js` currently injects to force wraps. `white-space: nowrap` + Barlow Condensed 13px is the wrap strategy; it must fit at 360px and 390px.
- **Primary labels:** `Start workout` on home; `Finish` on the start-workout sheet (short enough not to wrap beside Close — today's `Finish workout` wraps). Discard / close copy already has test coverage; do not rewrite those strings in a way that breaks the tests.
- Sentence case. No exclamation-mark pep talk. No new marketing voice.

## 5. Screens

Match the v2 PNGs. Widths below are CSS pixels.

### Home, 390 × 844 (mock: `docs/design/matte/mocks/home-390.png`)

Single column, content width = viewport minus 16px side padding. Order:

1. Header: wordmark `Will's Body` (Barlow Condensed 28 / 32, solid chalk), then a 48×48 shine button and a 48×48 theme button. Streak / session meta sits as a quiet 13px sentence under the title or in a single mute line — not as chrome pills.
2. Week line: the last-session sentence from §4, then the existing five-day `.strip` if you keep it. Cells are 4px radius, 1px `--line`. **`.strip .cell.cur` (2px ink outline) must be declared last, or at higher specificity than `.neglected` / `.lvl1` / `.lvl2` / `.lvl3`**, so a "today" cell never loses its current outline. (Today, `.neglected` is declared later and wins.) Empty cells show `—` or `0`, never "neglected".
3. `#tabs` with the five short nowrap labels. Selected tab = 2px ink outline.
4. Compact `.card`s, one per exercise in the selected routine: name, last-set chips, a "Next" target in `--acc-text`, a one-line trend or cue. No Strong-style steppers on the idle home card.
5. A full-width `button.primary` **Start workout** after the cards (or docked just above the safe area when no timer is showing).
6. Optional `.sugg` ("Try …") and the in-progress `.inprog` banner when a draft exists, using `--acc-text`, not green.
7. Footer `#ver`.

At 360px and 390px: no truncated card titles, no hyphenated tabs, no horizontal overflow. If a long exercise name must wrap, it wraps to two lines of Barlow Condensed 20 / 24 — it does not ellipsis mid-word.

### Logging, 390 × 844 (mocks: `docs/design/matte/mocks/logging-390.png`, `logging-390-light.png`)

This is the in-progress workout UI (home with an active draft, and the same rows inside the start-workout sheet).

- Strong-style rows: columns `Set` · `Previous` · `kg` · `Reps` · tick. Column headers are 13px uppercase Source Sans 3 600. Row height 56px. Previous is a mute, tabular, right-aligned memory of the last session (`20×11`), not an editable field. Pending reps (not yet typed) use a 16×2 mute bar (a clean dash — the typographic `—` in Barlow Condensed read as a weak hyphen in Paper and must not return).
- The **current** kg or reps cell carries the 2px ink outline, and that outline wins over hover, last-set, and completed-tick states.
- Effort row as specified in §2.6, under the sets, with Good / Tough / Easy (keep the existing labels if tests mention them).
- Notes field: 16px Source Sans 3, 4px radius, `--input` fill, 1px `--line`.
- **Docked rest timer** (`#timer` / `.timer`): `position: fixed; left: 0; right: 0; bottom: 0; z-index: 9`. Bar height is content + **24px padding-top + 24px padding-bottom + `env(safe-area-inset-bottom, 0px)`**. Flat `--tbar` (`--card`) fill, 1px `--line` on the top edge only, no float-shadow, no chrome. Digits `#timer .count` are 44px Barlow Condensed tabular. `#skipBtn`, ±15 (`.adj`), and `#floatBtn` are 48px targets. The floating variant (`.timer.float`, `FLOAT_KEY`) may stay, restyled matte, and must include safe-area insets on the bottom / right when floated.
- **`body` padding-bottom** (and the scroll container's padding) must be at least the docked bar's total height, including the safe-area inset, whenever the timer is visible. Today's `padding-bottom: 160px` is not enough: while scrolling, and at the end of the list, the fixed `#timer` covers the last card. When the timer is hidden, drop back to a 24px + safe-area footer inset.
- Light-theme logging is the same structure with the light tokens. The primary / Finish button does not change colour polarity (see §2.6 and the bug list).

### Home, 1440 × 900 — two-pane from 1024px (mock: `docs/design/matte/mocks/home-1440.png`)

- Breakpoint: `@media (min-width: 1024px)`. Below that, the 390 single column just gets wider, still capped.
- A centred shell: `max-width: 1120px; margin-inline: auto; padding-inline: 24px`. The page must **not** stretch to the full 1440px viewport (no full-bleed header, no stretched steppers).
- Two panes in a row: left list ~480px, right logger + timer ~600px, gap 32–40px. Top edges of the two panes align (wordmark / session title on one baseline).
- Left: header, week line, tabs, compact exercise cards, suggestion (wraps inside the column).
- Right: session title, Strong-style logger for the selected / in-progress exercise, effort, notes, and the rest timer **in document flow** at the bottom of the right pane (not `position: fixed` on a wide screen — a fixed bottom bar on a 1440 display is what we are getting away from). If the timer must remain a single component, at ≥1024px switch it from `fixed` to static / sticky inside the right pane and clear the extra `body` padding-bottom.
- Primary Start / Finish lives at the bottom of the right pane.

### Start-workout sheet (`#dlg`, opened by Start workout)

- One dialog, surface + 1px line, 8px radius. A short sticky header with the routine name and Close.
- Scrollable list of Strong-style loggers for the session.
- **Sticky `Finish`** (`#qSave`) at the bottom of the dialog (or a sticky footer), always visible without scrolling past notes. Label: `Finish`. Today's flow appends `#qSave` at the very end of a long `draw()`, so Finish is buried; move it.
- `#qCancel` stays a ghost / mute control.
- The weekly report and any other `#dlg` content: **do not wrap `reportCard()` (already a `.card.report`) inside `#dlg` that is also painted as a card**. That doubles the border. Either `#dlg` has no card chrome and the inner card is the only one, or `reportCard` used inside the dialog renders a bare body (no `.card` box). Pick one and apply it to every dialog body.

### Claude's bugs — required fixes

These were found on the live v1.18.0 app and are part of this pass, not a later polish.

1. **ISO dates wrap in the weekly report** (and other surfaces). Use the §4 `en-GB` helper. The report title `2026-11-09 → 2026-11-15` must become a compact `9–15 Nov` (year only if it spans a year). History, trend, "Last:", and tab-head dates follow the same helper.
2. **Doubled card inside the dialog.** `#dlg` is already a card (`background`, border, radius). `openReport()` injects `reportCard()`, which is itself a `.card.report`. Drop one of the two boxes (see above).
3. **Timer covers the last card.** `#timer` is `position: fixed; z-index: 9`. `body` padding-bottom of 160px is not enough once the bar includes controls and a safe-area inset. Size the padding from the actual bar height, and re-check with the last exercise card scrolled into view and with a notched safe area (`env(safe-area-inset-bottom)` of 34px as a test).
4. **Light theme (and Reduce shine) flip the primary button.** `button.primary` currently follows `--chrome`, which becomes a dark slab in light and a green / high-contrast invert in shine. Primary is always `#B8432F` with `#F4F0E6` type.

## 6. Banned (anything here = not done)

- `--brush`, `--bgrad`, `--cardg`, `--btng`, `--chrome`, `--chrome-txt`, `--hdrg`, `--edge`, `--rim`, `--shade`, `--navbg`
- `backdrop-filter`, `background-clip: text` (and `-webkit-background-clip: text`) on the wordmark or any other type
- Noise textures, glow, inner bevels, gradient fills on chrome, `box-shadow` used as elevation
- Tailwind `#22c55e` and the green family listed in §2.7, including Reduce-shine `#4ade80` / `#166534`
- Google Fonts CDN (or any webfont CDN). No `@import` of fonts, no `fonts.googleapis.com` `<link>`
- Font Awesome (or any icon font) as a replacement for the custom strokes
- Hyphenation or soft hyphens in tab labels; shortening `Equipment` to `Equip`
- The word "neglected" (or a scolding synonym) in user-visible copy, `aria-label`, or on-screen class text
- Primary-button polarity flip in light or Reduce shine
- Pill primaries (`border-radius: 999px`), 40px `.inprog-x`, text smaller than 13px
- Changing `rules.js` progression, storage, or import / export behaviour to "make the UI easier"
- Merging the PR, pushing to `main`, or deploying GitHub Pages without Will's own words
- Paper MCP calls as part of implementation (the mocks are already exported)

## 7. Process

Suggested branch: `feat/matte-redesign` from `main` at `a9a3cc3`. PR only.

Suggested commit order (keep the author as `124254214+Stocks84@users.noreply.github.com` on every commit):

1. **Fonts + tokens + SW bump.** Add the woff2 files and OFL, `@font-face`, the four theme blocks in `styles.css`, `theme-color` + splash colours in `index.html` / `applyTheme` / `applyShine`, `sw.js` `SHELL` + `wills-body-v19`, manifest `1.19.0`.
2. **Strip metallic chrome.** Remove the §2.7 variables and rules; flatten `body`, `h1`, `.card`, `dialog`, `button.primary`, header, nav.
3. **Home chrome and copy.** Compact cards, week line without "neglected", `.cur` outline winning, human dates, nowrap tabs, no SHY.
4. **Logger + timer.** Strong-style rows, effort overflow fix, docked timer + safe-area, `body` padding that actually clears the bar, two-pane ≥1024px centred at 1120.
5. **Start-workout sheet and dialogs.** Sticky `Finish`, dialog / `reportCard` double-border, weekly report dates.
6. **Sweep.** Grep the bans, remove confetti (§2.8), update `README.md` screenshots / theme-colour mentions if they still show chrome or green, run `node rules.test.js`.

Do not open follow-up issues as a way to defer a §6 ban. If something in this spec is genuinely blocked, say so in the PR and in the handoff report rather than silently shipping the old look.

## 8. Done when

- The four theme blocks match §2.1 and the contrast table in §2.2 holds on the shipped CSS (spot-check primary label, mute on raised, line on raised, acc-text on surface, accent text *not* used on dark fill or on light raised).
- Repo search is clean for `#22c55e`, `--brush`, `--bgrad`, `backdrop-filter`, `background-clip: text`, `fonts.googleapis.com`, `fonts.gstatic.com`, and user-visible `neglected`. Soft hyphens are gone from tab labels.
- Fonts are woff2 under the app, `@font-face` uses `font-display: swap`, OFL is present, and `sw.js` precaches the woff2 files on the bumped `wills-body-v19` / manifest `1.19.0`.
- Custom stroke icons remain; no icon font was added.
- Screens match the v2 PNGs in structure: home 390 and 1440 (two-pane, centred, max 1120), logging with Strong rows, docked timer with safe-area inset, start-workout sheet with sticky Finish, week line without "neglected", short nowrap tabs, current-cell outline winning.
- The four Claude bugs are fixed (§5).
- Hit targets are ≥48px. No truncation or hyphenation of tabs or exercise names at **360** and **390**. No horizontal stretch or overflow at **1440**. Capture screenshots at 360, 390, and 1440 (dark home + logging; light logging; Reduce shine home) and attach them to the PR.
- Offline still works: with the service worker claimed, a hard-offline reload serves the shell *and* the three fonts (no fallback-to-system flash caused by a cache miss on the woff2 files, beyond the intended `font-display: swap` on first ever visit).
- `node rules.test.js` is green (all 114 tests, plus any you add; do not drop any).
- Git author is the noreply address. The change is on a PR against `main`. Nothing has been merged or deployed.

**Ask for the house-rule 11 handoff report** when the PR is ready, sent to Will and Willow, below the DONE / NEEDS WILL / NO ACTION tag, in this shape (approved 13 Nov 2026). Only list a check under CHECKS RUN if it actually ran; anything untested goes under NOT CHECKED — that line is required and must not be left out:

```
PROJECT: repo and branch
PULL REQUEST: link (or not created)
PREVIEW: link or how to open it (or unavailable)
BUILT: what changed, in plain words
CHECKS RUN: what ran and the result
NOT CHECKED: what nobody tested (e.g. real phone, live data, safe-area on a notched device, offline on an installed PWA)
KNOWN ISSUES: list, or none
COST / USAGE: where to see it; never guess a number
NEXT DECISION: exactly what Will needs to say yes or no to
```

`NEXT DECISION` should include: merge / deploy of this PR (default is no).

## 9. Open questions for Will

1. **Confetti on a PR** — DECIDED: remove it (Will, 13 Nov 2026). See §2.8.
2. **Who implements this.** Design is the taste-keeper and wrote this spec. No existing Willow project bot (Willow, NomadPro, Lakshmi, Career, DraftedCV, Social Sips, Viking Saga) is recorded as owning Stocks84/wills-body. DECIDED: Will said "Willow should queue the Will's Body PR" (13 Nov 2026), so Willow queues the Cursor PR.

When those are answered, do not treat an agent's "approved" as approval to merge or deploy. Wait for Will's own words.
