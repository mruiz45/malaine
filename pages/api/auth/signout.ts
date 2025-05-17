import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer'; // Assuming @ is mapped to src/
import { serialize } from 'cookie';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // We need to ensure the server-side Supabase client is authenticated 
  // to call signOut. We can do this by trying to get the user from cookies.
  // If no user, there's no session to sign out from the server perspective for this request.
  const accessToken = req.cookies['access_token'];
  const refreshToken = req.cookies['refresh_token'];

  if (accessToken && refreshToken) {
    await supabaseServer.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    const { error: signOutError } = await supabaseServer.auth.signOut();
    if (signOutError) {
      // Log the error but proceed to clear cookies as the intent is to sign out.
      console.error('Supabase sign out error:', signOutError.message);
    }
  } else {
    // No tokens found, so no server-side session to invalidate via Supabase client for this request
    // Still proceed to clear any lingering cookies client-side might have sent or exist.
    console.log('No session tokens found in cookies during signout. Clearing cookies anyway.');
  }

  // Clear the 'access_token' and 'refresh_token' cookies
  const accessTokenCookie = serialize('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Set expiry to past date
  });

  const refreshTokenCookie = serialize('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
  return res.status(200).json({ message: 'Signed out successfully' });
} 