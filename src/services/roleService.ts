import { UserRole, UserProfile } from '../types/auth';

/**
 * Get the current user's role
 * @returns Promise resolving to the user role ('guest', 'user', or 'admin')
 */
export const getCurrentUserRole = async (): Promise<UserRole> => {
  try {
    const response = await fetch('/api/role/getCurrentRole');
    const data = await response.json();
    return data.role as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest'; // Default to guest role on error
  }
};

/**
 * Check if current user has a specific role or higher
 * Role hierarchy: guest < user < admin
 */
export const hasRole = async (role: UserRole): Promise<boolean> => {
  try {
    const response = await fetch(`/api/role/hasRole?role=${role}`);
    const data = await response.json();
    return data.hasRole;
  } catch (error) {
    console.error('Error checking user role:', error);
    // On error, only allow guest permissions
    return role === 'guest';
  }
};

/**
 * Promote a user to admin role
 * @param userId The auth ID of the user to promote
 * @returns Promise resolving to success status
 */
export const promoteToAdmin = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/role/promoteToAdmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to promote user');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error promoting user:', error);
    throw error;
  }
};

/**
 * Demote a user from admin role
 * @param userId The auth ID of the user to demote
 * @returns Promise resolving to success status
 */
export const demoteFromAdmin = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/role/demoteFromAdmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to demote user');
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error demoting user:', error);
    throw error;
  }
};

/**
 * Get the profile of the current user
 * @returns Promise resolving to the user profile or null if not found
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const response = await fetch('/api/role/getUserProfile');
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user profile');
    }
    
    const data = await response.json();
    return data.profile as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}; 