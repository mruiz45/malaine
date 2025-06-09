import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewPatternClient from './NewPatternClient';

export default async function NewPatternPage() {
  const supabase = createClient();
  
  // Vérification de l'authentification
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Récupération des types de vêtements actifs
  const { data: garmentTypes, error: typesError } = await supabase
    .from('garment_types')
    .select('id, type_key, category, section, is_active, image_url, created_at, updated_at, metadata')
    .eq('is_active', true)
    .order('category, type_key');

  if (typesError) {
    console.error('Error fetching garment types:', typesError);
    throw new Error('Failed to load garment types');
  }

  return <NewPatternClient initialGarmentTypes={garmentTypes || []} />;
} 