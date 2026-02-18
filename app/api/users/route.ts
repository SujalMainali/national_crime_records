import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, queryOne } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { sendCredentialsEmail, generateUsername, generatePassword } from '@/lib/email';

// GET all users
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'users.read')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    let query = `
      SELECT u.id, u.username, u.role, u.station_id, u.officer_id, 
             u.is_active, u.last_login, u.created_at,
             s.station_name, s.station_code,
             o.first_name, o.middle_name, o.last_name, o.badge_number
      FROM users u
      LEFT JOIN police_stations s ON u.station_id = s.id
      LEFT JOIN officers o ON u.officer_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND u.username LIKE ?';
      params.push(`%${search}%`);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    query += ' ORDER BY u.created_at DESC';

    const users = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new user (linked to officer with auto-generated credentials)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, 'users.create')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.officer_id) {
      return NextResponse.json(
        { success: false, message: 'Officer selection is required. User must be linked to an officer.' },
        { status: 400 }
      );
    }

    if (!data.role) {
      return NextResponse.json(
        { success: false, message: 'Role is required.' },
        { status: 400 }
      );
    }

    // Get officer details
    const officer = await queryOne<any>(
      `SELECT o.id, o.first_name, o.middle_name, o.last_name, o.badge_number, o.email, o.station_id,
              s.station_name
       FROM officers o
       LEFT JOIN police_stations s ON o.station_id = s.id
       WHERE o.id = ?`,
      [data.officer_id]
    );

    if (!officer) {
      return NextResponse.json(
        { success: false, message: 'Selected officer not found.' },
        { status: 400 }
      );
    }

    // Check if officer's email exists
    if (!officer.email) {
      return NextResponse.json(
        { success: false, message: 'Officer does not have an email address. Please update the officer record first.' },
        { status: 400 }
      );
    }

    // RULE 1: Check if officer already has an account
    const existingAccount = await queryOne<any>(
      'SELECT id, username FROM users WHERE officer_id = ?',
      [data.officer_id]
    );

    if (existingAccount) {
      return NextResponse.json(
        { success: false, message: `This officer already has an account (Username: ${existingAccount.username}). Each officer can only have one user account.` },
        { status: 400 }
      );
    }

    // Determine station_id (use officer's station or provided station)
    const stationId = data.station_id || officer.station_id;

    if (!stationId && data.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'Station is required for non-Admin roles.' },
        { status: 400 }
      );
    }

    // RULE 2: Check station admin limit (max 2 per station)
    if (data.role === 'StationAdmin' && stationId) {
      const stationAdminCount = await queryOne<any>(
        'SELECT COUNT(*) as count FROM users WHERE role = ? AND station_id = ?',
        ['StationAdmin', stationId]
      );

      if (parseInt(stationAdminCount?.count || '0') >= 2) {
        return NextResponse.json(
          { success: false, message: 'This station already has 2 Station Admins. Maximum limit reached. Each station can have at most 2 Station Admins.' },
          { status: 400 }
        );
      }
    }

    // RULE 3: Auto-generate username and password
    const generatedUsername = generateUsername(officer.first_name, officer.last_name, officer.badge_number);
    const generatedPassword = generatePassword();

    // Check if generated username already exists (edge case)
    const usernameExists = await queryOne(
      'SELECT id FROM users WHERE username = ?',
      [generatedUsername]
    );

    let finalUsername = generatedUsername;
    if (usernameExists) {
      // Append random number if username exists
      finalUsername = `${generatedUsername}.${Math.floor(Math.random() * 1000)}`;
    }

    // Hash password
    const passwordHash = await hashPassword(generatedPassword);

    // Create user
    const result = await executeQuery(
      `INSERT INTO users 
       (username, password_hash, role, station_id, officer_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        finalUsername,
        passwordHash,
        data.role,
        stationId || null,
        data.officer_id,
        true, // Default to active
      ]
    );

    const newUserId = (result as any).insertId;

    // Get station name for email
    let stationName = officer.station_name;
    if (!stationName && stationId) {
      const station = await queryOne<any>(
        'SELECT station_name FROM police_stations WHERE id = ?',
        [stationId]
      );
      stationName = station?.station_name;
    }

    // RULE 4: Send credentials via email
    const officerFullName = [officer.first_name, officer.middle_name, officer.last_name]
      .filter(Boolean)
      .join(' ');

    const emailSent = await sendCredentialsEmail({
      to: officer.email,
      officerName: officerFullName,
      username: finalUsername,
      password: generatedPassword,
      role: data.role,
      stationName: stationName,
    });

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? `User created successfully. Credentials sent to ${officer.email}` 
        : `User created successfully, but failed to send email. Please manually share the credentials.`,
      data: { 
        id: newUserId, 
        username: finalUsername,
        emailSent: emailSent,
        email: officer.email,
        // Only include password in response if email failed (for manual sharing)
        ...(emailSent ? {} : { password: generatedPassword })
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
