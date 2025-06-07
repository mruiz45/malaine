/**
 * Engine Input Validator (PD_PH6_US002)
 * Validates input data for the core pattern calculation engine
 */

import {
  CoreCalculationInput,
  ValidationResult
} from '@/types/core-pattern-calculation';

/**
 * Validates input data for the pattern calculation engine
 */
export class EngineInputValidator {

  /**
   * Validate core calculation input
   */
  validateInput(input: CoreCalculationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    // Validate pattern state
    if (!input.patternState) {
      errors.push('Pattern state is required');
      return { isValid: false, errors, warnings, missingData };
    }

    // Validate session ID
    if (!input.patternState.sessionId) {
      errors.push('Session ID is required');
    }

    // Validate garment type
    if (!input.patternState.garmentType) {
      errors.push('Garment type must be selected');
    }

    // Validate craft type
    if (!input.patternState.craftType) {
      errors.push('Craft type is required');
    } else if (!['knitting', 'crochet'].includes(input.patternState.craftType)) {
      errors.push('Craft type must be either knitting or crochet');
    }

    // Validate gauge information
    const gaugeValidation = this.validateGauge(input.patternState.gauge);
    errors.push(...gaugeValidation.errors);
    warnings.push(...gaugeValidation.warnings);
    missingData.push(...gaugeValidation.missingData);

    // Validate measurements
    const measurementValidation = this.validateMeasurements(input.patternState.measurements);
    errors.push(...measurementValidation.errors);
    warnings.push(...measurementValidation.warnings);
    missingData.push(...measurementValidation.missingData);

    // Validate ease (warnings only)
    const easeValidation = this.validateEase(input.patternState.ease);
    warnings.push(...easeValidation.warnings);

    // Validate yarn information (warnings only)
    const yarnValidation = this.validateYarn(input.patternState.yarn);
    warnings.push(...yarnValidation.warnings);

    // Validate garment-specific requirements
    const garmentValidation = this.validateGarmentSpecific(input.patternState);
    errors.push(...garmentValidation.errors);
    warnings.push(...garmentValidation.warnings);
    missingData.push(...garmentValidation.missingData);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Validate gauge information
   */
  private validateGauge(gauge: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    if (!gauge) {
      errors.push('Gauge information is required');
      return { isValid: false, errors, warnings, missingData };
    }

    if (!gauge.stitchCount || gauge.stitchCount <= 0) {
      errors.push('Valid stitch count is required for gauge');
    }

    if (!gauge.rowCount || gauge.rowCount <= 0) {
      errors.push('Valid row count is required for gauge');
    }

    if (!gauge.unit) {
      errors.push('Gauge unit is required');
    } else if (!['cm', 'inch'].includes(gauge.unit)) {
      errors.push('Gauge unit must be cm or inch');
    }

    if (!gauge.isCompleted) {
      warnings.push('Gauge section is not marked as completed');
    }

    // Validate reasonable gauge values
    if (gauge.stitchCount && (gauge.stitchCount < 5 || gauge.stitchCount > 50)) {
      warnings.push('Gauge stitch count seems unusual - please verify');
    }

    if (gauge.rowCount && (gauge.rowCount < 5 || gauge.rowCount > 80)) {
      warnings.push('Gauge row count seems unusual - please verify');
    }

    return { isValid: errors.length === 0, errors, warnings, missingData };
  }

  /**
   * Validate measurements
   */
  private validateMeasurements(measurements: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    if (!measurements) {
      errors.push('Measurements are required');
      return { isValid: false, errors, warnings, missingData };
    }

    if (!measurements.measurements || Object.keys(measurements.measurements).length === 0) {
      errors.push('At least one measurement is required');
      return { isValid: false, errors, warnings, missingData };
    }

    if (!measurements.unit) {
      errors.push('Measurement unit is required');
    } else if (!['cm', 'inch'].includes(measurements.unit)) {
      errors.push('Measurement unit must be cm or inch');
    }

    if (!measurements.isCompleted) {
      warnings.push('Measurements section is not marked as completed');
    }

    // Validate specific measurements based on values
    const measurementValues = measurements.measurements;
    for (const [key, value] of Object.entries(measurementValues)) {
      if (typeof value === 'number') {
        if (value <= 0) {
          errors.push(`Invalid measurement value for ${key}: must be positive`);
        } else if (value > 300) { // 300cm seems like a reasonable upper limit
          warnings.push(`Measurement value for ${key} seems very large: ${value}${measurements.unit}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, missingData };
  }

  /**
   * Validate ease information
   */
  private validateEase(ease: any): ValidationResult {
    const warnings: string[] = [];

    if (!ease) {
      warnings.push('No ease information provided - using default ease values');
      return { isValid: true, errors: [], warnings, missingData: [] };
    }

    if (!ease.isCompleted) {
      warnings.push('Ease section is not marked as completed');
    }

    if (!ease.type) {
      warnings.push('No ease type specified - using default');
    }

    // Check for extreme ease values
    if (ease.values) {
      for (const [key, value] of Object.entries(ease.values)) {
        if (typeof value === 'number') {
          if (Math.abs(value) > 20) { // More than 20cm ease seems extreme
            warnings.push(`Ease value for ${key} seems extreme: ${value}cm`);
          }
        }
      }
    }

    return { isValid: true, errors: [], warnings, missingData: [] };
  }

  /**
   * Validate yarn information
   */
  private validateYarn(yarn: any): ValidationResult {
    const warnings: string[] = [];

    if (!yarn) {
      warnings.push('No yarn information provided - yarn estimates may be inaccurate');
      return { isValid: true, errors: [], warnings, missingData: [] };
    }

    if (!yarn.isCompleted) {
      warnings.push('Yarn section is not marked as completed');
    }

    if (!yarn.properties?.weight) {
      warnings.push('No yarn weight specified - estimates may be less accurate');
    }

    return { isValid: true, errors: [], warnings, missingData: [] };
  }

  /**
   * Validate garment-specific requirements
   */
  private validateGarmentSpecific(patternState: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    const garmentType = patternState.garmentType?.toLowerCase();

    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
        return this.validateSweaterRequirements(patternState);
      
      case 'hat':
      case 'beanie':
        return this.validateHatRequirements(patternState);
      
      case 'scarf':
        return this.validateScarfRequirements(patternState);
      
      case 'shawl':
        return this.validateShawlRequirements(patternState);
      
      default:
        warnings.push(`Unknown garment type: ${garmentType}`);
        break;
    }

    return { isValid: errors.length === 0, errors, warnings, missingData };
  }

  /**
   * Validate sweater/cardigan specific requirements
   */
  private validateSweaterRequirements(patternState: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    // Check for required measurements
    const requiredMeasurements = ['bust', 'length'];
    if (patternState.measurements?.measurements) {
      requiredMeasurements.forEach(measurement => {
        if (!patternState.measurements.measurements[measurement]) {
          missingData.push(`${measurement} measurement`);
        }
      });
    }

    // Check for body structure
    if (!patternState.bodyStructure) {
      warnings.push('No body structure specified - using default construction');
    }

    // Check for sleeve information
    if (!patternState.sleeves) {
      warnings.push('No sleeve information specified - using default sleeves');
    }

    // Check for neckline information
    if (!patternState.neckline) {
      warnings.push('No neckline information specified - using default round neck');
    }

    return { isValid: errors.length === 0, errors, warnings, missingData };
  }

  /**
   * Validate hat/beanie specific requirements
   */
  private validateHatRequirements(patternState: any): ValidationResult {
    const warnings: string[] = [];
    const missingData: string[] = [];

    // Check for head circumference
    if (patternState.measurements?.measurements && !patternState.measurements.measurements.headCircumference) {
      missingData.push('headCircumference measurement');
    }

    return { isValid: true, errors: [], warnings, missingData };
  }

  /**
   * Validate scarf specific requirements
   */
  private validateScarfRequirements(patternState: any): ValidationResult {
    const warnings: string[] = [];

    // Scarves are simple - just warn if no dimensions specified
    if (patternState.measurements?.measurements) {
      if (!patternState.measurements.measurements.scarfLength) {
        warnings.push('No scarf length specified - using default length');
      }
      if (!patternState.measurements.measurements.scarfWidth) {
        warnings.push('No scarf width specified - using default width');
      }
    }

    return { isValid: true, errors: [], warnings, missingData: [] };
  }

  /**
   * Validate shawl specific requirements
   */
  private validateShawlRequirements(patternState: any): ValidationResult {
    const warnings: string[] = [];

    // Similar to scarves
    if (patternState.measurements?.measurements) {
      if (!patternState.measurements.measurements.shawlWidth) {
        warnings.push('No shawl width specified - using default width');
      }
      if (!patternState.measurements.measurements.shawlLength) {
        warnings.push('No shawl length specified - using default length');
      }
    }

    return { isValid: true, errors: [], warnings, missingData: [] };
  }
} 