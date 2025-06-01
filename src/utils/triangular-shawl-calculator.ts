/**
 * Triangular Shawl Calculator (US_12.5)
 * Implements calculation logic for triangular shawl construction methods
 */

import {
  TriangularShawlCalculationInput,
  TriangularShawlCalculations,
  TriangularShawlShapingPhase,
  TriangularShawlConstructionMethod
} from '@/types/triangular-shawl';

/**
 * Calculates triangular shawl specifications based on input parameters
 * @param input - Calculation input with dimensions, gauge and construction method
 * @returns Complete triangular shawl calculations
 */
export function calculateTriangularShawl(input: TriangularShawlCalculationInput): TriangularShawlCalculations {
  // Validate input
  validateTriangularShawlInput(input);

  // Normalize inputs
  const normalizedInput = normalizeTriangularShawlInput(input);

  // Calculate based on construction method
  switch (normalizedInput.construction_method) {
    case 'top_down_center_out':
      return calculateTopDownCenterOut(normalizedInput);
    case 'side_to_side':
      return calculateSideToSide(normalizedInput);
    case 'bottom_up':
      return calculateBottomUp(normalizedInput);
    default:
      throw new Error(`Unsupported construction method: ${normalizedInput.construction_method}`);
  }
}

/**
 * Validates triangular shawl calculation input
 */
function validateTriangularShawlInput(input: TriangularShawlCalculationInput): void {
  if (input.target_wingspan_cm <= 0) {
    throw new Error('Target wingspan must be greater than 0');
  }
  
  if (input.target_depth_cm <= 0) {
    throw new Error('Target depth must be greater than 0');
  }
  
  if (input.gauge_stitches_per_10cm <= 0) {
    throw new Error('Gauge stitches per 10cm must be greater than 0');
  }
  
  if (input.gauge_rows_per_10cm <= 0) {
    throw new Error('Gauge rows per 10cm must be greater than 0');
  }
}

/**
 * Normalizes input with default values
 */
function normalizeTriangularShawlInput(input: TriangularShawlCalculationInput): Required<TriangularShawlCalculationInput> {
  return {
    ...input,
    border_stitches_each_side: input.border_stitches_each_side ?? 0,
    work_style: input.work_style ?? 'flat'
  };
}

/**
 * Calculates top-down center-out triangular shawl (FR3.a)
 * Starts with few stitches at center top, increases on both sides and around central spine
 */
