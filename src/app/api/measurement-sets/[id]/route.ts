import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { UpdateMeasurementSet, MeasurementSet } from '@/types/measurements';

/**
 * GET /api/measurement-sets/[id]
 * Retrieves a specific measurement set by ID for the authenticated user
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

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid measurement set ID format' },
        { status: 400 }
      );
    }

    // Fetch the specific measurement set for the authenticated user
    const { data: measurementSet, error } = await supabase
      .from('measurement_sets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Measurement set not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching measurement set:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch measurement set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: measurementSet as MeasurementSet
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/measurement-sets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/measurement-sets/[id]
 * Updates a specific measurement set for the authenticated user
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

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid measurement set ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateMeasurementSet = await request.json();

    // Validate measurement unit if provided
    if (body.measurement_unit && !['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Measurement unit must be either "cm" or "inch"' },
        { status: 400 }
      );
    }

    // Validate set name if provided
    if (body.set_name !== undefined) {
      if (body.set_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Set name cannot be empty' },
          { status: 400 }
        );
      }
      if (body.set_name.trim().length > 255) {
        return NextResponse.json(
          { success: false, error: 'Set name must be 255 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate measurement values (must be positive if provided)
    const measurementFields = [
      'chest_circumference', 'waist_circumference', 'hip_circumference',
      'shoulder_width', 'arm_length', 'inseam_length', 'torso_length',
      'head_circumference', 'neck_circumference', 'wrist_circumference',
      'ankle_circumference', 'foot_length'
    ];

    for (const field of measurementFields) {
      const value = body[field as keyof UpdateMeasurementSet] as number;
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value <= 0) {
          return NextResponse.json(
            { success: false, error: `${field} must be a positive number` },
            { status: 400 }
          );
        }
        if (value > 999.99) {
          return NextResponse.json(
            { success: false, error: `${field} must be less than 1000` },
            { status: 400 }
          );
        }
      }
    }

    // Validate custom measurements if provided
    if (body.custom_measurements) {
      for (const [key, value] of Object.entries(body.custom_measurements)) {
        if (typeof value !== 'number' || value <= 0) {
          return NextResponse.json(
            { success: false, error: `Custom measurement "${key}" must be a positive number` },
            { status: 400 }
          );
        }
        if (value > 999.99) {
          return NextResponse.json(
            { success: false, error: `Custom measurement "${key}" must be less than 1000` },
            { status: 400 }
          );
        }
      }
    }

    // Check if set name already exists for this user (if changing name)
    if (body.set_name) {
      const { data: existingSet } = await supabase
        .from('measurement_sets')
        .select('id')
        .eq('user_id', user.id)
        .eq('set_name', body.set_name.trim())
        .neq('id', id)
        .single();

      if (existingSet) {
        return NextResponse.json(
          { success: false, error: 'A measurement set with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.set_name !== undefined) updateData.set_name = body.set_name.trim();
    if (body.measurement_unit !== undefined) updateData.measurement_unit = body.measurement_unit;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.custom_measurements !== undefined) updateData.custom_measurements = body.custom_measurements;

    // Add measurement fields
    measurementFields.forEach(field => {
      if (body[field as keyof UpdateMeasurementSet] !== undefined) {
        updateData[field] = body[field as keyof UpdateMeasurementSet];
      }
    });

    // Update the measurement set
    const { data: updatedMeasurementSet, error } = await supabase
      .from('measurement_sets')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Measurement set not found' },
          { status: 404 }
        );
      }
      console.error('Error updating measurement set:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update measurement set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedMeasurementSet as MeasurementSet
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/measurement-sets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/measurement-sets/[id]
 * Deletes a specific measurement set for the authenticated user
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

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid measurement set ID format' },
        { status: 400 }
      );
    }

    // Delete the measurement set
    const { error } = await supabase
      .from('measurement_sets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting measurement set:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete measurement set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Measurement set deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/measurement-sets/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 