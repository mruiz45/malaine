import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from './useRole';
import { UserRole } from './roles';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole: UserRole;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Component to protect routes based on user roles
 * 
 * @example
 * ```tsx
 * // Only allow admins to access this route
 * <RoleProtectedRoute requiredRole="admin" redirectTo="/login">
 *   <AdminDashboard />
 * </RoleProtectedRoute>
 * ```
 */
export default function RoleProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/',
  fallback,
}: RoleProtectedRouteProps) {
  const { role, loading, hasRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    // Wait until role is loaded
    if (!loading) {
      // Check if user has required role
      if (!hasRole(requiredRole)) {
        // Redirect if user doesn't have required role
        router.push(redirectTo);
      }
    }
  }, [loading, hasRole, requiredRole, redirectTo, router]);

  // Show nothing while checking role
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user doesn't have required role and we're not redirecting
  if (!hasRole(requiredRole) && fallback) {
    return <>{fallback}</>;
  }

  // User has required role, show children
  return <>{children}</>;
} 