const fs = require('fs');
const path = require('path');

// Create GeoJSON for specific BBQ areas within districts
const bbqAreas = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Tempelhofer Feld BBQ Areas",
        "district": "Tempelhof-Schöneberg",
        "description": "3 designated BBQ areas",
        "rules": "Near Tempelhofer Damm, Oderstraße, and Columbiadamm entrances"
      },
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": [
          // Simplified polygons for BBQ areas - these would need real coordinates
          [[[13.3913, 52.4774], [13.3923, 52.4774], [13.3923, 52.4784], [13.3913, 52.4784], [13.3913, 52.4774]]],
          [[[13.3501, 52.4839], [13.3511, 52.4839], [13.3511, 52.4849], [13.3501, 52.4849], [13.3501, 52.4839]]],
          [[[13.4050, 52.4730], [13.4060, 52.4730], [13.4060, 52.4740], [13.4050, 52.4740], [13.4050, 52.4730]]]
        ]
      }
    },
    {
      "type": "Feature", 
      "properties": {
        "name": "Monbijoupark BBQ Area",
        "district": "Mitte",
        "description": "Small signposted area",
        "rules": "Only on Oranienburger Straße side"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.3970, 52.5235],
          [13.3980, 52.5235],
          [13.3980, 52.5245],
          [13.3970, 52.5245],
          [13.3970, 52.5235]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Görlitzer Park BBQ Area",
        "district": "Friedrichshain-Kreuzberg",
        "description": "Designated area opposite sports pitch",
        "rules": "On meadow opposite artificial turf sports pitch"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.4410, 52.4975],
          [13.4425, 52.4975],
          [13.4425, 52.4985],
          [13.4410, 52.4985],
          [13.4410, 52.4975]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Volkspark Friedrichshain BBQ Area",
        "district": "Friedrichshain-Kreuzberg",
        "description": "Neuer Hain - reservation required",
        "rules": "Must reserve barbecue pitches online in advance"
      },
      "geometry": {
        "type": "Polygon", 
        "coordinates": [[
          [13.4330, 52.5265],
          [13.4350, 52.5265],
          [13.4350, 52.5275],
          [13.4330, 52.5275],
          [13.4330, 52.5265]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Mauerpark BBQ Area",
        "district": "Pankow",
        "description": "Near Bernauer Straße entrance",
        "rules": "June/Sept: 12-8 PM, July/Aug: 12-9 PM"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.4020, 52.5405],
          [13.4040, 52.5405],
          [13.4040, 52.5415],
          [13.4020, 52.5415],
          [13.4020, 52.5405]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Goslarer Ufer BBQ Area",
        "district": "Charlottenburg-Wilmersdorf",
        "description": "Near old Charlottenburg gasworks",
        "rules": "Only near the old gasworks area"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.2950, 52.5200],
          [13.2970, 52.5200],
          [13.2970, 52.5210],
          [13.2950, 52.5210],
          [13.2950, 52.5200]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Rudolf-Mosse-Platz BBQ Area",
        "district": "Charlottenburg-Wilmersdorf",
        "description": "BBQ allowed",
        "rules": "No specific restrictions"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [13.3200, 52.4900],
          [13.3220, 52.4900],
          [13.3220, 52.4910],
          [13.3200, 52.4910],
          [13.3200, 52.4900]
        ]]
      }
    }
  ]
};

// Save BBQ areas data
const outputPath = path.join(__dirname, '../data/bbq-areas.json');
fs.writeFileSync(outputPath, JSON.stringify(bbqAreas, null, 2));

console.log('BBQ areas data created successfully!');
console.log(`Saved to: ${outputPath}`);