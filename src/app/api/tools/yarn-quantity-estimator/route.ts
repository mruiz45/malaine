import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { 
  YarnQuantityEstimationRequest,
  YarnQuantityEstimationInput,
  YarnQuantityEstimation,
  EstimationGaugeInfo,
  EstimationYarnInfo,
  EstimationContext
} from '@/types/yarnQuantityEstimator';
import type { GaugeProfile } from '@/types/gauge';
import type { YarnProfile } from '@/types/yarn';
import { 
  getProjectTypeConfig,
  getProjectSurfaceArea,
  getYarnConsumptionFactor,
  YARN_ESTIMATION_BUFFER_PERCENTAGE
} from '@/utils/yarnEstimationConstants';

/**
 * POST /api/tools/yarn-quantity-estimator
 * Calculates yarn quantity estimation based on gauge, yarn, and project specifications
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Parse request body
    const body: YarnQuantityEstimationRequest = await request.json();
    const input = body.input;

    // Validate required fields
    if (!input.project_type) {
      return NextResponse.json(
        { success: false, error: 'Project type is required' },
        { status: 400 }
      );
    }

    // Validate that either profile IDs or direct info is provided
    if (!input.gauge_profile_id && !input.gauge_info) {
      return NextResponse.json(
        { success: false, error: 'Either gauge profile ID or gauge information is required' },
        { status: 400 }
      );
    }

    if (!input.yarn_profile_id && !input.yarn_info) {
      return NextResponse.json(
        { success: false, error: 'Either yarn profile ID or yarn information is required' },
        { status: 400 }
      );
    }

    // Resolve gauge information
    const gaugeInfo = await resolveGaugeInfo(supabase, user.id, input);
    if (!gaugeInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to resolve gauge information' },
        { status: 400 }
      );
    }

    // Resolve yarn information
    const yarnInfo = await resolveYarnInfo(supabase, user.id, input);
    if (!yarnInfo) {
      return NextResponse.json(
        { success: false, error: 'Failed to resolve yarn information' },
        { status: 400 }
      );
    }

    // Get project configuration
    const projectConfig = getProjectTypeConfig(input.project_type);

    // Validate project-specific requirements
    if (projectConfig.requires_dimensions && !input.dimensions) {
      return NextResponse.json(
        { success: false, error: 'Dimensions are required for this project type' },
        { status: 400 }
      );
    }

    if (projectConfig.requires_size && !input.garment_size) {
      return NextResponse.json(
        { success: false, error: 'Garment size is required for this project type' },
        { status: 400 }
      );
    }

    // Calculate surface area
    const surfaceArea = getProjectSurfaceArea(
      input.project_type,
      input.garment_size,
      input.dimensions
    );

    // Get yarn consumption factor
    const yarnFactor = getYarnConsumptionFactor(yarnInfo.yarn_weight_category);

    // Create estimation context
    const context: EstimationContext = {
      gauge: gaugeInfo,
      yarn: yarnInfo,
      project_config: projectConfig,
      surface_area_m2: surfaceArea,
      yarn_factor: yarnFactor
    };

    // Perform calculation
    const estimation = calculateYarnQuantity(context);

    return NextResponse.json({
      success: true,
      data: estimation
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/tools/yarn-quantity-estimator:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Resolves gauge information from profile ID or direct input
 */
async function resolveGaugeInfo(
  supabase: any,
  userId: string,
  input: YarnQuantityEstimationInput
): Promise<EstimationGaugeInfo | null> {
  if (input.gauge_profile_id) {
    // Fetch gauge profile from database
    const { data: gaugeProfile, error } = await supabase
      .from('gauge_profiles')
      .select('*')
      .eq('id', input.gauge_profile_id)
      .eq('user_id', userId)
      .single();

    if (error || !gaugeProfile) {
      console.error('Error fetching gauge profile:', error);
      return null;
    }

    const profile = gaugeProfile as GaugeProfile;
    return {
      stitch_count: profile.stitch_count,
      row_count: profile.row_count,
      measurement_unit: profile.measurement_unit as 'cm' | 'inch',
      swatch_width: profile.swatch_width,
      swatch_height: profile.swatch_height
    };
  } else if (input.gauge_info) {
    // Use direct gauge information
    return input.gauge_info;
  }

  return null;
}

/**
 * Resolves yarn information from profile ID or direct input
 */
async function resolveYarnInfo(
  supabase: any,
  userId: string,
  input: YarnQuantityEstimationInput
): Promise<EstimationYarnInfo | null> {
  if (input.yarn_profile_id) {
    // Fetch yarn profile from database
    const { data: yarnProfile, error } = await supabase
      .from('yarn_profiles')
      .select('*')
      .eq('id', input.yarn_profile_id)
      .eq('user_id', userId)
      .single();

    if (error || !yarnProfile) {
      console.error('Error fetching yarn profile:', error);
      return null;
    }

    const profile = yarnProfile as YarnProfile;
    return {
      yarn_weight_category: profile.yarn_weight_category,
      skein_meterage: profile.skein_meterage || undefined,
      skein_weight_grams: profile.skein_weight_grams || undefined
    };
  } else if (input.yarn_info) {
    // Use direct yarn information
    return input.yarn_info;
  }

  return null;
}

/**
 * Calculates yarn quantity based on estimation context
 */
function calculateYarnQuantity(context: EstimationContext): YarnQuantityEstimation {
  const { surface_area_m2, yarn_factor, yarn } = context;

  // Calculate base yarn length needed (without buffer)
  const baseYarnLength = surface_area_m2 * yarn_factor;

  // Add buffer percentage
  const bufferMultiplier = 1 + (YARN_ESTIMATION_BUFFER_PERCENTAGE / 100);
  const totalYarnLength = baseYarnLength * bufferMultiplier;

  // Calculate total weight
  let totalWeight = 0;
  if (yarn.skein_meterage && yarn.skein_weight_grams) {
    // Calculate yarn linear density (grams per meter)
    const linearDensity = yarn.skein_weight_grams / yarn.skein_meterage;
    totalWeight = totalYarnLength * linearDensity;
  }

  // Calculate number of skeins
  let numberOfSkeins = 1; // Default to at least 1 skein
  if (yarn.skein_meterage) {
    numberOfSkeins = Math.ceil(totalYarnLength / yarn.skein_meterage);
  } else if (yarn.skein_weight_grams && totalWeight > 0) {
    numberOfSkeins = Math.ceil(totalWeight / yarn.skein_weight_grams);
  }

  return {
    total_length_meters: Math.round(totalYarnLength * 100) / 100,
    total_weight_grams: Math.round(totalWeight * 100) / 100,
    number_of_skeins: numberOfSkeins,
    surface_area_m2: Math.round(surface_area_m2 * 10000) / 10000,
    yarn_factor_used: yarn_factor,
    buffer_percentage: YARN_ESTIMATION_BUFFER_PERCENTAGE,
    calculation_method: context.project_config.estimation_method,
    yarn_weight_category_used: yarn.yarn_weight_category
  };
} 