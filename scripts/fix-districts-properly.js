#!/usr/bin/env node

/**
 * Properly fix district geometry by finding the actual main boundary
 * Uses area calculation to identify the largest polygon
 */

const fs = require('fs');
const path = require('path');

// Load the original districts
const inputPath = path.join(__dirname, '..', 'data', 'berlin-districts-real.json');
const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-proper.json');

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Calculate polygon area using shoelace formula
function polygonArea(coords) {
    let area = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        area += coords[i][0] * coords[i + 1][1];
        area -= coords[i + 1][0] * coords[i][1];
    }
    return Math.abs(area / 2);
}

console.log('Fixing district geometries properly...');

// Process each district
data.features = data.features.map(feature => {
    const name = feature.properties.name;
    const rings = feature.geometry.coordinates;
    
    if (rings.length > 1) {
        console.log(`\n${name}: ${rings.length} rings found`);
        
        // Calculate area for each ring
        const ringsWithArea = rings.map((ring, index) => ({
            ring: ring,
            area: polygonArea(ring),
            points: ring.length,
            index: index
        }));
        
        // Sort by area (largest first)
        ringsWithArea.sort((a, b) => b.area - a.area);
        
        // Show top 3 rings
        console.log(`  Largest rings by area:`);
        ringsWithArea.slice(0, 3).forEach((r, i) => {
            console.log(`    ${i + 1}. Ring ${r.index}: area=${r.area.toFixed(6)}, points=${r.points}`);
        });
        
        // Use the largest ring
        feature.geometry.coordinates = [ringsWithArea[0].ring];
        console.log(`  → Using ring ${ringsWithArea[0].index} as main boundary`);
    } else {
        console.log(`${name}: Single ring (${rings[0].length} points)`);
    }
    
    return feature;
});

// For better results, let's also try to merge the data with our simplified districts
// to get reasonable boundaries
const simplifiedPath = path.join(__dirname, '..', 'data', 'berlin-districts.json');
if (fs.existsSync(simplifiedPath)) {
    const simplified = JSON.parse(fs.readFileSync(simplifiedPath, 'utf8'));
    console.log('\nFound simplified districts - using as fallback for better boundaries');
    
    // Create a map of simplified districts
    const simplifiedMap = {};
    simplified.features.forEach(f => {
        simplifiedMap[f.properties.name] = f.geometry.coordinates;
    });
    
    // For each district, check if the area seems too small
    data.features.forEach(feature => {
        const area = polygonArea(feature.geometry.coordinates[0]);
        // If area is suspiciously small (less than 0.001 which is tiny for a district)
        if (area < 0.001 && simplifiedMap[feature.properties.name]) {
            console.log(`${feature.properties.name}: Area too small (${area.toFixed(6)}), using simplified boundary`);
            feature.geometry.coordinates = simplifiedMap[feature.properties.name];
        }
    });
}

// Save the properly fixed data
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('\n✓ Saved to berlin-districts-proper.json');
console.log('✓ Districts now use their main boundaries based on area calculation');