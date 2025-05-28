/**
 * Pattern Calculator API Route (US_6.1)
 * Handles pattern calculation requests and interfaces with the Core Pattern Calculation Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';
import {
  PatternCalculationRequest,
  PatternCalculationResponse,
  PatternCalculationResult,
  ComponentCalculationResult
} from '@/types/pattern-calculation';
import { validatePatternCalculationInput } from '@/utils/pattern-calculation-validators';

/**
 * POST /api/pattern-calculator/calculate-pattern
 * Calculates pattern specifications from input data
 */
export async function POST(request: NextRequest): Promise<NextResponse<PatternCalculationResponse>> {
  try {
    // Authenticate user session
    const supabaseServer = await getSupabaseSessionApi(request);
    if (!supabaseServer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let requestData: PatternCalculationRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    // Validate request structure
    if (!requestData.input) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing calculation input data'
        },
        { status: 400 }
      );
    }

    // Validate calculation input
    const validation = validatePatternCalculationInput(requestData.input);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid calculation input',
          validationErrors: [...validation.errors, ...validation.missingFields.map(field => `Missing field: ${field}`)]
        },
        { status: 400 }
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Pattern calculation warnings:', validation.warnings);
    }

    // Perform pattern calculation
    const calculationResult = await performPatternCalculation(requestData);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: calculationResult
    });

  } catch (error) {
    console.error('Pattern calculation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during pattern calculation'
      },
      { status: 500 }
    );
  }
}

/**
 * Performs the actual pattern calculation
 * This is a placeholder implementation for US_6.1 - the actual calculation engine will be implemented in subsequent US
 */
