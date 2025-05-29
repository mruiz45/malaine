/**
 * Types for Shaping Calculations (US 7.2)
 * Defines interfaces for calculating increases/decreases in garment components
 */

/**
 * Input parameters for shaping calculations
 */
export interface ShapingCalculationInput {
  /** Starting stitch count for the component section */
  startingStitchCount: number;
  /** Target stitch count for the component section */
  targetStitchCount: number;
  /** Total number of rows over which shaping should occur */
  totalRowsForShaping: number;
  /** Number of stitches to increase/decrease at each shaping point */
  stitchesPerShapingEvent: number;
  /** Gauge information for row calculations */
  rowsPerUnit: number;
  /** Unit of measurement */
  unit: string;
}

/**
 * Detailed breakdown of a single shaping instruction
 */
export interface ShapingInstructionDetail {
  /** Row offset from the previous instruction */
  actionRowOffset: number;
  /** Specific instruction text for this step */
  instruction: string;
}

/**
 * Complete shaping event definition
 */
export interface ShapingEvent {
  /** Type of shaping: increase or decrease */
  type: 'increase' | 'decrease';
  /** Total number of stitches to change */
  totalStitchesToChange: number;
  /** Number of stitches changed per shaping event */
  stitchesPerEvent: number;
  /** Total number of shaping events needed */
  numShapingEvents: number;
  /** Simple text instruction for the shaping */
  instructionsTextSimple: string;
  /** Detailed breakdown for instruction generator */
  detailedBreakdown: ShapingInstructionDetail[];
}

/**
 * Complete shaping schedule for a component
 */
export interface ShapingSchedule {
  /** Array of shaping events (can have multiple phases) */
  shapingEvents: ShapingEvent[];
  /** Whether any shaping is required */
  hasShaping: boolean;
  /** Total rows used for shaping */
  totalShapingRows: number;
  /** Calculation metadata */
  metadata?: {
    /** Algorithm used for distribution */
    algorithm: string;
    /** Timestamp of calculation */
    calculatedAt: string;
  };
}

/**
 * Result of shaping calculation
 */
export interface ShapingCalculationResult {
  /** Success status */
  success: boolean;
  /** Calculated shaping schedule */
  schedule?: ShapingSchedule;
  /** Error message if calculation failed */
  error?: string;
  /** Validation warnings */
  warnings?: string[];
}

/**
 * Distribution pattern for shaping intervals
 */
export interface ShapingDistribution {
  /** Base interval between shaping rows */
  baseInterval: number;
  /** Number of shorter intervals */
  numShorterIntervals: number;
  /** Number of longer intervals */
  numLongerIntervals: number;
  /** Length of longer intervals */
  longerInterval: number;
} 