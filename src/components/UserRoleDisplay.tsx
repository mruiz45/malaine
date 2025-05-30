'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserRoleDisplay() {
  const { t } = useTranslation();
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
    return <div>{t('common.loading', 'Loading...')}</div>;
  }
  
  return (
    <div className="role-display">
      <h2>{t('userRole.title', 'User Information')}</h2>
      {user ? (
        <>
          <p>{t('userRole.email', 'Email')}: {user.email}</p>
          <p>{t('userRole.role', 'Role')}: <strong>{t(`userRole.roles.${role}`, role)}</strong></p>
          <p>{t('userRole.status', 'Status')}: <strong>{t('userRole.authenticated', 'Authenticated')}</strong></p>
          {role === 'admin' && (
            <p className="admin-badge">{t('userRole.adminAccess', 'Administrator Access')}</p>
          )}
        </>
      ) : (
        <p>{t('userRole.notSignedIn', 'You are not signed in. Your role is')}: <strong>{t('userRole.roles.guest', 'guest')}</strong></p>
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