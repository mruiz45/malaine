/**
 * Stitch Pattern Instruction Generator (US_8.3)
 * Specialized utilities for generating row-by-row instructions with integrated stitch patterns
 */

import { StitchPattern, StitchPatternInstructions } from '@/types/stitchPattern';
import { 
  StitchPatternInstructionContext, 
  ComponentStitchPatternIntegrationData 
} from '@/types/pattern-calculation';
import { ShapingEvent, ShapingSchedule } from '@/types/shaping';

/**
 * Creates a stitch pattern instruction context from stitch pattern data
 * @param stitchPattern - The stitch pattern from the database
 * @param integrationData - Integration data from US_8.2
 * @returns Stitch pattern instruction context
 */
export function createStitchPatternContext(
  stitchPattern: StitchPattern,
  integrationData: ComponentStitchPatternIntegrationData
): StitchPatternInstructionContext {
  const patternRows: Array<{
    rowNumber: number;
    instruction: string;
    note?: string;
  }> = [];

  // Extract row instructions from the stitch pattern
  if (stitchPattern.instructions_written?.rows) {
    stitchPattern.instructions_written.rows.forEach(row => {
      patternRows.push({
        rowNumber: row.row_num,
        instruction: row.instruction,
        note: row.note
      });
    });
  } else if (stitchPattern.instructions_written?.rounds) {
    // Handle crochet rounds as rows for pattern repeat tracking
    stitchPattern.instructions_written.rounds.forEach(round => {
      patternRows.push({
        rowNumber: round.round_num,
        instruction: round.instruction,
        note: round.note
      });
    });
  }

  return {
    stitchPatternId: stitchPattern.id,
    stitchPatternName: stitchPattern.stitch_name,
    patternRows,
    repeatHeight: stitchPattern.stitch_repeat_height || patternRows.length,
    repeatWidth: stitchPattern.stitch_repeat_width || 1,
    edgeStitchesEachSide: integrationData.edgeStitchesEachSide,
    stockinetteStitchesEachSide: integrationData.stockinetteStitchesEachSide,
    fullRepeatsCount: integrationData.fullRepeatsCount,
    currentPatternRowIndex: 0 // Start at the first row of the pattern
  };
}

/**
 * Generates row instruction with integrated stitch pattern
 * @param context - Stitch pattern instruction context
 * @param rowNumber - Overall row number in the garment piece
 * @param currentStitchCount - Current stitch count for the row
 * @param craftType - Knitting or crochet
 * @param shapingEvent - Optional shaping event for this row
 * @returns Generated instruction text
 */
export function generateStitchPatternRowInstruction(
  context: StitchPatternInstructionContext,
  rowNumber: number,
  currentStitchCount: number,
  craftType: 'knitting' | 'crochet',
  shapingEvent?: ShapingEvent
): {
  instruction: string;
  nextPatternRowIndex: number;
  isShapingRow: boolean;
} {
  const isShapingRow = !!shapingEvent;
  
  // Get the current pattern row instruction
  const patternRowIndex = context.currentPatternRowIndex;
  const patternRow = context.patternRows[patternRowIndex];
  
  if (!patternRow) {
    // Fallback to basic instruction if pattern row not found
    const basicStitch = craftType === 'knitting' ? 'knit' : 'single crochet';
    return {
      instruction: `Row ${rowNumber}: Work ${currentStitchCount} sts in ${basicStitch}.`,
      nextPatternRowIndex: (patternRowIndex + 1) % context.repeatHeight,
      isShapingRow
    };
  }

  let instruction = `Row ${rowNumber}`;
  
  // Add pattern row indicator
  const patternRowNum = patternRow.rowNumber;
  instruction += ` (Pattern Row ${patternRowNum})`;
  
  // Add shaping indicator
  if (isShapingRow) {
    const shapingType = shapingEvent!.type === 'decrease' ? 'Dec' : 'Inc';
    instruction += ` [${shapingType}]`;
  }
  
  instruction += ': ';

  // Build the row instruction with edge stitches, pattern, and shaping
  if (isShapingRow && context.edgeStitchesEachSide > 0) {
    // Shaping with edge stitches - put shaping in edge stitches
    instruction += generateShapingWithEdgeStitches(
      context, 
      patternRow, 
      shapingEvent!, 
      craftType,
      currentStitchCount
    );
  } else if (isShapingRow) {
    // Shaping without dedicated edge stitches - generic approach
    instruction += generateGenericShapingInstruction(
      context,
      patternRow,
      shapingEvent!,
      craftType,
      currentStitchCount
    );
  } else {
    // No shaping - just pattern with edge stitches
    instruction += generatePatternWithEdgeStitches(
      context,
      patternRow,
      craftType,
      currentStitchCount
    );
  }

  // Calculate next pattern row index
  const nextPatternRowIndex = (patternRowIndex + 1) % context.repeatHeight;

  return {
    instruction,
    nextPatternRowIndex,
    isShapingRow
  };
}

