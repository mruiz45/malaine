/**
 * Yarn Quantity Estimator Service - Handles API calls for yarn quantity estimation
 * Follows the established service pattern for the Malaine project (US_2.2)
 */

import type { 
  YarnQuantityEstimationInput,
  YarnQuantityEstimation,
  YarnQuantityEstimationRequest,
  YarnQuantityEstimationResponse,
  EstimationValidationErrors,
  ProjectType,
  GarmentSize,
  DimensionUnit,
  FormattedEstimationResults
} from '@/types/yarnQuantityEstimator';
import { 
  getProjectTypeConfig, 
  DIMENSION_LIMITS,
  YARN_ESTIMATION_BUFFER_PERCENTAGE
} from '@/utils/yarnEstimationConstants';

/**
 * Estimates yarn quantity based on gauge, yarn, and project specifications
 * @param input - Estimation input data
 * @returns Promise<YarnQuantityEstimation> The estimation results
 * @throws Error if the request fails or validation fails
 */
export async function estimateYarnQuantity(input: YarnQuantityEstimationInput): Promise<YarnQuantityEstimation> {
  try {
    // Validate input before sending to API
    const validationErrors = validateEstimationInput(input);
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    const requestData: YarnQuantityEstimationRequest = { input };

    const response = await fetch('/api/tools/yarn-quantity-estimator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data: YarnQuantityEstimationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to estimate yarn quantity');
    }

    return data.data;
  } catch (error) {
    console.error('Error in estimateYarnQuantity:', error);
    throw error;
  }
}

/**
 * Validates yarn quantity estimation input data
 * @param input - Input data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateEstimationInput(input: YarnQuantityEstimationInput): EstimationValidationErrors {
  const errors: EstimationValidationErrors = {};

  // Validate project type
  if (!input.project_type) {
    errors.project_type = 'Project type is required';
  } else {
    const validProjectTypes: ProjectType[] = ['scarf', 'baby_blanket', 'simple_hat', 'adult_sweater'];
    if (!validProjectTypes.includes(input.project_type)) {
      errors.project_type = 'Invalid project type';
    }
  }

  // Get project configuration for further validation
  const projectConfig = input.project_type ? getProjectTypeConfig(input.project_type) : null;

  // Validate gauge information
  if (!input.gauge_profile_id && !input.gauge_info) {
    errors.gauge_info = 'Either gauge profile ID or gauge information is required';
  } else if (input.gauge_info) {
    const gaugeErrors = validateGaugeInfo(input.gauge_info);
    if (gaugeErrors) {
      errors.gauge_info = gaugeErrors;
    }
  }

  // Validate yarn information
  if (!input.yarn_profile_id && !input.yarn_info) {
    errors.yarn_info = 'Either yarn profile ID or yarn information is required';
  } else if (input.yarn_info) {
    const yarnErrors = validateYarnInfo(input.yarn_info);
    if (yarnErrors) {
      errors.yarn_info = yarnErrors;
    }
  }

  // Validate dimensions if required
  if (projectConfig?.requires_dimensions) {
    if (!input.dimensions) {
      errors.dimensions = 'Dimensions are required for this project type';
    } else {
      const dimensionErrors = validateDimensions(input.dimensions.width, input.dimensions.length, input.dimensions.unit);
      if (dimensionErrors) {
        errors.dimensions = dimensionErrors;
      }
    }
  }

  // Validate garment size if required
  if (projectConfig?.requires_size) {
    if (!input.garment_size) {
      errors.garment_size = 'Garment size is required for this project type';
    } else {
      const validSizes: GarmentSize[] = ['S', 'M', 'L', 'XL'];
      if (!validSizes.includes(input.garment_size)) {
        errors.garment_size = 'Invalid garment size';
      }
    }
  }

  return errors;
}

/**
 * Validates gauge information
 * @param gaugeInfo - Gauge information to validate
 * @returns Error message or null if valid
 */
function validateGaugeInfo(gaugeInfo: any): string | null {
  if (!gaugeInfo.stitch_count || gaugeInfo.stitch_count <= 0) {
    return 'Stitch count must be a positive number';
  }
  if (!gaugeInfo.row_count || gaugeInfo.row_count <= 0) {
    return 'Row count must be a positive number';
  }
  if (!gaugeInfo.measurement_unit || !['cm', 'inch'].includes(gaugeInfo.measurement_unit)) {
    return 'Measurement unit must be either "cm" or "inch"';
  }
  if (!gaugeInfo.swatch_width || gaugeInfo.swatch_width <= 0) {
    return 'Swatch width must be a positive number';
  }
  if (!gaugeInfo.swatch_height || gaugeInfo.swatch_height <= 0) {
    return 'Swatch height must be a positive number';
  }
  return null;
}

