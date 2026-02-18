import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// POST: Add additional statement for an existing case person
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id: caseId, linkId } = await params;
    const { statement } = await request.json();

    if (!statement || !statement.trim()) {
      return NextResponse.json({ success: false, message: 'Statement is required' }, { status: 400 });
    }

    // Verify the link exists and get person details
    const linkData = await queryOne<any>(
      `SELECT cp.id, cp.case_id, cp.person_id, cp.role, cp.statement as existing_statement,
              p.first_name, p.last_name
       FROM case_persons cp
       JOIN persons p ON cp.person_id = p.id
       WHERE cp.id = $1 AND cp.case_id = $2`,
      [linkId, caseId]
    );

    if (!linkData) {
      return NextResponse.json({ success: false, message: 'Person link not found for this case' }, { status: 404 });
    }

    // Check case access
    const caseData = await queryOne<any>(
      'SELECT station_id FROM cases WHERE case_id = $1',
      [caseId]
    );

    if (!caseData) {
      return NextResponse.json({ success: false, message: 'Case not found' }, { status: 404 });
    }

    // Permission check
    if (user.role !== 'Admin' && user.station_id) {
      if (caseData.station_id !== user.station_id) {
        return NextResponse.json({ success: false, message: 'Access Denied' }, { status: 403 });
      }
    }

    // Append the new statement with timestamp
    const timestamp = new Date().toISOString();
    const newStatementEntry = `[${timestamp}] ${statement.trim()}`;
    
    let updatedStatement: string;
    if (linkData.existing_statement) {
      // Append to existing statement with separator
      updatedStatement = `${linkData.existing_statement}\n\n---\n\n${newStatementEntry}`;
    } else {
      updatedStatement = newStatementEntry;
    }

    // Update the case_persons table with the new statement
    await executeQuery(
      `UPDATE case_persons SET statement = $1 WHERE id = $2`,
      [updatedStatement, linkId]
    );

    // Track this action in fir_track_records
    const personName = `${linkData.first_name} ${linkData.last_name}`;
    await executeQuery(
      `INSERT INTO fir_track_records (case_id, action_type, action_description, performed_by_user_id)
       VALUES ($1, 'Additional Statement Record', $2, $3)`,
      [
        caseId,
        `Additional statement recorded for ${linkData.role}: ${personName} (Person ID: ${linkData.person_id})`,
        user.id
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Statement added successfully',
      data: { updated_statement: updatedStatement }
    });
  } catch (error) {
    console.error('Add statement error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// GET: Get all statements for a specific case person
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id: caseId, linkId } = await params;

    const linkData = await queryOne<any>(
      `SELECT cp.id, cp.statement, cp.role, cp.added_at,
              p.first_name, p.last_name, p.id as person_id
       FROM case_persons cp
       JOIN persons p ON cp.person_id = p.id
       WHERE cp.id = $1 AND cp.case_id = $2`,
      [linkId, caseId]
    );

    if (!linkData) {
      return NextResponse.json({ success: false, message: 'Person link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: linkData });
  } catch (error) {
    console.error('Get statement error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
