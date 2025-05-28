/**
 * Types for Pattern Calculation Engine (US_6.1)
 * Defines interfaces for the input data structure and API contract for the Core Pattern Calculation Engine
 */

/**
 * Version information for the calculation input schema
 */
export interface CalculationVersion {
  /** Schema version for backward compatibility */
  version: string;
}

/**
 * Unit preferences for calculations
 */
export interface CalculationUnits {
  /** Unit for dimensional measurements (cm, inches) */
  dimensionUnit: 'cm' | 'inches';
  /** Unit for gauge measurements (cm, inches) */
  gaugeUnit: 'cm' | 'inches';
}

/**
 * Gauge data for pattern calculations
 */
export interface CalculationGaugeData {
  /** Number of stitches per gauge unit */
  stitchesPer10cm: number;
  /** Number of rows per gauge unit */
  rowsPer10cm: number;
  /** Gauge measurement unit */
  unit: string;
  /** Optional gauge profile name for reference */
  profileName?: string;
}

/**
 * Yarn profile data for calculations
 */
export interface CalculationYarnProfile {
  /** Yarn name */
  name: string;
  /** Yarn weight category (Lace, DK, Worsted, etc.) */
  weightCategory: string;
  /** Fiber content */
  fiber?: string;
  /** Additional yarn metadata */
  metadata?: Record<string, any>;
}

/**
 * Stitch pattern data for calculations
 */
export interface CalculationStitchPattern {
  /** Pattern name */
  name: string;
  /** Horizontal repeat count */
  horizontalRepeat: number;
  /** Vertical repeat count */
  verticalRepeat: number;
  /** Pattern type (stockinette, ribbing, cable, etc.) */
  patternType?: string;
  /** Additional pattern metadata */
  metadata?: Record<string, any>;
}

/**
 * Component definition for calculation
 */
export interface CalculationComponentDefinition {
  /** Unique component key (body_panel, sleeve, neckband, etc.) */
  componentKey: string;
  /** Display name for the component */
  displayName: string;
  /** Target width in finished dimensions */
  targetWidth?: number;
  /** Target length in finished dimensions */
  targetLength?: number;
  /** Target circumference for circular components */
  targetCircumference?: number;
  /** Component-specific attributes */
  attributes: Record<string, any>;
}

/**
 * Finished garment measurements (after ease application)
 */
export interface CalculationMeasurements {
  /** Finished chest/bust circumference */
  finishedChestCircumference: number;
  /** Finished garment length */
  finishedLength: number;
  /** Finished waist circumference */
  finishedWaistCircumference?: number;
  /** Finished hip circumference */
  finishedHipCircumference?: number;
  /** Finished shoulder width */
  finishedShoulderWidth?: number;
  /** Finished arm length */
  finishedArmLength?: number;
  /** Finished upper arm circumference */
  finishedUpperArmCircumference?: number;
  /** Finished neck circumference */
  finishedNeckCircumference?: number;
  /** Additional finished measurements */
  additionalMeasurements?: Record<string, number>;
}

/**
 * Garment definition for calculation
 */
export interface CalculationGarmentDefinition {
  /** Garment type key */
  typeKey: string;
  /** Display name */
  displayName: string;
  /** Construction method */
  constructionMethod: string;
  /** Body shape */
  bodyShape: string;
  /** Target finished measurements */
  measurements: CalculationMeasurements;
  /** Component definitions */
  components: CalculationComponentDefinition[];
  /** Additional garment attributes */
  attributes?: Record<string, any>;
}

/**
 * Complete input structure for the Pattern Calculation Engine
 */
export interface PatternCalculationInput {
  /** Schema version */
  version: string;
  /** Source session ID for traceability */
  sessionId: string;
  /** Unit preferences */
  units: CalculationUnits;
  /** Gauge information */
  gauge: CalculationGaugeData;
  /** Yarn profile */
  yarn: CalculationYarnProfile;
  /** Stitch pattern */
  stitchPattern: CalculationStitchPattern;
  /** Garment definition */
  garment: CalculationGarmentDefinition;
  /** Timestamp of calculation request */
  requestedAt: string;
}

/**
 * Component calculation result
 */
export interface ComponentCalculationResult {
  /** Component key */
  componentKey: string;
  /** Component display name */
  displayName: string;
  /** Calculated stitch count */
  stitchCount: number;
  /** Calculated row count */
  rowCount: number;
  /** Shaping instructions */
  shapingInstructions?: string[];
  /** Additional calculation metadata */
  metadata?: Record<string, any>;
}

/**
 * Pattern calculation result
 */
export interface PatternCalculationResult {
  /** Calculation ID for reference */
  calculationId: string;
  /** Source session ID */
  sessionId: string;
  /** Calculation timestamp */
  calculatedAt: string;
  /** Input data used for calculation */
  input: PatternCalculationInput;
  /** Component calculation results */
  components: ComponentCalculationResult[];
  /** Overall pattern metadata */
  patternMetadata: {
    /** Total estimated stitches */
    totalStitches: number;
    /** Estimated completion time */
    estimatedTime?: string;
    /** Difficulty level */
    difficultyLevel?: string;
  };
  /** Calculation status */
  status: 'success' | 'error' | 'warning';
  /** Error messages if any */
  errors?: string[];
  /** Warning messages if any */
  warnings?: string[];
}

/**
 * API request for pattern calculation
 */
export interface PatternCalculationRequest {
  /** Input data for calculation */
  input: PatternCalculationInput;
  /** Optional calculation options */
  options?: {
    /** Include detailed shaping instructions */
    includeShaping?: boolean;
    /** Include yarn quantity estimates */
    includeYarnEstimate?: boolean;
    /** Preferred instruction format */
    instructionFormat?: 'text' | 'chart' | 'both';
  };
}

/**
 * API response for pattern calculation
 */
export interface PatternCalculationResponse {
  /** Success status */
  success: boolean;
  /** Calculation result data */
  data?: PatternCalculationResult;
  /** Error message if any */
  error?: string;
  /** Validation errors */
  validationErrors?: string[];
}

/**
 * Validation result for calculation input
 */
export interface InputValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Missing required fields */
  missingFields: string[];
}

/**
 * Transformation context for building calculation input
 */
export interface TransformationContext {
  /** Source session data */
  sessionData: any;
  /** Transformation options */
  options?: {
    /** Apply default values for missing data */
    applyDefaults?: boolean;
    /** Validate input after transformation */
    validateInput?: boolean;
    /** Include debug information */
    includeDebugInfo?: boolean;
  };
}

/**
 * Transformation result
 */
export interface TransformationResult {
  /** Success status */
  success: boolean;
  /** Transformed calculation input */
  input?: PatternCalculationInput;
  /** Transformation errors */
  errors?: string[];
  /** Transformation warnings */
  warnings?: string[];
  /** Debug information */
  debugInfo?: Record<string, any>;
} 