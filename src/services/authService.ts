import { User } from '../types/auth';

/**
 * Sign in with email and password
 */
export const signIn = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email: string, password: string): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error signing up:', error);
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign out');
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/user');
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

/* Ensure ensureUserProfileService and its comments are fully removed */

// /**
//  * Ensures that a user profile exists for the currently authenticated user.
//  * If a profile does not exist, it attempts to create one.
//  */
// export const ensureUserProfileService = async (): Promise<void> => {
//   try {
//     const response = await fetch('/api/auth/ensure-profile', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
// 
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Failed to ensure user profile');
//     }
// 
//     // Optionally, you can return something from the API if needed
//     // const data = await response.json();
//     // return data;
//   } catch (error) {
//     console.error('Error ensuring user profile:', error);
//     // Depending on requirements, you might want to throw the error
//     // or handle it silently, or return a specific status.
//     // For now, let's re-throw to make it visible.
//     throw error;
//   }
// }; 