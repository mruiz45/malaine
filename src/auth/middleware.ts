import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from './roles';

/**
 * Check if the user has the required role
 */
export async function checkRole(req: NextRequest, requiredRole: UserRole): Promise<boolean> {
  // If the required role is 'guest', everyone has access
  if (requiredRole === 'guest') {
    return true;
  }

  // Get authentication token from cookies
  const supabaseToken = req.cookies.get('sb-access-token')?.value;
  
  if (!supabaseToken) {
    return false; // No authentication token
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`
        }
      }
    }
  );

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // If the required role is 'user' or 'admin', the user must be authenticated
  if (userError || !user) {
    return false;
  }

  // If the required role is 'user', any authenticated user has access
  if (requiredRole === 'user') {
    return true;
  }

  // If the required role is 'admin', check if the user has the admin role
  if (requiredRole === 'admin') {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single();

    if (error || !data) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return data.is_admin;
  }

  return false;
}

/**
 * Route handler factory that enforces role-based access control
 */
export function withRoleCheck<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  requiredRole: UserRole = 'user'
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const hasAccess = await checkRole(req, requiredRole);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(req);
  };
} 