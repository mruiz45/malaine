/**
 * Pattern Calculator API Route (US_6.1 + US_6.2 + US_6.3)
 * Handles pattern calculation requests and interfaces with the Core Pattern Calculation Engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import {
  PatternCalculationRequest,
  PatternCalculationResponse,
  PatternCalculationResult,
  ComponentCalculationResult,
  CalculationGaugeData,
  CalculationStitchPattern
} from '@/types/pattern-calculation';
import { validatePatternCalculationInput } from '@/utils/pattern-calculation-validators';
import { 
  calculateRectangularPiece, 
  RectangularPieceInput 
} from '@/utils/rectangular-piece-calculator';
import { 
  generateBasicInstructions, 
  extractInstructionInput 
} from '@/utils/instruction-generator';
import { calculateBeanie, BeanieCalculationInput } from '@/utils/beanie-calculator';
import { generateBeanieInstructions, BeanieInstructionGenerationInput } from '@/utils/beanie-instruction-generator';
import { BeanieAttributes } from '@/types/accessories';

/**
 * POST /api/pattern-calculator/calculate-pattern
 * Calculates pattern specifications from input data
 */
export async function POST(request: NextRequest): Promise<NextResponse<PatternCalculationResponse>> {
  try {
    // Authenticate user session
    const supabaseServer = await getSupabaseSessionAppRouter(request);
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
    const calculationResult = await performPatternCalculation(requestData, supabaseServer);

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
 * Enhanced for US_6.3 to include instruction generation
 */
async function performPatternCalculation(
  request: PatternCalculationRequest, 
  sessionResult: { supabase: any; user: any }
): Promise<PatternCalculationResult> {
  const { input, options } = request;
  const calculationId = generateCalculationId();

  try {
    // Fetch craft_type from the pattern definition session (US_6.3)
    let craftType: 'knitting' | 'crochet' = 'knitting'; // Default fallback
    try {
      const { data: sessionData, error: sessionError } = await sessionResult.supabase
        .from('pattern_definition_sessions')
        .select('craft_type')
        .eq('id', input.sessionId)
        .single();

      if (!sessionError && sessionData?.craft_type) {
        craftType = sessionData.craft_type;
      }
    } catch (error) {
      console.warn('Could not fetch craft_type from session, using default:', error);
    }

    // Calculate components
    const componentResults: ComponentCalculationResult[] = [];
    
    for (const component of input.garment.components) {
      const componentResult = calculateComponent(component, input, craftType);
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
 * Enhanced for US_6.2 with specialized rectangular piece calculation
 * Enhanced for US_7.1.1 with specialized beanie calculation
 */
function calculateComponent(component: any, input: any, craftType: 'knitting' | 'crochet'): ComponentCalculationResult {
  const { gauge, stitchPattern } = input;
  
  // Check if this is a beanie component (US_7.1.1)
  if (component.beanieAttributes) {
    return calculateBeanieComponent(component, input, craftType);
  }
  
  // Check if this is a rectangular component that can use the specialized calculator
  if (component.targetWidth && component.targetLength) {
    return calculateRectangularComponent(component, input, craftType);
  }

  // Fallback to original calculation for non-rectangular components
  return calculateNonRectangularComponent(component, input, craftType);
}

/**
 * Calculates stitch and row counts for beanie components
 * Implements US_7.1.1 beanie calculation logic
 */
function calculateBeanieComponent(component: any, input: any, craftType: 'knitting' | 'crochet'): ComponentCalculationResult {
  const { gauge, stitchPattern } = input;
  
  try {
    // Prepare beanie calculation input
    const beanieInput: BeanieCalculationInput = {
      beanieAttributes: component.beanieAttributes as BeanieAttributes,
      gauge: gauge as CalculationGaugeData,
      stitchPattern: stitchPattern as CalculationStitchPattern,
      componentKey: component.componentKey,
    };

    // Perform beanie calculation
    const beanieResult = calculateBeanie(beanieInput);
    
    // Generate beanie-specific instructions
    let instructions: Array<{ step: number; text: string; notes?: string }> | undefined;
    const instructionInput: BeanieInstructionGenerationInput = {
      calculationResult: beanieResult,
      beanieAttributes: component.beanieAttributes as BeanieAttributes,
      craftType,
      yarnName: input.yarn?.name,
      needleSize: input.needleSize,
    };
    
    const instructionResult = generateBeanieInstructions(instructionInput);
    if (instructionResult.success && instructionResult.instructions) {
      instructions = instructionResult.instructions.map(inst => ({
        step: inst.step,
        text: inst.text,
        notes: inst.notes
      }));
      
      // Add instruction warnings to component warnings
      if (instructionResult.warnings) {
        beanieResult.warnings = [
          ...(beanieResult.warnings || []),
          ...instructionResult.warnings
        ];
      }
    } else if (instructionResult.errors) {
      // Add instruction errors to component errors
      beanieResult.errors = [
        ...(beanieResult.errors || []),
        ...instructionResult.errors
      ];
    }

    // Generate basic shaping instructions summary
    const shapingInstructions: string[] = [];
    if (beanieResult.calculations.castOnStitches > 0) {
      shapingInstructions.push(`Cast on ${beanieResult.calculations.castOnStitches} stitches for working in the round`);
      
      const brimSection = beanieResult.sections.find(s => s.sectionName === 'brim');
      const bodySection = beanieResult.sections.find(s => s.sectionName === 'body');
      const crownSection = beanieResult.sections.find(s => s.sectionName === 'crown');
      
      if (brimSection && brimSection.rounds > 0) {
        shapingInstructions.push(`Work brim for ${brimSection.rounds} rounds`);
      }
      if (bodySection && bodySection.rounds > 0) {
        shapingInstructions.push(`Work body for ${bodySection.rounds} rounds`);
      }
      if (crownSection) {
        shapingInstructions.push(`Work crown decreases for ${crownSection.rounds} rounds to ${crownSection.stitches} stitches`);
      }
      shapingInstructions.push('Finish crown and weave in ends');
    }

    return {
      componentKey: component.componentKey,
      displayName: component.displayName || 'Beanie',
      stitchCount: beanieResult.calculations.castOnStitches,
      rowCount: beanieResult.calculations.totalRounds,
      shapingInstructions,
      detailedCalculations: {
        castOnStitches: beanieResult.calculations.castOnStitches,
        totalRows: beanieResult.calculations.totalRounds,
        rawStitchCount: beanieResult.calculations.rawStitchCount,
        patternRepeats: beanieResult.calculations.patternRepeats,
      },
      instructions,
      errors: beanieResult.errors,
      warnings: beanieResult.warnings,
      metadata: {
        calculationType: 'beanie',
        targetDimensions: {
          circumference: component.beanieAttributes.target_circumference_cm,
          height: component.beanieAttributes.body_height_cm,
        },
        calculatedDimensions: {
          actualCircumference: beanieResult.calculations.actualCalculatedCircumference_cm,
          actualHeight: beanieResult.calculations.actualCalculatedHeight_cm,
        },
        beanieSpecific: {
          crownStyle: component.beanieAttributes.crown_style,
          brimStyle: component.beanieAttributes.brim_style,
          workStyle: component.beanieAttributes.work_style,
          negativeEaseApplied: beanieResult.calculations.targetCircumferenceUsed_cm < component.beanieAttributes.target_circumference_cm,
          targetCircumferenceUsed_cm: beanieResult.calculations.targetCircumferenceUsed_cm,
          targetHeightUsed_cm: beanieResult.calculations.targetHeightUsed_cm,
          crownDecreasePoints: beanieResult.calculations.crownDecreasePoints,
          sections: beanieResult.sections,
        }
      }
    };
  } catch (error) {
    return {
      componentKey: component.componentKey,
      displayName: component.displayName || 'Beanie',
      stitchCount: 0,
      rowCount: 0,
      shapingInstructions: [],
      errors: [`Beanie calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      metadata: {
        calculationType: 'beanie',
        targetDimensions: {
          circumference: component.beanieAttributes?.target_circumference_cm || 0,
          height: component.beanieAttributes?.body_height_cm || 0,
        },
        calculatedDimensions: {
          actualCircumference: 0,
          actualHeight: 0,
        }
      }
    };
  }
}

/**
 * Calculates stitch and row counts for rectangular components
 * Extracted from original calculateComponent function for clarity
 */
function calculateRectangularComponent(component: any, input: any, craftType: 'knitting' | 'crochet'): ComponentCalculationResult {
  const { gauge, stitchPattern } = input;
  
  // Use specialized rectangular piece calculator (US_6.2)
  const rectangularInput: RectangularPieceInput = {
    targetWidth_cm: component.targetWidth,
    targetLength_cm: component.targetLength,
    gauge,
    stitchPattern,
    componentKey: component.componentKey,
  };

  const rectangularResult = calculateRectangularPiece(rectangularInput);
  
  // Generate basic textual instructions (US_6.3)
  let instructions: Array<{ step: number; text: string }> | undefined;
  const instructionInput = extractInstructionInput(
    rectangularResult.calculations,
    stitchPattern.name || 'pattern',
    craftType,
    input.yarn?.name
  );
  
  if (instructionInput) {
    const instructionResult = generateBasicInstructions(instructionInput);
    if (instructionResult.success && instructionResult.instructions) {
      instructions = instructionResult.instructions;
      
      // Add instruction warnings to component warnings
      if (instructionResult.warnings) {
        rectangularResult.warnings = [
          ...(rectangularResult.warnings || []),
          ...instructionResult.warnings
        ];
      }
    } else if (instructionResult.errors) {
      // Add instruction errors to component errors
      rectangularResult.errors = [
        ...(rectangularResult.errors || []),
        ...instructionResult.errors
      ];
    }
  }
  
  // Generate shaping instructions based on calculation
  const shapingInstructions: string[] = [];
  if (rectangularResult.calculations.castOnStitches > 0) {
    shapingInstructions.push(`Cast on ${rectangularResult.calculations.castOnStitches} stitches`);
    shapingInstructions.push(`Work in ${stitchPattern.name || 'pattern'} for ${rectangularResult.calculations.totalRows} rows`);
    shapingInstructions.push('Bind off all stitches');
  }

  return {
    componentKey: component.componentKey,
    displayName: component.displayName,
    stitchCount: rectangularResult.calculations.castOnStitches,
    rowCount: rectangularResult.calculations.totalRows,
    shapingInstructions,
    detailedCalculations: {
      targetWidthUsed_cm: rectangularResult.calculations.targetWidthUsed_cm,
      targetLengthUsed_cm: rectangularResult.calculations.targetLengthUsed_cm,
      castOnStitches: rectangularResult.calculations.castOnStitches,
      totalRows: rectangularResult.calculations.totalRows,
      actualCalculatedWidth_cm: rectangularResult.calculations.actualCalculatedWidth_cm,
      actualCalculatedLength_cm: rectangularResult.calculations.actualCalculatedLength_cm,
      rawStitchCount: rectangularResult.calculations.rawStitchCount,
      patternRepeats: rectangularResult.calculations.patternRepeats,
    },
    instructions,
    errors: rectangularResult.errors,
    warnings: rectangularResult.warnings,
    metadata: {
      calculationType: 'rectangular',
      targetDimensions: {
        width: component.targetWidth,
        length: component.targetLength,
      },
      calculatedDimensions: {
        actualWidth: rectangularResult.calculations.actualCalculatedWidth_cm,
        actualLength: rectangularResult.calculations.actualCalculatedLength_cm,
      }
    }
  };
}

/**
 * Calculates stitch and row counts for non-rectangular components
 * (Original logic preserved for cylindrical and circular components)
 */
function calculateNonRectangularComponent(component: any, input: any, craftType: 'knitting' | 'crochet'): ComponentCalculationResult {
  const { gauge } = input;
  
  // Basic calculation: convert dimensions to stitches/rows
  let stitchCount = 0;
  let rowCount = 0;
  const shapingInstructions: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Calculate based on component type and dimensions
  if (component.targetCircumference && component.targetLength) {
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
  } else {
    errors.push('Component must have either rectangular dimensions (width + length) or circular dimensions (circumference)');
  }

  // Adjust for stitch pattern repeat
  if (input.stitchPattern.horizontalRepeat > 1 && stitchCount > 0) {
    const repeatAdjustment = stitchCount % input.stitchPattern.horizontalRepeat;
    if (repeatAdjustment !== 0) {
      const adjustment = input.stitchPattern.horizontalRepeat - repeatAdjustment;
      stitchCount += adjustment;
      warnings.push(`Stitch count adjusted by +${adjustment} to accommodate ${input.stitchPattern.horizontalRepeat}-stitch pattern repeat`);
    }
  }

  return {
    componentKey: component.componentKey,
    displayName: component.displayName,
    stitchCount,
    rowCount,
    shapingInstructions,
    errors,
    warnings,
    metadata: {
      calculationType: 'non-rectangular',
      targetDimensions: {
        circumference: component.targetCircumference,
        length: component.targetLength,
      },
      calculatedDimensions: {
        actualCircumference: component.targetCircumference,
        actualLength: component.targetLength,
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