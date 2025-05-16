import { createClient } from '@supabase/supabase-js';

// Supabase client for client-side auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service function to ensure a user profile exists.
 * Calls the /api/auth/fix-profiles endpoint.
 */
export const ensureUserProfileService = async (): Promise<boolean> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('ensureUserProfileService: Error getting session or no user.', sessionError?.message);
      return false;
    }
    
    const user = session.user;
    const accessToken = session.access_token;

    if (!accessToken) {
      console.warn('ensureUserProfileService: No access token. Cannot call /api/auth/fix-profiles.');
      return false; 
    }

    console.log(`ensureUserProfileService: Calling /api/auth/fix-profiles for user ${user.id}.`);
    const response = await fetch('/api/auth/fix-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId: user.id }),
    });
    
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.error(`ensureUserProfileService: /api/auth/fix-profiles call failed (status ${response.status}):`, result.error || result.details || 'Unknown API error');
        return false;
    }
    
    const result = await response.json();
    console.log('ensureUserProfileService: /api/auth/fix-profiles call successful.', result.message);
    return true;
  } catch (error) {
    console.error('ensureUserProfileService: Error calling /api/auth/fix-profiles:', error);
    return false;
  }
};

/**
 * Sign up with email and password.
 * This primarily uses the Supabase client SDK.
 * It then ensures the user profile is created via our service.
 */
export const signUpService = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) throw error;
    
    // After successful Supabase signUp, ensure profile.
    // If user needs to confirm email, session might not be immediately available.
    // ensureUserProfileService will handle getting the session.
    if (data.user || data.session) { // Check if we have some indication of success
        await ensureUserProfileService();
    } else if (!data.user && !data.session && !error) {
        // User exists but needs confirmation - profile creation might be handled by trigger
        // or when they first sign in after confirmation.
        console.log("signUpService: User created, requires email confirmation. Profile check will occur on first login.");
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('signUpService: Error signing up:', error);
    return {
      data: null, 
      error: error instanceof Error ? error.message : 'An error occurred during signup'
    };
  }
};

/**
 * Sign in with email and password.
 * This primarily uses the Supabase client SDK.
 * It then ensures the user profile is created via our service.
 */
export const signInService = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    
    if (data.user) {
      await ensureUserProfileService();
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('signInService: Error signing in:', error);
    return {
      data: null, 
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    };
  }
};

/**
 * Sign out the current user.
 * This uses the Supabase client SDK.
 */
export const signOutService = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('signOutService: Error signing out:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred during sign out' };
  }
}; 