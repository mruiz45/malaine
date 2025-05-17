import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const sessionInfo = await getSupabaseSessionApi(req, res);

    if (!sessionInfo || !sessionInfo.user) {
      // Not authenticated or session invalid
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { user } = sessionInfo;
    
    // Return the user object (or a subset of it if preferred)
    return res.status(200).json({ 
      user: {
        id: user.id,
        email: user.email,
        // Add other relevant user properties from the user object as needed
        // e.g., app_metadata, user_metadata
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
      }
    });

  } catch (error: any) {
    // This catch block is for unexpected errors during the getSupabaseSessionApi call 
    // or subsequent processing, though getSupabaseSessionApi itself handles its internal errors gracefully.
    console.error('Error in /api/auth/user:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
} 