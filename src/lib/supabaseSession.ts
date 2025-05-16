import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'cookie';
import { supabaseServer } from './supabaseServer';

export async function getSupabaseSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies['sb-access-token'];
    const refreshToken = cookies['sb-refresh-token'];

    if (!accessToken || !refreshToken) {
      return null;
    }

    // Set the session with access_token and refresh_token
    await supabaseServer.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Get the user from the session
    const { data, error } = await supabaseServer.auth.getUser();
    
    if (error || !data.user) {
      return null;
    }
    
    return supabaseServer;
  } catch (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }
} 