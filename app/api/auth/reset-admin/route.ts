import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const password = 'admin123';
        const hash = await hashPassword(password);

        // Check if admin user exists
        const existingAdmin = await queryOne(
            "SELECT id FROM users WHERE username = 'admin'",
            []
        );

        if (existingAdmin) {
            // Update existing admin
            await executeQuery(
                "UPDATE users SET password_hash = ?, is_active = TRUE WHERE username = 'admin'",
                [hash]
            );
        } else {
            // Create admin user
            await executeQuery(
                `INSERT INTO users (username, password_hash, role, is_active) 
                 VALUES ('admin', ?, 'Admin', TRUE)`,
                [hash]
            );
        }

        return NextResponse.json({
            success: true,
            message: existingAdmin ? 'Admin password reset to: admin123' : 'Admin user created with password: admin123',
            new_hash: hash
        });
    } catch (error: any) {
        console.error('Reset admin error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
