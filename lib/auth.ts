import bcrypt from 'bcryptjs';
import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionUser } from './types';

export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: process.env.SESSION_NAME || 'fir_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_TTL || '86400'),
  },
};

export interface SessionData {
  user?: SessionUser;
  isLoggedIn: boolean;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get session
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn || false;
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user || null;
}

// Check if user has required role
export function hasRole(user: SessionUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

// Check if user can access station data
export function canAccessStation(user: SessionUser | null, stationId: number): boolean {
  if (!user) return false;

  // Admin can access all stations
  if (user.role === 'Admin') return true;

  // StationAdmin and others can only access their assigned station
  return user.station_id === stationId;
}