/**
 * Validates yarn information
 * @param yarnInfo - Yarn information to validate
 * @returns Error message or null if valid
 */
function validateYarnInfo(yarnInfo: any): string | null {
  // At least one of meterage or weight should be provided for meaningful calculations
  if (!yarnInfo.skein_meterage && !yarnInfo.skein_weight_grams) {
    return 'Either skein meterage or skein weight is required for calculations';
  }
  
  if (yarnInfo.skein_meterage && yarnInfo.skein_meterage <= 0) {
    return 'Skein meterage must be a positive number';
  }
  
  if (yarnInfo.skein_weight_grams && yarnInfo.skein_weight_grams <= 0) {
    return 'Skein weight must be a positive number';
  }
  
  return null;
}

/**
 * Validates project dimensions
 * @param width - Width value
 * @param length - Length value
 * @param unit - Unit of measurement
 * @returns Error message or null if valid
 */
function validateDimensions(width: number, length: number, unit: DimensionUnit): string | null {
  if (!width || width <= 0) {
    return 'Width must be a positive number';
  }
  
  if (!length || length <= 0) {
    return 'Length must be a positive number';
  }
  
  if (!['cm', 'inch'].includes(unit)) {
    return 'Unit must be either "cm" or "inch"';
  }
  
  // Check dimension limits
  if (unit === 'cm') {
    if (width < DIMENSION_LIMITS.MIN_WIDTH_CM || width > DIMENSION_LIMITS.MAX_WIDTH_CM) {
      return `Width must be between ${DIMENSION_LIMITS.MIN_WIDTH_CM} and ${DIMENSION_LIMITS.MAX_WIDTH_CM} cm`;
    }
    if (length < DIMENSION_LIMITS.MIN_LENGTH_CM || length > DIMENSION_LIMITS.MAX_LENGTH_CM) {
      return `Length must be between ${DIMENSION_LIMITS.MIN_LENGTH_CM} and ${DIMENSION_LIMITS.MAX_LENGTH_CM} cm`;
    }
  } else if (unit === 'inch') {
    if (width < DIMENSION_LIMITS.MIN_WIDTH_INCH || width > DIMENSION_LIMITS.MAX_WIDTH_INCH) {
      return `Width must be between ${DIMENSION_LIMITS.MIN_WIDTH_INCH} and ${DIMENSION_LIMITS.MAX_WIDTH_INCH} inches`;
    }
    if (length < DIMENSION_LIMITS.MIN_LENGTH_INCH || length > DIMENSION_LIMITS.MAX_LENGTH_INCH) {
      return `Length must be between ${DIMENSION_LIMITS.MIN_LENGTH_INCH} and ${DIMENSION_LIMITS.MAX_LENGTH_INCH} inches`;
    }
  }
  
  return null;
}

/**
 * Formats yarn quantity results for display
 * @param estimation - Estimation results
 * @returns Formatted display object
 */
export function formatEstimationResults(estimation: YarnQuantityEstimation): FormattedEstimationResults {
  return {
    totalLength: {
      meters: Math.round(estimation.total_length_meters * 100) / 100,
      yards: Math.round(estimation.total_length_meters * 1.0936 * 100) / 100
    },
    totalWeight: {
      grams: Math.round(estimation.total_weight_grams * 100) / 100,
      ounces: Math.round(estimation.total_weight_grams * 0.0353 * 100) / 100
    },
    numberOfSkeins: estimation.number_of_skeins,
    surfaceArea: Math.round(estimation.surface_area_m2 * 10000) / 10000, // m² with 4 decimal places
    bufferPercentage: estimation.buffer_percentage,
    calculationMethod: estimation.calculation_method,
    yarnWeightUsed: estimation.yarn_weight_category_used
  };
}

/**
 * Gets display name for project type
 * @param projectType - Project type
 * @returns Display name
 */
export function getProjectTypeDisplayName(projectType: ProjectType): string {
  const displayNames: Record<ProjectType, string> = {
    'scarf': 'Scarf',
    'baby_blanket': 'Baby Blanket',
    'simple_hat': 'Simple Hat',
    'adult_sweater': 'Adult Sweater'
  };
  
  return displayNames[projectType] || projectType;
}

/**
 * Gets display name for garment size
 * @param size - Garment size
 * @returns Display name
 */
export function getGarmentSizeDisplayName(size: GarmentSize): string {
  const displayNames: Record<GarmentSize, string> = {
    'S': 'Small',
    'M': 'Medium',
    'L': 'Large',
    'XL': 'Extra Large'
  };
  
  return displayNames[size] || size;
} 