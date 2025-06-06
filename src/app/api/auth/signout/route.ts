import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (sessionResult) {
      // Sign out from Supabase
      await sessionResult.supabase.auth.signOut();
    }

    // Clear cookies regardless of Supabase response
    const response = NextResponse.json({
      message: 'Signed out successfully'
    });

    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Sign-out error:', error);
    
    // Still clear cookies even if there's an error
    const response = NextResponse.json({
      message: 'Signed out successfully'
    });

    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
} 