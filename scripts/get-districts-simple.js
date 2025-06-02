#!/usr/bin/env node

/**
 * Simpler approach to get Berlin district data
 * Uses a reliable GeoJSON source
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// BBQ status for each district
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

// BBQ areas for each district
const BBQ_AREAS = {
    'Mitte': ['Monbijoupark', 'James-Simon-Park', 'Tiergarten'],
    'Friedrichshain-Kreuzberg': ['Görlitzer Park', 'Volkspark Friedrichshain', 'Park am Gleisdreieck'],
    'Pankow': ['Volkspark Prenzlauer Berg', 'Bürgerpark Pankow', 'Schlosspark'],
    'Charlottenburg-Wilmersdorf': ['Lietzenseepark', 'Preußenpark', 'Volkspark Wilmersdorf'],
    'Spandau': ['Spektepark', 'Bullengraben', 'Zitadellenpark'],
    'Steglitz-Zehlendorf': ['Stadtpark Steglitz', 'Schlachtensee', 'Krumme Lanke'],
    'Tempelhof-Schöneberg': ['Tempelhofer Feld', 'Volkspark Mariendorf', 'Insulaner'],
    'Neukölln': ['Volkspark Hasenheide', 'Britzer Garten', 'Körnerpark'],
    'Treptow-Köpenick': [],
    'Marzahn-Hellersdorf': ['Gärten der Welt', 'Kienbergpark'],
    'Lichtenberg': ['Fennpfuhlpark', 'Stadtpark Lichtenberg'],
    'Reinickendorf': ['Tegeler See', 'Schäfersee', 'Volkspark Rehberge']
};

console.log('Fetching Berlin district boundaries...');

// Option 1: Use GitHub raw content from berlin-geodata
const url = 'https://raw.githubusercontent.com/funkeinteraktiv/berlin-geodata/master/berlin_bezirke.geojson';

https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const berlinData = JSON.parse(data);
            
            // Transform to our format
            const geojson = {
                type: 'FeatureCollection',
                metadata: {
                    title: 'Berlin Administrative Districts',
                    description: 'Official district boundaries with BBQ status',
                    last_updated: new Date().toISOString().split('T')[0],
                    version: '2.0.0',
                    source: 'berlin-geodata'
                },
                features: berlinData.features.map(feature => {
                    const name = feature.properties.name || feature.properties.Gemeinde_name;
                    return {
                        type: 'Feature',
                        properties: {
                            name: name,
                            bbq_status: BBQ_STATUS[name] || 'limited',
                            bbq_areas: BBQ_AREAS[name] || [],
                            population: feature.properties.population
                        },
                        geometry: feature.geometry
                    };
                })
            };
            
            // Save the data
            const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-real.json');
            fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
            
            console.log(`✓ Saved ${geojson.features.length} districts with real boundaries`);
            console.log('✓ Data source: berlin-geodata (official boundaries)');
            console.log(`✓ File saved to: ${outputPath}`);
            
        } catch (error) {
            console.error('Error processing data:', error);
            
            // Fallback: Create a message about manual download
            console.log('\nAlternative: Download districts manually from:');
            console.log('1. https://daten.berlin.de/datensaetze/bezirksgrenzen-berlin');
            console.log('2. Convert shapefile to GeoJSON using https://mapshaper.org/');
            console.log('3. Save as data/berlin-districts-real.json');
        }
    });
}).on('error', (error) => {
    console.error('Error fetching data:', error);
});