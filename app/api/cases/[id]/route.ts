import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // Fetch case with station name and officer details
    const caseData = await queryOne<any>(
      `SELECT c.case_id as id, c.fir_no, c.crime_type, c.crime_section,
              c.case_status, c.case_priority, 
              c.fir_date_time, c.incident_date_time, c.incident_location,
              c.incident_district, c.summary, c.summary as description,
              c.station_id, c.created_at, c.updated_at,
              s.station_name, s.station_code,
              o.id as officer_id,
              CONCAT(o.first_name, ' ', o.last_name) as officer_name,
              o.rank as officer_rank,
              o.badge_number as officer_badge,
              o.contact_number as officer_contact,
              o.department as officer_department,
              o.photo as officer_photo
       FROM cases c
       LEFT JOIN police_stations s ON c.station_id = s.id
       LEFT JOIN officers o ON c.officer_id = o.id
       WHERE c.case_id = $1`,
      [id]
    );

    if (!caseData) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Check Access (Admin or same station)
    if (user.role !== 'Admin' && user.station_id) {
      if (caseData.station_id !== user.station_id) {
        return NextResponse.json({ success: false, message: 'Access Denied: Case is from another station.' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: caseData });
  } catch (error) {
    console.error('Fetch case details error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update case (status, priority, etc)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) { // Add permission check if needed
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const { action_type: customActionType, action_description: customActionDescription, ...updateData } = data;

    // Fetch current state
    const currentCase = await queryOne<any>(
      'SELECT case_status, fir_no, station_id FROM cases WHERE case_id = $1',
      [id]
    );

    if (!currentCase) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Permission check
    if (user.role !== 'Admin' && user.station_id) {
      if (currentCase.station_id !== user.station_id) {
        return NextResponse.json({ success: false, message: 'Access Denied' }, { status: 403 });
      }
    }

    // Get current case data for tracking
    const fullCurrentCase = await queryOne<any>(
      'SELECT case_status, case_priority, summary, fir_no, station_id FROM cases WHERE case_id = $1',
      [id]
    );

    // Update
    await executeQuery(
      `UPDATE cases 
         SET case_status = COALESCE($1, case_status), 
             case_priority = COALESCE($2, case_priority),
             summary = COALESCE($3, summary),
             updated_at = CURRENT_TIMESTAMP
         WHERE case_id = $4`,
      [updateData.case_status, updateData.case_priority, updateData.summary, id]
    );

    // Track Status Change
    if (updateData.case_status && updateData.case_status !== fullCurrentCase.case_status) {
      const desc = customActionDescription
        ? `Case status updated from ${fullCurrentCase.case_status} to ${updateData.case_status}. ${customActionDescription}`
        : `Case status updated from ${fullCurrentCase.case_status} to ${updateData.case_status}`;
      await executeQuery(
        `INSERT INTO fir_track_records 
             (case_id, action_type, action_description, old_status, new_status, performed_by_user_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          customActionType || 'Status Change',
          desc,
          fullCurrentCase.case_status,
          updateData.case_status,
          user.id
        ]
      );
    }

    // Track Priority Change
    if (updateData.case_priority && updateData.case_priority !== fullCurrentCase.case_priority) {
      const desc = customActionDescription
        ? `Case priority updated from ${fullCurrentCase.case_priority} to ${updateData.case_priority}. ${customActionDescription}`
        : `Case priority updated from ${fullCurrentCase.case_priority} to ${updateData.case_priority}`;
      await executeQuery(
        `INSERT INTO fir_track_records 
             (case_id, action_type, action_description, old_status, new_status, performed_by_user_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          customActionType || 'Priority Change',
          desc,
          fullCurrentCase.case_priority,
          updateData.case_priority,
          user.id
        ]
      );
    }

    // Track Summary/Description Update
    if (updateData.summary && updateData.summary !== fullCurrentCase.summary) {
      await executeQuery(
        `INSERT INTO fir_track_records 
             (case_id, action_type, action_description, performed_by_user_id)
             VALUES ($1, 'Description Update', $2, $3)`,
        [
          id,
          customActionDescription || `Case description/summary was updated`,
          user.id
        ]
      );
    }

    // If custom action type provided but no status/priority/summary changed, still log the action
    if (customActionType && customActionDescription) {
      const statusChanged = updateData.case_status && updateData.case_status !== fullCurrentCase.case_status;
      const priorityChanged = updateData.case_priority && updateData.case_priority !== fullCurrentCase.case_priority;
      const summaryChanged = updateData.summary && updateData.summary !== fullCurrentCase.summary;

      if (!statusChanged && !priorityChanged && !summaryChanged) {
        await executeQuery(
          `INSERT INTO fir_track_records 
               (case_id, action_type, action_description, performed_by_user_id)
               VALUES ($1, $2, $3, $4)`,
          [id, customActionType, customActionDescription, user.id]
        );
      }
    }


    return NextResponse.json({ success: true, message: 'Case updated successfully' });

  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
