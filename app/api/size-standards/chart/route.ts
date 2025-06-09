import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';
import { SizeEquivalences, StandardMeasurements } from '@/lib/types';

interface SizeChartData {
  [region: string]: {
    [demographic: string]: {
      [size: string]: {
        equivalences: SizeEquivalences;
        measurements: StandardMeasurements;
      };
    };
  };
}

interface SizeChartResponse {
  success: boolean;
  data: SizeChartData;
  error?: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<SizeChartResponse>> {
  try {
    // 1. Check HTTP method (déjà géré par la route GET)
    
    // 2. Get session (MANDATORY for auth routes)
    const sessionInfo = await getSupabaseSessionApi(req);
    if (!sessionInfo) {
      return NextResponse.json(
        { success: false, error: 'Not authorized', data: {} },
        { status: 401 }
      );
    }

    const { supabase: _ } = sessionInfo;

    // 3. Données de test organisées pour le tableau complet
    const testChartData: SizeChartData = {
      europe: {
        adult_female: {
          'XS': {
            equivalences: { eu: '32-34', us: '2-4', uk: '6-8' },
            measurements: {
              chest_bust_cm: 81,
              waist_cm: 66,
              hip_cm: 86,
              back_waist_length_cm: 39.5,
              cross_back_cm: 35,
              arm_length_to_underarm_cm: 41,
              upper_arm_cm: 25,
              armhole_depth_cm: 16.5,
              shoulder_width_cm: 11.5,
              wrist_circumference_cm: 15,
              head_circumference_cm: 55,
              overall_garment_length_cm: 55
            }
          },
          'S': {
            equivalences: { eu: '36-38', us: '6-8', uk: '10-12' },
            measurements: {
              chest_bust_cm: 86,
              waist_cm: 71,
              hip_cm: 91,
              back_waist_length_cm: 40.5,
              cross_back_cm: 37,
              arm_length_to_underarm_cm: 42,
              upper_arm_cm: 26,
              armhole_depth_cm: 17,
              shoulder_width_cm: 12,
              wrist_circumference_cm: 15.5,
              head_circumference_cm: 55.5,
              overall_garment_length_cm: 58
            }
          },
          'M': {
            equivalences: { eu: '40-42', us: '10-12', uk: '14-16' },
            measurements: {
              chest_bust_cm: 94,
              waist_cm: 76,
              hip_cm: 99,
              back_waist_length_cm: 43.5,
              cross_back_cm: 39.5,
              arm_length_to_underarm_cm: 43,
              upper_arm_cm: 28,
              armhole_depth_cm: 18,
              shoulder_width_cm: 13,
              wrist_circumference_cm: 16,
              head_circumference_cm: 56,
              overall_garment_length_cm: 61
            }
          }
        },
        adult_male: {
          'M': {
            equivalences: { eu: '48-50', us: 'M', uk: 'M' },
            measurements: {
              chest_bust_cm: 99,
              waist_cm: 84,
              hip_cm: 99,
              back_waist_length_cm: 47,
              cross_back_cm: 44,
              arm_length_to_underarm_cm: 46,
              upper_arm_cm: 32,
              armhole_depth_cm: 24,
              shoulder_width_cm: 15,
              wrist_circumference_cm: 17.5,
              head_circumference_cm: 58.5,
              overall_garment_length_cm: 68
            }
          },
          'L': {
            equivalences: { eu: '52-54', us: 'L', uk: 'L' },
            measurements: {
              chest_bust_cm: 109,
              waist_cm: 94,
              hip_cm: 109,
              back_waist_length_cm: 48,
              cross_back_cm: 47,
              arm_length_to_underarm_cm: 47,
              upper_arm_cm: 34,
              armhole_depth_cm: 25,
              shoulder_width_cm: 16,
              wrist_circumference_cm: 18,
              head_circumference_cm: 59,
              overall_garment_length_cm: 71
            }
          }
        },
        baby: {
          '0-3M': {
            equivalences: { eu: '56', us: 'NB', uk: '0-3M' },
            measurements: {
              chest_bust_cm: 41,
              waist_cm: 41,
              hip_cm: 44,
              back_waist_length_cm: 17,
              cross_back_cm: 19,
              arm_length_to_underarm_cm: 17,
              upper_arm_cm: 14,
              armhole_depth_cm: 8,
              shoulder_width_cm: 6,
              wrist_circumference_cm: 10,
              head_circumference_cm: 37,
              overall_garment_length_cm: 28,
              leg_length_cm: 24,
              shoe_size_reference: '16'
            }
          },
          '3-6M': {
            equivalences: { eu: '62', us: '3M', uk: '3-6M' },
            measurements: {
              chest_bust_cm: 44,
              waist_cm: 44,
              hip_cm: 47,
              back_waist_length_cm: 19,
              cross_back_cm: 20,
              arm_length_to_underarm_cm: 19,
              upper_arm_cm: 15,
              armhole_depth_cm: 9,
              shoulder_width_cm: 6.5,
              wrist_circumference_cm: 10.5,
              head_circumference_cm: 39,
              overall_garment_length_cm: 31,
              leg_length_cm: 28,
              shoe_size_reference: '17'
            }
          }
        }
      },
      us: {
        adult_female: {
          'S': {
            equivalences: { eu: '36-38', us: '6-8', uk: '10-12' },
            measurements: {
              chest_bust_cm: 86,
              waist_cm: 71,
              hip_cm: 91,
              back_waist_length_cm: 40.5,
              cross_back_cm: 37,
              arm_length_to_underarm_cm: 42,
              upper_arm_cm: 26,
              armhole_depth_cm: 17,
              shoulder_width_cm: 12,
              wrist_circumference_cm: 15.5,
              head_circumference_cm: 55.5,
              overall_garment_length_cm: 58
            }
          }
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: testChartData
    });

  } catch (error) {
    console.error('Error in /api/size-standards/chart:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', data: {} },
      { status: 500 }
    );
  }
} 