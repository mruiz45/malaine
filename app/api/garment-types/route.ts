import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated session (MANDATORY pattern per malaine-rules.mdc)
    const sessionInfo = await getSupabaseSessionApi(request);
    if (!sessionInfo) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionInfo;

    // Récupération du paramètre de section depuis l'URL
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') as 'baby' | 'general' | null;

    // Construction de la query de base
    let query = supabase
      .from('garment_types')
      .select('id, type_key, category, section, is_active, image_url, created_at, updated_at, metadata')
      .eq('is_active', true);

    // Ajout du filtre par section si spécifié
    if (section && (section === 'baby' || section === 'general')) {
      query = query.eq('section', section);
    }

    // Exécution de la query avec ordre
    const { data: garmentTypes, error } = await query.order('category, type_key');

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