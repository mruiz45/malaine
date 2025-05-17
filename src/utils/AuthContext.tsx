"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { api, auth } from './api';
import { supabase } from './supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; data: any }>;
  updatePassword: (password: string) => Promise<{ error: any; data: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session on initial load
    const getInitialSession = async () => {
      try {
        // Utiliser notre API pour récupérer la session
        const response = await auth.getSession();
        if (response.user) {
          setUser(response.user as User);
          // Nous n'avons pas besoin de la session complète côté client
          // car les tokens sont gérés par les cookies HttpOnly
          setSession({} as Session);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user as User);
        setSession(session as Session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      // Call the /api/auth/signup endpoint
      const response = await api.post<{ user: User; session: Session } | { error: string }>('/auth/signup', { email, password });
      if ('error' in response) {
        return { data: null, error: response.error };
      }
      // Assuming signup API returns user and session directly or within a data object
      // Adjust if the actual API response structure is different
      setUser(response.user as User);
      setSession(response.session as Session);
      return { data: response, error: null };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred during signup'
      };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const response = await auth.signIn(email, password);
      // auth.signIn from api.ts returns { user, session } on success
      setUser(response.user as User);
      setSession(response.session as Session);
      return { data: response, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred during signin' 
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setSession(null);
      // No explicit return value needed as per AuthContextType (Promise<void>)
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, try to clear local state
      setUser(null);
      setSession(null);
    }
  };

  // Reset password (send email with recovery link)
  const resetPassword = async (email: string) => {
    try {
      // Nous continuons à utiliser Supabase directement pour la réinitialisation
      // car nous n'avons pas encore implémenté cette route dans notre API
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      console.error('Error during password reset:', error);
      return { data: null, error };
    }
  };

  // Update password (after reset)
  const updatePassword = async (password: string) => {
    try {
      // Nous continuons à utiliser Supabase directement pour la mise à jour
      // car nous n'avons pas encore implémenté cette route dans notre API
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error during password update:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 