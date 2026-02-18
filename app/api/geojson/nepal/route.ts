import { NextResponse } from 'next/server';

// GET Nepal districts GeoJSON
export async function GET() {
  try {
    // Import nepal-geojson on server side
    const nepalGeojson = require('nepal-geojson');
    const districtsGeo = nepalGeojson.districts();
    
    return NextResponse.json({
      success: true,
      data: districtsGeo
    });
  } catch (error) {
    console.error('Error loading Nepal GeoJSON:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load GeoJSON data' },
      { status: 500 }
    );
  }
}
