import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PartsPageClient from './PartsPageClient';

export default async function PartsPage() {
  const supabase = createClient();
  
  // Vérification de l'authentification
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  return <PartsPageClient />;
} 