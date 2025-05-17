// The authentication logic (signUp, signIn, signOut, ensureUserProfile)
// and client-side Supabase client initialization previously in this file
// have been refactored and moved:
//
// 1. API-based Authentication: Core authentication operations are now handled by API routes
//    in `pages/api/auth/` (signin.ts, signup.ts, signout.ts, session.ts).
//    These routes use a server-side Supabase client (`src/lib/supabaseServer.ts`)
//    and manage sessions via HttpOnly cookies.
//
// 2. Client-Side State Management: An `AuthContext` (`src/contexts/AuthContext.tsx`)
//    now manages the user's authentication state on the client-side.
//    It provides `signIn`, `signUp`, `signOut` methods that interact with the new API routes,
//    and a `useAuth` hook for components to access auth state and functions.
//
// 3. Client-Side Supabase Instance: The public Supabase client for non-sensitive client-side
//    operations (like `onAuthStateChange`) is now initialized in `src/lib/supabaseClient.ts`.
//
// This file is kept for now in case any genuinely non-API, non-Context, non-service auth-related
// helper functions are needed in the future. Currently, it should not be directly used for
// primary auth operations.

export {}; // Ensures this file is treated as a module
