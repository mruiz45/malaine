**User Story 3: User Authentication with Supabase (Email/Password)**

1.  **Title:** 3. User Authentication with Supabase (Email/Password)
2.  **Goal:** As a user, I want to be able to sign up for an account and log in with my email and password, so I can access personalized features and content.
3.  **Description:** This story connects the application to a Supabase backend and implements a complete authentication flow. It includes creating signup and login pages, handling user sessions with Supabase Auth Helpers, and providing a secure logout mechanism.
4.  **Functional Requirements:**
    *   FR1: A `/signup` page with a form (email, password, password confirmation) allows new users to create an account.
    *   FR2: A `/login` page with a form (email, password) allows existing users to sign in.
    *   FR3: After a successful login or signup, the user is redirected to a protected area (e.g., a `/dashboard` page).
    *   FR4: A "Logout" button must be available to signed-in users, which terminates their session and redirects them to the homepage.
    *   FR5: Users who are not logged in must be redirected to the `/login` page when trying to access protected routes.
    *   FR6: Users who are already logged in must be redirected away from `/login` and `/signup` pages (e.g., to `/dashboard`).
    *   FR7: All forms, buttons, and error messages related to authentication must be internationalized using the i18n setup.
5.  **Technical Implementation Guidance:**
    *   **Libraries:** `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`.
    *   **Backend Setup (Supabase):**
        *   Enable Email/Password authentication in the Supabase project dashboard.
        *   The default `auth.users` table will be used.
    *   **API Usage:** This will use the Supabase client library methods, primarily via Auth Helpers:
        *   `supabase.auth.signUp()`
        *   `supabase.auth.signInWithPassword()`
        *   `supabase.auth.signOut()`
        *   `supabase.auth.onAuthStateChange()` for listening to auth events.
    *   **Logic/Processing:**
        *   Create a Supabase client singleton (`lib/supabase-client.ts`).
        *   Store Supabase URL and anon key in environment variables (`.env.local`).
        *   Use a React Context (`AuthContext`) or a custom hook (`useUser`) to manage and provide user session data across the app.
        *   Implement route protection logic, preferably in a middleware (`middleware.ts`) to check for a valid session.
6.  **Acceptance Criteria (Testing & Validation):**
    *   AC1: A new user can successfully create an account via the `/signup` page. The user appears in the `auth.users` table in Supabase.
    *   AC2: An existing user can successfully log in via the `/login` page.
    *   AC3: An incorrect password or non-existent email shows an appropriate, localized error message on the login page.
    *   AC4: A logged-in user can see a "Logout" button and can successfully log out, clearing their session.
    *   AC5: An unauthenticated user visiting a protected route (e.g., `/dashboard`) is redirected to `/login`.
    *   AC6: A logged-in user visiting `/login` or `/signup` is redirected to `/dashboard`.
    *   AC7: Supabase keys are stored in environment variables and are not exposed in the client-side code.
7.  **Assumptions/Pre-conditions:**
    *   User Story 2 is completed.
    *   A Supabase project has been created and the necessary environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) are available.
8.  **Impacted System Components:**
    *   New Libraries: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`.
    *   New UI: `app/login/page.tsx`, `app/signup/page.tsx`.
    *   New Logic: `lib/supabase-client.ts`, `context/AuthContext.tsx` (or hook), `middleware.ts`.
    *   New Routes: `/login`, `/signup`.
    *   New Config: `.env.local` for Supabase keys. 