/**
 * Generates instruction for shaping with dedicated edge stitches
 */
function generateShapingWithEdgeStitches(
  context: StitchPatternInstructionContext,
  patternRow: { rowNumber: number; instruction: string; note?: string },
  shapingEvent: ShapingEvent,
  craftType: 'knitting' | 'crochet',
  currentStitchCount: number
): string {
  const edgeStitches = context.edgeStitchesEachSide;
  const patternInstruction = patternRow.instruction;
  
  if (craftType === 'knitting') {
    if (shapingEvent.type === 'decrease') {
      return `K1, k2tog, work Pattern Row ${patternRow.rowNumber} (${patternInstruction}) to last ${edgeStitches} sts, ssk, k1. (${currentStitchCount - 2} sts)`;
    } else {
      return `K1, M1L, work Pattern Row ${patternRow.rowNumber} (${patternInstruction}) to last st, M1R, k1. (${currentStitchCount + 2} sts)`;
    }
  } else {
    // Crochet
    if (shapingEvent.type === 'decrease') {
      return `Sc1, sc2tog, work Pattern Row ${patternRow.rowNumber} (${patternInstruction}) to last 3 sts, sc2tog, sc1. (${currentStitchCount - 2} sts)`;
    } else {
      return `Sc1, 2 sc in next st, work Pattern Row ${patternRow.rowNumber} (${patternInstruction}) to last st, 2 sc in last st. (${currentStitchCount + 2} sts)`;
    }
  }
}

/**
 * Generates generic shaping instruction when no dedicated edge stitches
 */
function generateGenericShapingInstruction(
  context: StitchPatternInstructionContext,
  patternRow: { rowNumber: number; instruction: string; note?: string },
  shapingEvent: ShapingEvent,
  craftType: 'knitting' | 'crochet',
  currentStitchCount: number
): string {
  const shapingType = shapingEvent.type === 'decrease' ? 'Dec' : 'Inc';
  const stitchChange = shapingEvent.type === 'decrease' ? -shapingEvent.totalStitchesToChange : shapingEvent.totalStitchesToChange;
  const finalStitchCount = currentStitchCount + stitchChange;
  
  return `${shapingType} ${Math.abs(stitchChange)} st${Math.abs(stitchChange) > 1 ? 's' : ''} each end, work Pattern Row ${patternRow.rowNumber} (${patternRow.instruction}) as established. (${finalStitchCount} sts)`;
}

/**
 * Generates pattern instruction with edge stitches (no shaping)
 */
