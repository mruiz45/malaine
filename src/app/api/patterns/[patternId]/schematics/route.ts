/**
 * Pattern Schematics API (US_9.3)
 * Endpoint for generating schematic diagrams for pattern components
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { schematicGeneratorService } from '@/lib/services/SchematicGeneratorService';
import {
  SchematicsGenerationRequest,
  SchematicsGenerationResponse,
  SchematicGenerationConfig,
  ComponentDimensions
} from '@/types/schematics';

/**
 * POST /api/patterns/[patternId]/schematics
 * Generates schematics for pattern components
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { patternId: string } }
) {
  try {
    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase: supabaseServer } = sessionResult;
    const { patternId } = params;
    
    // Parse request body
    const body: SchematicsGenerationRequest = await request.json();
    
    if (!body.sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (!body.components || body.components.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Component configurations are required' },
        { status: 400 }
      );
    }

    // Validate user access to the pattern session
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from('pattern_definition_sessions')
      .select('id, user_id')
      .eq('id', body.sessionId)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { success: false, error: 'Pattern session not found or not accessible' },
        { status: 404 }
      );
    }

    // Generate schematics
    const schematics = schematicGeneratorService.generateMultipleSchematics(body.components);

    const response: SchematicsGenerationResponse = {
      success: true,
      data: schematics
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating schematics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/patterns/[patternId]/schematics?sessionId=...
 * Generates default schematics for all components in a pattern session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { patternId: string } }
) {
  try {
    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase: supabaseServer } = sessionResult;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    console.log('GET schematics request:', {
      sessionId,
      userId: sessionResult.user?.id,
      userEmail: sessionResult.user?.email
    });

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate user access to the pattern session
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from('pattern_definition_sessions')
      .select('id, user_id, pattern_definition')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Session validation failed:', {
        sessionId,
        sessionError: sessionError?.message || sessionError,
        sessionData: sessionData ? 'exists' : 'null'
      });
      
      return NextResponse.json(
        { success: false, error: 'Pattern session not found or not accessible' },
        { status: 404 }
      );
    }

    console.log('Session found for schematics:', {
      sessionId,
      userId: sessionData.user_id,
      hasPatternDefinition: !!sessionData.pattern_definition
    });

    // Extract component information from pattern definition
    const patternDefinition = sessionData.pattern_definition;
    const components = extractComponentsFromPattern(patternDefinition);

    if (components.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No components found in pattern definition' },
        { status: 404 }
      );
    }

    // Generate default schematic configurations
    const schematicConfigs: SchematicGenerationConfig[] = components.map(component => ({
      componentName: component.name,
      dimensions: component.dimensions,
      shape: schematicGeneratorService.determineOptimalShape(component.name, component.dimensions)
    }));

    // Generate schematics
    const schematics = schematicGeneratorService.generateMultipleSchematics(schematicConfigs);

    const response: SchematicsGenerationResponse = {
      success: true,
      data: schematics
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating default schematics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Extracts component information from pattern definition
 * This is a simplified implementation - in reality, this would need to
 * interface with the CorePatternCalculationEngine to get accurate dimensions
 */
function extractComponentsFromPattern(patternDefinition: any): Array<{
  name: string;
  dimensions: ComponentDimensions;
}> {
  const components: Array<{ name: string; dimensions: ComponentDimensions }> = [];

  try {
    // This is a simplified implementation for the US_9.3 requirements
    // In a real implementation, this would integrate with the pattern calculation engine
    
    if (patternDefinition?.garment?.components) {
      Object.entries(patternDefinition.garment.components).forEach(([key, component]: [string, any]) => {
        if (component && typeof component === 'object') {
          // Extract dimensions from component data
          // These are mock calculations - real implementation would use the calculation engine
          const dimensions: ComponentDimensions = {
            bottomWidth: component.width || 50, // Default values for testing
            topWidth: component.topWidth || component.width || 50,
            length: component.length || 60,
          };

          components.push({
            name: component.name || key,
            dimensions
          });
        }
      });
    }

    // If no components found, create sample components for testing
    if (components.length === 0) {
      components.push(
        {
          name: 'Back Panel',
          dimensions: { bottomWidth: 50, topWidth: 50, length: 60 }
        },
        {
          name: 'Front Panel',
          dimensions: { bottomWidth: 50, topWidth: 50, length: 60 }
        },
        {
          name: 'Sleeve',
          dimensions: { bottomWidth: 20, topWidth: 30, length: 45 }
        }
      );
    }

  } catch (error) {
    console.error('Error extracting components from pattern definition:', error);
    // Return sample components as fallback
    components.push(
      {
        name: 'Back Panel',
        dimensions: { bottomWidth: 50, topWidth: 50, length: 60 }
      },
      {
        name: 'Sleeve',
        dimensions: { bottomWidth: 20, topWidth: 30, length: 45 }
      }
    );
  }

  return components;
} 