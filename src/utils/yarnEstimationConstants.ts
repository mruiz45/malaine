/**
 * Constants and configuration for Yarn Quantity Estimator Tool (US_2.2)
 * Contains project type configurations and yarn consumption factors
 */

import type { 
  ProjectType, 
  ProjectTypeConfig, 
  YarnConsumptionFactors, 
  GarmentSize 
} from '@/types/yarnQuantityEstimator';
import type { YarnWeightCategory } from '@/types/yarn';

/**
 * Buffer percentage added to final yarn calculations to account for variations
 */
export const YARN_ESTIMATION_BUFFER_PERCENTAGE = 15; // 15%

/**
 * Yarn consumption factors by weight category (meters per square meter)
 * These are approximate values for stockinette stitch based on industry standards
 */
export const YARN_CONSUMPTION_FACTORS: YarnConsumptionFactors = {
  'Lace': 1400,        // Very fine yarn requires more length per area
  'Fingering': 1200,   // Fine yarn
  'DK': 1000,          // Medium weight
  'Worsted': 800,      // Standard worsted weight
  'Bulky': 600,        // Thick yarn
  'Super Bulky': 400,  // Very thick yarn
  'Jumbo': 300         // Extremely thick yarn
};

/**
 * Default yarn consumption factor when yarn weight category is unknown
 */
export const DEFAULT_YARN_CONSUMPTION_FACTOR = 800; // Worsted weight equivalent

/**
 * Predefined surface areas for adult sweaters by size (in square meters)
 * Based on typical adult garment measurements
 */
export const ADULT_SWEATER_SURFACE_AREAS: Record<GarmentSize, number> = {
  'S': 1.0,   // Small: ~1.0 m²
  'M': 1.2,   // Medium: ~1.2 m²
  'L': 1.4,   // Large: ~1.4 m²
  'XL': 1.6   // Extra Large: ~1.6 m²
};

/**
 * Configuration for each project type
 */
export const PROJECT_TYPE_CONFIGS: Record<ProjectType, ProjectTypeConfig> = {
  scarf: {
    project_type_key: 'scarf',
    estimation_method: 'area_based',
    requires_dimensions: true,
    requires_size: false,
    default_dimensions: {
      width: 20,
      length: 150,
      unit: 'cm'
    }
  },
  
  baby_blanket: {
    project_type_key: 'baby_blanket',
    estimation_method: 'area_based',
    requires_dimensions: true,
    requires_size: false,
    default_dimensions: {
      width: 75,
      length: 100,
      unit: 'cm'
    }
  },
  
  simple_hat: {
    project_type_key: 'simple_hat',
    estimation_method: 'area_based',
    requires_dimensions: false,
    requires_size: false,
    // Approximate surface area for an adult hat
    predefined_surface_areas: {
      'S': 0.08,  // Small hat: ~0.08 m²
      'M': 0.10,  // Medium hat: ~0.10 m²
      'L': 0.12,  // Large hat: ~0.12 m²
      'XL': 0.14  // Extra large hat: ~0.14 m²
    }
  },
  
  adult_sweater: {
    project_type_key: 'adult_sweater',
    estimation_method: 'area_based',
    requires_dimensions: false,
    requires_size: true,
    predefined_surface_areas: ADULT_SWEATER_SURFACE_AREAS
  }
};

/**
 * Unit conversion factors
 */
export const UNIT_CONVERSIONS = {
  CM_TO_M: 0.01,
  INCH_TO_M: 0.0254,
  M_TO_CM: 100,
  M_TO_INCH: 39.3701
};

/**
 * Validation limits for dimensions
 */
export const DIMENSION_LIMITS = {
  MIN_WIDTH_CM: 1,
  MAX_WIDTH_CM: 500,
  MIN_LENGTH_CM: 1,
  MAX_LENGTH_CM: 1000,
  MIN_WIDTH_INCH: 0.5,
  MAX_WIDTH_INCH: 200,
  MIN_LENGTH_INCH: 0.5,
  MAX_LENGTH_INCH: 400
};

/**
 * Gets the yarn consumption factor for a given yarn weight category
 * @param category - Yarn weight category
 * @returns Consumption factor in meters per square meter
 */
export function getYarnConsumptionFactor(category?: YarnWeightCategory): number {
  if (!category) {
    return DEFAULT_YARN_CONSUMPTION_FACTOR;
  }
  
  return YARN_CONSUMPTION_FACTORS[category] || DEFAULT_YARN_CONSUMPTION_FACTOR;
}

/**
 * Gets the project configuration for a given project type
 * @param projectType - Project type
 * @returns Project configuration
 */
export function getProjectTypeConfig(projectType: ProjectType): ProjectTypeConfig {
  return PROJECT_TYPE_CONFIGS[projectType];
}

/**
 * Converts dimensions to square meters
 * @param width - Width value
 * @param length - Length value
 * @param unit - Unit of measurement
 * @returns Area in square meters
 */
export function convertDimensionsToSquareMeters(
  width: number, 
  length: number, 
  unit: 'cm' | 'inch'
): number {
  const conversionFactor = unit === 'cm' ? UNIT_CONVERSIONS.CM_TO_M : UNIT_CONVERSIONS.INCH_TO_M;
  const widthInMeters = width * conversionFactor;
  const lengthInMeters = length * conversionFactor;
  return widthInMeters * lengthInMeters;
}

/**
 * Gets surface area for a project
 * @param projectType - Type of project
 * @param size - Garment size (if applicable)
 * @param dimensions - Custom dimensions (if applicable)
 * @returns Surface area in square meters
 */
export function getProjectSurfaceArea(
  projectType: ProjectType,
  size?: GarmentSize,
  dimensions?: { width: number; length: number; unit: 'cm' | 'inch' }
): number {
  const config = getProjectTypeConfig(projectType);
  
  if (config.requires_dimensions && dimensions) {
    return convertDimensionsToSquareMeters(dimensions.width, dimensions.length, dimensions.unit);
  }
  
  if (config.requires_size && size && config.predefined_surface_areas) {
    return config.predefined_surface_areas[size];
  }
  
  if (config.predefined_surface_areas) {
    // Use medium size as default for projects with predefined areas
    return config.predefined_surface_areas['M'];
  }
  
  // Fallback: use default dimensions if available
  if (config.default_dimensions) {
    const { width, length, unit } = config.default_dimensions;
    return convertDimensionsToSquareMeters(width, length, unit);
  }
  
  throw new Error(`Cannot determine surface area for project type: ${projectType}`);
} 