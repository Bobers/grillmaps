# GrillMaps Berlin - API & Data Documentation

**Data Sources, Formats, and Processing Scripts Reference**

---

## 📊 Data Overview

### Primary Data Sources

#### 1. Official Berlin WFS Service
- **Provider**: Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin
- **Source URL**: https://daten.berlin.de/datensaetze/grillflachen-wms-aaeff7f1
- **License**: dl-zero-de/2.0 (Open Government License)
- **Format**: GeoJSON FeatureCollection
- **Update Frequency**: Quarterly (verified monthly)
- **Coverage**: Government-designated grilling areas

#### 2. OpenStreetMap Data
- **Source**: Overpass API
- **License**: ODbL (Open Database License)
- **Usage**: District boundaries, park information
- **Update Frequency**: Real-time via Overpass API

---

## 🗃️ Data Formats

### Official Grilling Areas Format

#### File: `/data/official-grilling-areas.json`

```json
{
  "type": "FeatureCollection",
  "generator": "official-berlin-wfs",
  "generated": "2025-06-04T16:43:56.348Z",
  "source": "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin",
  "license": "dl-zero-de/2.0",
  "attribution": "© Geoportal Berlin / Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen",
  "count": 6,
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          [[[longitude, latitude], [longitude, latitude], ...]]
        ]
      },
      "properties": {
        "name": "Grilling area name",
        "district": "District name (e.g., Tempelhof-Schöneberg)",
        "address": "Physical address or location description",
        "official_id": "Unique identifier from Berlin system",
        "grill_type": "Type of grilling permitted",
        "access_type": "public/private access level",
        "fee_required": true/false,
        "reservation_required": true/false,
        "rules_url": "URL to official rules (if available)",
        "booking_url": "URL for reservations (if applicable)",
        "authority": "Managing authority/organization",
        "data_source": "official_berlin_wfs",
        "last_updated": "YYYY-MM-DD",
        "verification_status": "official/verified/pending"
      }
    }
  ]
}
```

#### Properties Schema

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Official area name |
| `district` | string | ✅ | Berlin district name |
| `address` | string | ✅ | Physical address/location |
| `official_id` | string | ✅ | Berlin system ID |
| `grill_type` | string | ❌ | Type of grilling allowed |
| `access_type` | string | ❌ | Access level (public/private) |
| `fee_required` | boolean | ❌ | Whether fees apply |
| `reservation_required` | boolean | ❌ | Advance booking required |
| `rules_url` | string/null | ❌ | Link to official rules |
| `booking_url` | string/null | ❌ | Link for reservations |
| `authority` | string | ❌ | Managing organization |
| `data_source` | string | ✅ | Data source identifier |
| `last_updated` | string | ✅ | Last update date (YYYY-MM-DD) |
| `verification_status` | string | ✅ | Verification level |

### District Boundaries Format

#### File: `/data/berlin-districts-*.json`

```json
{
  "type": "FeatureCollection",
  "source": "OpenStreetMap via Overpass API",
  "generated": "2025-06-04T12:00:00Z",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[longitude, latitude], ...]]
      },
      "properties": {
        "name": "District name",
        "name_en": "English name",
        "type": "boundary",
        "admin_level": "9",
        "population": 123456,
        "area_km2": 45.67
      }
    }
  ]
}
```

---

## 🔧 Data Processing Scripts

### Core Scripts

#### 1. Fetch Official Data
**File**: `scripts/fetch-official-grilling-data.js`

```javascript
// Usage
node scripts/fetch-official-grilling-data.js

// Purpose
// - Fetches latest data from Berlin WFS service
// - Validates geometry and properties
// - Transforms to standardized GeoJSON format
// - Updates /data/official-grilling-areas.json
```

**Process Flow:**
1. Connect to Berlin WFS endpoint
2. Fetch all grilling area features
3. Validate coordinate systems (WGS84)
4. Transform MultiPolygon geometries
5. Extract and normalize properties
6. Write to data file with metadata

#### 2. Update BBQ Data
**File**: `scripts/update-official-bbq-data.js`

```javascript
// Usage
node scripts/update-official-bbq-data.js

// Purpose
// - Updates existing data with new information
// - Preserves manual enhancements
// - Merges official data with local improvements
```

#### 3. District Data Processing
**File**: `scripts/fetch-real-districts.js`

```javascript
// Usage
node scripts/fetch-real-districts.js

// Purpose
// - Fetches Berlin district boundaries from OSM
// - Uses Overpass API for current data
// - Processes complex boundary geometries
```

### Data Validation

