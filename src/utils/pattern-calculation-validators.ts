/**
 * Validation utilities for Pattern Calculation Engine (US_6.1)
 * Provides validation functions for calculation input data
 */

import {
  PatternCalculationInput,
  InputValidationResult,
  CalculationGaugeData,
  CalculationMeasurements,
  CalculationComponentDefinition
} from '@/types/pattern-calculation';

/**
 * Validates the complete pattern calculation input
 * @param input - The calculation input to validate
 * @returns Validation result with errors and warnings
 */
export function validatePatternCalculationInput(input: PatternCalculationInput): InputValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];

  // Validate version
  if (!input.version) {
    missingFields.push('version');
  } else if (!isValidVersion(input.version)) {
    errors.push(`Invalid version format: ${input.version}`);
  }

  // Validate session ID
  if (!input.sessionId) {
    missingFields.push('sessionId');
  } else if (!isValidUUID(input.sessionId)) {
    errors.push(`Invalid session ID format: ${input.sessionId}`);
  }

  // Validate units
  if (!input.units) {
    missingFields.push('units');
  } else {
    const unitValidation = validateUnits(input.units);
    errors.push(...unitValidation.errors);
    warnings.push(...unitValidation.warnings);
  }

  // Validate gauge
  if (!input.gauge) {
    missingFields.push('gauge');
  } else {
    const gaugeValidation = validateGauge(input.gauge);
    errors.push(...gaugeValidation.errors);
    warnings.push(...gaugeValidation.warnings);
  }

  // Validate yarn
  if (!input.yarn) {
    missingFields.push('yarn');
  } else {
    const yarnValidation = validateYarn(input.yarn);
    errors.push(...yarnValidation.errors);
    warnings.push(...yarnValidation.warnings);
  }

  // Validate stitch pattern
  if (!input.stitchPattern) {
    missingFields.push('stitchPattern');
  } else {
    const stitchValidation = validateStitchPattern(input.stitchPattern);
    errors.push(...stitchValidation.errors);
    warnings.push(...stitchValidation.warnings);
  }

  // Validate garment
  if (!input.garment) {
    missingFields.push('garment');
  } else {
    const garmentValidation = validateGarment(input.garment);
    errors.push(...garmentValidation.errors);
    warnings.push(...garmentValidation.warnings);
  }

  // Validate timestamp
  if (!input.requestedAt) {
    missingFields.push('requestedAt');
  } else if (!isValidISO8601(input.requestedAt)) {
    errors.push(`Invalid timestamp format: ${input.requestedAt}`);
  }

  return {
    isValid: errors.length === 0 && missingFields.length === 0,
    errors,
    warnings,
    missingFields
  };
}

/**
 * Validates calculation units
 */
function validateUnits(units: any): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!units.dimensionUnit) {
    errors.push('Missing dimension unit');
  } else if (!['cm', 'inches'].includes(units.dimensionUnit)) {
    errors.push(`Invalid dimension unit: ${units.dimensionUnit}`);
  }

  if (!units.gaugeUnit) {
    errors.push('Missing gauge unit');
  } else if (!['cm', 'inches'].includes(units.gaugeUnit)) {
    errors.push(`Invalid gauge unit: ${units.gaugeUnit}`);
  }

  return { errors, warnings };
}

/**
 * Validates gauge data
 */
function validateGauge(gauge: CalculationGaugeData): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!gauge.stitchesPer10cm || gauge.stitchesPer10cm <= 0) {
    errors.push('Invalid stitches per 10cm: must be positive number');
  } else if (gauge.stitchesPer10cm < 5 || gauge.stitchesPer10cm > 100) {
    warnings.push(`Unusual stitch count: ${gauge.stitchesPer10cm} stitches per 10cm`);
  }

  if (!gauge.rowsPer10cm || gauge.rowsPer10cm <= 0) {
    errors.push('Invalid rows per 10cm: must be positive number');
  } else if (gauge.rowsPer10cm < 5 || gauge.rowsPer10cm > 150) {
    warnings.push(`Unusual row count: ${gauge.rowsPer10cm} rows per 10cm`);
  }

  if (!gauge.unit) {
    errors.push('Missing gauge unit');
  }

  return { errors, warnings };
}

/**
 * Validates yarn profile
 */
