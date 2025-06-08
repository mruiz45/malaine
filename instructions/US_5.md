**User Story 5: User Dashboard & Profile Management**

1.  **Title:** 5. User Dashboard and Profile Management
2.  **Goal:** As a logged-in user, I want a personal dashboard where I can see my profile information and manage my preferences, so I have a central hub for my activities on the site.
3.  **Description:** This story focuses on creating a `/dashboard` page for authenticated users. The dashboard will display user information, allow them to update basic profile settings (like preferred language), and act as a placeholder for future application features.
4.  **Functional Requirements:**
    *   FR1: A `/dashboard` route must be created and be accessible only to authenticated users (`user` or `admin`).
    *   FR2: The dashboard must display a personalized welcome message, the user's email, and their role.
    *   FR3: The dashboard must include a "Preferences" section where the user can select their preferred UI language.
    *   FR4: The selected language preference must be saved to their profile in the `profiles` table in the database.
    *   FR5: The dashboard must contain a placeholder section for future "Knitting Projects."
    *   FR6: The dashboard layout must be responsive, and all its text must be internationalized.
5.  **Technical Implementation Guidance:**
    *   **Data Models (SQL):**
        ```sql
        -- Add a column to the profiles table to store language preference
        ALTER TABLE public.profiles ADD COLUMN language_preference TEXT DEFAULT 'en';
        
        -- The RLS policy allowing users to update their own profile
        -- from US_4 already covers this change.
        -- CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
        ```
    *   **Logic/Processing:**
        *   The dashboard component will fetch user and profile data from the `AuthContext` or `useUser` hook.
        *   The language preference form will call a function that performs a Supabase `update` on the `profiles` table for the current user.
        *   On successful update of the language preference, the client-side i18n language should also be changed to reflect the choice immediately.
    *   **UI Considerations:** Use a clean layout (e.g., cards or sections) to organize the dashboard information. An admin user might see a small badge or an extra message indicating their status.
6.  **Acceptance Criteria (Testing & Validation):**
    *   AC1: A logged-in `user` is automatically redirected to `/dashboard` and sees their email and role ("user").
    *   AC2: A logged-in `admin` sees their email and role ("admin") on the dashboard.
    *   AC3: Changing the language preference in the dashboard updates the `language_preference` column in the user's `profiles` row in Supabase.
    *   AC4: The UI language changes immediately after the user saves their new language preference.
    *   AC5: The dashboard layout adapts correctly to mobile screen sizes without usability issues.
    *   AC6: An unauthenticated user attempting to access `/dashboard` is successfully redirected to `/login`.
7.  **Assumptions/Pre-conditions:**
    *   User Story 4 is completed. Role management and the `profiles` table are in place.
8.  **Impacted System Components:**
    *   New UI: `app/dashboard/page.tsx`, `components/dashboard/ProfileSection.tsx`, `components/dashboard/PreferencesSection.tsx`.
    *   Modified DB: `profiles` table schema (new `language_preference` column).
    *   Modified Logic: Functions to update profile data via Supabase client. 