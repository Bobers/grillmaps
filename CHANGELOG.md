# GrillMaps Berlin — Changelog

## v6.4.0 — 2026-03-22

### Added
- Ko-fi button in header now uses brand color `#FF5E5B` — clearly visible against green background (GRILL-2)
- Ko-fi support nudge added to footer of both Rules modals (General Rules + Private Property) (GRILL-2)

### Tickets closed
- GRILL-2: Ko-fi visibility + Rules modal nudge

---

## v6.3.0 — 2026-03-22

### Security
- Hardened CSP headers in `vercel.json` — replaced `default-src *` wildcard with explicit allowlist, removed `unsafe-eval` (GRILL-9)
- Added `escapeHtml()` to `index.html` — applied to all GeoJSON popup data and rules modal JSON; `booking_url` validated to http/https only (GRILL-10)

### Deferred
- SRI hashes for CDN scripts (GRILL-11) — needs testing pipeline before shipping
- Mapbox token domain restriction — caused production outage, needs careful rollout

### Tickets closed
- GRILL-9: CSP hardening
- GRILL-10: XSS escaping

---

## v6.2.0 — 2026-03-22

### Added
- Sentry error monitoring on all 7 HTML pages (`@sentry/browser` 10.45.0)
  - EU endpoint (`ingest.de.sentry.io`) — DSGVO compliant
  - `sendDefaultPii: false` — no IP addresses sent
  - Release tracking (`release: "6.2.0"`) — errors tagged to deploy version
  - Instrumented: data fetch failure (`official-grilling-areas.json`) and Mapbox map errors in `index.html`
- Sentry section added to Privacy Policy (section 4.3)
- Sentry GitHub integration configured:
  - Repository: `Bobers/grillmaps`
  - Code mappings: stack trace root → repo root
  - Resolve in Next Release enabled
  - All sync options enabled (GitHub ↔ Sentry bidirectional)
- Press release archive (`data/press-release-log.json`) — 11 grilling-related entries from all 12 Berlin districts, 2022–2026

### Fixed
- CLAUDE.md rewritten with accurate project context (was referencing v5.1.0)

### Tickets closed
- GRILL-3: Sentry error monitoring
- GRILL-4: Outdated CLAUDE.md
- GRILL-8: Press release archive scrape

---

## v6.1.0 — 2025-06-21

Base version at start of active development session. Existing features:
- Interactive map of 8 official Berlin grilling spots (4 districts)
- PWA with offline support (service worker)
- Vercel Analytics (privacy-first, no cookies)
- Blog with one published post (ultimate grilling guide)
- Legal pages (privacy policy, impressum, terms of service)
- Ko-fi donation button
- Mapbox GL JS v3.12.0