async function performPatternCalculation(request: PatternCalculationRequest): Promise<PatternCalculationResult> {
  const { input, options } = request;
  const calculationId = generateCalculationId();

  try {
    // Calculate components
    const componentResults: ComponentCalculationResult[] = [];
    
    for (const component of input.garment.components) {
      const componentResult = calculateComponent(component, input);
      componentResults.push(componentResult);
    }

    // Calculate overall pattern metadata
    const totalStitches = componentResults.reduce((sum, comp) => sum + comp.stitchCount, 0);
    const estimatedTime = estimateCompletionTime(totalStitches, input.yarn.weightCategory);
    const difficultyLevel = assessDifficultyLevel(input.garment.components, input.stitchPattern);

    // Build result
    const result: PatternCalculationResult = {
      calculationId,
      sessionId: input.sessionId,
      calculatedAt: new Date().toISOString(),
      input,
      components: componentResults,
      patternMetadata: {
        totalStitches,
        estimatedTime,
        difficultyLevel
      },
      status: 'success',
      warnings: []
    };

    // Add warnings for unusual values
    const warnings: string[] = [];
    if (totalStitches > 50000) {
      warnings.push('Very large pattern - consider breaking into sections');
    }
    if (totalStitches < 500) {
      warnings.push('Very small pattern - double-check measurements');
    }

    if (warnings.length > 0) {
      result.warnings = warnings;
      result.status = 'warning';
    }

    return result;

  } catch (error) {
    throw new Error(`Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculates stitch and row counts for a single component
 */
function calculateComponent(component: any, input: any): ComponentCalculationResult {
  const { gauge } = input;
  
  // Basic calculation: convert dimensions to stitches/rows
  let stitchCount = 0;
  let rowCount = 0;
  const shapingInstructions: string[] = [];

  // Calculate based on component type and dimensions
  if (component.targetWidth && component.targetLength) {
    // Rectangular component (body panel)
    stitchCount = Math.round((component.targetWidth / 10) * gauge.stitchesPer10cm);
    rowCount = Math.round((component.targetLength / 10) * gauge.rowsPer10cm);
    
    shapingInstructions.push(`Cast on ${stitchCount} stitches`);
    shapingInstructions.push(`Work in pattern for ${rowCount} rows`);
    shapingInstructions.push('Bind off all stitches');
    
  } else if (component.targetCircumference && component.targetLength) {
    // Cylindrical component (sleeve)
    stitchCount = Math.round((component.targetCircumference / 10) * gauge.stitchesPer10cm);
    rowCount = Math.round((component.targetLength / 10) * gauge.rowsPer10cm);
    
    shapingInstructions.push(`Cast on ${stitchCount} stitches`);
    shapingInstructions.push('Join in the round, being careful not to twist');
    shapingInstructions.push(`Work in pattern for ${rowCount} rounds`);
    shapingInstructions.push('Bind off all stitches');
    
  } else if (component.targetCircumference) {
    // Circular component (neckband)
    stitchCount = Math.round((component.targetCircumference / 10) * gauge.stitchesPer10cm);
    rowCount = Math.round(2 * gauge.rowsPer10cm); // Default 2cm height
    
    shapingInstructions.push(`Pick up ${stitchCount} stitches around neck opening`);
    shapingInstructions.push(`Work in ribbing for ${rowCount} rounds`);
    shapingInstructions.push('Bind off in pattern');
  }

  // Adjust for stitch pattern repeat
  if (input.stitchPattern.horizontalRepeat > 1) {
    const repeatAdjustment = stitchCount % input.stitchPattern.horizontalRepeat;
    if (repeatAdjustment !== 0) {
      const adjustment = input.stitchPattern.horizontalRepeat - repeatAdjustment;
      stitchCount += adjustment;
      shapingInstructions.unshift(`Note: Stitch count adjusted by +${adjustment} to accommodate pattern repeat`);
    }
  }

  return {
    componentKey: component.componentKey,
    displayName: component.displayName,
    stitchCount,
    rowCount,
    shapingInstructions,
    metadata: {
      targetDimensions: {
        width: component.targetWidth,
        length: component.targetLength,
        circumference: component.targetCircumference
      },
      calculatedDimensions: {
        actualWidth: component.targetWidth,
        actualLength: component.targetLength,
        actualCircumference: component.targetCircumference
      }
    }
  };
}

/**
 * Estimates completion time based on stitch count and yarn weight
 */
function estimateCompletionTime(totalStitches: number, yarnWeight: string): string {
  // Base stitches per hour by yarn weight
  const stitchesPerHour: Record<string, number> = {
    'Lace': 200,
    'Fingering': 300,
    'DK': 400,
    'Worsted': 500,
    'Bulky': 600,
    'Super Bulky': 700,
    'Jumbo': 800
  };

  const baseRate = stitchesPerHour[yarnWeight] || 400;
  const estimatedHours = Math.ceil(totalStitches / baseRate);

  if (estimatedHours < 24) {
    return `${estimatedHours} hours`;
  } else if (estimatedHours < 168) {
    const days = Math.ceil(estimatedHours / 8); // 8 hours per day
    return `${days} days`;
  } else {
    const weeks = Math.ceil(estimatedHours / 40); // 40 hours per week
    return `${weeks} weeks`;
  }
}

/**
 * Assesses difficulty level based on components and stitch pattern
 */
function assessDifficultyLevel(components: any[], stitchPattern: any): string {
  let difficultyScore = 0;

  // Base difficulty from number of components
  difficultyScore += components.length;

  // Add difficulty for complex components
  for (const component of components) {
    if (component.componentKey.includes('sleeve')) {
      difficultyScore += 2; // Sleeves add complexity
    }
    if (component.componentKey.includes('neck') || component.componentKey.includes('collar')) {
      difficultyScore += 1; // Necklines add some complexity
    }
  }

  // Add difficulty for stitch pattern
  if (stitchPattern.horizontalRepeat > 4 || stitchPattern.verticalRepeat > 4) {
    difficultyScore += 2; // Complex patterns
  } else if (stitchPattern.horizontalRepeat > 1 || stitchPattern.verticalRepeat > 1) {
    difficultyScore += 1; // Simple patterns
  }

  // Determine level
  if (difficultyScore <= 3) {
    return 'beginner';
  } else if (difficultyScore <= 6) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

/**
 * Generates a unique calculation ID
 */
function generateCalculationId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 