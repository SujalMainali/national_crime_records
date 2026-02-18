import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all persons (with optional search)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = `SELECT id, first_name, middle_name, last_name, national_id, gender, contact_number, city, created_at FROM persons`;
    const params: any[] = [];

    if (search) {
      query += ` WHERE first_name ILIKE ? OR last_name ILIKE ? OR national_id ILIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const persons = await executeQuery(query, params);
    return NextResponse.json({ success: true, data: persons });
  } catch (error) {
    console.error('Get persons error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST create new person
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const data = await request.json();

    if (!data.first_name || !data.last_name) {
      return NextResponse.json({ success: false, message: 'First name and last name are required' }, { status: 400 });
    }

    // Map form fields to database columns
    // Form uses: citizenship_no, phone, address_line, district, municipality, ward_no, state_province
    // DB uses: national_id, contact_number, address, city, state
    const nationalId = data.citizenship_no || data.national_id || null;
    const contactNumber = data.phone || data.contact_number || null;
    const address = data.address_line || data.address || null;
    const city = data.municipality || data.city || null;
    const state = data.state_province || data.state || null;

    // Check for duplicate by national_id if provided
    if (nationalId) {
      const existing = await queryOne('SELECT id FROM persons WHERE national_id = ?', [nationalId]);
      if (existing) {
        return NextResponse.json({ success: false, message: 'Person with this National ID already exists' }, { status: 400 });
      }
    }

    const result = await executeQuery(
      `INSERT INTO persons 
       (first_name, middle_name, last_name, national_id, gender, contact_number, email, address, city, state, date_of_birth, citizenship, photo, signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        data.first_name,
        data.middle_name || null,
        data.last_name,
        nationalId,
        data.gender || null,
        contactNumber,
        data.email || null,
        address,
        city,
        state,
        data.date_of_birth || null,
        data.nationality || 'Nepali',
        data.photo || null,
        data.signature || null
      ]
    );

    const personId = (result as any)[0]?.id || (result as any).insertId;

    return NextResponse.json({
      success: true,
      message: 'Person created successfully',
      data: { id: personId }
    });
  } catch (error) {
    console.error('Create person error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