function validateYarn(yarn: any): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!yarn.name || yarn.name.trim().length === 0) {
    errors.push('Missing yarn name');
  }

  if (!yarn.weightCategory || yarn.weightCategory.trim().length === 0) {
    errors.push('Missing yarn weight category');
  } else {
    const validWeights = ['Lace', 'Light Fingering', 'Fingering', 'Sport', 'DK', 'Worsted', 'Aran', 'Chunky', 'Super Chunky'];
    if (!validWeights.includes(yarn.weightCategory)) {
      warnings.push(`Unusual yarn weight category: ${yarn.weightCategory}`);
    }
  }

  return { errors, warnings };
}

/**
 * Validates stitch pattern
 */
function validateStitchPattern(pattern: any): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pattern.name || pattern.name.trim().length === 0) {
    errors.push('Missing stitch pattern name');
  }

  if (!pattern.horizontalRepeat || pattern.horizontalRepeat <= 0) {
    errors.push('Invalid horizontal repeat: must be positive number');
  } else if (pattern.horizontalRepeat > 50) {
    warnings.push(`Large horizontal repeat: ${pattern.horizontalRepeat} stitches`);
  }

  if (!pattern.verticalRepeat || pattern.verticalRepeat <= 0) {
    errors.push('Invalid vertical repeat: must be positive number');
  } else if (pattern.verticalRepeat > 100) {
    warnings.push(`Large vertical repeat: ${pattern.verticalRepeat} rows`);
  }

  return { errors, warnings };
}

/**
 * Validates garment definition
 */
function validateGarment(garment: any): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!garment.typeKey || garment.typeKey.trim().length === 0) {
    errors.push('Missing garment type key');
  }

  if (!garment.displayName || garment.displayName.trim().length === 0) {
    errors.push('Missing garment display name');
  }

  if (!garment.constructionMethod || garment.constructionMethod.trim().length === 0) {
    errors.push('Missing construction method');
  }

  if (!garment.bodyShape || garment.bodyShape.trim().length === 0) {
    errors.push('Missing body shape');
  }

  // Validate measurements
  if (!garment.measurements) {
    errors.push('Missing garment measurements');
  } else {
    const measurementValidation = validateMeasurements(garment.measurements);
    errors.push(...measurementValidation.errors);
    warnings.push(...measurementValidation.warnings);
  }

  // Validate components
  if (!garment.components || !Array.isArray(garment.components)) {
    errors.push('Missing or invalid garment components');
  } else if (garment.components.length === 0) {
    warnings.push('No garment components defined');
  } else {
    garment.components.forEach((component: any, index: number) => {
      const componentValidation = validateComponent(component, index);
      errors.push(...componentValidation.errors);
      warnings.push(...componentValidation.warnings);
    });
  }

  return { errors, warnings };
}

/**
 * Validates garment measurements
 */
function validateMeasurements(measurements: CalculationMeasurements): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!measurements.finishedChestCircumference || measurements.finishedChestCircumference <= 0) {
    errors.push('Invalid finished chest circumference: must be positive number');
  } else if (measurements.finishedChestCircumference < 50 || measurements.finishedChestCircumference > 200) {
    warnings.push(`Unusual chest circumference: ${measurements.finishedChestCircumference}cm`);
  }

  if (!measurements.finishedLength || measurements.finishedLength <= 0) {
    errors.push('Invalid finished length: must be positive number');
  } else if (measurements.finishedLength < 30 || measurements.finishedLength > 120) {
    warnings.push(`Unusual garment length: ${measurements.finishedLength}cm`);
  }

  return { errors, warnings };
}

/**
 * Validates a garment component
 */
function validateComponent(component: CalculationComponentDefinition, index: number): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!component.componentKey || component.componentKey.trim().length === 0) {
    errors.push(`Component ${index}: Missing component key`);
  }

  if (!component.displayName || component.displayName.trim().length === 0) {
    errors.push(`Component ${index}: Missing display name`);
  }

  if (!component.attributes) {
    warnings.push(`Component ${index}: No attributes defined`);
  }

  return { errors, warnings };
}

/**
 * Validates version format (semantic versioning)
 */
function isValidVersion(version: string): boolean {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
}

/**
 * Validates UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates ISO 8601 timestamp format
 */
function isValidISO8601(timestamp: string): boolean {
  const date = new Date(timestamp);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === timestamp;
} 