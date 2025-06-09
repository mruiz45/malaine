import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MeasurementsPageClient from './MeasurementsPageClient';

export default async function MeasurementsPage() {
  const supabase = createClient();
  
  // Vérification de l'authentification
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Récupérer le profil utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <MeasurementsPageClient user={user} profile={profile} />;
} 