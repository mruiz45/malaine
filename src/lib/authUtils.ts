import { supabaseServer } from '@/lib/supabaseServer';
import { UserProfile } from '@/types/auth'; // Corrected import path

/**
 * Ensures a user profile exists in the 'user_profiles' table.
 * If not, it creates one with 'is_admin' set to false.
 * Returns the user's profile.
 * This function is intended for server-side use (API routes).
 * @param userId The user's authentication ID from Supabase Auth.
 * @param email Optional email of the user, used to populate profile.
 * @returns The user profile object or null if an error occurs.
 */
export async function ensureProfileExistsApi(
  userId: string,
  email?: string
): Promise<UserProfile | null> {
  // Check if profile already exists
  const { data: existingProfile, error: checkError } = await supabaseServer
    .from('user_profiles')
    .select('*') // Select all fields to get is_admin
    .eq('auth_id', userId)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116: 0 rows found
    console.error('API: Error checking for user profile:', checkError.message);
    // throw new Error('Could not verify user profile.'); // Avoid throwing, return null
    return null;
  }

  if (existingProfile) {
    console.log(`API: Profile already exists for user ${userId}`);
    return existingProfile as UserProfile;
  }

  // Profile not found, create one
  console.log(`API: Profile not found for user ${userId}. Creating one.`);
  const profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> = { // Adjust based on actual UserProfile type
    auth_id: userId,
    is_admin: false, // Default is_admin to false
  };

  if (email) {
    profileData.email = email;
    try {
      profileData.name = email.split('@')[0]; // Basic name from email
    } catch (e) { /* ignore if email format is unusual */ }
  }

  const { data: newProfile, error: insertError } = await supabaseServer
    .from('user_profiles')
    .insert(profileData)
    .select('*') // Select all fields of the newly created profile
    .single();

  if (insertError) {
    console.error('API: Error creating user profile:', insertError.message);
    // throw new Error('Could not create user profile.'); // Avoid throwing, return null
    return null;
  }

  console.log(`API: Profile created for user ${userId}`);
  return newProfile as UserProfile;
} 