# Implementation & Validation Guide: User Story 4

This document outlines the technical implementation details and provides a step-by-step guide for testing and validating the Role-Based Access Control (RBAC) features introduced in User Story 4.

## 1. Technical Implementation Summary

### Database Changes (Migration)
A new migration was applied to the Supabase database to:
- Create the `public.profiles` table with a `role` column, defaulting to `'user'`.
- Link the `profiles` table one-to-one with `auth.users`.
- Enable Row-Level Security (RLS) on the `profiles` table.
- Implement the following RLS policies:
    - "Users can view their own profile."
    - "Admins can view all profiles."
    - "Users can update their own profile."
- Create a trigger (`on_auth_user_created`) that calls a function (`handle_new_user`) to automatically create a profile for new users upon signup.

### Middleware (`middleware.ts`)
The routing middleware was enhanced to:
- Fetch the current user's role from the `profiles` table on each request.
- Protect the `/admin` route, allowing access only to users with the `'admin'` role.
- Redirect any non-admin users attempting to access `/admin` to the `/unauthorized` page.
- Redirect unauthenticated users from both `/dashboard` and `/admin` to the `/login` page.

### New Pages
- **`app/admin/page.tsx`**: A placeholder page for the admin dashboard.
- **`app/unauthorized/page.tsx`**: A page to inform users they do not have the required permissions to view a resource.

### Type Definitions (`lib/types.ts`)
- A new type `UserDetails` was created, which extends the default Supabase `User` type with a `role` string.

### Application Layout (`app/layout.tsx`)
- The root server component layout now fetches the user's `role` from the database alongside the user session.
- It passes the combined `UserDetails` object (user data + role) to the `Header` component.

### Header Component (`components/Header.tsx`)
- The `Header` now accepts the `UserDetails` object.
- It conditionally renders a navigation link to `/admin` only if `user.role` is equal to `'admin'`.

---

## 2. Testing and Validation (Acceptance Criteria)

Follow these steps to validate that the implementation meets the acceptance criteria.

### AC1: New User Signup Creates Profile with 'user' Role
1.  **Action:** Navigate to the `/signup` page and create a new user account.
2.  **Validation:**
    *   Log in to your Supabase project dashboard.
    *   Navigate to the **Table Editor** section.
    *   Select the `profiles` table.
    *   Verify that a new row exists corresponding to the new user's ID.
    *   Confirm that the `role` column for this new row is set to `'user'`.

### AC2: 'user' Role Cannot Access Admin Page
1.  **Action:** Log in with the newly created user account (which has the 'user' role).
2.  **Validation:**
    *   Attempt to navigate directly to the `/admin` URL in your browser.
    *   You should be immediately redirected to the `/unauthorized` page, displaying the "Access Denied" message.
    *   The "Admin" link should **not** be visible in the header navigation.

### AC3: 'admin' Role Can Access Admin Page
1.  **Action:**
    *   In the Supabase **Table Editor** for the `profiles` table, find the row for the user you want to make an admin.
    *   Click the cell in the `role` column for that user and change its value from `'user'` to `'admin'`.
    *   Save the change.
2.  **Validation:**
    *   Log in to the application with the user you just promoted to admin.
    *   Verify that an "Admin" link is now visible in the header navigation.
    *   Click the "Admin" link or navigate directly to `/admin`.
    *   You should successfully see the "Admin Dashboard" page content.

### AC4 & AC5: RLS Policies for 'user' and 'admin'
These acceptance criteria are best tested using the Supabase client library, either in a test script or by temporarily adding test code to a component.

**Testing as a 'user':**
1.  Log in as a standard `'user'`.
2.  Use the following code snippet in a component to test RLS:
    ```javascript
    // (Assuming 'supabase' is your initialized client)
    const { data, error } = await supabase.from('profiles').select('*');
    console.log('User can see profiles:', data); // Should only be the user's own profile
    if (error) console.error(error);
    ```
3.  **Validation:** The `data` array should contain **only one** profile object: the one belonging to the currently logged-in user.

**Testing as an 'admin':**
1.  Log in as an `'admin'` user.
2.  Use the same code snippet from the previous test.
3.  **Validation:** The `data` array should contain **all** profile objects from the `profiles` table.

This completes the validation for User Story 4. 