import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    let stationFilter = '';
    const params: any[] = [];

    if (user.role !== 'Admin' && user.station_id) {
      stationFilter = 'WHERE station_id = $1';
      params.push(user.station_id);
    }

    // Total cases
    const totalCasesRes = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM cases ${stationFilter}`,
      params
    );
    const totalCases = totalCasesRes[0]?.count || 0;

    // Total stations (Admin only)
    const totalStationsRes = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM police_stations`,
      []
    );
    const totalStations = totalStationsRes[0]?.count || 0;

    // Total officers
    const totalOfficersRes = await executeQuery<any[]>(
      user.role === 'Admin' 
        ? `SELECT COUNT(*) as count FROM officers`
        : `SELECT COUNT(*) as count FROM officers WHERE station_id = $1`,
      user.role === 'Admin' ? [] : [user.station_id]
    );
    const totalOfficers = totalOfficersRes[0]?.count || 0;

    // Total users (Admin only)
    const totalUsersRes = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM users`,
      []
    );
    const totalUsers = totalUsersRes[0]?.count || 0;

    // Cases by status
    const casesByStatus = await executeQuery(
      `SELECT case_status as status, COUNT(*) as count 
       FROM cases ${stationFilter}
       GROUP BY case_status`,
      params
    );

    // Cases by priority
    const casesByPriority = await executeQuery(
      `SELECT case_priority as priority, COUNT(*) as count 
       FROM cases ${stationFilter}
       GROUP BY case_priority`,
      params
    );

    // Cases by crime type
    const casesByCrimeType = await executeQuery(
      `SELECT crime_type as type, COUNT(*) as count 
       FROM cases ${stationFilter}
       GROUP BY crime_type
       ORDER BY count DESC`,
      params
    );

    // Recent cases
    const recentCases = await executeQuery(
      `SELECT c.case_id as id, c.fir_no as fir_number, c.crime_type, c.case_status as status, c.case_priority as priority, 
              c.fir_date_time as registered_date, s.station_name
       FROM cases c
       LEFT JOIN police_stations s ON c.station_id = s.id
       ${stationFilter ? 'WHERE c.station_id = $1' : ''}
       ORDER BY c.fir_date_time DESC
       LIMIT 10`,
      params
    );

    // Monthly case trends (Postgres syntax) - FIXED
    let trendQuery = `SELECT 
         TO_CHAR(created_at, 'YYYY-MM') as month,
         COUNT(*) as count
       FROM cases
       WHERE created_at >= (NOW() - INTERVAL '6 months')
       ${stationFilter ? 'AND station_id = $1' : ''}
       GROUP BY month
       ORDER BY month DESC`;

    const monthlyTrends = await executeQuery(trendQuery, params);

    // Cases by district for map visualization
    const casesByDistrictQuery = `
      SELECT 
        UPPER(incident_district) as district,
        COUNT(*) as total,
        SUM(CASE WHEN case_status = 'Registered' THEN 1 ELSE 0 END) as registered,
        SUM(CASE WHEN case_status = 'Under Investigation' THEN 1 ELSE 0 END) as under_investigation,
        SUM(CASE WHEN case_status = 'Charge Sheet Filed' THEN 1 ELSE 0 END) as chargesheet,
        SUM(CASE WHEN case_status = 'Closed' THEN 1 ELSE 0 END) as closed
      FROM cases
      WHERE incident_district IS NOT NULL AND incident_district != ''
      ${stationFilter ? 'AND station_id = $1' : ''}
      GROUP BY UPPER(incident_district)
      ORDER BY total DESC
    `;
    const casesByDistrict = await executeQuery(casesByDistrictQuery, params);

    return NextResponse.json({
      success: true,
      data: {
        totalCases: parseInt(totalCases),
        totalStations: parseInt(totalStations),
        totalOfficers: parseInt(totalOfficers),
        totalUsers: parseInt(totalUsers),
        casesByStatus,
        casesByPriority,
        casesByCrimeType,
        recentCases,
        monthlyTrends,
        casesByDistrict,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
