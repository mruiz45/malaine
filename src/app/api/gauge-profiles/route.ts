import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { CreateGaugeProfile, GaugeProfile } from '@/types/gauge';

/**
 * GET /api/gauge-profiles
 * Retrieves all gauge profiles for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Fetch gauge profiles for the authenticated user
    const { data: gaugeProfiles, error } = await supabase
      .from('gauge_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gauge profiles:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch gauge profiles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gaugeProfiles as GaugeProfile[]
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/gauge-profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gauge-profiles
 * Creates a new gauge profile for the authenticated user
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
    const body: CreateGaugeProfile = await request.json();

    // Validate required fields
    if (!body.profile_name || !body.stitch_count || !body.row_count || !body.measurement_unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: profile_name, stitch_count, row_count, measurement_unit' },
        { status: 400 }
      );
    }

    // Validate numeric values
    if (body.stitch_count <= 0 || body.row_count <= 0) {
      return NextResponse.json(
        { success: false, error: 'Stitch count and row count must be positive numbers' },
        { status: 400 }
      );
    }

    // Validate measurement unit
    if (!['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Measurement unit must be either "cm" or "inch"' },
        { status: 400 }
      );
    }

    // Set default swatch dimensions if not provided
    const swatchWidth = body.swatch_width || (body.measurement_unit === 'cm' ? 10.0 : 4.0);
    const swatchHeight = body.swatch_height || (body.measurement_unit === 'cm' ? 10.0 : 4.0);

    // Validate swatch dimensions
    if (swatchWidth <= 0 || swatchHeight <= 0) {
      return NextResponse.json(
        { success: false, error: 'Swatch dimensions must be positive numbers' },
        { status: 400 }
      );
    }

    // Check if profile name already exists for this user
    const { data: existingProfile } = await supabase
      .from('gauge_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('profile_name', body.profile_name)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'A gauge profile with this name already exists' },
        { status: 409 }
      );
    }

    // Create the gauge profile
    const { data: newProfile, error } = await supabase
      .from('gauge_profiles')
      .insert({
        user_id: user.id,
        profile_name: body.profile_name,
        stitch_count: body.stitch_count,
        row_count: body.row_count,
        measurement_unit: body.measurement_unit,
        swatch_width: swatchWidth,
        swatch_height: swatchHeight,
        notes: body.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gauge profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create gauge profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProfile as GaugeProfile
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/gauge-profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 