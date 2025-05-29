/**
 * Instruction Generator for Basic Textual Instructions (US 6.3)
 * Enhanced for US 7.3 to include detailed shaping instructions
 * Generates human-readable instructions for rectangular garment pieces
 * based on calculation results from US 6.2
 */

import { InstructionGeneratorService } from '@/services/instructionGeneratorService';
import { 
  InstructionGenerationContext, 
  DetailedInstruction 
} from '@/types/instruction-generation';
import { ShapingSchedule } from '@/types/shaping';

/**
 * Input data for instruction generation
 */
export interface InstructionGenerationInput {
  /** Number of stitches to cast on */
  castOnStitches: number;
  /** Total number of rows to work */
  totalRows: number;
  /** Name of the stitch pattern */
  stitchPatternName: string;
  /** Craft type for terminology */
  craftType: 'knitting' | 'crochet';
  /** Optional yarn name for personalization */
  yarnName?: string;
}

/**
 * Generated instruction step
 */
export interface InstructionStep {
  /** Step number */
  step: number;
  /** Instruction text */
  text: string;
}

/**
 * Result of instruction generation
 */
export interface InstructionGenerationResult {
  /** Success status */
  success: boolean;
  /** Generated instructions */
  instructions?: InstructionStep[];
  /** Error messages if any */
  errors?: string[];
  /** Warning messages if any */
  warnings?: string[];
}

/**
 * Validates input data for instruction generation
 * @param input - The input data to validate
 * @returns Validation result with errors if any
 */
