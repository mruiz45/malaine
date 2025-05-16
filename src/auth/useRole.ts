import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UserRole } from './roles';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type User = {
  id: string;
  email?: string;
};

/**
 * Hook for working with user roles in React components
 */
export const useRole = () => {
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch the current user
  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }, []);

  // Fetch the user role
  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole('guest');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Query the user_profiles table to check if user is admin
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        setRole('user'); // Default to 'user' role if there's an error
      } else {
        setRole(data?.is_admin ? 'admin' : 'user');
      }
    } catch (error) {
      console.error('Error in fetchRole:', error);
      setRole('user'); // Default to 'user' role on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user has a specific role or higher
  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (requiredRole === 'guest') return true;
      if (requiredRole === 'user') return role === 'user' || role === 'admin';
      if (requiredRole === 'admin') return role === 'admin';
      return false;
    },
    [role]
  );

  // Set up auth state listener
  useEffect(() => {
    fetchUser().then(() => fetchRole());

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchUser().then(() => fetchRole());
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser, fetchRole]);

  return {
    role,
    loading,
    isGuest: role === 'guest',
    isUser: role === 'user' || role === 'admin', // admin also has user privileges
    isAdmin: role === 'admin',
    hasRole,
  };
}; 