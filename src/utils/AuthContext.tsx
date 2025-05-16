"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth } from './api';
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
          setUser(response.user as unknown as User);
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

    // Nous n'utilisons plus le mécanisme de subscription de Supabase
    // car nous gérons les sessions via notre API et les cookies
  }, []);

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      // Nous continuons à utiliser Supabase directement pour l'inscription
      // car nous n'avons pas encore implémenté cette route dans notre API
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error during sign up:', error);
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Utiliser notre API pour la connexion
      const response = await auth.signIn(email, password);
      setUser(response.user as unknown as User);
      setSession({} as Session);
      return { data: response, error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Utiliser notre API pour la déconnexion
      await auth.signOut();
      setUser(null);
      setSession(null);
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