# GrillMaps Berlin - Architecture Documentation

**Technical Deep Dive into System Design and Implementation**

---

## 🏗️ System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER DEVICES                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Mobile    │  │   Tablet    │  │   Desktop   │        │
│  │   (PWA)     │  │   (Web)     │  │   (Web)     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL CDN                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Static    │  │   Edge      │  │   Global    │        │
│  │   Assets    │  │   Cache     │  │   Network   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   PWA APPLICATION                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Service   │  │   Main      │  │   Cache     │        │
│  │   Worker    │  │   Thread    │  │   Storage   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Mapbox    │  │   Berlin    │  │   GitHub    │        │
│  │   API       │  │   Open Data │  │   Repo      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action → PWA Interface → Service Worker → Cache/Network → Mapbox API → Display Update
     ↑                                    ↓
     └──────── Background Sync ←──────────┘
```

---

## 🧩 Core Components

### 1. PWA Shell Architecture

#### Application Shell
```javascript
// Core shell components that are cached aggressively
const APP_SHELL = [
  '/index.html',           // Main application HTML
  '/manifest.json',        // PWA manifest
  '/sw/service-worker.js', // Service worker
  '/icons/*'               // All PWA icons
];
```

**Purpose:** Instant loading of UI structure while content loads

**Benefits:**
- Fast initial paint
- Consistent performance
- Offline capability
- Native app-like experience

#### Progressive Enhancement
```
Basic HTML → CSS Styling → JavaScript Features → PWA Features
    ↓              ↓              ↓              ↓
  Always        Fast Load    Interactive    App-like
  Works         Experience   Features       Experience
```

### 2. Data Layer Architecture

#### Data Source Hierarchy
```
1. Service Worker Cache (Instant)
    ↓ (if miss)
2. Browser Network Request (Fresh)
    ↓ (if fail)
3. Local Storage Fallback (Stale but functional)
    ↓ (if empty)
4. Embedded Fallback Data (Always available)
```

#### Data Flow Pattern
```javascript
async function loadLocationData() {
  try {
    // 1. Try network first for fresh data
    const response = await fetch('./data/official-grilling-areas.json');
    const data = await response.json();
    
    // 2. Cache successful response
    await cacheData(data);
    return data.features;
    
  } catch (networkError) {
    // 3. Fallback to cache
    const cachedData = await getCachedData();
    if (cachedData) return cachedData;
    
    // 4. Last resort: embedded data
    return EMBEDDED_FALLBACK_LOCATIONS;
  }
}
```

### 3. Map Rendering Architecture

#### Dual Visualization System
```
Mapbox GL JS Base Map
    ↓
Polygon Layer (GeoJSON Source)
    ├── Fill Layer (Semi-transparent)
    └── Stroke Layer (Border outline)
    ↓
Marker Layer (Custom DOM Elements)
    ├── Fire emoji icons
    └── Click handlers
    ↓
Popup Layer (Dynamic content)
```

#### Layer Management
```javascript
// Layer rendering order (bottom to top)
const LAYER_ORDER = [
  'mapbox-base-map',      // Mapbox streets layer
  'grilling-areas-fill',  // Semi-transparent polygons
  'grilling-areas-border', // Polygon borders
  'center-markers',       // Fire emoji markers
  'popup-overlay'         // Information popups
];
```

### 4. Service Worker Architecture

#### Cache Strategy Implementation
```javascript
// Multi-tier caching strategy
const CACHE_STRATEGIES = {
  'static-assets': 'cache-first',     // HTML, CSS, JS, Icons
  'api-data': 'network-first',        // Location data, fresh preferred
  'map-tiles': 'cache-first',         // Mapbox tiles, long-lived
  'user-data': 'cache-only'           // Offline user preferences
};
```

#### Background Processing
```
Main Thread                Service Worker Thread
     │                           │
     │ ──── API Request ──────→   │
     │                           │ ── Network Fetch ──→ [Server]
     │                           │ ← Response ─────────── [Server]
     │                           │
     │                           │ ── Cache Update ──→ [Cache]
     │ ←── Cached Data ─────────  │
     │                           │
     │                           │ ── Background Sync ──→ [Queue]
