import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Trim the search query and create search term
        const trimmedQuery = query.trim();
        const searchTerm = `%${trimmedQuery}%`;

        // Enhanced search: 
        // - Matches first_name, last_name, middle_name, national_id individually
        // - Matches "first_name last_name" for full name (when middle_name is NULL)
        // - Matches "first_name middle_name last_name" for full name with middle name
        // Using TRIM to handle extra spaces
        const persons = await executeQuery<any[]>(
            `SELECT id, first_name, middle_name, last_name, gender, date_of_birth, national_id, city 
             FROM persons 
             WHERE first_name ILIKE ? 
                OR last_name ILIKE ? 
                OR middle_name ILIKE ?
                OR national_id ILIKE ?
                OR TRIM(CONCAT(first_name, ' ', last_name)) ILIKE ?
                OR TRIM(CONCAT(first_name, ' ', COALESCE(middle_name || ' ', ''), last_name)) ILIKE ?
             ORDER BY first_name ASC
             LIMIT 20`,
            [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
        );

        console.log(`Person search for "${trimmedQuery}" found ${persons?.length || 0} results`);

        return NextResponse.json({ success: true, data: persons || [] });
    } catch (error) {
        console.error('Search persons error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}


