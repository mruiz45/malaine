'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserRoleDisplay() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<'guest' | 'user' | 'admin'>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (!currentUser) {
        setRole('guest');
        setLoading(false);
        return;
      }
      
      // Check if user is admin
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_id', currentUser.id)
        .single();
        
      if (error) {
        console.error('Error fetching role:', error);
        setRole('user'); // Default to user role on error
      } else {
        setRole(data?.is_admin ? 'admin' : 'user');
      }
      
      setLoading(false);
    };
    
    checkUser();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="role-display">
      <h2>User Information</h2>
      {user ? (
        <>
          <p>Email: {user.email}</p>
          <p>Role: <strong>{role}</strong></p>
          <p>Status: <strong>Authenticated</strong></p>
          {role === 'admin' && (
            <p className="admin-badge">Administrator Access</p>
          )}
        </>
      ) : (
        <p>You are not signed in. Your role is: <strong>guest</strong></p>
      )}
      <style jsx>{`
        .role-display {
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin: 1rem 0;
          background-color: #f9f9f9;
        }
        .admin-badge {
          background-color: #f44336;
          color: white;
          padding: 0.5rem;
          border-radius: 3px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
} 