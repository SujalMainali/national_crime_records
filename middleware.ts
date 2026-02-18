import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';

// Inline session options to avoid importing auth.ts (which has bcryptjs - not edge compatible)
const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: process.env.SESSION_NAME || 'fir_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TTL || '86400'),
  },
};

interface SessionData {
  user?: {
    id: number;
    username: string;
    role: string;
    station_id?: number;
  };
  isLoggedIn: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login'];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected routes, check if user has a session cookie
  const sessionCookie = request.cookies.get('fir_session');

  if (!sessionCookie) {
    // Redirect to login for web pages
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Return 401 for API routes
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Role-based route restrictions
  // Parse session to get user role (using iron-session)
  try {
    const response = NextResponse.next();
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (session.user) {
      const role = session.user.role;

      // Define restricted routes per role
      const roleRestrictedRoutes: Record<string, string[]> = {
        // Officer cannot access station management, user management, or officer management pages
        Officer: ['/stations', '/users', '/officers'],
        // StationAdmin cannot access station creation, user management
        StationAdmin: ['/stations/new', '/users'],
      };

      const restricted = roleRestrictedRoutes[role] || [];

      for (const route of restricted) {
        if (pathname === route || pathname.startsWith(route + '/')) {
          // Allow StationAdmin to access /officers (they manage their station officers)
          if (role === 'StationAdmin' && pathname.startsWith('/officers')) {
            continue;
          }
          // Allow StationAdmin to view their own station details
          if (role === 'StationAdmin' && pathname === `/stations/${session.user.station_id}`) {
            continue;
          }

          if (!pathname.startsWith('/api/')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
          return NextResponse.json(
            { success: false, message: 'Access denied for your role' },
            { status: 403 }
          );
        }
      }

      return response;
    }
  } catch (error) {
    // If session parsing fails, still allow through (API routes handle their own auth)
    console.error('Middleware session parse error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
