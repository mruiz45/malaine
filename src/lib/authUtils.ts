import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Ensures a user profile exists in the 'user_profiles' table.
 * If not, it creates one with basic information.
 * This function is intended for server-side use (API routes).
 * @param userId The user's authentication ID from Supabase Auth.
 * @param email Optional email of the user, used to populate profile.
 */
export async function ensureProfileExistsApi(userId: string, email?: string) {
  // Check if profile already exists
  const { data: existingProfile, error: checkError } = await supabaseServer
    .from('user_profiles')
    .select('auth_id')
    .eq('auth_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 0 rows found
    console.error('API: Error checking for user profile:', checkError.message);
    throw new Error('Could not verify user profile.');
  }

  if (!existingProfile) {
    console.log(`API: Profile not found for user ${userId}. Creating one.`);
    const profileData: { auth_id: string; email?: string; name?: string } = { auth_id: userId };
    if (email) {
      profileData.email = email;
      try {
        profileData.name = email.split('@')[0]; // Basic name from email
      } catch (e) { /* ignore if email format is unusual */ }
    }

    const { error: insertError } = await supabaseServer
      .from('user_profiles')
      .insert(profileData);

    if (insertError) {
      console.error('API: Error creating user profile:', insertError.message);
      throw new Error('Could not create user profile.');
    }
    console.log(`API: Profile created for user ${userId}`);
  } else {
    console.log(`API: Profile already exists for user ${userId}`);
  }
} 