function calculateTopDownCenterOut(input: Required<TriangularShawlCalculationInput>): TriangularShawlCalculations {
  const warnings: string[] = [];
  
  // Calculate gauge conversions
  const stitchesPerCm = input.gauge_stitches_per_10cm / 10;
  const rowsPerCm = input.gauge_rows_per_10cm / 10;

  // Setup: Start with 3-5 stitches (typical for center-out construction)
  const castOnStitches = 3;
  
  // Calculate target rows for depth
  const targetRowsForDepth = Math.round(input.target_depth_cm * rowsPerCm);
  
  // For top-down center-out: 4 increases every 2 rows (typical pattern)
  // 1 at each end + 2 at center spine (around central stitch)
  const stitchesIncreasedPerEvent = 4;
  const shapingFrequency = 2; // Every 2 rows (RS rows only when working flat)
  
  // Calculate number of increase events needed
  // Each increase event adds 4 stitches and 2 rows
  const increaseEvents = Math.floor(targetRowsForDepth / shapingFrequency);
  
  // Calculate actual rows and final stitch count
  const totalRowsInPhase = increaseEvents * shapingFrequency;
  const finalStitchCount = castOnStitches + (increaseEvents * stitchesIncreasedPerEvent);
  
  // Calculate actual dimensions achieved
  const actualDepthCm = totalRowsInPhase / rowsPerCm;
  
  // For wingspan calculation: the final stitch count represents the wingspan
  // But we need to account for the triangular shape - not all stitches contribute equally to width
  // Use a more realistic calculation based on the triangular geometry
  const actualWingspanCm = (finalStitchCount * 0.7) / stitchesPerCm; // 0.7 factor for triangular shape
  
  // Check if dimensions are reasonable
  if (Math.abs(actualDepthCm - input.target_depth_cm) > (input.target_depth_cm * 0.1)) {
    warnings.push(`Actual depth (${actualDepthCm.toFixed(1)}cm) differs from target (${input.target_depth_cm}cm) by more than 10%`);
  }
  
  if (Math.abs(actualWingspanCm - input.target_wingspan_cm) > (input.target_wingspan_cm * 0.15)) {
    warnings.push(`Actual wingspan (${actualWingspanCm.toFixed(1)}cm) differs from target (${input.target_wingspan_cm}cm) by more than 15%`);
  }

  const phase1: TriangularShawlShapingPhase = {
    description: 'Increase 4 stitches every 2nd row (1 at each end, 2 at center spine)',
    total_shaping_rows: increaseEvents,
    stitches_per_event: stitchesIncreasedPerEvent,
    total_rows_in_phase: totalRowsInPhase,
    shaping_frequency: shapingFrequency
  };

  return {
    construction_method: 'top_down_center_out',
    inputs: {
      target_wingspan_cm: input.target_wingspan_cm,
      target_depth_cm: input.target_depth_cm,
      gauge_stitches_per_10cm: input.gauge_stitches_per_10cm,
      gauge_rows_per_10cm: input.gauge_rows_per_10cm,
      border_stitches_each_side: input.border_stitches_each_side,
      work_style: input.work_style
    },
    setup: {
      cast_on_stitches: castOnStitches,
      setup_notes: 'Cast on 3 stitches. Place markers for center spine if desired.'
    },
    shaping_schedule: {
      phase_1_increases: phase1
    },
    final_stitch_count: finalStitchCount,
    total_rows_knit: totalRowsInPhase,
    calculated_dimensions: {
      actual_wingspan_cm: Math.round(actualWingspanCm * 10) / 10,
      actual_depth_cm: Math.round(actualDepthCm * 10) / 10
    },
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Calculates side-to-side (point-to-point) triangular shawl (FR3.b)  
 * Starts at one point, increases to maximum depth, then decreases symmetrically
 */
function calculateSideToSide(input: Required<TriangularShawlCalculationInput>): TriangularShawlCalculations {
  const warnings: string[] = [];
  
  // Calculate gauge conversions
  const stitchesPerCm = input.gauge_stitches_per_10cm / 10;
  const rowsPerCm = input.gauge_rows_per_10cm / 10;

  // Setup: Start with few stitches at one point
  const castOnStitches = 4;
  
  // Calculate target rows for half the wingspan (since we work from point to point)
  const halfWingspanRows = Math.round((input.target_wingspan_cm / 2) * rowsPerCm);
  
  // Side-to-side: typically 1 increase on one edge every 2-4 rows
  const stitchesIncreasedPerEvent = 1;
  const shapingFrequency = 2; // Every 2 rows
  
  // Phase 1: Increase until we reach maximum depth (target_depth_cm in stitches)
  const maxStitchesForDepth = Math.round(input.target_depth_cm * stitchesPerCm);
  const increaseEvents = Math.max(0, maxStitchesForDepth - castOnStitches);
  const phase1Rows = increaseEvents * shapingFrequency;
  
  // Phase 2: Decrease symmetrically  
  const decreaseEvents = increaseEvents;
  const phase2Rows = decreaseEvents * shapingFrequency;
  
  const totalRows = phase1Rows + phase2Rows;
  const finalStitchCount = castOnStitches; // Back to starting point
  
  // Calculate actual dimensions
  const actualWingspanCm = totalRows / rowsPerCm;
  const actualDepthCm = (castOnStitches + increaseEvents) / stitchesPerCm;
  
  // Validation warnings
  if (Math.abs(actualWingspanCm - input.target_wingspan_cm) > (input.target_wingspan_cm * 0.1)) {
    warnings.push(`Actual wingspan (${actualWingspanCm.toFixed(1)}cm) differs from target (${input.target_wingspan_cm}cm) by more than 10%`);
  }
  
  if (Math.abs(actualDepthCm - input.target_depth_cm) > (input.target_depth_cm * 0.15)) {
    warnings.push(`Actual depth (${actualDepthCm.toFixed(1)}cm) differs from target (${input.target_depth_cm}cm) by more than 15%`);
  }

  const phase1: TriangularShawlShapingPhase = {
    description: 'Increase 1 stitch on one edge every 2nd row until maximum depth',
    total_shaping_rows: increaseEvents,
    stitches_per_event: stitchesIncreasedPerEvent,
    total_rows_in_phase: phase1Rows,
    shaping_frequency: shapingFrequency
  };

  const phase2: TriangularShawlShapingPhase = {
    description: 'Decrease 1 stitch on same edge every 2nd row to form second half',
    total_shaping_rows: decreaseEvents,
    stitches_per_event: stitchesIncreasedPerEvent,
    total_rows_in_phase: phase2Rows,
    shaping_frequency: shapingFrequency
  };

  return {
    construction_method: 'side_to_side',
    inputs: {
      target_wingspan_cm: input.target_wingspan_cm,
      target_depth_cm: input.target_depth_cm,
      gauge_stitches_per_10cm: input.gauge_stitches_per_10cm,
      gauge_rows_per_10cm: input.gauge_rows_per_10cm,
      border_stitches_each_side: input.border_stitches_each_side,
      work_style: input.work_style
    },
    setup: {
      cast_on_stitches: castOnStitches,
      setup_notes: 'Cast on 4 stitches at one point of the triangle.'
    },
    shaping_schedule: {
      phase_1_increases: phase1,
      phase_2_decreases: phase2
    },
    final_stitch_count: finalStitchCount,
    total_rows_knit: totalRows,
    calculated_dimensions: {
      actual_wingspan_cm: Math.round(actualWingspanCm * 10) / 10,
      actual_depth_cm: Math.round(actualDepthCm * 10) / 10
    },
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Calculates bottom-up triangular shawl (FR3.c)
 * Starts with large number of stitches for wingspan, decreases to form point
 */
function calculateBottomUp(input: Required<TriangularShawlCalculationInput>): TriangularShawlCalculations {
  const warnings: string[] = [];
  
  // Calculate gauge conversions
  const stitchesPerCm = input.gauge_stitches_per_10cm / 10;
  const rowsPerCm = input.gauge_rows_per_10cm / 10;

  // Setup: Calculate cast-on stitches for full wingspan
  const castOnStitches = Math.round(input.target_wingspan_cm * stitchesPerCm);
  
  // Calculate target rows for depth
  const targetRowsForDepth = Math.round(input.target_depth_cm * rowsPerCm);
  
  // Bottom-up: typically decrease 1 stitch at each end every 2-4 rows
  const stitchesDecreasedPerEvent = 2; // 1 at each end
  const shapingFrequency = 2; // Every 2 rows
  
  // Calculate number of decrease events needed to reach a reasonable point (3-5 stitches)
  const finalStitches = 3;
  const totalStitchesToDecrease = castOnStitches - finalStitches;
  const decreaseEvents = Math.round(totalStitchesToDecrease / stitchesDecreasedPerEvent);
  
  // Calculate actual rows and validate against target depth
  const totalRows = decreaseEvents * shapingFrequency;
  
  // Calculate actual dimensions
  const actualDepthCm = totalRows / rowsPerCm;
  const actualWingspanCm = castOnStitches / stitchesPerCm;
  
  // Validation warnings
  if (Math.abs(actualDepthCm - input.target_depth_cm) > (input.target_depth_cm * 0.1)) {
    warnings.push(`Actual depth (${actualDepthCm.toFixed(1)}cm) differs from target (${input.target_depth_cm}cm) by more than 10%`);
  }
  
  if (Math.abs(actualWingspanCm - input.target_wingspan_cm) > (input.target_wingspan_cm * 0.05)) {
    warnings.push(`Actual wingspan (${actualWingspanCm.toFixed(1)}cm) differs from target (${input.target_wingspan_cm}cm) by more than 5%`);
  }

  const phase2: TriangularShawlShapingPhase = {
    description: 'Decrease 1 stitch at each end every 2nd row until 3 stitches remain',
    total_shaping_rows: decreaseEvents,
    stitches_per_event: stitchesDecreasedPerEvent,
    total_rows_in_phase: totalRows,
    shaping_frequency: shapingFrequency
  };

  return {
    construction_method: 'bottom_up',
    inputs: {
      target_wingspan_cm: input.target_wingspan_cm,
      target_depth_cm: input.target_depth_cm,
      gauge_stitches_per_10cm: input.gauge_stitches_per_10cm,
      gauge_rows_per_10cm: input.gauge_rows_per_10cm,
      border_stitches_each_side: input.border_stitches_each_side,
      work_style: input.work_style
    },
    setup: {
      cast_on_stitches: castOnStitches,
      setup_notes: `Cast on ${castOnStitches} stitches for full wingspan.`
    },
    shaping_schedule: {
      phase_2_decreases: phase2
    },
    final_stitch_count: finalStitches,
    total_rows_knit: totalRows,
    calculated_dimensions: {
      actual_wingspan_cm: Math.round(actualWingspanCm * 10) / 10,
      actual_depth_cm: Math.round(actualDepthCm * 10) / 10
    },
    warnings: warnings.length > 0 ? warnings : undefined
  };
} 