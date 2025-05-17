import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
// import { parse } from 'cookie'; // req.cookies is available in Next.js API routes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Cookies are automatically parsed by Next.js and available in req.cookies
  const accessToken = req.cookies['access_token'];
  const refreshToken = req.cookies['refresh_token'];

  if (!accessToken) { // Only checking for accessToken, as Supabase can refresh with just that sometimes, or refresh token is used internally.
    return res.status(401).json({ error: 'Not authenticated: No access token', user: null });
  }

  // Set the session for the server-side client using the tokens from cookies
  const { error: sessionError } = await supabaseServer.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || '', // Pass an empty string if refresh token is not present
  });

  if (sessionError) {
    console.error('Error setting session with tokens:', sessionError.message);
    // Potentially clear cookies here if setSession fails due to invalid tokens
    // For now, just return an error. Client might try to clear its state.
    return res.status(401).json({ error: 'Failed to set session with tokens', user: null });
  }

  // Get the user based on the (now set) session
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();

  if (userError) {
    console.error('Error getting user after setting session:', userError.message);
    // This could mean tokens are invalid or expired and couldn't be refreshed.
    return res.status(401).json({ error: userError.message, user: null });
  }

  if (!user) {
    return res.status(401).json({ error: 'No user found for the session', user: null });
  }

  // Optionally, you can fetch profile information here too if needed by the client immediately
  // For now, just returning the auth user.
  return res.status(200).json({ user });
} 