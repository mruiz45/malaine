import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/auth';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { role: roleQuery } = req.query;

    if (!roleQuery || typeof roleQuery !== 'string' || !['guest', 'user', 'admin'].includes(roleQuery)) {
      return res.status(400).json({ message: 'Invalid role parameter' });
    }
    const requestedRole = roleQuery as UserRole;

    const sessionInfo = await getSupabaseSessionApi(req, res);

    let currentActualRole: UserRole = 'guest';

    if (sessionInfo && sessionInfo.user) {
      const { supabase, user } = sessionInfo;
      // User is authenticated, determine their actual role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile for hasRole check (user authenticated):', profileError.message);
        // Default to 'user' if profile fetch fails for an authenticated user
        currentActualRole = 'user'; 
      } else if (profileData) {
        currentActualRole = profileData.is_admin ? 'admin' : 'user';
      } else {
        // Profile not found for an authenticated user, default to 'user'
        console.warn(`Profile not found for authenticated user ${user.id} in hasRole. Defaulting to 'user' role.`);
        currentActualRole = 'user';
      }
    } 
    // If no sessionInfo or no user, currentActualRole remains 'guest'
    
    let hasRoleResult = false;
    if (requestedRole === 'guest') {
      // Everyone is technically a guest, or if not authenticated, this is their only role.
      hasRoleResult = true; 
    } else if (requestedRole === 'user') {
      // Authenticated users (user or admin) satisfy the 'user' role requirement.
      hasRoleResult = currentActualRole === 'user' || currentActualRole === 'admin';
    } else if (requestedRole === 'admin') {
      hasRoleResult = currentActualRole === 'admin';
    }
    
    return res.status(200).json({ hasRole: hasRoleResult, actualRole: currentActualRole });

  } catch (error: any) {
    console.error('Error in hasRole API (outer catch):', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 