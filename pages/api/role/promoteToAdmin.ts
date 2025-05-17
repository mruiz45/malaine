import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionInfo = await getSupabaseSessionApi(req, res);
    if (!sessionInfo || !sessionInfo.user) {
      return res.status(401).json({ message: 'Unauthorized: Could not verify performing user' });
    }

    const { supabase, user: performingUser } = sessionInfo;
    
    // Check if the performing user is an admin
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_id', performingUser.id)
      .single();

    if (adminProfileError) {
      console.error('Error fetching admin profile for performing user:', adminProfileError.message);
      return res.status(500).json({ message: 'Error verifying admin status.' });
    }

    if (!adminProfile || !adminProfile.is_admin) {
      return res.status(403).json({ message: 'Forbidden: Only admins can promote users' });
    }
    
    // Proceed with promotion logic
    const { userId: targetUserId } = req.body;
    if (!targetUserId || typeof targetUserId !== 'string') {
      return res.status(400).json({ message: 'Invalid target userId parameter in request body' });
    }
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ is_admin: true })
      .eq('auth_id', targetUserId);
    
    if (updateError) {
      console.error('Error promoting user:', updateError);
      return res.status(500).json({ message: 'Failed to promote user', error: updateError.message });
    }
    
    return res.status(200).json({ success: true, message: `User ${targetUserId} promoted to admin.` });

  } catch (error: any) {
    console.error('Error in promoteToAdmin API (outer catch):', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 