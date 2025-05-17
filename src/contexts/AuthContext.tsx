import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import type { User } from '@supabase/supabase-js';
import { supabaseClient } from '@/lib/supabaseClient'; // For onAuthStateChange listener

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // session: Session | null; // We'll primarily rely on user object from /api/auth/session
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetches user from our API route which uses HttpOnly cookies
  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/session', { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || null);
      } else {
        setUser(null);
        // Optionally, redirect if specific error codes indicate invalid session
        // if (response.status === 401) router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch user on initial load

    // Listen to Supabase auth state changes client-side.
    // This helps reflect state changes from other tabs or token refreshes immediately.
    const { data: authListenerSubscription } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase onAuthStateChange event:', event, session);
        // When auth state changes (e.g. TOKEN_REFRESHED, SIGNED_OUT from another tab),
        // re-fetch the user from our /api/auth/session to get the source of truth based on HttpOnly cookies.
        // For SIGNED_IN, it often means Supabase JS has a session.
        // For SIGNED_OUT, it means Supabase JS cleared its session.
        // Regardless, our backend /api/auth/session is the authority.
        if (event === 'SIGNED_OUT') {
            setUser(null); // Optimistically update UI
            router.push('/login'); // Or your desired redirect path
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            await fetchUser(); // Re-validate with backend
        } else if (event === 'INITIAL_SESSION') {
            // This event fires when the client SDK has initialized and potentially found a session in its storage.
            // We still prefer our backend check.
            await fetchUser();
        }
      }
    );

    return () => {
      authListenerSubscription?.subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        // No need to call fetchUser() here as signin API returns the user
        // router.push('/'); // Or your desired redirect path
      } else {
        throw new Error(data.error || 'Sign-in failed');
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      setUser(null);
      throw error; // Re-throw to be caught by UI
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user); // If signup returns user and sets session immediately
        // If email verification is required, data.message might indicate that.
        // router.push('/'); // Or a page indicating to check email
      } else if (response.status === 201 && data.message) { // Special case for email verification pending
        console.log(data.message);
        // User technically created, but not logged in with a session yet
        // UI should inform the user to check email
      }else {
        throw new Error(data.error || 'Sign-up failed');
      }
    } catch (error: any) {
      console.error('Sign-up error:', error);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
      // supabaseClient.auth.signOut(); // Also sign out from Supabase JS client to clear its state
      router.push('/login'); // Or your desired redirect path
    } catch (error) {
      console.error('Sign-out error:', error);
      // Still try to set user to null
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 