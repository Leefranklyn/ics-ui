import { TokenPayload, Role } from '@/types';

export function decodeToken(token: string): TokenPayload {
  try {
    const base64 = token.split('.')[1];
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch (e) {
    throw new Error('Invalid token');
  }
}

export function hasRole(user: TokenPayload | null, roles: Role[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}
