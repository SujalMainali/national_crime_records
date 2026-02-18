import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET single evidence
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'evidence.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const evidence = await queryOne(
      `SELECT e.*, 
              c.fir_no, c.crime_type, c.case_status,
              CONCAT(o.first_name, ' ', o.last_name) as collected_by_name,
              o.rank as collected_by_rank, o.badge_number
       FROM evidence e
       LEFT JOIN cases c ON e.case_id = c.case_id
       LEFT JOIN officers o ON e.collected_by = o.id
       WHERE e.id = ?`,
      [id]
    );

    if (!evidence) {
      return NextResponse.json(
        { success: false, message: 'Evidence not found' },
        { status: 404 }
      );
    }

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

// PUT update evidence
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'evidence.update')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    const evidence = await queryOne<any>('SELECT case_id, status FROM evidence WHERE id = ?', [id]);

    await executeQuery(
      `UPDATE evidence 
       SET evidence_type = ?, description = ?, collected_date_time = ?,
           file_path = ?, status = ?
       WHERE id = ?`,
      [
        data.evidence_type,
        data.description,
        data.collection_date,
        data.file_path || null,
        data.status,
        id,
      ]
    );



    return NextResponse.json({
      success: true,
      message: 'Evidence updated successfully',
    });
  } catch (error) {
    console.error('Update evidence error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE evidence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'evidence.delete')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await executeQuery('DELETE FROM evidence WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Evidence deleted successfully',
    });
  } catch (error) {
    console.error('Delete evidence error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
