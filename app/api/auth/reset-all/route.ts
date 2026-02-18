import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const password = 'admin123';
        const hash = await hashPassword(password);

        // Update ALL users to have this trusted hash
        await executeQuery(
            "UPDATE users SET password_hash = ?",
            [hash]
        );

        return NextResponse.json({
            success: true,
            message: 'ALL users password reset to: admin123',
            new_hash: hash
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
