import { type User } from '@supabase/supabase-js';

export type UserDetails = User & {
  role: string;
}; 