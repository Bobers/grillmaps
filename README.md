# Official Berlin Grilling Areas

An interactive map showing official government-designated grilling areas in Berlin.

## Overview

This application displays the official grilling zones authorized by the Berlin government, sourced directly from the Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin.

## Features

- **Official Data Only** - Shows only government-approved grilling areas
- **Interactive Map** - Click areas for detailed information
- **Mobile-Friendly** - Responsive design for all devices
- **Authoritative Source** - Data from Berlin's official WFS service
- **Real-time Information** - Fee requirements, reservation needs, and rules

## Data Source

- **Provider**: Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin
- **Source**: https://daten.berlin.de/datensaetze/grillflachen-wms-aaeff7f1
- **License**: dl-zero-de/2.0
- **Coverage**: Currently includes grilling areas in:
  - Tempelhof-Schöneberg
  - Charlottenburg-Wilmersdorf
  - Friedrichshain-Kreuzberg

## Live Demo

Visit the live application: [Official Berlin Grilling Areas](https://grillmaps.vercel.app)

## Technologies Used

- Mapbox GL JS for interactive mapping
- Official Berlin WFS (Web Feature Service) data
- Vanilla HTML, CSS, and JavaScript
- Deployed on Vercel

## Local Development

1. Clone this repository
2. Mapbox token is already configured in `index.html`
3. Open `index.html` in your browser or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

## Updating Official Data

To fetch the latest official data:
```bash
cd scripts
node fetch-official-grilling-data.js
```

## Important Note

According to Berlin regulations: "In öffentlichen Parks und Grünanlagen ist das Grillen grundsätzlich verboten" (Grilling is generally prohibited in public parks and green spaces) except in the specifically designated areas shown on this map.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

Always check current local regulations before grilling. Fire bans may be in effect during dry periods. This application provides official information for convenience but users should verify current rules.