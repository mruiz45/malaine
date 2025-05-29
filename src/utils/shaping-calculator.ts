/**
 * Shaping Calculator (US 7.2)
 * Implements basic shaping calculations for increases/decreases in garment components
 * Handles linear shaping transitions between two different stitch counts
 */

import {
  ShapingCalculationInput,
  ShapingCalculationResult,
  ShapingSchedule,
  ShapingEvent,
  ShapingInstructionDetail,
  ShapingDistribution
} from '@/types/shaping';

/**
 * Main function to calculate shaping schedule for a garment component
 * Implements the core algorithm described in FR1-FR6 of US 7.2
 * 
 * @param input - Shaping calculation parameters
 * @returns Calculated shaping schedule or error
 */
export function calculateShaping(input: ShapingCalculationInput): ShapingCalculationResult {
  try {
    // Validate input parameters
    const validation = validateShapingInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid input: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      };
    }

    const {
      startingStitchCount,
      targetStitchCount,
      totalRowsForShaping,
      stitchesPerShapingEvent
    } = input;

    // FR2: Calculate total number of stitches to be increased or decreased
    const totalShapingStitches = Math.abs(targetStitchCount - startingStitchCount);
    
    // No shaping needed
    if (totalShapingStitches === 0) {
      return {
        success: true,
        schedule: {
          shapingEvents: [],
          hasShaping: false,
          totalShapingRows: 0,
          metadata: {
            algorithm: 'no-shaping',
            calculatedAt: new Date().toISOString()
          }
        }
      };
    }

    // FR3: Calculate number of shaping rows needed
    const numShapingRows = Math.ceil(totalShapingStitches / stitchesPerShapingEvent);
    
    // Check if we have enough rows for the required shaping
    if (numShapingRows > totalRowsForShaping) {
      return {
        success: false,
        error: `Not enough rows for shaping: need ${numShapingRows} shaping rows but only have ${totalRowsForShaping} total rows`
      };
    }

    // Determine shaping type
    const shapingType: 'increase' | 'decrease' = targetStitchCount > startingStitchCount ? 'increase' : 'decrease';

    // Calculate the distribution of shaping events
    const distribution = calculateShapingDistribution(totalRowsForShaping, numShapingRows);

    // Generate detailed breakdown
    const detailedBreakdown = generateDetailedBreakdown(
      distribution,
      numShapingRows,
      shapingType,
      stitchesPerShapingEvent
    );

    // Generate simple instruction text
    const instructionsTextSimple = generateSimpleInstructions(
      shapingType,
      stitchesPerShapingEvent,
      distribution,
      numShapingRows
    );

    // Create shaping event
    const shapingEvent: ShapingEvent = {
      type: shapingType,
      totalStitchesToChange: totalShapingStitches,
      stitchesPerEvent: stitchesPerShapingEvent,
      numShapingEvents: numShapingRows,
      instructionsTextSimple,
      detailedBreakdown
    };

    // Create complete schedule
    const schedule: ShapingSchedule = {
      shapingEvents: [shapingEvent],
      hasShaping: true,
      totalShapingRows: numShapingRows,
      metadata: {
        algorithm: 'linear-distribution',
        calculatedAt: new Date().toISOString()
      }
    };

    return {
      success: true,
      schedule,
      warnings: validation.warnings
    };

  } catch (error) {
    return {
      success: false,
      error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * FR4-FR5: Calculate even distribution of shaping intervals
 * Implements the algorithm specified in the technical implementation guidance
 */
function calculateShapingDistribution(totalRows: number, numEvents: number): ShapingDistribution {
  if (numEvents === 0) {
    return {
      baseInterval: 0,
      numShorterIntervals: 0,
      numLongerIntervals: 0,
      longerInterval: 0
    };
  }

  const baseInterval = Math.floor(totalRows / numEvents);
  const remainderRows = totalRows % numEvents;
  
  // Number of intervals that will be longer (baseInterval + 1)
  const numLongerIntervals = remainderRows;
  // Number of intervals that will be shorter (baseInterval)
  const numShorterIntervals = numEvents - remainderRows;

  return {
    baseInterval,
    numShorterIntervals,
    numLongerIntervals,
    longerInterval: baseInterval + 1
  };
}

/**
 * Generate detailed breakdown for instruction generator
 * Creates step-by-step instructions with row offsets
 */
function generateDetailedBreakdown(
  distribution: ShapingDistribution,
  numShapingRows: number,
  shapingType: 'increase' | 'decrease',
  stitchesPerEvent: number
): ShapingInstructionDetail[] {
  const breakdown: ShapingInstructionDetail[] = [];
  let currentRowOffset = 0;

  // Generate shaping events with mixed intervals
  let longerIntervalsUsed = 0;
  let shorterIntervalsUsed = 0;

  for (let i = 0; i < numShapingRows; i++) {
    // Determine interval for this shaping event
    let interval: number;
    
    // Distribute longer intervals first to spread them evenly
    if (longerIntervalsUsed < distribution.numLongerIntervals) {
      interval = distribution.longerInterval;
      longerIntervalsUsed++;
    } else {
      interval = distribution.baseInterval;
      shorterIntervalsUsed++;
    }

    // Add plain rows before shaping (except for first event)
    if (i === 0 && interval > 1) {
      breakdown.push({
        actionRowOffset: currentRowOffset,
        instruction: `Work ${interval - 1} rows plain.`
      });
      currentRowOffset += interval - 1;
    } else if (i > 0 && interval > 1) {
      breakdown.push({
        actionRowOffset: currentRowOffset,
        instruction: `Work ${interval - 1} rows plain.`
      });
      currentRowOffset += interval - 1;
    }

    // Add shaping instruction
    const shapingInstruction = generateShapingInstruction(shapingType, stitchesPerEvent);
    breakdown.push({
      actionRowOffset: currentRowOffset,
      instruction: shapingInstruction
    });
    currentRowOffset += 1; // The shaping row itself
  }

  return breakdown;
}

/**
 * Generate simple instruction text for the shaping
 */
function generateSimpleInstructions(
  shapingType: 'increase' | 'decrease',
  stitchesPerEvent: number,
  distribution: ShapingDistribution,
  numEvents: number
): string {
  const actionText = shapingType === 'increase' ? 'Increase' : 'Decrease';
  const stitchText = stitchesPerEvent === 1 ? '1 stitch' : `${stitchesPerEvent} stitches`;
  
  // If all intervals are the same
  if (distribution.numLongerIntervals === 0) {
    const ordinal = getOrdinalText(distribution.baseInterval);
    return `${actionText} ${stitchText} every ${ordinal} row, ${numEvents} times.`;
  }
  
  // If we have mixed intervals
  if (distribution.numShorterIntervals > 0 && distribution.numLongerIntervals > 0) {
    const shorterOrdinal = getOrdinalText(distribution.baseInterval);
    const longerOrdinal = getOrdinalText(distribution.longerInterval);
    
    return `${actionText} ${stitchText} every ${shorterOrdinal} row ${distribution.numShorterIntervals} times, then every ${longerOrdinal} row ${distribution.numLongerIntervals} times.`;
  }
  
  // All intervals are longer
  const ordinal = getOrdinalText(distribution.longerInterval);
  return `${actionText} ${stitchText} every ${ordinal} row, ${numEvents} times.`;
}

/**
 * Generate specific shaping instruction for a single event
 */
function generateShapingInstruction(shapingType: 'increase' | 'decrease', stitchesPerEvent: number): string {
  if (shapingType === 'increase') {
    if (stitchesPerEvent === 1) {
      return 'Increase Row: Inc 1 st at beg of row.';
    } else if (stitchesPerEvent === 2) {
      return 'Increase Row: Inc 1 st at beg of row, work to last st, inc 1 st.';
    } else {
      return `Increase Row: Inc ${stitchesPerEvent} sts evenly across row.`;
    }
  } else {
    if (stitchesPerEvent === 1) {
      return 'Decrease Row: Dec 1 st at beg of row.';
    } else if (stitchesPerEvent === 2) {
      return 'Decrease Row: Dec 1 st at beg of row, work to last 2 sts, dec 1 st.';
    } else {
      return `Decrease Row: Dec ${stitchesPerEvent} sts evenly across row.`;
    }
  }
}

/**
 * Convert number to ordinal text (1st, 2nd, 3rd, etc.)
 */
function getOrdinalText(num: number): string {
  if (num === 1) return '1st';
  if (num === 2) return '2nd';
  if (num === 3) return '3rd';
  if (num >= 4 && num <= 20) return `${num}th`;
  
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }
  
  switch (lastDigit) {
    case 1: return `${num}st`;
    case 2: return `${num}nd`;
    case 3: return `${num}rd`;
    default: return `${num}th`;
  }
}

/**
 * Validate shaping calculation input
 */
function validateShapingInput(input: ShapingCalculationInput): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!Number.isInteger(input.startingStitchCount) || input.startingStitchCount < 1) {
    errors.push('startingStitchCount must be a positive integer');
  }

  if (!Number.isInteger(input.targetStitchCount) || input.targetStitchCount < 1) {
    errors.push('targetStitchCount must be a positive integer');
  }

  if (!Number.isInteger(input.totalRowsForShaping) || input.totalRowsForShaping < 1) {
    errors.push('totalRowsForShaping must be a positive integer');
  }

  if (!Number.isInteger(input.stitchesPerShapingEvent) || input.stitchesPerShapingEvent < 1) {
    errors.push('stitchesPerShapingEvent must be a positive integer');
  }

  if (input.rowsPerUnit <= 0) {
    errors.push('rowsPerUnit must be greater than 0');
  }

  // Logical validations
  const totalChange = Math.abs(input.targetStitchCount - input.startingStitchCount);
  if (totalChange > 0 && totalChange < input.stitchesPerShapingEvent) {
    warnings.push('Total stitch change is less than stitches per shaping event');
  }

  // Check for unusual values that might indicate errors
  if (input.totalRowsForShaping > 500) {
    warnings.push('Very large number of rows for shaping - please verify');
  }

  if (totalChange > input.startingStitchCount) {
    warnings.push('Large change relative to starting stitch count - please verify measurements');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 