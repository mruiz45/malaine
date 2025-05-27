/**
 * API Route: /api/garment-types
 * Handles operations for garment types (US_4.1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GarmentTypeService } from '@/services/garmentTypeService';

/**
 * GET /api/garment-types
 * Get all available garment types
 * 
 * Query parameters:
 * - difficulty: Filter by difficulty level (beginner, intermediate, advanced)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | null;

    // Initialize the service with public Supabase credentials
    const garmentTypeService = new GarmentTypeService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let result;
    if (difficulty) {
      // Filter by difficulty level
      result = await garmentTypeService.getGarmentTypesByDifficulty(difficulty);
    } else {
      // Get all garment types
      result = await garmentTypeService.getAllGarmentTypes();
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error in GET /api/garment-types:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while fetching garment types' 
      },
      { status: 500 }
    );
  }
} 