import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer'; // Using @ alias
import { serialize } from 'cookie';
import { ensureProfileExistsApi } from '@/lib/authUtils'; // Import the shared helper

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error: signInError } = await supabaseServer.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Sign-in error:', signInError.message);
    return res.status(401).json({ error: signInError.message }); // 401 for auth errors
  }

  if (!data.session || !data.user) {
    console.error('Sign-in failed: No session or user data returned.');
    return res.status(500).json({ error: 'Sign-in failed, please try again.' });
  }

  // Sign-in was successful, set cookies first
  const { access_token, refresh_token, expires_in } = data.session;
  const accessTokenCookie = serialize('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // 'strict' can have issues with cross-site redirects after login
    path: '/',
    maxAge: expires_in,
  });

  const refreshTokenCookie = serialize('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

  // Now, try to ensure the profile exists
  let userProfile = null; // Initialize userProfile to null
  try {
    userProfile = await ensureProfileExistsApi(data.user.id, data.user.email);
    if (!userProfile) {
      console.error('API: Non-critical error - user profile could not be ensured for user:', data.user.id, '(Login proceeds)');
    }
  } catch (profileError: any) {
    // This catch is for unexpected errors from ensureProfileExistsApi itself, 
    // though it's designed to return null for common DB issues.
    console.error('Profile ensuring step had an unexpected error after sign-in:', profileError.message, '(Login proceeds)');
  }

  // Return user and profile (which might be null if ensuring failed)
  return res.status(200).json({ user: data.user, profile: userProfile });
} 