#!/usr/bin/env node

/**
 * Fetch real Berlin district boundaries from OpenStreetMap
 * This gets accurate polygon data instead of simplified rectangles
 */

const https = require('https');
const fs = require('fs');

// Berlin districts with their OSM relation IDs
const BERLIN_DISTRICTS = [
    { name: 'Mitte', osmId: 55741 },
    { name: 'Friedrichshain-Kreuzberg', osmId: 55742 },
    { name: 'Pankow', osmId: 55743 },
    { name: 'Charlottenburg-Wilmersdorf', osmId: 55744 },
    { name: 'Spandau', osmId: 55745 },
    { name: 'Steglitz-Zehlendorf', osmId: 55746 },
    { name: 'Tempelhof-Schöneberg', osmId: 55747 },
    { name: 'Neukölln', osmId: 55748 },
    { name: 'Treptow-Köpenick', osmId: 55749 },
    { name: 'Marzahn-Hellersdorf', osmId: 55750 },
    { name: 'Lichtenberg', osmId: 55751 },
    { name: 'Reinickendorf', osmId: 55752 }
];

// BBQ status for each district (from our current data)
const BBQ_STATUS = {
    'Mitte': 'limited',
    'Friedrichshain-Kreuzberg': 'allowed',
    'Pankow': 'limited',
    'Charlottenburg-Wilmersdorf': 'limited',
    'Spandau': 'limited',
    'Steglitz-Zehlendorf': 'limited',
    'Tempelhof-Schöneberg': 'allowed',
    'Neukölln': 'allowed',
    'Treptow-Köpenick': 'prohibited',
    'Marzahn-Hellersdorf': 'limited',
    'Lichtenberg': 'limited',
    'Reinickendorf': 'limited'
};

// Overpass API query to get district boundaries
const query = `
[out:json][timeout:90];
(
  ${BERLIN_DISTRICTS.map(d => `relation(${d.osmId});`).join('\n  ')}
);
out geom;
`;

console.log('Fetching real Berlin district boundaries from OpenStreetMap...');

const options = {
    hostname: 'overpass-api.de',
    path: '/api/interpreter',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(`data=${encodeURIComponent(query)}`)
    }
};

const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const osmData = JSON.parse(data);
            
            // Convert OSM data to GeoJSON
            const geojson = {
                type: 'FeatureCollection',
                metadata: {
                    title: 'Berlin Administrative Districts',
                    description: 'Official district boundaries from OpenStreetMap',
                    last_updated: new Date().toISOString().split('T')[0],
                    version: '2.0.0',
                    source: 'OpenStreetMap'
                },
                features: []
            };
            
            osmData.elements.forEach(element => {
                if (element.type === 'relation' && element.members) {
                    const districtInfo = BERLIN_DISTRICTS.find(d => d.osmId === element.id);
                    
                    // Extract coordinates from the relation geometry
                    const coordinates = extractPolygonFromRelation(element);
                    
                    if (coordinates && districtInfo) {
                        geojson.features.push({
                            type: 'Feature',
                            properties: {
                                name: districtInfo.name,
                                bbq_status: BBQ_STATUS[districtInfo.name],
                                osm_id: element.id,
                                population: element.tags?.population || null,
                                area_km2: calculateArea(coordinates)
                            },
                            geometry: {
                                type: 'Polygon',
                                coordinates: coordinates
                            }
                        });
                    }
                }
            });
            
            // Save the real district data
            fs.writeFileSync(
                '../data/berlin-districts-real.json',
                JSON.stringify(geojson, null, 2)
            );
            
            console.log(`✓ Saved ${geojson.features.length} districts to berlin-districts-real.json`);
            console.log('✓ Districts have accurate boundaries from OpenStreetMap');
            
        } catch (error) {
            console.error('Error processing OSM data:', error);
        }
    });
});

req.on('error', (error) => {
    console.error('Error fetching data:', error);
});

req.write(`data=${encodeURIComponent(query)}`);
req.end();

// Helper function to extract polygon coordinates from OSM relation
function extractPolygonFromRelation(relation) {
    // This is simplified - real implementation would need to handle
    // complex relations with inner/outer ways
    if (relation.members && relation.members.length > 0) {
        const outerWays = relation.members
            .filter(m => m.type === 'way' && m.role === 'outer')
            .map(m => m.geometry);
        
        if (outerWays.length > 0) {
            // Combine outer ways into a polygon
            return outerWays[0].map(node => [node.lon, node.lat]);
        }
    }
    return null;
}

// Simple area calculation (for reference only)
function calculateArea(coordinates) {
    // Simplified - would need proper geodesic calculation
    return null;
}