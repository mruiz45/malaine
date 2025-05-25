'use client';

import { useEffect } from 'react';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
// import { ensureUserProfileService } from '@/services/authService'; // Removed import

/**
 * This component ensures a user profile exists for authenticated users
 * by calling the authService.
 */
export default function AuthProfileHandler() {
  useEffect(() => {
    const handleAuthenticationStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      console.log(`AuthProfileHandler: Auth state change detected. Event: ${event}, Session: ${session ? 'present' : 'absent'}`);
      
      // Only attempt to ensure profile if the user has just signed in and a session is available.
      if (event === 'SIGNED_IN' && session) {
        console.log("AuthProfileHandler: SIGNED_IN event with session. Profile ensuring is now handled by sign-in/sign-up API."); // Updated log
        // try { // <-- Start of deletion
        //   await ensureUserProfileService();
        //   console.log("AuthProfileHandler: Profile successfully ensured or already exists via service.");
        // } catch (error) {
        //   console.error("AuthProfileHandler: Error calling ensureUserProfileService:", error);
        // } // <-- End of deletion
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthProfileHandler: SIGNED_OUT event, no profile action needed.");
      } else if (event === 'INITIAL_SESSION' && session) {
        console.log("AuthProfileHandler: INITIAL_SESSION event with session. Profile ensuring is now handled by sign-in/sign-up API."); // Updated log
        // try { // <-- Start of deletion
        //   await ensureUserProfileService(); // Also check on initial session if user is already logged in
        //   console.log("AuthProfileHandler: Profile successfully ensured or already exists via service on initial session.");
        // } catch (error) {
        //   console.error("AuthProfileHandler: Error calling ensureUserProfileService on initial session:", error);
        // } // <-- End of deletion
      }
    };
    
    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        handleAuthenticationStateChange(event, session);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 