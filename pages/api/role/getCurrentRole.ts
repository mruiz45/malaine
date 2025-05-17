import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/auth'; 
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession'; // Use the new helper

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionInfo = await getSupabaseSessionApi(req, res);

    if (!sessionInfo || !sessionInfo.user) {
      // No valid session, or user could not be retrieved from session
      return res.status(200).json({ role: 'guest' as UserRole }); 
    }

    const { supabase, user } = sessionInfo; // Destructure the authenticated client and user
    
    // User is authenticated, now fetch their profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin') // Assuming 'is_admin' column exists
      .eq('auth_id', user.id)
      .single();
      
    if (profileError) {
      // Log the error, but for an authenticated user, if profile is missing/error, 
      // default to 'user' role rather than 'guest'. This might indicate a data integrity issue.
      console.error('Error fetching user profile for role check (user authenticated):', profileError.message);
      // PGRST116 means no rows found, which is a valid case for a new user post-signup if profile creation failed or is pending
      if (profileError.code === 'PGRST116') {
        console.warn(`Profile not found for authenticated user ${user.id}. Defaulting to 'user' role.`);
      }
      return res.status(200).json({ role: 'user' as UserRole });
    }
    
    if (!profileData) {
        // Should ideally be caught by profileError.code === 'PGRST116', but as a safeguard
        console.warn(`Profile data empty for authenticated user ${user.id} despite no error. Defaulting to 'user' role.`);
        return res.status(200).json({ role: 'user' as UserRole });
    }

    const role: UserRole = profileData.is_admin ? 'admin' : 'user';
    return res.status(200).json({ role });

  } catch (error: any) {
    console.error('Error in getCurrentRole API (outer catch):', error);
    // Fallback to guest role in case of unexpected errors during session handling itself
    return res.status(500).json({ message: error.message || 'Internal server error', role: 'guest' as UserRole });
  }
} 