# GrillMaps Project Commands

## Essential Commands

### After Making Updates
```bash
# ALWAYS UPDATE VERSION FIRST (in index.html header)
# Then run after making changes
git add .
git commit -m "Description of changes"
git push origin main
```

### IMPORTANT RULE
**ALWAYS UPDATE THE VERSION NUMBER** in index.html header after every change:
- Find: `<div style="font-size: 0.75rem; opacity: 0.8; margin-top: 0.25rem;">v5.1.0`
- Update: Increment version (v5.1.0 → v5.1.1 for fixes, v5.2.0 for features, v6.0.0 for major changes)

### Development Workflow
```bash
# Start local development server
python -m http.server 8000
# Or alternative:
npx serve .

# View local site
open http://localhost:8000
```

### Testing & Validation
```bash
# Check git status
git status

# View recent changes
git diff

# Check deployment status
git log --oneline -5
```

### Project Structure
```
grillmaps/
├── index.html          # Main application
├── data/               # Data files
│   ├── locations.json  # Manual locations
│   ├── bbq-areas.json  # BBQ area polygons
│   └── berlin-districts-nominatim.json  # District data
├── vercel.json         # Deployment config
└── CLAUDE.md           # This file
```

### Important Notes
- **Always commit and push after changes** - this deploys to live site
- Local server required for development (not file://)
- Mapbox token is configured in index.html
- Live site: https://grillmaps.vercel.app

### Quick Deploy Command
```bash
# One-liner for commit and push
git add . && git commit -m "Update: $(date)" && git push origin main
```