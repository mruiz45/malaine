import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';
import { SizeEquivalences, StandardMeasurements } from '@/lib/types';

interface SizeData {
  size_key: string;
  equivalences: SizeEquivalences;
  measurements: StandardMeasurements;
}

interface SizesResponse {
  success: boolean;
  data: SizeData[];
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<SizesResponse>> {
  try {
    // 1. Check HTTP method (déjà géré par la route GET)
    
    // 2. Get session (MANDATORY for auth routes)
    const sessionInfo = await getSupabaseSessionApi(req);
    if (!sessionInfo) {
      return NextResponse.json(
        { success: false, error: 'Not authorized', data: [] },
        { status: 401 }
      );
    }

    const { supabase } = sessionInfo;

    // 3. Récupération des paramètres de requête
    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region');
    const demographic = searchParams.get('demographic');

    if (!region || !demographic) {
      return NextResponse.json(
        { success: false, error: 'Region and demographic parameters are required', data: [] },
        { status: 400 }
      );
    }

    // 4. Récupération des données depuis la base de données
    const { data: sizesData, error: sizesError } = await supabase
      .from('size_standards')
      .select('*')
      .eq('region', region)
      .eq('demographic', demographic)
      .order('size_key');

    if (sizesError) {
      console.error('Error fetching sizes data:', sizesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sizes data', data: [] },
        { status: 500 }
      );
    }

    if (!sizesData || sizesData.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // 5. Transformation des données en format de réponse
    const responseData: SizeData[] = sizesData.map((size) => ({
      size_key: size.size_key,
      equivalences: {
        eu: size.eu_equivalent || undefined,
        us: size.us_equivalent || undefined,
        uk: size.uk_equivalent || undefined,
        asia: size.asia_equivalent || undefined
      },
      measurements: {
        chest_bust_cm: size.chest_bust_cm,
        back_neck_to_wrist_cm: size.back_neck_to_wrist_cm || undefined,
        back_waist_length_cm: size.back_waist_length_cm || undefined,
        cross_back_cm: size.cross_back_cm || undefined,
        arm_length_to_underarm_cm: size.arm_length_to_underarm_cm || undefined,
        upper_arm_cm: size.upper_arm_cm || undefined,
        armhole_depth_cm: size.armhole_depth_cm || undefined,
        waist_cm: size.waist_cm || undefined,
        hip_cm: size.hip_cm || undefined,
        head_circumference_cm: size.head_circumference_cm || undefined,
        overall_garment_length_cm: size.overall_garment_length_cm || undefined,
        shoulder_width_cm: size.shoulder_width_cm || undefined,
        wrist_circumference_cm: size.wrist_circumference_cm || undefined,
        leg_length_cm: size.leg_length_cm || undefined,
        shoe_size_reference: size.shoe_size_reference || undefined
      }
    }));

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error in /api/size-standards/sizes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', data: [] },
      { status: 500 }
    );
  }
} 