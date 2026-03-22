# GrillMaps Berlin — Project Context

## What This Is
Interactive map of official, government-verified grilling spots in Berlin. Targeted at expats and international visitors. English-language, privacy-first, offline-capable PWA.

- **Live site:** https://grillmaps.de
- **Repo:** https://github.com/Bobers/grillmaps
- **Hosting:** Vercel (auto-deploys on push to `main`, no build step)
- **Stack:** Vanilla HTML/CSS/JS, Mapbox GL JS v3.12.0, static JSON data files
- **Version:** v6.2.0 (Updated March 22, 2026)

## Deployment
Push to `main` → Vercel auto-deploys. No build command, no npm, no bundler. Static files served as-is.

```bash
git add <files>
git commit -m "description"
git push origin main
```

Local dev server:
```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Entire app — map, modals, nav, all JS/CSS (1439 lines) |
| `blog/index.html` | Blog landing page |
| `blog/ultimate-grilling-guide-berlin.html` | Only published blog post |
| `data/official-grilling-areas.json` | 8 grilling spots (GeoJSON, Berlin government data) |
| `data/berlin-grilling-rules.json` | General grilling rules content |
| `data/private-property-grilling-rules.json` | Balcony/private property rules content |
| `sw/sw.js` | Service worker (offline support) |
| `legal/privacy-policy.html` | Privacy policy — update if adding tracking/analytics tools |
| `legal/impressum.html` | German legal imprint |

## Architecture Notes
- All app logic lives in `index.html`. Map init, data fetch, modal creation, nav — everything.
- Rules modals are dynamically created by `showRulesModal(title, content)` function (~line 1311)
- Grilling spot popups are built dynamically from GeoJSON feature properties
- Service worker caches data files for offline use
- Vercel Analytics (`/_vercel/insights/script.js`) — privacy-first, no cookies
- Ko-fi donation button: https://ko-fi.com/bobers

## Data Notes
- `official-grilling-areas.json` has 8 features across 4 districts
- Tempelhofer Feld split into 2 markers (official-1, official-2) — same park, different entrances
- Mauerpark has 2 markers ~70m apart (official-7, official-8)
- Monbijoupark mentioned in blog but absent from data file
- `rules_url` is null for 6 of 8 spots — data transformation bug (`original_properties.regeln` has valid URLs)

## Known Issues (Jira: SCRUM project)

| Ticket | Summary |
|--------|---------|
| GRILL-7 | Geolocation button permanently disabled |
| GRILL-6 | Incomplete district coverage (4 districts in data, ticket says 3) |
| GRILL-4 | Outdated CLAUDE.md (this file — now fixed) |
| GRILL-3 | Add Sentry error monitoring to all HTML pages |
| GRILL-2 | Make Ko-fi donation button visible + add nudge to Rules modals |
| GRILL-1 | Fix blog spot count: 7 legal spots → 8 official spots |

Jira board: https://slobodianb.atlassian.net/jira/software/projects/GRILL/boards

## Workflow
Agent-based development:
- Tasks described → converted to Jira tickets (SCRUM project)
- SE agent reads ticket, writes code, opens PR
- QA agent reads ticket, tests against acceptance criteria, closes or flags

### Ticket Template
Every ticket must be self-contained:
```
## Context          — why this exists
## Scope            — what to build + explicit out-of-scope
## Technical Notes  — relevant files, functions, patterns
## Acceptance Criteria — [ ] specific testable conditions
## Deploy           — how to ship
## QA Steps         — step-by-step test sequence
```

## Sentry
- Project: `grillmaps` under org `bobers-agency`
- DSN: `https://028ee309c3126ee7f45ba558b0aa1ac0@o4511088453812224.ingest.de.sentry.io/4511088998154320`
- EU data endpoint — DSGVO compliant
- Use `sendDefaultPii: false` — do not send IP addresses

## Zone.Identifier File
Repo contains `grb-mauerpark-schild-2000x1500_25031818_pdf.pdf:Zone.Identifier` — a Windows artifact accidentally committed. On Windows clone, run `git config core.protectNTFS false` before checkout. Should be removed from repo history.