/**
 * Core Pattern Calculation Engine Types (PD_PH6_US002)
 * Types for the modular pattern calculation engine
 */

import { InMemoryPatternDefinition } from './patternDefinitionInMemory';
import { PatternCalculationInput, ComponentCalculationResult } from './pattern-calculation';

/**
 * Input data for the core calculation engine
 */
export interface CoreCalculationInput {
  /** Pattern state data */
  patternState: InMemoryPatternDefinition;
  /** Optional calculation options */
  options?: CoreCalculationOptions;
}

/**
 * Options for core pattern calculations
 */
export interface CoreCalculationOptions {
  /** Include detailed shaping instructions */
  includeDetailedShaping?: boolean;
  /** Include yarn estimation */
  includeYarnEstimation?: boolean;
  /** Validate interdependencies */
  validateInterdependencies?: boolean;
  /** Debug mode for additional information */
  debugMode?: boolean;
}

/**
 * Main output structure from the calculation engine
 * This is the calculatedPatternDetails mentioned in the US
 */
export interface CalculatedPatternDetails {
  /** Pattern metadata */
  patternInfo: {
    sessionId: string;
    garmentType: string;
    craftType: 'knitting' | 'crochet';
    calculatedAt: string;
    schemaVersion: string;
  };
  /** Calculated pieces with detailed information */
  pieces: Record<string, CalculatedPieceDetails>;
  /** Overall yarn estimation */
  yarnEstimation?: YarnEstimationDetails;
  /** Calculation warnings and notes */
  warnings?: string[];
  /** Calculation errors if any */
  errors?: string[];
}

/**
 * Detailed calculation results for a single pattern piece
 */
export interface CalculatedPieceDetails {
  /** Piece identifier */
  pieceKey: string;
  /** Display name */
  displayName: string;
  /** Number of stitches to cast on */
  castOnStitches: number;
  /** Total length in rows */
  lengthInRows: number;
  /** Final stitch count (after shaping) */
  finalStitchCount: number;
  /** Finished dimensions */
  finishedDimensions: {
    width_cm: number;
    length_cm: number;
    circumference_cm?: number;
  };
  /** Detailed shaping instructions */
  shaping: ShapingInstruction[];
  /** Row-by-row stitch counts at key points */
  stitchCountsAtRows?: Record<number, number>;
  /** Construction notes */
  constructionNotes?: string[];
  /** Piece-specific yarn usage */
  yarnUsage?: {
    estimatedLength_m: number;
    estimatedWeight_g: number;
  };
}

/**
 * Shaping instruction details
 */
export interface ShapingInstruction {
  /** Type of shaping */
  type: 'waistDecrease' | 'waistIncrease' | 'armhole' | 'neckline' | 'sleeveCap' | 'sleeveShaping' | 'custom';
  /** Human-readable instruction */
  instruction: string;
  /** Starting row number */
  startRow: number;
  /** Ending row number */
  endRow: number;
  /** Stitch count change */
  stitchCountChange: number;
  /** Frequency of shaping (every N rows) */
  frequency?: number;
  /** Number of repetitions */
  repetitions?: number;
  /** Additional notes */
  notes?: string[];
}

/**
 * Yarn estimation details
 */
export interface YarnEstimationDetails {
  /** Total estimated yarn length in meters */
  totalLength_m: number;
  /** Total estimated yarn weight in grams */
  totalWeight_g: number;
  /** Breakdown by piece */
  byPiece: Record<string, {
    length_m: number;
    weight_g: number;
    percentage: number;
  }>;
  /** Safety margin applied */
  safetyMargin: number;
  /** Estimation confidence level */
  confidence: 'high' | 'medium' | 'low';
  /** Factors affecting estimation */
  factors: string[];
}

/**
 * Context shared across all calculators
 */
export interface CalculationContext {
  /** Original pattern state */
  patternState: InMemoryPatternDefinition;
  /** Calculation options */
  options: CoreCalculationOptions;
  /** Current calculation session ID */
  sessionId: string;
  /** Gauge information */
  gauge: {
    stitchesPerCm: number;
    rowsPerCm: number;
    unit: 'cm' | 'inch';
  };
  /** Finished measurements after ease application */
  finishedMeasurements: Record<string, number>;
  /** Interdependency flags and data */
  interdependencies: Record<string, any>;
  /** Calculation timestamp */
  calculatedAt: Date;
}

/**
 * Base interface for all calculator modules
 */
export interface BaseCalculator {
  /** Calculator identifier */
  readonly calculatorType: string;
  /** Calculate for given context */
  calculate(context: CalculationContext): Promise<CalculatorResult>;
  /** Validate input for this calculator */
  validateInput(context: CalculationContext): ValidationResult;
  /** Get dependencies on other calculators */
  getDependencies(): string[];
}

/**
 * Result from a calculator module
 */
export interface CalculatorResult {
  /** Success status */
  success: boolean;
  /** Calculated pieces */
  pieces: Record<string, CalculatedPieceDetails>;
  /** Context updates (for interdependencies) */
  contextUpdates?: Partial<CalculationContext>;
  /** Warnings generated */
  warnings?: string[];
  /** Errors if any */
  errors?: string[];
}

/**
 * Validation result from calculators
 */
export interface ValidationResult {
  /** Is input valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Missing required data */
  missingData: string[];
}

/**
 * Interdependency resolution result
 */
export interface InterdependencyResolutionResult {
  /** Resolution success */
  success: boolean;
  /** Resolved context with updated values */
  resolvedContext: CalculationContext;
  /** Resolution actions taken */
  actions: string[];
  /** Warnings from resolution */
  warnings?: string[];
  /** Errors if resolution failed */
  errors?: string[];
}

/**
 * Engine configuration
 */
export interface EngineConfiguration {
  /** Enabled calculator modules */
  enabledCalculators: string[];
  /** Maximum calculation iterations for interdependency resolution */
  maxIterations: number;
  /** Default safety margins */
  safetyMargins: {
    yarn: number;
    stitchCount: number;
  };
  /** Calculation precision */
  precision: {
    dimensions: number;
    stitchCount: number;
  };
} 