#### Geometry Validation
```javascript
function validateGeometry(feature) {
  const { geometry } = feature;
  
  // Check geometry type
  if (!['Polygon', 'MultiPolygon'].includes(geometry.type)) {
    throw new Error(`Invalid geometry type: ${geometry.type}`);
  }
  
  // Validate coordinates
  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    throw new Error('Missing or invalid coordinates');
  }
  
  // Check coordinate format [longitude, latitude]
  function validateCoords(coords) {
    if (typeof coords[0] !== 'number' || typeof coords[1] !== 'number') {
      throw new Error('Invalid coordinate format');
    }
    
    // Berlin longitude range: ~13.0 - 13.8
    // Berlin latitude range: ~52.3 - 52.7
    if (coords[0] < 13.0 || coords[0] > 13.8 || coords[1] < 52.3 || coords[1] > 52.7) {
      console.warn('Coordinates outside Berlin area:', coords);
    }
  }
  
  return true;
}
```

#### Property Validation
```javascript
function validateProperties(properties) {
  const required = ['name', 'district', 'address', 'official_id', 'data_source', 'last_updated', 'verification_status'];
  
  for (const field of required) {
    if (!properties[field] || typeof properties[field] !== 'string') {
      throw new Error(`Missing required property: ${field}`);
    }
  }
  
  // Validate Berlin districts
  const validDistricts = [
    'Charlottenburg-Wilmersdorf',
    'Friedrichshain-Kreuzberg',
    'Lichtenberg',
    'Marzahn-Hellersdorf',
    'Mitte',
    'Neukölln',
    'Pankow',
    'Reinickendorf',
    'Spandau',
    'Steglitz-Zehlendorf',
    'Tempelhof-Schöneberg',
    'Treptow-Köpenick'
  ];
  
  if (!validDistricts.includes(properties.district)) {
    console.warn('Unknown district:', properties.district);
  }
  
  // Validate data source
  const validSources = ['official_berlin_wfs', 'manual_curation', 'osm_data'];
  if (!validSources.includes(properties.data_source)) {
    console.warn('Unknown data source:', properties.data_source);
  }
  
  return true;
}
```

---

## 🌐 External APIs

### Mapbox GL JS API

#### Configuration
```javascript
// Token management
const isLocalDev = window.location.hostname === 'localhost';
mapboxgl.accessToken = isLocalDev 
  ? 'pk.development_token'    // Unrestricted for localhost
  : 'pk.production_token';    // Domain-restricted for security

// Map initialization
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [13.4050, 52.5200], // Berlin center
  zoom: 11,
  minZoom: 10,
  maxZoom: 18
});
```

#### Usage Tracking
- **Monthly quota**: 50,000 map loads
- **Current usage**: ~5,000 loads/month
- **Rate limiting**: Handled by service worker caching

### Berlin Open Data Portal

#### WFS Endpoint
```
Base URL: https://gdi.berlin.de/services/wfs/grillflaechen
Service: WFS (Web Feature Service)
Version: 1.1.0
Format: GeoJSON
Projection: EPSG:4326 (WGS84)
```

#### Request Example
```javascript
const wfsUrl = 'https://gdi.berlin.de/services/wfs/grillflaechen?' +
  'SERVICE=WFS&' +
  'VERSION=1.1.0&' +
  'REQUEST=GetFeature&' +
  'TYPENAME=grillflaechen&' +
  'OUTPUTFORMAT=application/json&' +
  'SRSNAME=EPSG:4326';

const response = await fetch(wfsUrl);
const data = await response.json();
```

### Overpass API (OpenStreetMap)

#### District Boundaries Query
```javascript
const overpassQuery = `
[out:json][timeout:25];
(
  relation["boundary"="administrative"]["admin_level"="9"]["name"~"Berlin"];
  way(r)["boundary"="administrative"];
);
out geom;
`;

const overpassUrl = 'https://overpass-api.de/api/interpreter';
const response = await fetch(overpassUrl, {
  method: 'POST',
  body: overpassQuery,
  headers: { 'Content-Type': 'text/plain' }
});
```

---

## 🔄 Data Pipeline

### Automated Data Flow

```
1. Source Data (Berlin WFS)
   ↓
2. Fetch Script (scripts/fetch-official-grilling-data.js)
   ↓
3. Validation & Transformation
   ↓
4. Write to /data/official-grilling-areas.json
   ↓
5. Service Worker Cache Update
   ↓
6. Client Data Refresh
```

### Manual Data Enhancement

```
1. Official Data (automated)
   ↓
2. Manual Verification (site visits)
   ↓
3. Expat-Specific Information (local knowledge)
   ↓
4. Property Enhancement (facilities, rules, tips)
   ↓
5. Quality Assurance (accuracy check)
   ↓
6. Production Update
```

### Cache Management

