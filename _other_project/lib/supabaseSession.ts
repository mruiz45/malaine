import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '@/lib/supabaseServer';
import { parse } from 'cookie';

export async function getSupabaseSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<typeof supabaseServer | null> {
  try {
    // Parse cookies from the request headers
    const cookies = parse(req.headers.cookie || '');

    // Extract the tokens from cookies
    const accessToken = cookies['access_token'];
    const refreshToken = cookies['refresh_token'];

    if (!accessToken || !refreshToken) {
      console.log("No tokens provided [auth]");
      res.status(400).json({ error: "No tokens provided" });
      return null;
    }

    // Set the session with access_token and refresh_token
    const { data: userSessionData, error: userSessionError } = await supabaseServer.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (userSessionError) {
      console.log(`Set session error [auth]:`, userSessionError);
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    // Retrieve the user using the extracted token
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser();

    if (error || !user) {
      console.log("Unauthorized access [auth]:", error);
      res.status(401).json({ error: "Unauthorized" });
      return null;
    }

    return supabaseServer;
  } catch (error: any) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return null;
  }
}