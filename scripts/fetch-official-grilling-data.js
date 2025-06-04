#!/usr/bin/env node

/**
 * Fetch Official Berlin Grilling Areas Data
 * Source: https://daten.berlin.de/datensaetze/grillflachen-wms-aaeff7f1
 * 
 * This script fetches the official grilling areas from Berlin's WFS service
 * and converts it to our GrillMaps format.
 */

import fs from 'fs';
import path from 'path';

const WFS_ENDPOINT = 'https://gdi.berlin.de/services/wfs/grillflaechen';
const OUTPUT_FILE = '../data/official-grilling-areas.json';

async function fetchOfficialGrillingData() {
    console.log('🔄 Fetching official Berlin grilling areas data...');
    
    try {
        // Construct WFS GetFeature request for GeoJSON
        const params = new URLSearchParams({
            'SERVICE': 'WFS',
            'VERSION': '1.1.0',
            'REQUEST': 'GetFeature',
            'TYPENAME': 'grillflaechen',
            'OUTPUTFORMAT': 'application/json',
            'SRSNAME': 'EPSG:4326'  // WGS84 for web mapping
        });
        
        const url = `${WFS_ENDPOINT}?${params.toString()}`;
        console.log(`📡 Requesting: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Retrieved ${data.features?.length || 0} official grilling areas`);
        
        // Transform to our format
        const transformedData = transformToGrillMapsFormat(data);
        
        // Save to file
        const outputPath = path.resolve('./data/official-grilling-areas.json');
        fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
        
        console.log(`💾 Saved to: ${outputPath}`);
        console.log(`📊 Total locations: ${transformedData.features.length}`);
        
        // Display summary
        displayDataSummary(transformedData);
        
        return transformedData;
        
    } catch (error) {
        console.error('❌ Failed to fetch official data:', error.message);
        throw error;
    }
}

function transformToGrillMapsFormat(officialData) {
    const transformed = {
        type: 'FeatureCollection',
        generator: 'official-berlin-wfs',
        generated: new Date().toISOString(),
        source: 'Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin',
        license: 'dl-zero-de/2.0',
        attribution: '© Geoportal Berlin / Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen',
        count: officialData.features?.length || 0,
        features: []
    };
    
    if (!officialData.features) {
        console.warn('⚠️ No features found in official data');
        return transformed;
    }
    
    officialData.features.forEach((feature, index) => {
        try {
            const props = feature.properties || {};
            
            // Transform to our standard format
            const transformedFeature = {
                type: 'Feature',
                geometry: feature.geometry,
                properties: {
                    // Core identification
                    name: extractName(props),
                    district: extractDistrict(props),
                    address: extractAddress(props),
                    
                    // Official data
                    official_id: props.id || props.gml_id || `official-${index + 1}`,
                    grill_type: extractGrillType(props),
                    access_type: extractAccessType(props),
                    
                    // Rules and regulations
                    fee_required: extractFeeInfo(props),
                    reservation_required: extractReservationInfo(props),
                    rules_url: extractRulesUrl(props),
                    booking_url: extractBookingUrl(props),
                    
                    // Contact and authority
                    authority: extractAuthority(props),
                    
                    // Metadata
                    data_source: 'official_berlin_wfs',
                    last_updated: new Date().toISOString().split('T')[0],
                    verification_status: 'official'
                },
                metadata: {
                    original_properties: props,
                    source_url: 'https://daten.berlin.de/datensaetze/grillflachen-wms-aaeff7f1',
                    fetched_at: new Date().toISOString()
                }
            };
            
            transformed.features.push(transformedFeature);
            
        } catch (error) {
            console.warn(`⚠️ Failed to transform feature ${index}:`, error.message);
        }
    });
    
    return transformed;
}

// Data extraction functions
function extractName(props) {
    // Try various possible name fields
    return props.name || 
           props.bezeichnung || 
           props.standort || 
           props.ort ||
           props.location ||
           'Grilling Area';
}

function extractDistrict(props) {
    return props.bezirk || 
           props.district || 
           props.stadtteil ||
           'Unknown';
}

function extractAddress(props) {
    const addressParts = [];
    
    if (props.strasse) addressParts.push(props.strasse);
    if (props.hausnummer) addressParts.push(props.hausnummer);
    if (props.plz) addressParts.push(`${props.plz} Berlin`);
    
    return addressParts.join(', ') || 
           props.adresse || 
           props.address ||
           null;
}

function extractGrillType(props) {
    // Map German terms to our standard types
    const artGrillen = (props.art_grillen || '').toLowerCase();
    
    if (artGrillen.includes('frei')) return 'designated_area';
    if (artGrillen.includes('reservierung')) return 'reservation_required';
    if (artGrillen.includes('fest')) return 'fixed_grills';
    
    return 'unknown';
}

function extractAccessType(props) {
    const access = (props.zugang || props.access || '').toLowerCase();
    
    if (access.includes('öffentlich') || access.includes('public')) return 'public';
    if (access.includes('gebühr') || access.includes('fee')) return 'fee_required';
    
    return 'public';
}

function extractFeeInfo(props) {
    const fee = (props.gebuehr || props.fee || '').toLowerCase();
    return fee.includes('ja') || fee.includes('yes') || fee.includes('kostenpflichtig');
}

function extractReservationInfo(props) {
    const booking = (props.buchung || props.reservation || props.anmeldung || '').toLowerCase();
    return booking.includes('erforderlich') || 
           booking.includes('required') || 
           booking.includes('ja') ||
           booking.includes('yes');
}

function extractRulesUrl(props) {
    return props.regeln_url || 
           props.rules_url || 
           props.link_regeln ||
           null;
}

function extractBookingUrl(props) {
    return props.buchung_url || 
           props.booking_url || 
           props.anmeldung_url ||
           props.link_buchung ||
           null;
}

function extractAuthority(props) {
    return props.behoerde || 
           props.authority || 
           props.zustaendig ||
           'Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen';
}

function displayDataSummary(data) {
    console.log('\n📊 Data Summary:');
    console.log(`📍 Total locations: ${data.features.length}`);
    
    // Count by district
    const districts = {};
    const grillTypes = {};
    
    data.features.forEach(feature => {
        const district = feature.properties.district;
        const grillType = feature.properties.grill_type;
        
        districts[district] = (districts[district] || 0) + 1;
        grillTypes[grillType] = (grillTypes[grillType] || 0) + 1;
    });
    
    console.log('\n🏘️ By District:');
    Object.entries(districts).forEach(([district, count]) => {
        console.log(`  ${district}: ${count}`);
    });
    
    console.log('\n🔥 By Grill Type:');
    Object.entries(grillTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
    });
    
    console.log(`\n✅ Official data fetch completed successfully!`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fetchOfficialGrillingData()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Failed to fetch official data:', error);
            process.exit(1);
        });
}

export { fetchOfficialGrillingData };