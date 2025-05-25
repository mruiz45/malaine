import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { UpdateGaugeProfile, GaugeProfile } from '@/types/gauge';

/**
 * GET /api/gauge-profiles/[id]
 * Retrieves a specific gauge profile for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Fetch the specific gauge profile
    const { data: gaugeProfile, error } = await supabase
      .from('gauge_profiles')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Gauge profile not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching gauge profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch gauge profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: gaugeProfile as GaugeProfile
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/gauge-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gauge-profiles/[id]
 * Updates a specific gauge profile for the authenticated user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Parse request body
    const body: UpdateGaugeProfile = await request.json();

    // Validate numeric values if provided
    if (body.stitch_count !== undefined && body.stitch_count <= 0) {
      return NextResponse.json(
        { success: false, error: 'Stitch count must be a positive number' },
        { status: 400 }
      );
    }

    if (body.row_count !== undefined && body.row_count <= 0) {
      return NextResponse.json(
        { success: false, error: 'Row count must be a positive number' },
        { status: 400 }
      );
    }

    // Validate measurement unit if provided
    if (body.measurement_unit && !['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Measurement unit must be either "cm" or "inch"' },
        { status: 400 }
      );
    }

    // Validate swatch dimensions if provided
    if (body.swatch_width !== undefined && body.swatch_width <= 0) {
      return NextResponse.json(
        { success: false, error: 'Swatch width must be a positive number' },
        { status: 400 }
      );
    }

    if (body.swatch_height !== undefined && body.swatch_height <= 0) {
      return NextResponse.json(
        { success: false, error: 'Swatch height must be a positive number' },
        { status: 400 }
      );
    }

    // Check if profile name already exists for this user (if name is being updated)
    if (body.profile_name) {
      const { data: existingProfile } = await supabase
        .from('gauge_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_name', body.profile_name)
        .neq('id', id)
        .single();

      if (existingProfile) {
        return NextResponse.json(
          { success: false, error: 'A gauge profile with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the gauge profile
    const { data: updatedProfile, error } = await supabase
      .from('gauge_profiles')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Gauge profile not found' },
          { status: 404 }
        );
      }
      console.error('Error updating gauge profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update gauge profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile as GaugeProfile
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/gauge-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gauge-profiles/[id]
 * Deletes a specific gauge profile for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Delete the gauge profile
    const { error } = await supabase
      .from('gauge_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting gauge profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete gauge profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Gauge profile deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/gauge-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 