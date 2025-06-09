import { NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

interface UserMeasurement {
  id: string;
  user_id: string;
  project_id?: string;
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
  preferred_unit: 'cm' | 'inches';
  demographic_category: 'baby' | 'child' | 'adult';
  gender_category: 'male' | 'female' | 'neutral';
  garment_type?: string;
  created_at: string;
  updated_at: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    // Await params as required by Next.js 15
    const { user_id } = await params;

    // Get authenticated session (MANDATORY pattern per malaine-rules.mdc)
    const sessionInfo = await getSupabaseSessionApi(request);
    if (!sessionInfo) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { supabase, user } = sessionInfo;

    // Vérification que l'utilisateur demande ses propres mesures
    if (user.id !== user_id) {
      return new NextResponse(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Récupération des mensurations de l'utilisateur
    const { data: measurements, error } = await supabase
      .from('user_measurements')
      .select('*')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching measurements:', error);
      
      // Si la table n'existe pas, retourner une réponse vide plutôt qu'une erreur
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Table user_measurements does not exist yet - returning empty data');
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch measurements' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.json({
      success: true,
      data: measurements as UserMeasurement[],
    });

  } catch (error) {
    console.error('Error in measurements/[user_id] API:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 