function validateInstructionInput(input: InstructionGenerationInput): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate cast on stitches
  if (!input.castOnStitches || input.castOnStitches <= 0) {
    errors.push('Cast on stitches must be a positive number');
  }

  // Validate total rows
  if (!input.totalRows || input.totalRows <= 0) {
    errors.push('Total rows must be a positive number');
  }

  // Validate stitch pattern name
  if (!input.stitchPatternName || input.stitchPatternName.trim() === '') {
    errors.push('Stitch pattern name is required');
  }

  // Validate craft type
  if (!input.craftType || !['knitting', 'crochet'].includes(input.craftType)) {
    errors.push('Craft type must be either "knitting" or "crochet"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generates cast-on instruction based on craft type
 * @param castOnStitches - Number of stitches to cast on
 * @param craftType - Knitting or crochet
 * @param yarnName - Optional yarn name
 * @returns Cast-on instruction text
 */
function generateCastOnInstruction(
  castOnStitches: number, 
  craftType: 'knitting' | 'crochet', 
  yarnName?: string
): string {
  const yarnText = yarnName ? ` and ${yarnName}` : '';
  
  if (craftType === 'knitting') {
    return `Using your main needles${yarnText}, cast on ${castOnStitches} stitches.`;
  } else {
    // For crochet, we need to account for the foundation chain
    // The pattern assumes single crochet, so we chain one extra and skip the first chain
    const chainCount = castOnStitches + 1;
    return `Using your hook${yarnText}, chain ${chainCount} stitches. Row 1: Work ${castOnStitches} single crochet starting in 2nd chain from hook, resulting in ${castOnStitches} stitches.`;
  }
}

/**
 * Generates work body instruction
 * @param totalRows - Number of rows to work
 * @param stitchPatternName - Name of the stitch pattern
 * @param craftType - Knitting or crochet
 * @returns Work body instruction text
 */
function generateWorkBodyInstruction(
  totalRows: number, 
  stitchPatternName: string, 
  craftType: 'knitting' | 'crochet'
): string {
  if (craftType === 'knitting') {
    return `Work in ${stitchPatternName} for ${totalRows} rows.`;
  } else {
    // For crochet, we need to account for the foundation row already worked
    const remainingRows = totalRows - 1;
    if (remainingRows > 0) {
      return `Continue working in ${stitchPatternName} for ${remainingRows} more rows (${totalRows} rows total).`;
    } else {
      return `Foundation row complete. You now have ${totalRows} row total.`;
    }
  }
}

/**
 * Generates bind-off instruction based on craft type
 * @param craftType - Knitting or crochet
 * @returns Bind-off instruction text
 */
function generateBindOffInstruction(craftType: 'knitting' | 'crochet'): string {
  if (craftType === 'knitting') {
    return 'Bind off all stitches loosely.';
  } else {
    return 'Fasten off and weave in ends.';
  }
}

/**
 * Generates warnings for unusual values
 * @param input - The input data
 * @returns Array of warning messages
 */
function generateWarnings(input: InstructionGenerationInput): string[] {
  const warnings: string[] = [];

  // Check for very wide pieces
  if (input.castOnStitches > 400) {
    warnings.push(`This piece requires ${input.castOnStitches} stitches, which is quite wide. Double-check your calculations.`);
  }

  // Check for very narrow pieces
  if (input.castOnStitches < 20) {
    warnings.push(`This piece only requires ${input.castOnStitches} stitches, which is quite narrow. Verify this is correct.`);
  }

  // Check for very long pieces
  if (input.totalRows > 1000) {
    warnings.push(`This piece requires ${input.totalRows} rows, which will take considerable time to complete.`);
  }

  // Check for very short pieces
  if (input.totalRows < 10) {
    warnings.push(`This piece only requires ${input.totalRows} rows, which is quite short. Verify this is correct.`);
  }

  return warnings;
}

/**
 * Main function to generate basic textual instructions for a rectangular piece
 * @param input - Input data including calculations and craft type
 * @returns Generated instructions with success status
 */
export function generateBasicInstructions(input: InstructionGenerationInput): InstructionGenerationResult {
  try {
    // Validate input
    const validation = validateInstructionInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Generate instructions
    const instructions: InstructionStep[] = [];
    let stepNumber = 1;

    // Step 1: Cast On
    instructions.push({
      step: stepNumber++,
      text: generateCastOnInstruction(input.castOnStitches, input.craftType, input.yarnName)
    });

    // Step 2: Work Body (only if we have rows to work)
    const workBodyText = generateWorkBodyInstruction(input.totalRows, input.stitchPatternName, input.craftType);
    if (workBodyText) {
      instructions.push({
        step: stepNumber++,
        text: workBodyText
      });
    }

    // Step 3: Bind Off
    instructions.push({
      step: stepNumber++,
      text: generateBindOffInstruction(input.craftType)
    });

    // Generate warnings
    const warnings = generateWarnings(input);

    return {
      success: true,
      instructions,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to generate instructions: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Helper function to extract instruction generation input from calculation results
 * @param detailedCalculations - Detailed calculations from US 6.2
 * @param stitchPatternName - Name of the stitch pattern
 * @param craftType - Craft type from session
 * @param yarnName - Optional yarn name
 * @returns Input data for instruction generation
 */
export function extractInstructionInput(
  detailedCalculations: {
    castOnStitches?: number;
    totalRows?: number;
  },
  stitchPatternName: string,
  craftType: 'knitting' | 'crochet',
  yarnName?: string
): InstructionGenerationInput | null {
  if (!detailedCalculations.castOnStitches || !detailedCalculations.totalRows) {
    return null;
  }

  return {
    castOnStitches: detailedCalculations.castOnStitches,
    totalRows: detailedCalculations.totalRows,
    stitchPatternName,
    craftType,
    yarnName
  };
}

/**
 * Generates detailed instructions with shaping for a component (US 7.3)
 * @param componentKey - Component identifier
 * @param componentDisplayName - Component display name
 * @param startingStitchCount - Starting stitch count
 * @param finalStitchCount - Final stitch count after shaping
 * @param shapingSchedule - Shaping schedule from US 7.2
 * @param craftType - Craft type (knitting or crochet)
 * @param stitchPatternName - Stitch pattern name
 * @returns Instructions formatted for ComponentCalculationResult
 */
export function generateDetailedInstructionsWithShaping(
  componentKey: string,
  componentDisplayName: string,
  startingStitchCount: number,
  finalStitchCount: number,
  shapingSchedule: ShapingSchedule | undefined,
  craftType: 'knitting' | 'crochet',
  stitchPatternName?: string
): InstructionStep[] {
  const instructionService = new InstructionGeneratorService();
  
  const context: InstructionGenerationContext = {
    craftType,
    componentKey,
    componentDisplayName,
    startingStitchCount,
    finalStitchCount,
    shapingSchedule,
    metadata: {
      stitchPatternName: stitchPatternName || (craftType === 'knitting' ? 'Stockinette Stitch' : 'Single Crochet')
    }
  };

  const result = instructionService.generateDetailedInstructionsWithShaping(context);
  
  if (!result.success || !result.instructions) {
    // Fallback to basic instructions if detailed generation fails
    console.warn(`Failed to generate detailed instructions for ${componentKey}: ${result.error}`);
    return generateFallbackInstructions(startingStitchCount, craftType);
  }

  // Convert DetailedInstruction[] to InstructionStep[]
  return result.instructions.map((instruction: DetailedInstruction): InstructionStep => ({
    step: instruction.step,
    text: instruction.text
  }));
}

/**
 * Generates fallback basic instructions when detailed generation fails
 */
function generateFallbackInstructions(
  castOnStitches: number,
  craftType: 'knitting' | 'crochet'
): InstructionStep[] {
  const instructions: InstructionStep[] = [];
  
  instructions.push({
    step: 1,
    text: generateCastOnInstruction(castOnStitches, craftType)
  });
  
  instructions.push({
    step: 2,
    text: `Work in pattern as desired.`
  });
  
  instructions.push({
    step: 3,
    text: generateBindOffInstruction(craftType)
  });
  
  return instructions;
} 