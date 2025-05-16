'use client';

import { useEffect } from 'react';
import { createClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { ensureUserProfileService } from '@/services/authService'; // Import the service

// Supabase client for auth operations ONLY (onAuthStateChange)
const supabaseAuthClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

/**
 * This component ensures a user profile exists for authenticated users
 * by calling the authService.
 */
export default function AuthProfileHandler() {
  useEffect(() => {
    const handleAuthenticationStateChange = async () => {
      // The ensureUserProfileService will get the current session and user internally.
      console.log("AuthProfileHandler: Auth state change detected, ensuring user profile via service.");
      const profileEnsured = await ensureUserProfileService();
      if (profileEnsured) {
        console.log("AuthProfileHandler: Profile successfully ensured via service.");
      } else {
        console.warn("AuthProfileHandler: Profile ensuring via service failed or indicated no action needed/possible (e.g., no session).");
      }
    };
    
    // Handle on initial load
    handleAuthenticationStateChange();
    
    // Listen to auth state changes
    const { data: authListener } = supabaseAuthClient.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
      console.log(`AuthProfileHandler: Auth state changed (event: ${event}), re-triggering profile ensure.`);
      handleAuthenticationStateChange(); 
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 