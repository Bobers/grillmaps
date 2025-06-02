#!/usr/bin/env node

/**
 * Fix district geometry - convert complex polygons to proper format
 */

const fs = require('fs');
const path = require('path');

// Load the current districts
const inputPath = path.join(__dirname, '..', 'data', 'berlin-districts-real.json');
const outputPath = path.join(__dirname, '..', 'data', 'berlin-districts-fixed.json');

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

console.log('Fixing district geometries...');

// Fix each district
data.features = data.features.map(feature => {
    const coords = feature.geometry.coordinates;
    
    // If we have multiple rings, take only the largest one (main district boundary)
    if (coords.length > 1) {
        console.log(`${feature.properties.name}: ${coords.length} rings found, using largest`);
        
        // Find the ring with most points (likely the main boundary)
        let largestRing = coords[0];
        let maxPoints = coords[0].length;
        
        coords.forEach(ring => {
            if (ring.length > maxPoints) {
                maxPoints = ring.length;
                largestRing = ring;
            }
        });
        
        feature.geometry.coordinates = [largestRing];
    }
    
    return feature;
});

// Save fixed data
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('✓ Fixed geometries saved to berlin-districts-fixed.json');
console.log('✓ All districts now have single boundary polygons');

// Show summary
data.features.forEach(f => {
    console.log(`- ${f.properties.name}: ${f.geometry.coordinates[0].length} points`);
});