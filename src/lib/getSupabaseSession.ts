import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';
import { supabaseServer } from './supabaseServer'; // Relative path from within src/lib
import type { User, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseSessionResult {
  supabase: SupabaseClient;
  user: User;
}

/**
 * Retrieves and verifies the Supabase session from cookies for an API route.
 * Sets the session on the `supabaseServer` client instance.
 * 
 * @param req The NextApiRequest object.
 * @param res The NextApiResponse object.
 * @returns A Promise resolving to an object with the authenticated Supabase client and user, or null if authentication fails.
 */
export async function getSupabaseSessionApi(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SupabaseSessionResult | null> {
  const accessToken = req.cookies['access_token'];
  const refreshToken = req.cookies['refresh_token'];

  if (!accessToken) {
    // res.status(401).json({ error: 'Not authenticated: No access token' }); // Caller should handle response
    return null;
  }

  const { error: setSessionError } = await supabaseServer.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || '',
  });

  if (setSessionError) {
    console.error('API getSupabaseSession: Error setting session with tokens:', setSessionError.message);
    // res.status(401).json({ error: 'Failed to set session with tokens' }); // Caller should handle response
    return null;
  }

  const { data: { user }, error: getUserError } = await supabaseServer.auth.getUser();

  if (getUserError) {
    console.error('API getSupabaseSession: Error getting user after setting session:', getUserError.message);
    // res.status(401).json({ error: 'Failed to retrieve user from session' }); // Caller should handle response
    return null;
  }

  if (!user) {
    // res.status(401).json({ error: 'Not authenticated: User not found for session' }); // Caller should handle response
    return null;
  }

  return { supabase: supabaseServer, user };
}

/**
 * Retrieves and verifies the Supabase session from cookies for App Router API routes.
 * Sets the session on the `supabaseServer` client instance.
 * 
 * @param req The NextRequest object from App Router.
 * @returns A Promise resolving to an object with the authenticated Supabase client and user, or null if authentication fails.
 */
export async function getSupabaseSessionAppRouter(
  req: NextRequest
): Promise<SupabaseSessionResult | null> {
  const accessToken = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!accessToken) {
    return null;
  }

  const { error: setSessionError } = await supabaseServer.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken || '',
  });

  if (setSessionError) {
    console.error('App Router getSupabaseSession: Error setting session with tokens:', setSessionError.message);
    return null;
  }

  const { data: { user }, error: getUserError } = await supabaseServer.auth.getUser();

  if (getUserError) {
    console.error('App Router getSupabaseSession: Error getting user after setting session:', getUserError.message);
    return null;
  }

  if (!user) {
    return null;
  }

  return { supabase: supabaseServer, user };
} 