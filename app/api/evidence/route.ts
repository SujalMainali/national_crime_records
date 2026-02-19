import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET all evidence
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'evidence.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('case_id');
    const search = searchParams.get('search');

    let query = `
      SELECT e.*, 
             c.fir_no, c.crime_type,
             CONCAT(o.first_name, ' ', o.last_name) as collected_by_name,
             o.rank as collected_by_rank
      FROM evidence e
      LEFT JOIN cases c ON e.case_id = c.case_id
      LEFT JOIN officers o ON e.collected_by = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (caseId) {
      query += ' AND e.case_id = ?';
      params.push(caseId);
    }

    if (search) {
      query += ' AND (e.evidence_code LIKE ? OR e.evidence_type LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.collected_date_time DESC';

    const evidence = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: evidence,
    });
  } catch (error) {
    console.error('Get evidence error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new evidence
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'evidence.create')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Generate evidence code if not provided
    let evidenceCode = data.evidence_code;
    if (!evidenceCode) {
      const caseData = await queryOne<any>(
        'SELECT fir_no FROM cases WHERE case_id = ?',
        [data.case_id]
      );

      if (!caseData) {
        return NextResponse.json(
          { success: false, message: 'Invalid Case ID' },
          { status: 400 }
        );
      }

      const count = await queryOne<any>(
        'SELECT COUNT(*) as count FROM evidence WHERE case_id = ?',
        [data.case_id]
      );
      evidenceCode = `${caseData.fir_no}/E${String((count?.count || 0) + 1)}`;
    }

    // Use provided collected_by or default to logged-in user's officer_id
    const collectedBy = data.collected_by || user.officer_id || null;

    const result = await executeQuery(
      `INSERT INTO evidence 
       (evidence_code, case_id, evidence_type, description, collected_date_time,
        collected_by, file_path)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        evidenceCode,
        data.case_id,
        data.evidence_type,
        data.description,
        data.collection_date, // Mapped to collected_date_time
        collectedBy,
        data.file_path || null,
      ]
    );

    // Get the ID from RETURNING clause
    const evidenceId = Array.isArray(result) && result.length > 0 ? result[0].id : null;

    // Log action
    const evidenceDesc = data.description ? `: ${data.description}` : '';
    await executeQuery(
      `INSERT INTO fir_track_records 
       (case_id, action_type, action_description, performed_by_user_id)
       VALUES (?, ?, ?, ?)`,
      [
        data.case_id,
        'Add Evidence',
        `Evidence ${evidenceCode} collected${evidenceDesc}`,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Evidence added successfully',
      data: { id: evidenceId, evidence_id: evidenceId, evidence_code: evidenceCode },
    });
  } catch (error) {
    console.error('Create evidence error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

