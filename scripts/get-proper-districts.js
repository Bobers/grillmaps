#!/usr/bin/env node

/**
 * Get proper Berlin district boundaries
 * Using a different approach - administrative boundaries level 9
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Berlin district data
const DISTRICT_DATA = {
    'Mitte': { bbq_status: 'limited', bbq_areas: ['Monbijoupark', 'James-Simon-Park', 'Tiergarten'] },
    'Friedrichshain-Kreuzberg': { bbq_status: 'allowed', bbq_areas: ['Görlitzer Park', 'Volkspark Friedrichshain'] },
    'Pankow': { bbq_status: 'limited', bbq_areas: ['Volkspark Prenzlauer Berg', 'Bürgerpark Pankow'] },
    'Charlottenburg-Wilmersdorf': { bbq_status: 'limited', bbq_areas: ['Lietzenseepark', 'Preußenpark'] },
    'Spandau': { bbq_status: 'limited', bbq_areas: ['Spektepark', 'Bullengraben'] },
    'Steglitz-Zehlendorf': { bbq_status: 'limited', bbq_areas: ['Stadtpark Steglitz', 'Schlachtensee'] },
    'Tempelhof-Schöneberg': { bbq_status: 'allowed', bbq_areas: ['Tempelhofer Feld', 'Volkspark Mariendorf'] },
    'Neukölln': { bbq_status: 'allowed', bbq_areas: ['Volkspark Hasenheide', 'Britzer Garten'] },
    'Treptow-Köpenick': { bbq_status: 'prohibited', bbq_areas: [] },
    'Marzahn-Hellersdorf': { bbq_status: 'limited', bbq_areas: ['Gärten der Welt', 'Kienbergpark'] },
    'Lichtenberg': { bbq_status: 'limited', bbq_areas: ['Fennpfuhlpark', 'Stadtpark Lichtenberg'] },
    'Reinickendorf': { bbq_status: 'limited', bbq_areas: ['Tegeler See', 'Schäfersee'] }
};

console.log('Fetching proper Berlin district boundaries...');

// Try approach 1: Use nominatim to get district boundaries
const districts = Object.keys(DISTRICT_DATA);
const results = [];

async function fetchDistrict(name) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${name}, Berlin, Germany`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1&limit=1`;
        
        https.get(url, {
            headers: {
                'User-Agent': 'GrillMaps/1.0'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.length > 0 && json[0].geojson) {
                        console.log(`✓ Found ${name}`);
                        resolve({
                            name: name,
                            data: json[0]
                        });
                    } else {
                        console.log(`✗ No data for ${name}`);
                        resolve(null);
                    }
                } catch (e) {
                    console.log(`✗ Error parsing ${name}:`, e.message);
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

// Fetch districts one by one with delay to respect rate limits
async function fetchAllDistricts() {
    for (const district of districts) {
        const result = await fetchDistrict(district);
        if (result) {
            results.push(result);
        }
        // Wait 1 second between requests to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Convert to our format
    const geojson = {
        type: 'FeatureCollection',
        metadata: {
            title: 'Berlin Administrative Districts',
            description: 'District boundaries from Nominatim',
            last_updated: new Date().toISOString().split('T')[0],
            version: '3.0.0',
            source: 'OpenStreetMap Nominatim'
        },
        features: results.map(r => {
            const districtData = DISTRICT_DATA[r.name];
            return {
                type: 'Feature',
                properties: {
                    name: r.name,
                    bbq_status: districtData.bbq_status,
                    bbq_areas: districtData.bbq_areas,
                    osm_id: r.data.osm_id,
                    display_name: r.data.display_name
                },
                geometry: r.data.geojson
            };
        })
    };
    
    // Save the data
    const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-nominatim.json');
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
    
    console.log(`\n✓ Saved ${geojson.features.length} districts to berlin-districts-nominatim.json`);
}

// If Nominatim doesn't work well, provide fallback with simplified boundaries
console.log('\nFetching from Nominatim (this will take ~12 seconds)...\n');
fetchAllDistricts().catch(error => {
    console.error('Failed to fetch from Nominatim:', error);
    console.log('\nFalling back to simplified boundaries...');
    
    // Use our simplified boundaries as fallback
    const simplified = require('../data/berlin-districts.json');
    const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-nominatim.json');
    fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2));
    console.log('✓ Used simplified boundaries as fallback');
});