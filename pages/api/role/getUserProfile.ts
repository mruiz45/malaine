import type { NextApiRequest, NextApiResponse } from 'next';
import { UserProfile } from '@/types/auth';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionInfo = await getSupabaseSessionApi(req, res);

    if (!sessionInfo || !sessionInfo.user) {
      return res.status(401).json({ message: 'Unauthorized: Could not verify user for profile fetch' });
    }
    
    const { supabase, user } = sessionInfo;
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError.message);
      if (profileError.code === 'PGRST116') { // PostgREST code for single row not found
        // It's important to check if a profile *should* exist here.
        // If ensureProfileExistsApi ran on login/signup, this might indicate an issue
        // or a delay in profile creation if it's asynchronous (which it isn't in our current setup).
        return res.status(404).json({ message: 'User profile not found.' });
      }
      return res.status(500).json({ message: 'Failed to fetch user profile', details: profileError.message });
    }
    
    if (!profileData) {
      // Should ideally be caught by PGRST116, but as a fallback
      return res.status(404).json({ message: 'User profile not found (no data).' });
    }
    
    return res.status(200).json({ profile: profileData as UserProfile });

  } catch (error: any) {
    console.error('Error in getUserProfile API (outer catch):', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 