```

---

## 🗺️ Map Implementation Deep Dive

### Geometry Processing Pipeline

#### 1. Data Ingestion
```javascript
// Input: Official Berlin WFS GeoJSON
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "MultiPolygon",
      "coordinates": [
        [[[lon1, lat1], [lon2, lat2], ...]]
      ]
    },
    "properties": { "name": "...", "bezirk": "..." }
  }]
}
```

#### 2. Centroid Calculation
```javascript
// Algorithm: Bounding box center calculation
function calculatePolygonCentroid(coordinates) {
  const bounds = new mapboxgl.LngLatBounds();
  
  // Recursive coordinate processing
  function processCoords(coords) {
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
      // Terminal coordinates array
      coords.forEach(coord => bounds.extend(coord));
    } else {
      // Nested arrays (MultiPolygon structure)
      coords.forEach(nested => processCoords(nested));
    }
  }
  
  processCoords(coordinates);
  return bounds.getCenter();
}
```

#### 3. Dual Rendering
```javascript
// Render order ensures proper layering
async function renderMapLayers(map, locations) {
  // 1. Add polygon source
  map.addSource('grilling-areas', {
    type: 'geojson',
    data: createGeoJSONFromLocations(locations)
  });
  
  // 2. Add fill layer (bottom)
  map.addLayer({
    id: 'grilling-areas-fill',
    type: 'fill',
    source: 'grilling-areas',
    paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.2 }
  });
  
  // 3. Add border layer (middle)
  map.addLayer({
    id: 'grilling-areas-border', 
    type: 'line',
    source: 'grilling-areas',
    paint: { 'line-color': '#16a34a', 'line-width': 2 }
  });
  
  // 4. Add marker layer (top)
  locations.forEach(location => {
    const marker = new mapboxgl.Marker(createMarkerElement())
      .setLngLat(calculatePolygonCentroid(location.geometry.coordinates))
      .addTo(map);
  });
}
```

### Interaction Handling

#### Event Propagation
```
User Click
    ↓
Hit Testing (determine what was clicked)
    ├── Polygon clicked → Show popup at click coordinates
    ├── Marker clicked → Show popup at marker coordinates  
    └── Map clicked → Close existing popups
    ↓
Popup Management (ensure single popup instance)
    ↓
Content Rendering (location-specific information)
```

#### Performance Optimizations
- **Single popup instance** to prevent memory leaks
- **Event delegation** for efficient event handling
- **Debounced interactions** for smooth user experience
- **Lazy loading** of popup content

---

## 📱 PWA Implementation Details

### Service Worker Lifecycle

#### Registration Flow
```javascript
// Main thread registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw/service-worker.js')
    .then(registration => {
      console.log('SW registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', handleUpdate);
    });
}
```

#### Cache Management Strategy
```javascript
// Version-based cache invalidation
const CACHE_NAME = 'grillmaps-v6.0.0';

// Install: Cache core resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});
```

### Offline Strategy Implementation

#### Network-First with Cache Fallback
```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/data/')) {
    // Data requests: Network first, cache fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request);
        })
    );
  }
});
```

#### Cache-First for Static Assets
```javascript
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request.url)) {
    // Static assets: Cache first
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // Not in cache, fetch and cache
          return fetch(event.request)
            .then(response => {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
              return response;
            });
        })
    );
  }
});
```

---

## 🎯 Performance Architecture

### Loading Strategy

#### Critical Rendering Path
```
1. HTML Parse Start
    ↓
2. CSS Parse (inlined critical styles)
    ↓
3. First Paint (shell visible)
    ↓
4. JavaScript Execution
    ↓
5. Service Worker Registration
    ↓
6. Data Fetch (parallel with map init)
    ↓
7. Map Initialization
    ↓
8. Content Paint (map + data visible)
    ↓
9. Interactive (all features ready)
```

#### Resource Prioritization
```html
<!-- Critical resources loaded first -->
<link rel="preload" href="/data/official-grilling-areas.json" as="fetch" crossorigin>
<link rel="preload" href="/icons/icon-192x192.svg" as="image">

<!-- Non-critical resources loaded later -->
<link rel="prefetch" href="/sw/offline.html">
```

### Memory Management

#### Popup Instance Management
```javascript
// Prevent memory leaks with single popup instance
let currentPopup = null;