function generatePatternWithEdgeStitches(
  context: StitchPatternInstructionContext,
  patternRow: { rowNumber: number; instruction: string; note?: string },
  craftType: 'knitting' | 'crochet',
  currentStitchCount: number
): string {
  const edgeStitches = context.edgeStitchesEachSide;
  const stockinetteStitches = context.stockinetteStitchesEachSide || 0;
  
  let instruction = '';
  
  if (edgeStitches > 0) {
    // Add edge stitches at beginning
    const edgeStitch = craftType === 'knitting' ? 'k' : 'sc';
    instruction += `${edgeStitch.toUpperCase()}${edgeStitches}`;
    
    // Add stockinette panel if applicable
    if (stockinetteStitches > 0) {
      const stockinetteStitch = craftType === 'knitting' ? 'k' : 'sc';
      instruction += `, ${stockinetteStitch}${stockinetteStitches}`;
    }
    
    // Add pattern section
    if (context.fullRepeatsCount > 0) {
      instruction += `, work Pattern Row ${patternRow.rowNumber} (${patternRow.instruction}) ${context.fullRepeatsCount} time${context.fullRepeatsCount > 1 ? 's' : ''}`;
    }
    
    // Add stockinette panel at end if applicable
    if (stockinetteStitches > 0) {
      const stockinetteStitch = craftType === 'knitting' ? 'k' : 'sc';
      instruction += `, ${stockinetteStitch}${stockinetteStitches}`;
    }
    
    // Add edge stitches at end
    instruction += `, ${edgeStitch}${edgeStitches}`;
  } else {
    // No edge stitches - just the pattern
    instruction = `Work Pattern Row ${patternRow.rowNumber} (${patternRow.instruction}) across all stitches`;
  }
  
  instruction += `. (${currentStitchCount} sts)`;
  
  return instruction;
}

/**
 * Validates stitch pattern compatibility with component
 * @param stitchPattern - The stitch pattern
 * @param integrationData - Integration data from US_8.2
 * @returns Validation result
 */
export function validateStitchPatternCompatibility(
  stitchPattern: StitchPattern,
  integrationData: ComponentStitchPatternIntegrationData
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if stitch pattern has instructions
  if (!stitchPattern.instructions_written || 
      (!stitchPattern.instructions_written.rows && !stitchPattern.instructions_written.rounds)) {
    errors.push(`Stitch pattern "${stitchPattern.stitch_name}" does not have detailed row-by-row instructions`);
  }

  // Check repeat width compatibility
  if (stitchPattern.stitch_repeat_width && integrationData.fullRepeatsCount > 0) {
    const expectedPatternStitches = stitchPattern.stitch_repeat_width * integrationData.fullRepeatsCount;
    const availableStitches = integrationData.adjustedComponentStitchCount - (2 * integrationData.edgeStitchesEachSide);
    
    if (integrationData.stockinetteStitchesEachSide) {
      const stockinetteStitches = 2 * integrationData.stockinetteStitchesEachSide;
      if (expectedPatternStitches + stockinetteStitches !== availableStitches) {
        warnings.push(`Stitch count mismatch: Expected ${expectedPatternStitches} pattern stitches + ${stockinetteStitches} stockinette stitches, but have ${availableStitches} available stitches`);
      }
    } else {
      if (expectedPatternStitches !== availableStitches) {
        warnings.push(`Stitch count mismatch: Expected ${expectedPatternStitches} pattern stitches, but have ${availableStitches} available stitches`);
      }
    }
  }

  // Check if pattern has valid repeat dimensions
  if (!stitchPattern.stitch_repeat_width || stitchPattern.stitch_repeat_width < 1) {
    warnings.push(`Stitch pattern "${stitchPattern.stitch_name}" has invalid or missing repeat width`);
  }

  if (!stitchPattern.stitch_repeat_height || stitchPattern.stitch_repeat_height < 1) {
    warnings.push(`Stitch pattern "${stitchPattern.stitch_name}" has invalid or missing repeat height`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generates cast-on instruction for stitch pattern integration
 * @param context - Stitch pattern instruction context
 * @param integrationData - Integration data
 * @param craftType - Knitting or crochet
 * @returns Cast-on instruction
 */
export function generateStitchPatternCastOnInstruction(
  context: StitchPatternInstructionContext,
  integrationData: ComponentStitchPatternIntegrationData,
  craftType: 'knitting' | 'crochet'
): string {
  const totalStitches = integrationData.adjustedComponentStitchCount;
  
  if (craftType === 'knitting') {
    return `Cast on ${totalStitches} stitches for ${context.stitchPatternName} integration.`;
  } else {
    // For crochet, account for foundation chain
    const chainCount = totalStitches + 1;
    return `Chain ${chainCount}. Foundation Row: Work ${totalStitches} single crochet starting in 2nd chain from hook for ${context.stitchPatternName} integration. (${totalStitches} sts)`;
  }
} 