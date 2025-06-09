import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface GarmentPartConfig {
  part_key: string;
  is_obligatory: boolean;
  display_order: number;
  technical_impact: string[];
  measurement_requirements: string[];
  safety_constraints?: string[]; // Nouveau pour vêtements bébé
  age_restrictions?: AgeRestrictions; // Nouveau pour vêtements bébé
}

interface AgeRestrictions {
  min_age_months: number;
  max_age_months: number;
  safety_notes?: string[];
}

interface PartDependency {
  parent_part_key: string;
  dependent_part_key: string;
  activation_condition: string;
}

interface GarmentPartConfigResponse {
  success: boolean;
  data?: {
    type_key: string;
    obligatory_parts: GarmentPartConfig[];
    optional_parts: GarmentPartConfig[];
    dependencies: PartDependency[];
  };
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<GarmentPartConfigResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const typeKey = searchParams.get('type_key');

    if (!typeKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing type_key parameter'
      }, { status: 400 });
    }

    const supabase = createClient();

    // Vérification de l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authorized'
      }, { status: 401 });
    }

    // Récupération des configurations de parties
    const { data: partConfigs, error: configError } = await supabase
      .from('garment_part_configurations')
      .select('part_key, is_obligatory, display_order, technical_impact, measurement_requirements')
      .eq('garment_type_key', typeKey)
      .order('display_order');

    if (configError) {
      console.error('Error fetching part configurations:', configError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch part configurations'
      }, { status: 500 });
    }

    // Récupération des dépendances
    const { data: dependencies, error: depError } = await supabase
      .from('garment_part_dependencies')
      .select('parent_part_key, dependent_part_key, activation_condition')
      .eq('garment_type_key', typeKey);

    if (depError) {
      console.error('Error fetching dependencies:', depError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch dependencies'
      }, { status: 500 });
    }

    // Séparation des parties obligatoires et optionnelles avec conversion des types
    const obligatory_parts = partConfigs
      ?.filter(part => part.is_obligatory)
      ?.map(part => ({
        part_key: part.part_key,
        is_obligatory: part.is_obligatory ?? true,
        display_order: part.display_order ?? 0,
        technical_impact: part.technical_impact as string[],
        measurement_requirements: part.measurement_requirements as string[],
        // Support futur pour vêtements bébé (colonnes à ajouter en base)
        safety_constraints: undefined as string[] | undefined,
        age_restrictions: undefined as AgeRestrictions | undefined
      })) || [];
    
    const optional_parts = partConfigs
      ?.filter(part => !part.is_obligatory)
      ?.map(part => ({
        part_key: part.part_key,
        is_obligatory: part.is_obligatory ?? false,
        display_order: part.display_order ?? 0,
        technical_impact: part.technical_impact as string[],
        measurement_requirements: part.measurement_requirements as string[],
        // Support futur pour vêtements bébé (colonnes à ajouter en base)
        safety_constraints: undefined as string[] | undefined,
        age_restrictions: undefined as AgeRestrictions | undefined
      })) || [];

    return NextResponse.json({
      success: true,
      data: {
        type_key: typeKey,
        obligatory_parts,
        optional_parts,
        dependencies: dependencies?.map(dep => ({
          parent_part_key: dep.parent_part_key,
          dependent_part_key: dep.dependent_part_key,
          activation_condition: dep.activation_condition ?? 'optional_selected'
        })) || []
      }
    });

  } catch (error) {
    console.error('Error in garment-parts configuration API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 