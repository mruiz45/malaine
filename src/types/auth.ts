export type UserRole = 'guest' | 'user' | 'admin';

export interface UserProfile {
  id: number;
  auth_id: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
} 