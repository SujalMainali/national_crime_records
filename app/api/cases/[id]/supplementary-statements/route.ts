import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET all supplementary statements for a case
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { id: caseId } = await params;

        const statements = await executeQuery<any[]>(
            `SELECT ss.id, ss.statement, ss.statement_date, ss.remarks, ss.created_at,
                    cp.id as case_person_id, cp.role,
                    p.id as person_id, p.first_name, p.last_name, p.photo,
                    u.username as recorded_by_username,
                    o.first_name as recorded_by_first_name, o.last_name as recorded_by_last_name, o.rank as recorded_by_rank
             FROM supplementary_statements ss
             JOIN case_persons cp ON ss.case_person_id = cp.id
             JOIN persons p ON cp.person_id = p.id
             LEFT JOIN users u ON ss.recorded_by_user_id = u.id
             LEFT JOIN officers o ON u.officer_id = o.id
             WHERE cp.case_id = $1
             ORDER BY ss.statement_date DESC`,
            [caseId]
        );

        return NextResponse.json({ success: true, data: statements });
    } catch (error) {
        console.error('Fetch supplementary statements error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new supplementary statement
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { id: caseId } = await params;
        const { case_person_id, statement, remarks } = await request.json();

        if (!case_person_id || !statement?.trim()) {
            return NextResponse.json({ success: false, message: 'Case person and statement are required' }, { status: 400 });
        }

        // Verify the case_person exists and belongs to this case
        const casePerson = await queryOne<any>(
            `SELECT cp.id, cp.role, p.first_name, p.last_name, p.id as person_id
             FROM case_persons cp
             JOIN persons p ON cp.person_id = p.id
             WHERE cp.id = $1 AND cp.case_id = $2`,
            [case_person_id, caseId]
        );

        if (!casePerson) {
            return NextResponse.json({ success: false, message: 'Person not found in this case' }, { status: 404 });
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

        // Insert the supplementary statement
        const result = await executeQuery<any[]>(
            `INSERT INTO supplementary_statements (case_person_id, statement, remarks, recorded_by_user_id)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [case_person_id, statement.trim(), remarks || null, user.id]
        );

        const newStatementId = result && result.length > 0 ? result[0].id : null;

        // Track this action in fir_track_records
        const personName = `${casePerson.first_name} ${casePerson.last_name}`;
        await executeQuery(
            `INSERT INTO fir_track_records (case_id, action_type, action_description, performed_by_user_id)
             VALUES ($1, 'Supplementary Statement', $2, $3)`,
            [
                caseId,
                `Supplementary statement recorded for ${casePerson.role}: ${personName}`,
                user.id
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Supplementary statement added successfully',
            data: { id: newStatementId }
        });
    } catch (error) {
        console.error('Add supplementary statement error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
