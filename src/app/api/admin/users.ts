import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withRoleCheck } from '../../../auth/middleware';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

/**
 * GET handler to list all users (admin only)
 */
async function GET(req: NextRequest) {
  try {
    // Get users from auth schema
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, created_at');
    
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    
    // Get user profiles with admin status
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');
      
    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }
    
    // Combine the data
    const users = authUsers.map(authUser => {
      const profile = profiles.find(p => p.auth_id === authUser.id);
      return {
        auth_id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        profile_id: profile?.id,
        is_admin: profile?.is_admin || false
      };
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update a user's admin status (admin only)
 */
async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, is_admin } = body;
    
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }
    
    if (typeof is_admin !== 'boolean') {
      return NextResponse.json({ error: 'is_admin must be a boolean' }, { status: 400 });
    }
    
    // Update the user's admin status
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_admin })
      .eq('auth_id', user_id);
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Wrap the handlers with role check middleware
export const { GET: protectedGET } = { GET: withRoleCheck<any>(GET, 'admin') };
export const { PATCH: protectedPATCH } = { PATCH: withRoleCheck<any>(PATCH, 'admin') };

// Export the protected handlers
export { protectedGET as GET, protectedPATCH as PATCH }; 