#!/usr/bin/env python3
"""
Calculate the total area of all grilling polygons in Berlin.
Uses the Shoelace formula with geographic correction for WGS84 coordinates.
"""

import json
import math

def calculate_polygon_area_wgs84(coordinates):
    """
    Calculate the area of a polygon given its WGS84 coordinates.
    Uses the Shoelace formula with correction for geographic coordinates.
    
    Args:
        coordinates: List of [lon, lat] coordinate pairs
    
    Returns:
        Area in square meters
    """
    # Earth's radius in meters
    R = 6378137
    
    # Convert degrees to radians
    coords_rad = [[math.radians(lon), math.radians(lat)] for lon, lat in coordinates]
    
    # Calculate area using the Shoelace formula adapted for spherical coordinates
    area = 0.0
    n = len(coords_rad)
    
    for i in range(n - 1):
        lon1, lat1 = coords_rad[i]
        lon2, lat2 = coords_rad[i + 1]
        
        # Calculate the area contribution of this edge
        area += (lon2 - lon1) * (2 + math.sin(lat1) + math.sin(lat2))
    
    # Convert to square meters
    area = abs(area) * R * R / 2
    
    return area

def main():
    # Read the GeoJSON file
    with open('/home/bobers/grillmaps/data/official-grilling-areas.json', 'r') as f:
        data = json.load(f)
    
    print("Calculating areas of official grilling spots in Berlin\n")
    print("=" * 80)
    
    total_area_m2 = 0
    results = []
    
    # Process each feature
    for i, feature in enumerate(data['features'], 1):
        name = feature['properties']['name']
        district = feature['properties']['district']
        
        # Get the coordinates from the MultiPolygon
        # MultiPolygon structure: [[[polygon1]], [[polygon2]], ...]
        # We need to handle the nested structure
        geometry = feature['geometry']
        coordinates = geometry['coordinates'][0][0]  # First polygon, first ring
        
        # Calculate area
        area_m2 = calculate_polygon_area_wgs84(coordinates)
        area_km2 = area_m2 / 1_000_000
        
        results.append({
            'name': name,
            'district': district,
            'area_m2': area_m2,
            'area_km2': area_km2
        })
        
        total_area_m2 += area_m2
        
        print(f"{i}. {name}")
        print(f"   District: {district}")
        print(f"   Area: {area_m2:,.2f} m² ({area_km2:.6f} km²)")
        print()
    
    # Calculate totals
    total_area_km2 = total_area_m2 / 1_000_000
    berlin_area_km2 = 891.8
    percentage = (total_area_km2 / berlin_area_km2) * 100
    
    print("=" * 80)
    print(f"\nTOTAL GRILLING AREA:")
    print(f"  - {total_area_m2:,.2f} square meters")
    print(f"  - {total_area_km2:.6f} square kilometers")
    print(f"\nBerlin's total area: {berlin_area_km2} km²")
    print(f"Grilling areas represent: {percentage:.6f}% of Berlin's total area")
    
    # Additional statistics
    print(f"\nAverage grilling area size: {total_area_m2/len(results):,.2f} m² ({total_area_km2/len(results):.6f} km²)")
    
    # Sort by size
    results_sorted = sorted(results, key=lambda x: x['area_m2'], reverse=True)
    print(f"\nLargest grilling area: {results_sorted[0]['name']} ({results_sorted[0]['area_m2']:,.2f} m²)")
    print(f"Smallest grilling area: {results_sorted[-1]['name']} ({results_sorted[-1]['area_m2']:,.2f} m²)")

if __name__ == "__main__":
    main()