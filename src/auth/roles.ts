import { UserRole, UserProfile } from '../types/auth';
import { 
  getCurrentUserRole as fetchUserRole, 
  hasRole as checkHasRole, 
  promoteToAdmin as doPromoteToAdmin, 
  demoteFromAdmin as doDemoteFromAdmin, 
  getCurrentUserProfile as fetchUserProfile 
} from '../services/roleService';

// Export UserRole so it can be used by other files
export type { UserRole };

/**
 * Get the current user's role
 * @returns Promise resolving to the user role ('guest', 'user', or 'admin')
 */
export const getCurrentUserRole = async (): Promise<UserRole> => {
  return fetchUserRole();
};

/**
 * Check if current user has a specific role or higher
 * Role hierarchy: guest < user < admin
 */
export const hasRole = async (role: UserRole): Promise<boolean> => {
  return checkHasRole(role);
};

/**
 * Promote a user to admin role
 * @param userId The auth ID of the user to promote
 * @returns Promise resolving to success status
 */
export const promoteToAdmin = async (userId: string): Promise<boolean> => {
  try {
    return await doPromoteToAdmin(userId);
  } catch (error) {
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
    return await doDemoteFromAdmin(userId);
  } catch (error) {
    throw error;
  }
};

/**
 * Get the profile of the current user
 * @returns Promise resolving to the user profile or null if not found
 */
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  return fetchUserProfile();
}; 