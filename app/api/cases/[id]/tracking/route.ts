
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET tracking history for a case
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

        const timeline = await executeQuery<any[]>(
            `SELECT t.id, t.track_date_time, t.action_type, t.old_status, t.new_status, t.action_description,
              u.username,
              o.first_name, o.last_name, o.rank, o.badge_number
       FROM fir_track_records t
       LEFT JOIN users u ON t.performed_by_user_id = u.id
       LEFT JOIN officers o ON u.officer_id = o.id
       WHERE t.case_id = $1
       ORDER BY t.track_date_time DESC`,
            [id]
        );

        return NextResponse.json({ success: true, data: timeline });
    } catch (error) {
        console.error('Fetch tracking error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
