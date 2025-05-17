import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { parse } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const cookies = parse(req.headers.cookie || '');
    const accessToken = cookies['access_token'];
    const refreshToken = cookies['refresh_token'];

    if (!accessToken || !refreshToken) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    // Set the session with access_token and refresh_token
    await supabaseServer.auth.setSession({access_token: accessToken, refresh_token: refreshToken});

    const { data: { user }, error } = await supabaseServer.auth.getUser();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log('user role', user?.app_metadata.userrole);

    return res.status(200).json({ user });
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}