function showPopup(location, coordinates) {
  // Close existing popup
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  
  // Create new popup
  currentPopup = new mapboxgl.Popup()
    .setLngLat(coordinates)
    .setHTML(createPopupContent(location))
    .addTo(map);
}
```

#### Event Listener Cleanup
```javascript
// Proper cleanup on component destruction
function cleanupMapEventListeners() {
  map.off('click', 'grilling-areas-fill', handlePolygonClick);
  map.off('mouseenter', 'grilling-areas-fill', handleMouseEnter);
  map.off('mouseleave', 'grilling-areas-fill', handleMouseLeave);
}
```

### Bundle Optimization

#### Code Splitting Strategy
```javascript
// Critical path: Immediate execution
const criticalFeatures = [
  'mapInitialization',
  'dataLoading', 
  'basicInteractions'
];

// Deferred: Load after initial render
const deferredFeatures = [
  'advancedMapControls',
  'analyticsTracking',
  'pushNotifications'
];
```

---

## 🔐 Security Architecture

### Content Security Policy
```http
Content-Security-Policy: 
  default-src 'self' https:; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com; 
  style-src 'self' 'unsafe-inline' https://api.mapbox.com; 
  img-src 'self' data: blob: https:; 
  connect-src 'self' https://api.mapbox.com https://events.mapbox.com;
```

### Token Management
```javascript
// Environment-based token selection
const getMapboxToken = () => {
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
                     
  return isLocalDev 
    ? 'pk.local_unrestricted_token'    // Development only
    : 'pk.production_domain_restricted'; // Production
};
```

### Data Validation
```javascript
// Input validation for external data
function validateLocationData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }
  
  if (!Array.isArray(data.features)) {
    throw new Error('Missing features array');
  }
  
  data.features.forEach((feature, index) => {
    if (!feature.geometry || !feature.geometry.coordinates) {
      throw new Error(`Invalid geometry in feature ${index}`);
    }
  });
  
  return true;
}
```

---

## 📊 Monitoring & Analytics Architecture

### Performance Monitoring
```javascript
// Core Web Vitals tracking
function trackPerformanceMetrics() {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });
  
  // First Input Delay
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  }).observe({ entryTypes: ['first-input'] });
}
```

### Error Tracking
```javascript
// Global error handling
window.addEventListener('error', (event) => {
  console.error('JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
```

### Service Worker Monitoring
```javascript
// Service worker status tracking
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_UPDATED') {
    console.log('Cache updated:', event.data.payload);
  }
});

// Performance tracking
self.addEventListener('fetch', (event) => {
  const startTime = performance.now();
  
  event.respondWith(
    handleRequest(event.request)
      .then(response => {
        const duration = performance.now() - startTime;
        console.log(`Request ${event.request.url}: ${duration}ms`);
        return response;
      })
  );
});
```

---

## 🔄 Update & Deployment Architecture

### Continuous Deployment Pipeline
```
GitHub Push
    ↓
Vercel Build Trigger
    ↓
Static Asset Generation
    ↓
Service Worker Cache Invalidation
    ↓
Global CDN Distribution
    ↓
Client Update Notification
```

### Version Management
```javascript
// Semantic versioning for cache management
const VERSION = {
  major: 6,    // Breaking changes
  minor: 0,    // New features
  patch: 0     // Bug fixes
};

const CACHE_NAME = `grillmaps-v${VERSION.major}.${VERSION.minor}.${VERSION.patch}`;
```

### Client Update Strategy
```javascript
// Graceful update handling
navigator.serviceWorker.addEventListener('controllerchange', () => {
  // New service worker has taken control
  showUpdateNotification();
});

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div class="update-notification">
      Update available! 
      <button onclick="location.reload()">Refresh</button>
    </div>
  `;
  document.body.appendChild(notification);
}
```

---

## 🔮 Scalability Considerations

### Performance Scaling
- **CDN caching** for static assets
- **Service worker caching** for dynamic content
- **Image optimization** for faster loading
- **Code splitting** for reduced bundle size

### Data Scaling
- **Pagination** for large datasets
- **Spatial indexing** for efficient queries
- **Lazy loading** for off-screen content
- **Background sync** for offline updates

### Feature Scaling
- **Modular architecture** for easy feature addition
- **Plugin system** for third-party integrations  
- **API abstraction** for service swapping
- **Configuration management** for environment differences

---

**GrillMaps Berlin** - Detailed architecture documentation for technical understanding and system maintenance.  
*Version 6.0.0 - January 2025*