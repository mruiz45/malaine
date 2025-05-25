import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { UpdateYarnProfile, YarnProfile } from '@/types/yarn';

/**
 * GET /api/yarn-profiles/[id]
 * Retrieves a specific yarn profile by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid yarn profile ID format' },
        { status: 400 }
      );
    }

    // Fetch the specific yarn profile
    const { data: yarnProfile, error } = await supabase
      .from('yarn_profiles')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Yarn profile not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching yarn profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch yarn profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: yarnProfile as YarnProfile
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/yarn-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/yarn-profiles/[id]
 * Updates a specific yarn profile for the authenticated user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid yarn profile ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateYarnProfile = await request.json();

    // Validate yarn name length if provided
    if (body.yarn_name !== undefined) {
      if (!body.yarn_name || body.yarn_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Yarn name cannot be empty' },
          { status: 400 }
        );
      }
      if (body.yarn_name.trim().length > 255) {
        return NextResponse.json(
          { success: false, error: 'Yarn name must be 255 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate brand name length if provided
    if (body.brand_name !== undefined && body.brand_name && body.brand_name.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: 'Brand name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate numeric values if provided
    if (body.skein_yardage !== undefined && body.skein_yardage !== null && body.skein_yardage <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein yardage must be a positive number' },
        { status: 400 }
      );
    }

    if (body.skein_meterage !== undefined && body.skein_meterage !== null && body.skein_meterage <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein meterage must be a positive number' },
        { status: 400 }
      );
    }

    if (body.skein_weight_grams !== undefined && body.skein_weight_grams !== null && body.skein_weight_grams <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein weight must be a positive number' },
        { status: 400 }
      );
    }

    // Validate color hex code format if provided
    if (body.color_hex_code !== undefined && body.color_hex_code && !/^#[0-9A-Fa-f]{6}$/.test(body.color_hex_code)) {
      return NextResponse.json(
        { success: false, error: 'Color hex code must be in format #RRGGBB' },
        { status: 400 }
      );
    }

    // Validate fiber content if provided
    if (body.fiber_content !== undefined && body.fiber_content) {
      const totalPercentage = body.fiber_content.reduce((sum, fiber) => sum + fiber.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return NextResponse.json(
          { success: false, error: 'Fiber content percentages must sum to 100%' },
          { status: 400 }
        );
      }

      for (const fiber of body.fiber_content) {
        if (!fiber.fiber || fiber.fiber.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Fiber name cannot be empty' },
            { status: 400 }
          );
        }
        if (fiber.percentage <= 0 || fiber.percentage > 100) {
          return NextResponse.json(
            { success: false, error: 'Fiber percentage must be between 0 and 100' },
            { status: 400 }
          );
        }
      }
    }

    // Check if yarn profile exists and belongs to user
    const { data: existingProfile } = await supabase
      .from('yarn_profiles')
      .select('id, yarn_name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Yarn profile not found' },
        { status: 404 }
      );
    }

    // Check if new yarn name conflicts with existing profiles (if yarn_name is being updated)
    if (body.yarn_name && body.yarn_name.trim() !== existingProfile.yarn_name) {
      const { data: conflictingProfile } = await supabase
        .from('yarn_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('yarn_name', body.yarn_name.trim())
        .neq('id', id)
        .single();

      if (conflictingProfile) {
        return NextResponse.json(
          { success: false, error: 'A yarn profile with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (body.yarn_name !== undefined) updateData.yarn_name = body.yarn_name.trim();
    if (body.brand_name !== undefined) updateData.brand_name = body.brand_name?.trim() || null;
    if (body.fiber_content !== undefined) updateData.fiber_content = body.fiber_content || null;
    if (body.yarn_weight_category !== undefined) updateData.yarn_weight_category = body.yarn_weight_category || null;
    if (body.skein_yardage !== undefined) updateData.skein_yardage = body.skein_yardage || null;
    if (body.skein_meterage !== undefined) updateData.skein_meterage = body.skein_meterage || null;
    if (body.skein_weight_grams !== undefined) updateData.skein_weight_grams = body.skein_weight_grams || null;
    if (body.color_name !== undefined) updateData.color_name = body.color_name?.trim() || null;
    if (body.color_hex_code !== undefined) updateData.color_hex_code = body.color_hex_code || null;
    if (body.dye_lot !== undefined) updateData.dye_lot = body.dye_lot?.trim() || null;
    if (body.purchase_link !== undefined) updateData.purchase_link = body.purchase_link?.trim() || null;
    if (body.ravelry_id !== undefined) updateData.ravelry_id = body.ravelry_id?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    // Update the yarn profile
    const { data: updatedProfile, error } = await supabase
      .from('yarn_profiles')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating yarn profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update yarn profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile as YarnProfile
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/yarn-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/yarn-profiles/[id]
 * Deletes a specific yarn profile for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const { id } = params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid yarn profile ID format' },
        { status: 400 }
      );
    }

    // Check if yarn profile exists and belongs to user
    const { data: existingProfile } = await supabase
      .from('yarn_profiles')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Yarn profile not found' },
        { status: 404 }
      );
    }

    // Delete the yarn profile
    const { error } = await supabase
      .from('yarn_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting yarn profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete yarn profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Yarn profile deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/yarn-profiles/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 