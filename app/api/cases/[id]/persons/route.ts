import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all persons linked to a specific case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Type as Promise
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params; // Await params

    const people = await executeQuery<any[]>(
      `SELECT cp.id as link_id, cp.role, cp.is_primary, cp.statement, cp.added_at,
              p.id as person_id, p.first_name, p.middle_name, p.last_name, 
              p.gender, p.contact_number, p.photo, p.national_id, p.signature
       FROM case_persons cp
       JOIN persons p ON cp.person_id = p.id
       WHERE cp.case_id = $1
       ORDER BY cp.is_primary DESC, cp.role ASC, cp.added_at DESC`,
      [id]
    );

    return NextResponse.json({ success: true, data: people });
  } catch (error) {
    console.error('Fetch case persons error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Link an EXISTING person to the case
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { person_id, role, is_primary, statement } = await request.json();
    const { id } = await params;
    const caseId = id;

    if (!person_id || !role) {
      return NextResponse.json({ success: false, message: 'Person ID and Role are required' }, { status: 400 });
    }

    // Check if already linked
    const existing = await queryOne(
      'SELECT id FROM case_persons WHERE case_id = $1 AND person_id = $2',
      [caseId, person_id]
    );

    if (existing) {
      return NextResponse.json({ success: false, message: 'Person is already linked to this case' }, { status: 400 });
    }

    await executeQuery(
      `INSERT INTO case_persons (case_id, person_id, role, is_primary, statement)
       VALUES ($1, $2, $3, $4, $5)`,
      [caseId, person_id, role, is_primary || false, statement || null]
    );

    // Track this action
    await executeQuery(
      `INSERT INTO fir_track_records (case_id, action_type, action_description, performed_by_user_id)
       VALUES ($1, 'Add New Case Member', $2, $3)`,
      [caseId, `Added ${role}: Person ID ${person_id}`, user.id]
    );

    if (statement) {
      await executeQuery(
        `INSERT INTO fir_track_records (case_id, action_type, action_description, performed_by_user_id)
             VALUES ($1, 'Additional Statement Record', $2, $3)`,
        [caseId, `Statement recorded for ${role} (Person ID ${person_id})`, user.id]
      );
    }

    return NextResponse.json({ success: true, message: 'Person linked successfully' });
  } catch (error) {
    console.error('Link person error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

