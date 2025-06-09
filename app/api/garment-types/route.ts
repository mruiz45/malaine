import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Vérification de l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Récupération des types de vêtements actifs
    const { data: garmentTypes, error } = await supabase
      .from('garment_types')
      .select('id, type_key, category, is_active, image_url, created_at, updated_at, metadata')
      .eq('is_active', true)
      .order('category, type_key');

    if (error) {
      console.error('Error fetching garment types:', error);
      return NextResponse.json(
        { error: 'Failed to fetch garment types' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: garmentTypes || []
    });

  } catch (error) {
    console.error('Unexpected error in /api/garment-types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 