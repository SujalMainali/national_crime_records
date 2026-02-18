import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET single person
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'persons.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const person = await queryOne('SELECT * FROM persons WHERE id = ?', [id]);

    if (!person) {
      return NextResponse.json(
        { success: false, message: 'Person not found' },
        { status: 404 }
      );
    }

    // Get cases this person is involved in
    const cases = await executeQuery(
      `SELECT c.case_id, c.fir_no, c.crime_type, c.case_status, c.fir_date_time, 
              cp.role, s.station_name
       FROM case_persons cp
       JOIN cases c ON cp.case_id = c.case_id
       JOIN police_stations s ON c.station_id = s.id
       WHERE cp.person_id = ?
       ORDER BY c.fir_date_time DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: { ...person, cases },
    });
  } catch (error) {
    console.error('Get person error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update person
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'persons.update')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    await executeQuery(
      `UPDATE persons 
       SET first_name = ?, middle_name = ?, last_name = ?, date_of_birth = ?,
           gender = ?, citizenship = ?, national_id = ?, contact_number = ?,
           email = ?, address = ?, city = ?, state = ?, photo = ?, signature = ?
       WHERE id = ?`,
      [
        data.first_name,
        data.middle_name || null,
        data.last_name,
        data.date_of_birth || null,
        data.gender,
        data.citizenship || null,
        data.national_id || null,
        data.contact_number || null,
        data.email || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.photo || null,
        data.signature || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Person updated successfully',
    });
  } catch (error) {
    console.error('Update person error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE person
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'persons.delete')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await executeQuery('DELETE FROM persons WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Person deleted successfully',
    });
  } catch (error) {
    console.error('Delete person error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
