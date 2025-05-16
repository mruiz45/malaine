import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Functions ensureUserProfile, signUp, signIn, signOut have been moved to src/services/authService.ts
// Add any other non-service helper functions here if needed.

/**
 * Ensures a user profile exists for the current user
 * @returns Promise resolving to success status
 */
export const ensureUserProfile = async (): Promise<boolean> => {
  try {
    // Get the current session to access the token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.error('ensureUserProfile: Error getting session or no user.', sessionError?.message);
      return false;
    }
    
    const user = session.user;
    const accessToken = session.access_token;

    if (!accessToken) {
      console.warn('ensureUserProfile: No access token found. Cannot call fix-profiles.');
      // For now, let's assume if no token, we can't proceed with the API call part.
    }

    // Local check first (optional, but can save an API call if profile exists)
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 = 0 rows
        console.error('ensureUserProfile: Error checking profile locally:', profileCheckError.message);
        // Decide if you want to proceed to API call or return false
    }
    
    if (existingProfile) {
      console.log('ensureUserProfile: Profile already exists (checked locally).');
      return true;
    }
    
    // If profile doesn't exist locally, or local check was skipped/failed mildly, try to create/fix via API
    // Only proceed with API call if accessToken is available
    if (!accessToken) {
        console.warn('ensureUserProfile: Cannot call /api/auth/fix-profiles without an access token. Profile check also failed or showed no profile.');
        return false; // Or handle as per your app's logic
    }

    console.log(`ensureUserProfile: Profile not found locally for user ${user.id}, calling /api/auth/fix-profiles.`);
    const response = await fetch('/api/auth/fix-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Added Authorization header
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });
    
    if (!response.ok) {
        const result = await response.json().catch(() => ({})); // Try to parse error, default to empty obj
        console.error(`ensureUserProfile: /api/auth/fix-profiles call failed (status ${response.status}):`, result.error || result.details || 'Unknown API error');
        return false;
    }
    
    // const result = await response.json(); // Already parsed if !response.ok, parse if ok
    // console.log('ensureUserProfile: /api/auth/fix-profiles call successful.', result.message);
    return response.ok; // If it's ok, the profile should be fixed.
  } catch (error) {
    console.error('Error ensuring user profile (outer try-catch):', error);
    return false;
  }
};

/**
 * Sign up with email and password and ensure profile creation
 */
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // If signup was successful but we have no user yet (needs email confirmation)
    // We don't need to create a profile immediately, the trigger should handle it
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      data: null, 
      error: error instanceof Error ? error.message : 'An error occurred during signup'
    };
  }
};

/**
 * Sign in with email and password and ensure profile creation
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // Ensure the user has a profile
    if (data.user) {
      // We attempt to create a profile just in case it's missing
      await ensureUserProfile();
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error);
    return {
      data: null, 
      error: error instanceof Error ? error.message : 'An error occurred during sign in'
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error: error instanceof Error ? error.message : 'An error occurred during sign out' };
  }
}; 