import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET comprehensive case report data
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

    // 1. Case details with station and registering officer
    const caseData = await queryOne<any>(
      `SELECT c.case_id, c.fir_no, c.fir_date_time, c.crime_type, c.crime_section,
              c.incident_date_time, c.incident_location, c.incident_district,
              c.case_priority, c.case_status, c.summary, c.created_at, c.updated_at,
              c.station_id, c.officer_id,
              s.station_name, s.station_code, s.state_province, s.district,
              s.municipality, s.ward_no, s.address_line as station_address,
              s.phone as station_phone, s.email as station_email, s.jurisdiction_area,
              o.first_name as officer_first_name, o.middle_name as officer_middle_name,
              o.last_name as officer_last_name, o.rank as officer_rank,
              o.badge_number as officer_badge, o.department as officer_department,
              o.contact_number as officer_contact, o.signature as officer_signature, o.photo as officer_photo,
              s.photo as station_photo,
              io.first_name as incharge_first_name, io.last_name as incharge_last_name,
              io.rank as incharge_rank, io.badge_number as incharge_badge
       FROM cases c
       LEFT JOIN police_stations s ON c.station_id = s.id
       LEFT JOIN officers o ON c.officer_id = o.id
       LEFT JOIN officers io ON s.incharge_officer_id = io.id
       WHERE c.case_id = $1`,
      [id]
    );

    if (!caseData) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Access check
    if (user.role !== 'Admin' && user.station_id) {
      if (caseData.station_id !== user.station_id) {
        return NextResponse.json({ success: false, message: 'Access Denied' }, { status: 403 });
      }
    }

    // 2. Persons linked to case with roles and statements
    const persons = await executeQuery<any[]>(
      `SELECT cp.id as link_id, cp.role, cp.is_primary, cp.statement, cp.added_at,
              p.id as person_id, p.first_name, p.middle_name, p.last_name,
              p.date_of_birth, p.gender, p.citizenship, p.national_id,
              p.contact_number, p.email, p.address, p.city, p.state, p.photo,
              p.signature as person_signature
       FROM case_persons cp
       JOIN persons p ON cp.person_id = p.id
       WHERE cp.case_id = $1
       ORDER BY cp.is_primary DESC, cp.role ASC, cp.added_at ASC`,
      [id]
    );

    // 3. Supplementary statements
    const supplementaryStatements = await executeQuery<any[]>(
      `SELECT ss.id, ss.statement, ss.statement_date, ss.remarks, ss.created_at,
              cp.id as case_person_id, cp.role,
              p.id as person_id, p.first_name, p.last_name,
              u.username as recorded_by_username,
              o.first_name as recorded_by_first_name, o.last_name as recorded_by_last_name,
              o.rank as recorded_by_rank
       FROM supplementary_statements ss
       JOIN case_persons cp ON ss.case_person_id = cp.id
       JOIN persons p ON cp.person_id = p.id
       LEFT JOIN users u ON ss.recorded_by_user_id = u.id
       LEFT JOIN officers o ON u.officer_id = o.id
       WHERE cp.case_id = $1
       ORDER BY ss.statement_date ASC`,
      [id]
    );

    // 4. Evidence
    const evidence = await executeQuery<any[]>(
      `SELECT e.id, e.evidence_code, e.evidence_type, e.description,
              e.collected_date_time, e.file_path, e.status,
              o.first_name as collected_by_first_name, o.last_name as collected_by_last_name,
              o.rank as collected_by_rank, o.badge_number as collected_by_badge
       FROM evidence e
       LEFT JOIN officers o ON e.collected_by = o.id
       WHERE e.case_id = $1
       ORDER BY e.collected_date_time ASC`,
      [id]
    );

    // 5. Tracking records (timeline)
    const trackingRecords = await executeQuery<any[]>(
      `SELECT t.id, t.track_date_time, t.action_type, t.old_status, t.new_status,
              t.action_description,
              u.username,
              o.first_name, o.last_name, o.rank, o.badge_number
       FROM fir_track_records t
       LEFT JOIN users u ON t.performed_by_user_id = u.id
       LEFT JOIN officers o ON u.officer_id = o.id
       WHERE t.case_id = $1
       ORDER BY t.track_date_time ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        caseDetails: caseData,
        persons,
        supplementaryStatements,
        evidence,
        trackingRecords,
      }
    });
  } catch (error) {
    console.error('Fetch case report error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
