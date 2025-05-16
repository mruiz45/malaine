"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth } from './api';
import { supabase } from './supabase';
import * as authHelpers from '@/auth/helpers';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; data: any }>;
  updatePassword: (password: string) => Promise<{ error: any; data: any }>;
  ensureUserProfile: () => Promise<boolean>;
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
          setUser(response.user as unknown as User);
          // Nous n'avons pas besoin de la session complète côté client
          // car les tokens sont gérés par les cookies HttpOnly
          setSession({} as Session);
          
          // Ensure user has a profile
          try {
            await authHelpers.ensureUserProfile();
          } catch (profileError) {
            console.error('Error ensuring user profile:', profileError);
          }
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
        setUser(session.user);
        setSession(session);
        
        // Ensure user has a profile
        try {
          await authHelpers.ensureUserProfile();
        } catch (profileError) {
          console.error('Error ensuring user profile:', profileError);
        }
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
      // Use our improved auth helper for signup
      const result = await authHelpers.signUp(email, password);
      return result;
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
      // Use our improved auth helper for signin
      const result = await authHelpers.signIn(email, password);
      if (result.data?.user) {
        setUser(result.data.user);
        setSession(result.data.session);
      }
      return result;
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
      // Use our improved auth helper for signout
      const { error } = await authHelpers.signOut();
      if (!error) {
        setUser(null);
        setSession(null);
      } else {
        console.error('Error during sign out:', error);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
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

  // Ensure user has a profile
  const ensureUserProfile = async () => {
    return await authHelpers.ensureUserProfile();
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
    ensureUserProfile,
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