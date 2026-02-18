import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { sendPasswordResetEmail, generatePassword } from '@/lib/email';

// POST reset user password
export async function POST(
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

        // Don't allow resetting own password through this endpoint
        if (user.id === parseInt(id)) {
            return NextResponse.json(
                { success: false, message: 'Cannot reset your own password. Use the profile settings instead.' },
                { status: 400 }
            );
        }

        // Get user details with officer information
        const targetUser = await queryOne<any>(
            `SELECT u.id, u.username, u.officer_id,
              o.first_name, o.middle_name, o.last_name, o.email
       FROM users u
       LEFT JOIN officers o ON u.officer_id = o.id
       WHERE u.id = ?`,
            [id]
        );

        if (!targetUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        if (!targetUser.email) {
            return NextResponse.json(
                { success: false, message: 'User does not have an email address. Cannot send reset credentials.' },
                { status: 400 }
            );
        }

        // Generate new password
        const newPassword = generatePassword();
        const passwordHash = await hashPassword(newPassword);

        // Update password
        await executeQuery(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [passwordHash, id]
        );

        // Send email with new credentials
        const officerFullName = [targetUser.first_name, targetUser.middle_name, targetUser.last_name]
            .filter(Boolean)
            .join(' ') || targetUser.username;

        const emailSent = await sendPasswordResetEmail({
            to: targetUser.email,
            officerName: officerFullName,
            username: targetUser.username,
            newPassword: newPassword,
        });

        return NextResponse.json({
            success: true,
            message: emailSent
                ? `Password reset successfully. New credentials sent to ${targetUser.email}`
                : `Password reset successfully, but failed to send email. Please manually share the new password.`,
            data: {
                emailSent: emailSent,
                email: targetUser.email,
                // Only include passwo
                // rd in response if email failed (for manual sharing)
                ...(emailSent ? {} : { newPassword: newPassword })
            },
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
