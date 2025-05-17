import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { serialize } from 'cookie';
import { ensureProfileExistsApi } from '@/lib/authUtils'; // Import the shared helper

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body; // Removed ...otherProfileData as it's not used currently

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error: signUpError } = await supabaseServer.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    console.error('Sign-up error:', signUpError.message);
    return res.status(400).json({ error: signUpError.message });
  }

  // Regardless of session, if user object exists, ensure profile.
  if (data.user) {
    try {
      await ensureProfileExistsApi(data.user.id, data.user.email);
    } catch (profileError: any) {
      console.error('Profile creation/ensuring failed after signup:', profileError.message);
      // If profile creation is critical even before email verification, handle error appropriately.
      // For now, we log it. If signup doesn't return a session (email verification pending),
      // we still return a success message for signup itself.
      if (!data.session) {
        return res.status(500).json({ 
          error: 'Signup succeeded but profile creation failed. Please contact support.', 
          user: { id: data.user.id, email: data.user.email } 
        });
      }
      // If there IS a session, but profile failed, this is more problematic. 
      // Consider not setting cookies or returning a specific error.
      // For now, just logging as per previous behaviour for sign-in.
    }
  }

  if (!data.session) {
    // This case occurs if email confirmation is pending.
    if (data.user) {
      return res.status(201).json({ 
        message: 'Signup successful, please verify your email.', 
        user: { id: data.user.id, email: data.user.email } // Return non-sensitive user info
      });
    } else {
      // Should not happen if signUpError was not thrown, but as a safeguard:
      console.error('Sign-up: No session and no user object, despite no signUpError.');
      return res.status(500).json({ error: 'Sign-up failed in an unexpected way.' });
    }
  }
  
  // If signup includes immediate session (e.g. email confirmation disabled or auto-confirmed)
  const { access_token, refresh_token, expires_in } = data.session;

  const accessTokenCookie = serialize('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expires_in,
  });

  const refreshTokenCookie = serialize('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, 
  });

  res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
  return res.status(200).json({ user: data.user });
} 