# GrillMaps Project Commands

## Essential Commands

### Git Commands (When Ready to Deploy)
```bash
# Optional: Update version in index.html header first
# When you're ready to save changes:
git add .
git commit -m "Description of changes"

# When you're ready to deploy to live site:
git push origin main
```

### Version Update Guidelines
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
- **Push to deploy** - `git push` deploys changes to the live site
- Local server required for development (not file://)
- Mapbox token is configured in index.html
- Live site: https://grillmaps.vercel.app

### Quick Commands
```bash
# Save changes locally (doesn't deploy)
git add . && git commit -m "Update: $(date)"

# Deploy to live site when ready
git push origin main
```