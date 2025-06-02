# GrillMaps Data Optimization Plan

Based on Mapbox's data guide, here's how we can optimize our data structure:

## Current Issues
1. Loading 3 separate GeoJSON files at runtime
2. Large district polygons loaded as raw GeoJSON
3. No caching or performance optimization
4. Simplified district boundaries (rectangles)

## Recommended Improvements

### 1. Use Mapbox Tilesets for Districts (Static Data)
**Why**: Districts rarely change and cover large areas
```
- Upload berlin-districts.json to Mapbox Studio
- Create a custom tileset with optimized rendering
- Reference tileset in map style instead of runtime loading
```

### 2. Keep Runtime Loading for Dynamic Data
**Why**: BBQ locations may change frequently
```
- locations.json - Keep as runtime GeoJSON (small file)
- OSM data - Keep as runtime fetch (updates daily)
```

### 3. Data Structure Optimization
```javascript
// Instead of current approach:
map.addSource('districts', {
    'type': 'geojson',
    'data': districtData
});

// Use tileset approach:
map.addSource('districts', {
    'type': 'vector',
    'url': 'mapbox://bobers.berlin-districts'
});
```

### 4. Get Accurate District Boundaries
- Download official Berlin district boundaries from:
  - Berlin Open Data Portal
  - OpenStreetMap Overpass API
- Convert to optimized GeoJSON using mapshaper

### 5. Performance Benefits
- Faster initial load (no large GeoJSON parsing)
- Better zoom/pan performance
- Automatic level-of-detail optimization
- Reduced bandwidth usage

## Implementation Steps

1. **Get Real District Data**
   ```bash
   # Download Berlin districts from OSM
   curl 'https://overpass-api.de/api/interpreter' \
     -d 'data=[out:json];relation["boundary"="administrative"]["admin_level"="9"]["name"~"Berlin"];out geom;' \
     > berlin-districts-real.json
   ```

2. **Optimize with Mapshaper**
   ```bash
   # Simplify polygons for web use
   mapshaper berlin-districts-real.json \
     -simplify 10% \
     -o format=geojson berlin-districts-optimized.json
   ```

3. **Upload to Mapbox Studio**
   - Create new tileset
   - Upload optimized GeoJSON
   - Style in Mapbox Studio

4. **Update Code**
   - Reference tileset URL
   - Remove runtime district loading
   - Keep dynamic data as-is

## Benefits
- ⚡ 50-80% faster load times
- 🎯 Accurate district boundaries
- 📱 Better mobile performance
- 🔄 Easier to update districts