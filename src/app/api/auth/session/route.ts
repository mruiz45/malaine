import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    // Get cookies from the request headers
    const cookieHeader = request.headers.get('cookie') || '';
    const cookiePairs = cookieHeader.split(';').map(pair => pair.trim().split('='));
    const cookieMap = new Map(cookiePairs.map(([key, value]) => [key, value]));
    
    const accessToken = cookieMap.get('sb-access-token');
    const refreshToken = cookieMap.get('sb-refresh-token');

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "No authentication tokens found" },
        { status: 401 }
      );
    }

    // Set the session with access_token and refresh_token
    await supabaseServer.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Get the user from the session
    const { data, error } = await supabaseServer.auth.getUser();

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        user_metadata: data.user.user_metadata,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 