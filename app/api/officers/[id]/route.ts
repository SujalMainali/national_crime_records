import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET single officer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'officers.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const officer = await queryOne(
      `SELECT o.*, s.station_name, s.station_code, s.district as station_district
       FROM officers o
       LEFT JOIN police_stations s ON o.station_id = s.id
       WHERE o.id = ?`,
      [id]
    );

    if (!officer) {
      return NextResponse.json(
        { success: false, message: 'Officer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: officer,
    });
  } catch (error) {
    console.error('Get officer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update officer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'officers.update')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    await executeQuery(
      `UPDATE officers 
       SET first_name = ?, middle_name = ?, last_name = ?, rank = ?, department = ?,
           station_id = ?, contact_number = ?, email = ?,
           service_status = ?, date_of_joining = ?, gender = ?,
           state_province = ?, district = ?, municipality = ?, ward_no = ?, address_line = ?,
           photo = ?, signature = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.first_name,
        data.middle_name || null,
        data.last_name,
        data.rank,
        data.department || null,
        data.station_id,
        data.contact_number || null,
        data.email || null,
        data.service_status,
        data.date_of_joining || null,
        data.gender || null,
        data.state_province || null,
        data.district || null,
        data.municipality || null,
        data.ward_no || null,
        data.address_line || null,
        data.photo || null,
        data.signature || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Officer updated successfully',
    });
  } catch (error) {
    console.error('Update officer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE officer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'officers.delete')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await executeQuery('DELETE FROM officers WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Officer deleted successfully',
    });
  } catch (error) {
    console.error('Delete officer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
