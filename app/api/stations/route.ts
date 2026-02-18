import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET all stations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'stations.read')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const code = searchParams.get('station_code');
    const district = searchParams.get('district');

    let query = `SELECT *, 
                        state_province as state, 
                        ward_no as ward, 
                        address_line as address, 
                        phone as contact_number, 
                        jurisdiction_area as jurisdiction 
                 FROM police_stations WHERE 1=1`;
    const params: any[] = [];

    if (search) {
      query += ` AND (station_name ILIKE ? OR station_code ILIKE ? OR district ILIKE ?
                  OR municipality ILIKE ? OR state_province ILIKE ? OR address_line ILIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (code) {
      query += ' AND station_code = ?';
      params.push(code);
    }

    if (district) {
      query += ' AND LOWER(district) = LOWER(?)';
      params.push(district);
    }

    query += ' ORDER BY station_name ASC';

    const stations = await executeQuery(query, params);

    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error('Get stations error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST create new station
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'stations.create')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();

    const station_code = (data.station_code || '').trim();
    const station_name = (data.station_name || '').trim();
    const established_date = data.established_date || null;
    const jurisdiction = (data.jurisdiction_area || data.jurisdiction || '').trim();

    // Validation
    if (!station_code || !station_name) {
      return NextResponse.json(
        { success: false, message: 'Station code and name are required' },
        { status: 400 }
      );
    }

    if (!established_date) {
      return NextResponse.json(
        { success: false, message: 'Established date is required' },
        { status: 400 }
      );
    }

    if (!jurisdiction) {
      return NextResponse.json(
        { success: false, message: 'Jurisdiction area is required' },
        { status: 400 }
      );
    }

    // Check if station code already exists
    const existing = await queryOne(
      'SELECT id FROM police_stations WHERE station_code = ?',
      [station_code]
    );

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Station code already exists' },
        { status: 400 }
      );
    }

    const state = data.state_province || data.state || null;
    const district = data.district || null;
    const municipality = data.municipality || null;
    const ward = data.ward_no || data.ward || null;
    const address = data.address_line || data.address || null;
    const contact_number = data.phone || data.contact_number || null;
    const email = data.email || null;
    const incharge_officer_id = data.incharge_officer_id ? Number(data.incharge_officer_id) : null;

    const result = await executeQuery(
      `INSERT INTO police_stations
       (station_code, station_name, state_province, district, municipality, ward_no, address_line,
        phone, email, jurisdiction_area, incharge_officer_id, established_date, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        station_code,
        station_name,
        state,
        district,
        municipality,
        ward,
        address,
        contact_number,
        email,
        jurisdiction,
        incharge_officer_id,
        established_date,
        data.photo || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Police station created successfully',
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error('Create station error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
