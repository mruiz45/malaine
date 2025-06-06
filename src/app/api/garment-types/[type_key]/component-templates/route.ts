/**
 * API Route: /api/garment-types/[type_key]/component-templates
 * Handles operations for component templates of a specific garment type (US_4.1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GarmentTypeService } from '@/services/garmentTypeService';

/**
 * GET /api/garment-types/[type_key]/component-templates
 * Get component templates for a specific garment type
 * 
 * @param params - Route parameters containing type_key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type_key: string }> }
) {
  try {
    const { type_key } = await params;

    if (!type_key) {
      return NextResponse.json(
        { success: false, error: 'Garment type key is required' },
        { status: 400 }
      );
    }

    // Initialize the service with public Supabase credentials
    const garmentTypeService = new GarmentTypeService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Validate that the garment type exists
    const isValid = await garmentTypeService.validateGarmentTypeKey(type_key);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Garment type not found' },
        { status: 404 }
      );
    }

    // Get component templates for the garment type
    const result = await garmentTypeService.getComponentTemplatesForGarmentType(type_key);

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
    console.error('Error in GET /api/garment-types/[type_key]/component-templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred while fetching component templates' 
      },
      { status: 500 }
    );
  }
} 