# GrillMaps Berlin - Technical Documentation

**Version:** 6.0.0  
**Last Updated:** January 2025  
**Tech Stack:** PWA + Vanilla JavaScript + Mapbox GL JS + Vercel

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [PWA Implementation](#pwa-implementation)
4. [Data Management](#data-management)
5. [Map Implementation](#map-implementation)
6. [UI/UX Components](#uiux-components)
7. [Performance Optimizations](#performance-optimizations)
8. [Deployment](#deployment)
9. [Development Workflow](#development-workflow)
10. [Maintenance](#maintenance)

---

## 🎯 Project Overview

### Problem Statement
Berlin expats need a reliable, authoritative source for legal grilling locations without navigating complex government websites or relying on outdated information.

### Solution
Progressive Web App (PWA) providing:
- **Interactive map** with verified grilling locations
- **Offline functionality** for reliable access
- **Mobile-first design** optimized for on-the-go usage
- **Authoritative content** manually verified and curated

### Key Features
- ✅ **PWA Installation** - Works as native mobile app
- ✅ **Offline Maps** - Cached for offline access
- ✅ **Dual Visualization** - Markers + polygon boundaries
- ✅ **Location Services** - Find nearby grilling spots
- ✅ **Performance Optimized** - 90+ Lighthouse scores
- ✅ **Cross-Platform** - iOS, Android, Desktop compatible

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **HTML5** - Semantic markup with PWA meta tags
- **CSS3** - Custom properties, flexbox, responsive design
- **Vanilla JavaScript** - No frameworks, modern ES6+ features
- **Mapbox GL JS v3.12.0** - Interactive mapping

#### PWA Features
- **Service Worker** - Offline caching and background sync
- **Web Manifest** - App installation metadata
- **IndexedDB** - Client-side data storage
- **Push Notifications** - Ready for implementation

#### Infrastructure
- **Vercel** - Static hosting with edge functions
- **GitHub** - Version control and CI/CD
- **Mapbox** - Map tiles and geocoding services

### Project Structure
```
grillmaps/
├── index.html              # Main application entry point
├── manifest.json           # PWA manifest configuration
├── vercel.json            # Deployment configuration
├── CLAUDE.md              # Development commands reference
├── data/                  # Data files
│   ├── official-grilling-areas.json    # Primary location data
│   ├── locations.json                  # Legacy/fallback data
│   └── berlin-districts*.json          # District boundary data
├── icons/                 # PWA icons and graphics
│   ├── icon-*.svg        # App icons (various sizes)
│   ├── favicon.svg       # Browser favicon
│   └── shortcut-*.svg    # PWA shortcut icons
├── sw/                    # Service Worker files
│   ├── service-worker.js # Main service worker
│   └── offline.html      # Offline fallback page
├── scripts/              # Data processing scripts
│   ├── fetch-official-grilling-data.js
│   ├── generate-pwa-icons.cjs
│   └── update-official-bbq-data.js
└── docs/                 # Documentation (this folder)
    ├── README.md         # This file
    ├── ARCHITECTURE.md   # Detailed architecture
    ├── PWA.md           # PWA implementation details
    └── API.md           # API and data documentation
```

---

## 📱 PWA Implementation

### Service Worker Features

#### Caching Strategy
- **Cache-First** for static assets (HTML, CSS, JS, icons)
- **Network-First** for data files with cache fallback
- **Offline-First** for map tiles and user interactions

#### Cached Resources
```javascript
const CORE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/official-grilling-areas.json',
  '/sw/offline.html',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg'
];
```

#### Background Sync
- **Offline data synchronization** when connection restored
- **Failed request retry** for data updates
- **Cache invalidation** for outdated content

### Web Manifest Configuration

#### Installation Prompts
- **Automatic prompt** after 2+ visits
- **Manual install button** always available
- **Custom installation UI** with app benefits

#### App Shortcuts
- **Find Nearby Spots** - Quick location-based search
- **Favorites** - Access saved locations (planned)

#### Platform Integration
- **iOS** - Apple touch icons, status bar styling
- **Android** - Material Design theme colors
- **Desktop** - Window controls and menu integration

---

## 🗺️ Map Implementation

### Mapbox Integration

#### Configuration
```javascript
// Environment-aware token management
const isLocalDev = window.location.hostname === 'localhost';
mapboxgl.accessToken = isLocalDev 
    ? 'pk.local_dev_token'     // Unrestricted for development
    : 'pk.production_token';   // Domain-restricted for production
```

#### Map Initialization
- **Center:** Berlin coordinates (13.4050, 52.5200)
- **Zoom Level:** 11 (city overview)
- **Style:** Mapbox Streets v11
- **Controls:** Navigation, geolocation enabled

### Dual Visualization System

#### Polygon Overlays
```javascript
// Semi-transparent fill for grilling areas
'fill-color': '#22c55e',
'fill-opacity': 0.2

// Solid border outline
'line-color': '#16a34a',
'line-width': 2,
'line-opacity': 0.8
```

#### Center Markers
- **Icon:** 🔥 Fire emoji for visibility
- **Positioning:** Calculated polygon centroid
- **Interaction:** Click for detailed popup

#### Benefits
- **Polygon boundaries** show exact grilling area limits
- **Center markers** provide easy visual identification
- **Dual clickable** - both trigger same popup content

### Geometry Processing

#### Polygon Centroid Calculation
```javascript
// Handle MultiPolygon and Polygon geometries
const bounds = new mapboxgl.LngLatBounds();
processCoords(location.geometry.coordinates);
centerCoords = bounds.getCenter();
```

#### Coordinate Systems
- **Input:** GeoJSON (WGS84)
- **Display:** Web Mercator projection
- **Precision:** 8 decimal places for accuracy

---

## 💾 Data Management

### Data Sources

#### Primary: Official Berlin WFS
- **Source:** Senatsverwaltung für Stadtentwicklung
- **Format:** GeoJSON FeatureCollection
- **Update Frequency:** Monthly verification
- **License:** dl-zero-de/2.0

#### Data Structure
```json
{
  "type": "FeatureCollection",
  "generator": "official-berlin-wfs",
  "generated": "2025-01-31T10:00:00Z",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [[[lon, lat], ...]]
      },
      "properties": {
        "name": "Location name",
        "description": "Detailed description",
        "bezirk": "District name"
      }
    }
  ]
}
```

### Data Processing Pipeline

#### Automated Updates
- **Fetch Script:** `scripts/fetch-official-grilling-data.js`
- **Validation:** Geometry and property validation
- **Transformation:** Coordinate system normalization
- **Caching:** Service worker and browser cache updates

#### Manual Curation
- **Verification:** Physical location visits
- **Enhancement:** Expat-specific information
- **Quality Control:** Accuracy and completeness checks

---

## 🎨 UI/UX Components

### Design System

#### Color Palette
```css
:root {
  --primary-color: #22c55e;      /* Green - nature/grilling */
  --primary-dark: #16a34a;       /* Dark green - accents */
  --background-color: #f5f5f5;   /* Light gray - background */
  --surface-color: #ffffff;      /* White - cards/surfaces */
  --text-primary: #111827;       /* Dark gray - main text */
  --text-secondary: #6b7280;     /* Medium gray - secondary text */
}
```

#### Typography
- **Font Stack:** System fonts (-apple-system, Segoe UI, Roboto)
- **Hierarchy:** H1 (1.5rem) → Body (1rem) → Small (0.9rem)
- **Weight:** Regular (400), Medium (500), Semibold (600), Bold (700)

### Component Architecture

#### Bottom Navigation
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  background: var(--surface-color);
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}
```

**Features:**
- **4 main sections:** Map, Favorites, Nearby, Settings
- **Active state styling** with color and background
- **Touch-friendly targets** (44px minimum)
- **Icon + label design** for clarity

#### Loading States
- **Skeleton loader** with animated spinner
- **Progress indication** for data loading
- **Error boundaries** with retry options
- **Connection status** indicator

#### Map Popups
- **Responsive design** adapts to screen size
- **Rich content** with structured information
- **Close button** and background dismiss
- **Performance optimized** single popup instance

### Responsive Design

#### Breakpoints
- **Mobile:** < 768px (primary focus)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

#### Mobile Optimizations
- **Touch gestures** for map interaction
- **Thumb-friendly navigation** at bottom
- **Reduced motion** support for accessibility
- **Viewport handling** prevents zoom issues

---

## ⚡ Performance Optimizations

### Core Web Vitals Targets
- **LCP:** < 2.5s (Largest Contentful Paint)
- **FID:** < 100ms (First Input Delay)  
- **CLS:** < 0.1 (Cumulative Layout Shift)
- **FCP:** < 1.8s (First Contentful Paint)

### Optimization Strategies

#### Resource Loading
```html
<!-- Critical resource preloading -->
<link rel="preload" href="/data/official-grilling-areas.json" as="fetch" crossorigin>
<link rel="preload" href="/icons/icon-192x192.svg" as="image">
```

#### Caching Strategy
```javascript
// Vercel headers for optimal caching
"/data/(.*)": "Cache-Control: public, max-age=300",      // 5 min
"/icons/(.*)": "Cache-Control: public, max-age=31536000" // 1 year
```

#### Code Splitting
- **Critical CSS** inlined in HTML
- **Non-critical JavaScript** loaded asynchronously
- **Progressive enhancement** for advanced features

#### Image Optimization
- **SVG icons** for scalability and small size
- **WebP format** for screenshots (planned)
- **Responsive images** with appropriate sizing

### Bundle Size Analysis
- **HTML + CSS + JS:** ~45KB gzipped
- **Total with icons:** ~65KB gzipped
- **Mapbox GL JS:** ~500KB (cached by CDN)
- **Data payload:** ~22KB (official grilling areas)

---

## 🚀 Deployment

### Vercel Configuration

#### Build Settings
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ]
}
```

#### Security Headers
- **CSP:** Content Security Policy for XSS protection
- **HSTS:** HTTP Strict Transport Security
- **X-Frame-Options:** Clickjacking protection
- **X-Content-Type-Options:** MIME sniffing protection

#### PWA-Specific Routes
```json
{
  "src": "/sw/service-worker.js",
  "headers": {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "Service-Worker-Allowed": "/"
  }
}
```

### Deployment Pipeline

#### Branches
- **main:** Production deployment (grillmaps.vercel.app)
- **development:** Feature development and testing
- **feature/*:** Individual feature branches

#### CI/CD Process
1. **Push to branch** triggers Vercel preview deployment
2. **Pull request** generates preview URL for testing
3. **Merge to main** deploys to production
4. **Automatic performance audits** with Lighthouse

### Environment Configuration

#### Development
```bash
# Local development server
python3 -m http.server 8000 --bind 0.0.0.0

# Access: http://localhost:8000 or http://[IP]:8000
```

#### Production
- **Domain:** grillmaps.vercel.app
- **HTTPS:** Automatic SSL/TLS certificates
- **CDN:** Global edge network deployment
- **Analytics:** Vercel Web Analytics integration

---

## 🔧 Development Workflow

### Prerequisites
- **Node.js** (for build tools)
- **Python 3** (for local server)
- **Git** (for version control)
- **Mapbox account** (for API tokens)

### Local Development

#### Setup
```bash
# Clone repository
git clone https://github.com/Bobers/grillmaps.git
cd grillmaps

# Start development server
python3 -m http.server 8000 --bind 0.0.0.0

# Open in browser
open http://localhost:8000
```

#### Environment Tokens
- **Development:** Unrestricted Mapbox token for localhost
- **Production:** Domain-restricted token for security
- **Token switching:** Automatic based on hostname detection

### Code Standards

#### JavaScript
- **ES6+ features** for modern browser support
- **Async/await** for asynchronous operations
- **Const/let** instead of var
- **Template literals** for string interpolation
- **Arrow functions** for concise syntax

#### CSS
- **Custom properties** for theming
- **Flexbox/Grid** for layout
- **Mobile-first** responsive design
- **BEM-like naming** for components

#### HTML
- **Semantic elements** for accessibility
- **Progressive enhancement** approach
- **Performance-optimized** resource loading

### Testing Checklist

#### Functionality
- [ ] Map loads and displays correctly
- [ ] All markers and polygons visible
- [ ] Popups show correct information
- [ ] Bottom navigation works
- [ ] Location services functional

#### PWA Features
- [ ] Service worker registers successfully
- [ ] App installable on mobile devices
- [ ] Offline functionality works
- [ ] Cache invalidation working
- [ ] Update notifications appear

#### Performance
- [ ] Lighthouse score 90+ all categories
- [ ] Core Web Vitals within targets
- [ ] No console errors
- [ ] Fast loading on 3G networks

#### Cross-Platform
- [ ] iOS Safari compatibility
- [ ] Android Chrome functionality
- [ ] Desktop browser support
- [ ] Various screen sizes work

---

## 🛠️ Maintenance

### Regular Tasks

#### Weekly
- [ ] **Monitor performance** via Vercel analytics
- [ ] **Check error logs** for issues
- [ ] **Verify map functionality** with test devices
- [ ] **Update location data** if changes reported

#### Monthly
- [ ] **Data refresh** from official Berlin sources
- [ ] **Performance audit** with Lighthouse
- [ ] **Security review** of dependencies
- [ ] **User feedback review** and implementation

#### Quarterly
- [ ] **Major feature planning** and implementation
- [ ] **Technology stack updates** (Mapbox, etc.)
- [ ] **Content strategy review** and expansion
- [ ] **Analytics deep dive** for optimization

### Monitoring & Alerts

#### Performance Monitoring
- **Vercel Analytics** for Core Web Vitals
- **Real User Monitoring** via service worker
- **Error tracking** in console logs
- **Uptime monitoring** for critical endpoints

#### Data Quality Monitoring
- **Automated data validation** in processing scripts
- **Manual verification** of new locations
- **User report handling** for corrections
- **Backup data sources** for redundancy

### Troubleshooting Guide

#### Common Issues

**Map not loading:**
- Check Mapbox token configuration
- Verify internet connection
- Check browser console for errors
- Confirm token domain restrictions

**PWA not installing:**
- Verify HTTPS deployment
- Check manifest.json validity
- Confirm service worker registration
- Test on supported browsers

**Performance degradation:**
- Audit with Lighthouse
- Check network requests
- Review cache strategy
- Optimize resource loading

**Data inconsistencies:**
- Validate data source format
- Check processing scripts
- Verify coordinate systems
- Update cache after data changes

---

## 📚 Additional Resources

### Documentation
- [PWA Implementation Details](./PWA.md)
- [Architecture Deep Dive](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

### External References
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Berlin Open Data Portal](https://daten.berlin.de/)

### Development Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web App Manifest Validator](https://manifest-validator.appspot.com/)
- [Service Worker Testing](https://developers.google.com/web/tools/workbox)

---

**GrillMaps Berlin** - Comprehensive PWA documentation for efficient development and maintenance.  
*Version 6.0.0 - January 2025*