import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export interface SupabaseSessionInfo {
  supabase: SupabaseClient<Database>;
  user: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Helper function to get authenticated Supabase session for API routes
 * This is the MANDATORY pattern for all authenticated API routes according to malaine-rules.mdc
 * 
 * @param req - NextRequest object
 * @param res - NextResponse object (not used in App Router but kept for compatibility)
 * @returns SupabaseSessionInfo if authenticated, null if not authenticated
 */
export async function getSupabaseSessionApi(
  req: Request,
  res?: any // Optional for compatibility with Pages Router
): Promise<SupabaseSessionInfo | null> {
  try {
    const cookieStore = cookies();

    // Create authenticated Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
          },
          async set(name: string, value: string, options: CookieOptions) {
            (await cookieStore).set({ name, value, ...options });
          },
          async remove(name: string, options: CookieOptions) {
            (await cookieStore).delete({ name, ...options });
          },
        },
      },
    );

    // Get the authenticated user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      supabase,
      user,
    };
  } catch (error) {
    console.error('Error in getSupabaseSessionApi:', error);
    return null;
  }
} 