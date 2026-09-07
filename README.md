# Nancy Ansah-Addo — PhD Website

**"Leadership Across Boundaries"** — an animated, interactive personal research site
for Nancy Ansah-Addo, first-year PhD student in Psychology at the University of Alberta
(Rast Lab — Group Processes & Leadership) and Personnel Selection Officer in the
Canadian Armed Forces. Pure HTML/CSS/JS. No build step.

**Theme switch:** light "daylight dossier" (default) ⇄ dark "night ops", via the sun/moon
button in the nav. The choice persists in `localStorage` (`naa-theme`).

## Sections & deep links

The site is a single page with hash-based routing, so every section has a stable,
bookmarkable deep link that works on **any** GitHub Pages URL:

| Section | Deep link |
|---|---|
| Home / Hero | `#/` |
| About (Personnel Dossier) | `#/about` |
| Research (Mission Bulletin) | `#/research` |
| Publications (filterable) | `#/publications` |
| Experience (Operations Timeline) | `#/experience` |
| Teaching | `#/teaching` |
| Contact (Comms Node) | `#/contact` |
| Collaboration Requests | `#/collaborations` |

Extra: publications also accept a filter hint, e.g. `#/publications?filter=thesis`.

## Files

```
index.html                  — markup for all views
assets/css/site.css         — full theme (light default + dark, HUD chrome, animations)
assets/js/main.js           — router, neural canvas, typewriter, tilt, form, theme, easter eggs
assets/img/portrait.jpg     — dossier ID-card portrait
assets/img/hero-wide.jpg    — cinematic hero band
assets/img/int-branch.png   — OPTIONAL: official branch insignia (see below)
```

## Branch insignia

The CAF service card and About dossier show an inline SVG stand-in crest. To display the
official insignia instead, save it as `assets/img/int-branch.png` (square, ~512px) — the
site layers it automatically over the fallback, no code changes needed.

Dependencies: Google Fonts (Space Grotesk, IBM Plex Mono, Inter). Everything else is
hand-rolled vanilla JS — no frameworks, no build.

## Deploy to GitHub Pages (2 minutes)

1. Create a repo (e.g. `phd-website`) and copy these files to the repo root.
2. Commit and push to the `main` branch.
3. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** · folder **/** (root)
4. Wait ~1 minute. Your site is live at:
   - `https://<username>.github.io/phd-website/` — project site, or
   - `https://<username>.github.io/` — if you name the repo `<username>.github.io`

Deep links work with no extra config (`…/#/research`, `…/#/publications`, …).

## Local preview

```bash
cd "/path/to/PhD Website"
python3 -m http.server 8080
# open http://localhost:8080/
```

## Customising

- **Contact details / CV link** — search `main.js` (`SITE.email`) and `index.html` for
  `ansahaddonancy`, `nam184`, `306-807` to update emails/phone.
- **Publications** — edit the `.paper` cards in `index.html`; add `data-cat="paper|thesis|talk"`.
- **Colors** — tweak `:root` tokens in `assets/css/site.css`.
- **Reduce motion** — the site fully honours `prefers-reduced-motion` (canvas, boot,
  reveals and cursor effects are disabled).

## Easter eggs

- Type `declassify` anywhere, or triple-click the `N. ANSAH-ADDO` brand → stamp overlay.
- Every click fires a sonar ping. Crosshair cursor tracks interactive elements on desktop.

© Nancy Ansah-Addo — leadership across boundaries.
