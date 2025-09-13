import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

/**
 * Get the current session on the server side
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current user on the server side
 */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth(redirectTo: string = '/auth/login') {
  const session = await getCurrentSession();
  
  if (!session) {
    redirect(redirectTo);
  }
  
  return session;
}

/**
 * Require no authentication - redirect to dashboard if already authenticated
 */
export async function requireNoAuth(redirectTo: string = '/dashboard') {
  const session = await getCurrentSession();
  
  if (session) {
    redirect(redirectTo);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

/**
 * Get user's farm slug from session (if available)
 */
export async function getUserFarmSlug(): Promise<string | null> {
  const session = await getCurrentSession();
  // This would need to be implemented based on how you store farm info in the session
  // For now, returning null as we'll need to integrate with your backend
  return null;
}

/**
 * Client-side auth utilities
 */
export const clientAuth = {
  /**
   * Check if user is authenticated on client side
   */
  isAuthenticated: (session: any) => !!session,
  
  /**
   * Get user display name
   */
  getUserDisplayName: (session: any) => {
    if (!session?.user) return 'Guest';
    return session.user.name || session.user.email || 'User';
  },
  
  /**
   * Get user initials for avatar
   */
  getUserInitials: (session: any) => {
    if (!session?.user?.name) return 'U';
    return session.user.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },
};
