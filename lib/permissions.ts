import { UserRole } from './types';

// Define permissions for each role
export const rolePermissions: Record<UserRole, string[]> = {
  Admin: [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'stations.create',
    'stations.read',
    'stations.update',
    'stations.delete',
    'officers.create',
    'officers.read',
    'officers.update',
    'officers.delete',
    'cases.create',
    'cases.read',
    'cases.update',
    'cases.delete',
    'persons.create',
    'persons.read',
    'persons.update',
    'persons.delete',
    'evidence.create',
    'evidence.read',
    'evidence.update',
    'evidence.delete',
    'reports.generate',
  ],
  StationAdmin: [
    'stations.read',
    'officers.create',
    'officers.read',
    'officers.update',
    'cases.create',
    'cases.read',
    'cases.update',
    'persons.create',
    'persons.read',
    'persons.update',
    'evidence.create',
    'evidence.read',
    'evidence.update',
    'reports.generate',
  ],
  Officer: [
    'stations.read',
    'officers.read',
    'cases.create',
    'cases.read',
    'cases.update',
    'persons.create',
    'persons.read',
    'persons.update',
    'evidence.create',
    'evidence.read',
    'evidence.update',
  ]
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): string[] {
  return rolePermissions[role] || [];
}
