const fs = require('fs');
const path = require('path');

// Load current district data
const dataPath = path.join(__dirname, '../data/berlin-districts-nominatim.json');
const districtsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Common private property rules across Berlin
const privatePropertyRules = {
  private: {
    general: "Allowed on private property, but must respect neighbors",
    tips: [
      "Keep noise levels reasonable",
      "Avoid excessive smoke",
      "Best times: 12:00-20:00"
    ]
  },
  rental: {
    general: "Check house rules (Hausordnung) and rental contract",
    tips: [
      "Many properties restrict to electric grills only",
      "Balcony grilling often prohibited",
      "Ask property management if unclear",
      "Garden areas may have specific BBQ zones"
    ]
  }
};

// Official BBQ data from berlin.de
const officialBBQData = {
  'Mitte': {
    bbq_status: 'limited',
    bbq_areas: [
      {
        name: 'Monbijoupark',
        note: 'Only in small signposted area on Oranienburger Straße'
      }
    ],
    // Tiergarten is in Mitte district and has general ban since 2012
    prohibited_areas: ['Tiergarten']
  },
  'Friedrichshain-Kreuzberg': {
    bbq_status: 'limited',
    bbq_areas: [
      {
        name: 'Görlitzer Park',
        note: 'Designated area on meadow opposite artificial turf sports pitch'
      },
      {
        name: 'Volkspark Friedrichshain (Neuer Hain)',
        note: 'Must reserve barbecue pitches online in advance'
      }
    ]
  },
  'Pankow': {
    bbq_status: 'limited',
    bbq_areas: [
      {
        name: 'Mauerpark',
        note: 'Near Bernauer Straße entrance. June/Sept: 12-8 PM, July/Aug: 12-9 PM'
      }
    ]
  },
  'Charlottenburg-Wilmersdorf': {
    bbq_status: 'limited',
    bbq_areas: [
      {
        name: 'Goslarer Ufer',
        note: 'Only near old Charlottenburg gasworks'
      },
      {
        name: 'Rudolf-Mosse-Platz',
        note: 'Grilling allowed'
      }
    ]
  },
  'Tempelhof-Schöneberg': {
    bbq_status: 'limited',
    bbq_areas: [
      {
        name: 'Tempelhofer Feld',
        note: '3 designated areas near Tempelhofer Damm, Oderstraße, and Columbiadamm entrances'
      }
    ]
  },
  'Lichtenberg': {
    bbq_status: 'prohibited',
    bbq_areas: [],
    note: 'General ban on barbecues in all public green spaces since October 2022'
  },
  // Keep existing data for districts not mentioned in the official source
  'Spandau': {
    bbq_status: 'limited',
    bbq_areas: ['Spektepark', 'Bullengraben']
  },
  'Steglitz-Zehlendorf': {
    bbq_status: 'limited',
    bbq_areas: ['Stadtpark Steglitz', 'Schlachtensee']
  },
  'Neukölln': {
    bbq_status: 'limited',
    bbq_areas: ['Volkspark Hasenheide', 'Britzer Garten']
  },
  'Treptow-Köpenick': {
    bbq_status: 'prohibited',
    bbq_areas: [],
    note: 'No public grilling areas. Grilling prohibited in all public green spaces including Treptower Park and Schlesischer Busch'
  },
  'Marzahn-Hellersdorf': {
    bbq_status: 'limited',
    bbq_areas: ['Gärten der Welt', 'Kienbergpark']
  },
  'Reinickendorf': {
    bbq_status: 'limited',
    bbq_areas: ['Tegeler See', 'Schäfersee']
  }
};

// Update district data
districtsData.features = districtsData.features.map(district => {
  const name = district.properties.name;
  const officialData = officialBBQData[name];
  
  if (officialData) {
    // Update BBQ status
    district.properties.bbq_status = officialData.bbq_status;
    
    // Update BBQ areas - extract just the names for backward compatibility
    if (officialData.bbq_areas) {
      district.properties.bbq_areas = officialData.bbq_areas.map(area => 
        typeof area === 'string' ? area : area.name
      );
    } else {
      district.properties.bbq_areas = [];
    }
    
    // Add detailed BBQ info as a new property
    district.properties.bbq_details = officialData;
    
    // Add private property rules
    district.properties.private_property_rules = privatePropertyRules;
  }
  
  return district;
});

// Update metadata
districtsData.metadata.last_updated = new Date().toISOString().split('T')[0];
districtsData.metadata.version = '3.1.0';
districtsData.metadata.notes = 'Updated with official Berlin grilling areas from berlin.de';

// Save updated data
fs.writeFileSync(dataPath, JSON.stringify(districtsData, null, 2));

console.log('District BBQ data updated successfully!');
console.log('\nSummary of changes:');
console.log('- Mitte: Now limited (removed Tiergarten due to ban)');
console.log('- Lichtenberg: Changed to prohibited (ban since Oct 2022)');
console.log('- Added specific rules and restrictions for each area');
console.log('- Added detailed BBQ information for popups');