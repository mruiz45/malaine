**User Story 4: Role-Based Access Control (RBAC)**

1.  **Title:** 4. Role-Based Access Control (guest, user, admin)
2.  **Goal:** As an administrator, I need a different set of permissions than a regular user, so that I can access special administrative sections and ensure the platform is managed securely.
3.  **Description:** This story introduces a role-based authorization system. It defines `guest`, `user`, and `admin` roles, stores them in the database, and protects application routes and data access based on the logged-in user's role.
4.  **Functional Requirements:**
    *   FR1: The system must support three roles: `guest` (unauthenticated), `user` (default authenticated role), and `admin`.
    *   FR2: A user's role must be stored in a `profiles` table in the database, linked one-to-one with the `auth.users` table.
    *   FR3: All newly registered users must be automatically assigned the `user` role.
    *   FR4: The `admin` role must be assigned manually via the database for security.
    *   FR5: Application routes must be protected based on roles (e.g., an `/admin` page is only accessible to users with the `admin` role).
    *   FR6: Users attempting to access a page without the required role must be redirected or shown an "Access Denied" message.
    *   FR7: Database access must be secured with Row Level Security (RLS) policies based on user ID and role.
5.  **Technical Implementation Guidance:**
    *   **Data Models (SQL):**
        ```sql
        -- Create the profiles table to store roles and other user data
        CREATE TABLE public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL DEFAULT 'user'
        );
        -- Enable Row Level Security
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        -- Policies for the profiles table
        CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Admins can view all profiles." ON public.profiles FOR SELECT USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
        CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
        
        -- Trigger to create a profile automatically on new user signup
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.profiles (id, role)
          VALUES (new.id, 'user');
          RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
        ```
    *   **Logic/Processing:**
        *   Extend the `AuthContext` or `useUser` hook to fetch and store the user's role from the `profiles` table upon login.
        *   Enhance the route protection logic (in `middleware.ts` or components) to check for the required role.
        *   Create a placeholder `/admin` page to test admin-only access.
    *   **UI Considerations:** An "Access Denied" page (`app/unauthorized/page.tsx`) should be created to handle authorization failures gracefully.
6.  **Acceptance Criteria (Testing & Validation):**
    *   AC1: When a new user signs up, a corresponding row is created in the `public.profiles` table with the `role` correctly set to 'user'.
    *   AC2: A logged-in user with the 'user' role who tries to access `/admin` is redirected or sees an "Access Denied" page.
    *   AC3: After manually changing a user's role to 'admin' in the Supabase dashboard, that user can successfully access the `/admin` page.
    *   AC4: Using the Supabase client, a logged-in 'user' can only select/update their own row in the `profiles` table.
    *   AC5: Using the Supabase client, a logged-in 'admin' can select all rows from the `profiles` table.
7.  **Assumptions/Pre-conditions:**
    *   User Story 3 is completed. Users can authenticate successfully.
8.  **Impacted System Components:**
    *   New DB Objects: `profiles` table, `handle_new_user` function, `on_auth_user_created` trigger, RLS policies.
    *   New UI: `app/admin/page.tsx` (placeholder), `app/unauthorized/page.tsx`.
    *   Modified Logic: `AuthContext`/`useUser` hook (to include role), route protection middleware. 