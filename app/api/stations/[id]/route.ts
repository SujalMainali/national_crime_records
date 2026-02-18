import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET single station
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'stations.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const station = await queryOne(
      `SELECT s.*, 
              s.state_province as state,
              s.ward_no as ward,
              s.address_line as address,
              s.phone as contact_number,
              s.jurisdiction_area as jurisdiction,
              CONCAT(o.first_name, ' ', o.last_name) as incharge_name,
              o.rank as incharge_rank,
              o.contact_number as incharge_contact
       FROM police_stations s
       LEFT JOIN officers o ON s.incharge_officer_id = o.id
       WHERE s.id = ?`,
      [id]
    );

    if (!station) {
      return NextResponse.json(
        { success: false, message: 'Station not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: station,
    });
  } catch (error) {
    console.error('Get station error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update station
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'stations.update')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    await executeQuery(
      `UPDATE police_stations 
       SET station_name = ?, state_province = ?, district = ?, municipality = ?,
           ward_no = ?, jurisdiction_area = ?, phone = ?, email = ?,
           address_line = ?, incharge_officer_id = ?, photo = ?,
           established_date = ?, is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.station_name,
        data.state,
        data.district,
        data.municipality || null,
        data.ward || null,
        data.jurisdiction || null,
        data.contact_number || null,
        data.email || null,
        data.address || null,
        data.incharge_officer_id || null,
        data.photo || null,
        data.established_date || null,
        data.is_active !== undefined ? data.is_active : true,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Station updated successfully',
    });
  } catch (error) {
    console.error('Update station error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE station
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'stations.delete')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await executeQuery('DELETE FROM police_stations WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Station deleted successfully',
    });
  } catch (error) {
    console.error('Delete station error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
