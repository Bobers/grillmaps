#!/usr/bin/env node

/**
 * Get Berlin districts using Overpass API
 * Based on OSM guidelines for administrative boundaries
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// BBQ status and areas data
const DISTRICT_DATA = {
    'Mitte': {
        bbq_status: 'limited',
        bbq_areas: ['Monbijoupark', 'James-Simon-Park', 'Tiergarten']
    },
    'Friedrichshain-Kreuzberg': {
        bbq_status: 'allowed',
        bbq_areas: ['Görlitzer Park', 'Volkspark Friedrichshain', 'Park am Gleisdreieck']
    },
    'Pankow': {
        bbq_status: 'limited',
        bbq_areas: ['Volkspark Prenzlauer Berg', 'Bürgerpark Pankow', 'Schlosspark']
    },
    'Charlottenburg-Wilmersdorf': {
        bbq_status: 'limited',
        bbq_areas: ['Lietzenseepark', 'Preußenpark', 'Volkspark Wilmersdorf']
    },
    'Spandau': {
        bbq_status: 'limited',
        bbq_areas: ['Spektepark', 'Bullengraben', 'Zitadellenpark']
    },
    'Steglitz-Zehlendorf': {
        bbq_status: 'limited',
        bbq_areas: ['Stadtpark Steglitz', 'Schlachtensee', 'Krumme Lanke']
    },
    'Tempelhof-Schöneberg': {
        bbq_status: 'allowed',
        bbq_areas: ['Tempelhofer Feld', 'Volkspark Mariendorf', 'Insulaner']
    },
    'Neukölln': {
        bbq_status: 'allowed',
        bbq_areas: ['Volkspark Hasenheide', 'Britzer Garten', 'Körnerpark']
    },
    'Treptow-Köpenick': {
        bbq_status: 'prohibited',
        bbq_areas: []
    },
    'Marzahn-Hellersdorf': {
        bbq_status: 'limited',
        bbq_areas: ['Gärten der Welt', 'Kienbergpark']
    },
    'Lichtenberg': {
        bbq_status: 'limited',
        bbq_areas: ['Fennpfuhlpark', 'Stadtpark Lichtenberg']
    },
    'Reinickendorf': {
        bbq_status: 'limited',
        bbq_areas: ['Tegeler See', 'Schäfersee', 'Volkspark Rehberge']
    }
};

// Overpass API query for Berlin districts
// admin_level=9 is for city districts (Stadtbezirke) in Germany
const overpassQuery = `
[out:json][timeout:30];
area["name"="Berlin"]["admin_level"="4"]->.berlin;
(
  relation["boundary"="administrative"]["admin_level"="9"](area.berlin);
);
out body;
>;
out skel qt;
`;

console.log('Fetching Berlin districts from OpenStreetMap...');
console.log('Using Overpass API with admin_level=9 for city districts');

const postData = `data=${encodeURIComponent(overpassQuery)}`;

const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log(`Received ${result.elements.length} elements from Overpass API`);
            
            // Process the data
            const districts = processOverpassData(result.elements);
            
            // Create GeoJSON
            const geojson = {
                type: 'FeatureCollection',
                metadata: {
                    title: 'Berlin Administrative Districts',
                    description: 'Official district boundaries from OpenStreetMap',
                    last_updated: new Date().toISOString().split('T')[0],
                    version: '2.0.0',
                    source: 'OpenStreetMap via Overpass API',
                    admin_level: 9
                },
                features: districts
            };
            
            // Save the data
            const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-real.json');
            fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
            
            console.log(`✓ Saved ${geojson.features.length} districts with real boundaries`);
            console.log(`✓ File saved to: ${outputPath}`);
            
            // List districts found
            console.log('\nDistricts found:');
            geojson.features.forEach(f => {
                console.log(`- ${f.properties.name} (${f.properties.bbq_status})`);
            });
            
        } catch (error) {
            console.error('Error processing Overpass data:', error);
            console.error('Response:', data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error('Error with request:', error);
});

req.write(postData);
req.end();

// Process Overpass API response to GeoJSON
function processOverpassData(elements) {
    const features = [];
    const ways = {};
    const nodes = {};
    
    // First pass: collect all nodes and ways
    elements.forEach(element => {
        if (element.type === 'node') {
            nodes[element.id] = [element.lon, element.lat];
        } else if (element.type === 'way') {
            ways[element.id] = element.nodes;
        }
    });
    
    // Second pass: build district polygons
    elements.forEach(element => {
        if (element.type === 'relation' && element.tags && element.tags.name) {
            const name = element.tags.name;
            const districtInfo = DISTRICT_DATA[name] || {
                bbq_status: 'unknown',
                bbq_areas: []
            };
            
            // Build polygon from relation members
            const coordinates = [];
            
            if (element.members) {
                // Get outer ways
                const outerWays = element.members
                    .filter(m => m.type === 'way' && m.role === 'outer')
                    .map(m => m.ref);
                
                // Convert ways to coordinates
                outerWays.forEach(wayId => {
                    if (ways[wayId]) {
                        const wayCoords = ways[wayId]
                            .map(nodeId => nodes[nodeId])
                            .filter(coord => coord !== undefined);
                        
                        if (wayCoords.length > 0) {
                            coordinates.push(wayCoords);
                        }
                    }
                });
            }
            
            if (coordinates.length > 0) {
                features.push({
                    type: 'Feature',
                    properties: {
                        name: name,
                        name_de: element.tags['name:de'] || name,
                        name_en: element.tags['name:en'] || name,
                        bbq_status: districtInfo.bbq_status,
                        bbq_areas: districtInfo.bbq_areas,
                        osm_id: element.id,
                        admin_level: element.tags.admin_level,
                        population: element.tags.population || null
                    },
                    geometry: {
                        type: 'Polygon',
                        coordinates: coordinates
                    }
                });
            }
        }
    });
    
    return features;
}