import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { sendPasswordResetEmail } from '@/lib/email';

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'users.update')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    // If password is being updated
    if (data.password) {
      const passwordHash = await hashPassword(data.password);
      await executeQuery(
        `UPDATE users 
         SET password_hash = ?, role = ?, station_id = ?, officer_id = ?, is_active = ?
         WHERE id = ?`,
        [passwordHash, data.role, data.station_id || null, data.officer_id || null, data.is_active, id]
      );
    } else {
      await executeQuery(
        `UPDATE users 
         SET role = ?, station_id = ?, officer_id = ?, is_active = ?
         WHERE id = ?`,
        [data.role, data.station_id || null, data.officer_id || null, data.is_active, id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'users.delete')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Don't allow deleting own account
    if (user.id === parseInt(id)) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await executeQuery('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
