import { createClient } from '@supabase/supabase-js';

export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  id: number;
  auth_id: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get the current user's role
 * @returns Promise resolving to the user role ('guest', 'user', or 'admin')
 */
export const getCurrentUserRole = async (): Promise<UserRole> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return 'guest';
  }
  
  // Check if the user is an admin
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('auth_id', user.id)
    .single();
    
  if (error || !data) {
    // If there's an error or no data, assume 'user' role as default for authenticated users
    // This shouldn't normally happen if our DB triggers are working correctly
    console.error('Error fetching user profile:', error);
    return 'user';
  }
  
  return data.is_admin ? 'admin' : 'user';
};

/**
 * Check if current user has a specific role or higher
 * Role hierarchy: guest < user < admin
 */
export const hasRole = async (role: UserRole): Promise<boolean> => {
  const currentRole = await getCurrentUserRole();
  
  if (role === 'guest') return true; // Everyone has at least guest privileges
  if (role === 'user') return currentRole === 'user' || currentRole === 'admin';
  if (role === 'admin') return currentRole === 'admin';
  
  return false;
};

/**
 * Promote a user to admin role
 * @param userId The auth ID of the user to promote
 * @returns Promise resolving to success status
 */
export const promoteToAdmin = async (userId: string): Promise<boolean> => {
  // Check if current user is admin
  const currentUserRole = await getCurrentUserRole();
  if (currentUserRole !== 'admin') {
    throw new Error('Only admins can promote users');
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_admin: true })
    .eq('auth_id', userId);
  
  return !error;
};

/**
 * Demote a user from admin role
 * @param userId The auth ID of the user to demote
 * @returns Promise resolving to success status
 */
export const demoteFromAdmin = async (userId: string): Promise<boolean> => {
  // Check if current user is admin
  const currentUserRole = await getCurrentUserRole();
  if (currentUserRole !== 'admin') {
    throw new Error('Only admins can demote users');
  }
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_admin: false })
    .eq('auth_id', userId);
  
  return !error;
};

/**
 * Get the profile of the current user
 * @returns Promise resolving to the user profile or null if not found
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data as UserProfile;
}; 