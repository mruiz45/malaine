import { NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

// Types pour les requêtes et réponses selon l'US
interface MeasurementData {
  chest_bust_cm?: number;
  back_neck_to_wrist_cm?: number;
  back_waist_length_cm?: number;
  cross_back_cm?: number;
  arm_length_to_underarm_cm?: number;
  upper_arm_cm?: number;
  armhole_depth_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  head_circumference_cm?: number;
  overall_garment_length_cm?: number;
  shoulder_width_cm?: number;
  wrist_circumference_cm?: number;
  leg_length_cm?: number;
  shoe_size?: string;
}

interface RequestBody {
  measurements: MeasurementData;
  preferred_unit: 'cm' | 'inches';
  demographic_category: 'baby' | 'child' | 'adult';
  gender_category: 'male' | 'female' | 'neutral';
  garment_type?: string;
  project_id?: string;
}

// Fonctions de validation
function validateMeasurementValue(value: number | undefined): boolean {
  if (value === undefined || value === null) return true; // Valeurs optionnelles
  return typeof value === 'number' && value > 0 && value <= 500; // Range réaliste
}

function validateDemographicCoherence(
  measurements: MeasurementData,
  demographic: 'baby' | 'child' | 'adult'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (measurements.chest_bust_cm) {
    switch (demographic) {
      case 'baby':
        if (measurements.chest_bust_cm < 30 || measurements.chest_bust_cm > 60) {
          errors.push('Ces mesures semblent inadaptées pour un bébé');
        }
        break;
      case 'child':
        if (measurements.chest_bust_cm < 50 || measurements.chest_bust_cm > 90) {
          errors.push('Ces mesures semblent inadaptées pour un enfant');
        }
        break;
      case 'adult':
        if (measurements.chest_bust_cm < 70 || measurements.chest_bust_cm > 150) {
          errors.push('Ces mesures semblent inadaptées pour un adulte');
        }
        break;
    }
  }

  // Validation des ratios cohérents
  if (measurements.waist_cm && measurements.chest_bust_cm) {
    if (measurements.waist_cm > measurements.chest_bust_cm + 20) {
      errors.push('Le tour de taille semble incohérent avec le tour de poitrine');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();

    // Get authenticated session (MANDATORY pattern per malaine-rules.mdc)
    const sessionInfo = await getSupabaseSessionApi(request);
    if (!sessionInfo) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { supabase, user } = sessionInfo;

    // Validation des données requises
    if (!body.measurements || !body.preferred_unit || !body.demographic_category || !body.gender_category) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Validation des valeurs numériques
    const measurements = body.measurements;
    for (const [key, value] of Object.entries(measurements)) {
      if (key !== 'shoe_size' && !validateMeasurementValue(value as number)) {
        return new NextResponse(
          JSON.stringify({ error: `Invalid measurement value for ${key}` }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    // Validation de la cohérence démographique
    const coherenceCheck = validateDemographicCoherence(measurements, body.demographic_category);
    if (!coherenceCheck.isValid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Demographic coherence validation failed',
          validation_errors: coherenceCheck.errors 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Préparation des données pour insertion
    const insertData = {
      user_id: user.id,
      project_id: body.project_id || null,
      preferred_unit: body.preferred_unit,
      demographic_category: body.demographic_category,
      gender_category: body.gender_category,
      garment_type: body.garment_type || null,
      ...measurements,
      updated_at: new Date().toISOString(),
    };

    // Vérification si une mesure existe déjà pour ce projet ou cet utilisateur
    let query = supabase
      .from('user_measurements')
      .select('id')
      .eq('user_id', user.id);

    if (body.project_id) {
      query = query.eq('project_id', body.project_id);
    } else {
      query = query.is('project_id', null);
    }

    const { data: existingList, error: queryError } = await query;

    // Vérifier si la table existe (erreur réelle de base de données)
    if (queryError && (queryError.code === 'PGRST116' || queryError.message.includes('does not exist'))) {
      console.log('Table user_measurements does not exist yet');
      return new NextResponse(JSON.stringify({ 
        error: 'Database table not ready. Please create the user_measurements table in Supabase first.',
        table_sql: `
CREATE TABLE IF NOT EXISTS user_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_id uuid REFERENCES projects(id),
  chest_bust_cm numeric(5,2),
  back_neck_to_wrist_cm numeric(5,2),
  back_waist_length_cm numeric(5,2),
  cross_back_cm numeric(5,2),
  arm_length_to_underarm_cm numeric(5,2),
  upper_arm_cm numeric(5,2),
  armhole_depth_cm numeric(5,2),
  waist_cm numeric(5,2),
  hip_cm numeric(5,2),
  head_circumference_cm numeric(5,2),
  overall_garment_length_cm numeric(5,2),
  shoulder_width_cm numeric(5,2),
  wrist_circumference_cm numeric(5,2),
  leg_length_cm numeric(5,2),
  shoe_size varchar(10),
  preferred_unit varchar(10) DEFAULT 'cm' CHECK (preferred_unit IN ('cm', 'inches')),
  demographic_category varchar(20) CHECK (demographic_category IN ('baby', 'child', 'adult')),
  gender_category varchar(20) CHECK (gender_category IN ('male', 'female', 'neutral')),
  garment_type varchar(50),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own measurements" ON user_measurements FOR ALL USING (auth.uid() = user_id);
        `
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existing = existingList && existingList.length > 0 ? existingList[0] : null;

    let result;
    if (existing) {
      // Mise à jour de l'enregistrement existant
      const { data, error } = await supabase
        .from('user_measurements')
        .update(insertData)
        .eq('id', existing.id)
        .select('id, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error updating measurements:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to update measurements' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      result = data;
    } else {
      // Création d'un nouveau enregistrement
      const { data, error } = await supabase
        .from('user_measurements')
        .insert(insertData)
        .select('id, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error creating measurements:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to save measurements' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: {
        measurement_id: result.id,
        saved_at: result.updated_at || result.created_at,
      },
    });

  } catch (error) {
    console.error('Error in measurements/save API:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 