#### Service Worker Caching
```javascript
// Cache strategy for data files
const DATA_CACHE_NAME = 'grillmaps-data-v6.0.0';

// Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/data/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
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

#### Browser Cache Headers
```javascript
// Vercel configuration (vercel.json)
{
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, stale-while-revalidate=60"
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Data APIs

### Data Validation Tests

#### Geometry Tests
```javascript
describe('Data Validation', () => {
  test('All features have valid geometry', () => {
    data.features.forEach(feature => {
      expect(feature.geometry).toBeDefined();
      expect(feature.geometry.type).toMatch(/^(Multi)?Polygon$/);
      expect(feature.geometry.coordinates).toBeInstanceOf(Array);
    });
  });
  
  test('All coordinates are within Berlin bounds', () => {
    data.features.forEach(feature => {
      const coords = extractCoordinates(feature.geometry);
      coords.forEach(([lon, lat]) => {
        expect(lon).toBeGreaterThan(13.0);
        expect(lon).toBeLessThan(13.8);
        expect(lat).toBeGreaterThan(52.3);
        expect(lat).toBeLessThan(52.7);
      });
    });
  });
});
```

#### Property Tests
```javascript
describe('Property Validation', () => {
  test('Required properties exist', () => {
    const required = ['name', 'description', 'bezirk'];
    
    data.features.forEach(feature => {
      required.forEach(prop => {
        expect(feature.properties[prop]).toBeDefined();
        expect(typeof feature.properties[prop]).toBe('string');
        expect(feature.properties[prop].length).toBeGreaterThan(0);
      });
    });
  });
  
  test('District names are valid', () => {
    const validDistricts = [
      'Charlottenburg-Wilmersdorf',
      'Friedrichshain-Kreuzberg',
      'Tempelhof-Schöneberg'
      // ... other districts
    ];
    
    data.features.forEach(feature => {
      expect(validDistricts).toContain(feature.properties.bezirk);
    });
  });
});
```

### API Integration Tests

#### Mapbox API Test
```javascript
describe('Mapbox Integration', () => {
  test('Token is configured correctly', () => {
    expect(mapboxgl.accessToken).toBeDefined();
    expect(mapboxgl.accessToken.startsWith('pk.')).toBe(true);
  });
  
  test('Map initializes successfully', (done) => {
    const map = new mapboxgl.Map({
      container: document.createElement('div'),
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [13.4050, 52.5200],
      zoom: 11
    });
    
    map.on('load', () => {
      expect(map.isStyleLoaded()).toBe(true);
      done();
    });
  });
});
```

---

## 📈 Data Monitoring

### Data Freshness Monitoring

#### Automated Checks
```javascript
// Check data age
function checkDataFreshness(data) {
  const generated = new Date(data.generated);
  const now = new Date();
  const ageInDays = (now - generated) / (1000 * 60 * 60 * 24);
  
  if (ageInDays > 30) {
    console.warn('Data is over 30 days old:', ageInDays);
    // Trigger update notification
  }
  
  return ageInDays;
}

// Validate data integrity
function validateDataIntegrity(data) {
  const issues = [];
  
  if (!data.features || data.features.length === 0) {
    issues.push('No features found');
  }
  
  if (data.count !== data.features.length) {
    issues.push('Feature count mismatch');
  }
  
  return issues;
}
```

#### Performance Monitoring
```javascript
// Track data load times
function trackDataPerformance() {
  const startTime = performance.now();
  
  fetch('./data/official-grilling-areas.json')
    .then(response => response.json())
    .then(data => {
      const loadTime = performance.now() - startTime;
      console.log(`Data load time: ${loadTime}ms`);
      
      // Track file size
      const dataSize = JSON.stringify(data).length;
      console.log(`Data size: ${(dataSize / 1024).toFixed(2)}KB`);
    });
}
```

---

## 🔒 Data Security & Privacy

### Data Protection
- **No personal data** collected or stored
- **Location services** require user consent
- **Cache data** automatically expires
- **API tokens** domain-restricted in production

### API Security
```javascript
// Content Security Policy for API access
const csp = `
  default-src 'self' https:;
  connect-src 'self' 
    https://api.mapbox.com 
    https://events.mapbox.com 
    https://fbinter.stadt-berlin.de;
  img-src 'self' data: blob: https:;
`;
```

### Token Management
```javascript
// Environment-based token selection
function getMapboxToken() {
  const hostname = window.location.hostname;
  
  // Development tokens (unrestricted)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'pk.development_token';
  }
  
  // Production tokens (domain-restricted)
  return 'pk.production_token';
}
```

---

## 📚 Additional Resources

### Official Documentation
- [Berlin Open Data Portal](https://daten.berlin.de/)
- [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/)
- [GeoJSON Specification](https://geojson.org/)
- [Overpass API Documentation](https://wiki.openstreetmap.org/wiki/Overpass_API)

### Tools & Utilities
- [GeoJSON Validator](https://geojsonlint.com/)
- [Overpass Turbo](https://overpass-turbo.eu/)
- [Mapbox Studio](https://studio.mapbox.com/)
- [QGIS](https://qgis.org/) for advanced GIS operations

---

**GrillMaps Berlin API & Data Documentation** - Complete reference for data sources, formats, and processing.  
*Version 6.0.0 - January 2025*