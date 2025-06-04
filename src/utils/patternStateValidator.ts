import { PatternState, GarmentType } from '@/types/pattern';

/**
 * Pattern State Validator
 * Utilities to validate pattern state against acceptance criteria
 */

/**
 * Validates that pattern state structure is correct
 */
export const validatePatternStructure = (state: PatternState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check version
  if (!state.version || typeof state.version !== 'string') {
    errors.push('Pattern state must have a valid version string');
  }

  // Check metadata structure
  if (!state.metadata) {
    errors.push('Pattern state must have metadata object');
  } else {
    if (typeof state.metadata.designName !== 'string') {
      errors.push('Metadata must have a designName string');
    }
  }

  // Check UI settings
  if (!state.uiSettings) {
    errors.push('Pattern state must have uiSettings object');
  } else {
    if (!state.uiSettings.currentSection) {
      errors.push('UI settings must have a currentSection');
    }
  }

  // Check that all required sections exist
  const requiredSections = ['gauge', 'measurements', 'ease', 'bodyStructure', 'neckline', 'sleeves', 'finishing'];
  requiredSections.forEach(section => {
    if (!state[section as keyof PatternState]) {
      errors.push(`Pattern state must have ${section} section`);
    } else {
      const sectionData = state[section as keyof PatternState];
      if (typeof sectionData === 'object' && sectionData !== null && !('isSet' in sectionData)) {
        errors.push(`Section ${section} must have isSet property`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates data persistence across navigation
 */
export const validateDataPersistence = (
  beforeState: PatternState,
  afterState: PatternState,
  sectionName: string
): { isPersistent: boolean; differences: string[] } => {
  const differences: string[] = [];
  
  const beforeSection = beforeState[sectionName as keyof PatternState];
  const afterSection = afterState[sectionName as keyof PatternState];

  if (JSON.stringify(beforeSection) !== JSON.stringify(afterSection)) {
    differences.push(`Section ${sectionName} data changed unexpectedly`);
  }

  return {
    isPersistent: differences.length === 0,
    differences
  };
};

/**
 * Validates garment type change effects
 */
export const validateGarmentTypeChange = (
  beforeState: PatternState,
  afterState: PatternState,
  newGarmentType: GarmentType
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check that garment type was updated
  if (afterState.garmentType !== newGarmentType) {
    issues.push('Garment type was not updated correctly');
  }

  // Check that measurements were appropriately reset
  const beforeMeasurements = beforeState.measurements;
  const afterMeasurements = afterState.measurements;

  if (newGarmentType === 'hat') {
    // Hat-specific validations
    if (afterMeasurements.chestCircumference !== null) {
      issues.push('Chest circumference should be reset when changing to hat');
    }
    if (afterMeasurements.bodyLength !== null) {
      issues.push('Body length should be reset when changing to hat');
    }
  } else if (newGarmentType === 'scarf') {
    // Scarf-specific validations
    if (afterMeasurements.headCircumference !== null) {
      issues.push('Head circumference should be reset when changing to scarf');
    }
    if (afterMeasurements.hatHeight !== null) {
      issues.push('Hat height should be reset when changing to scarf');
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Validates that section completion tracking works
 */
export const validateSectionCompletion = (state: PatternState): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check gauge section
  if (state.gauge.isSet) {
    const hasGaugeData = state.gauge.stitchesPer10cm !== null || 
                        state.gauge.rowsPer10cm !== null ||
                        state.gauge.needleSize !== null ||
                        state.gauge.yarnUsed !== null;
    
    if (!hasGaugeData) {
      issues.push('Gauge section marked as set but contains no data');
    }
  }

  // Check measurements section
  if (state.measurements.isSet) {
    const hasMeasurementData = Object.values(state.measurements)
      .some(value => value !== null && value !== false && value !== '');
    
    if (!hasMeasurementData) {
      issues.push('Measurements section marked as set but contains no data');
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Comprehensive pattern state validation
 */
export const validatePatternState = (state: PatternState): { 
  isValid: boolean; 
  summary: string;
  details: {
    structure: ReturnType<typeof validatePatternStructure>;
    completion: ReturnType<typeof validateSectionCompletion>;
  };
} => {
  const structure = validatePatternStructure(state);
  const completion = validateSectionCompletion(state);

  const isValid = structure.isValid && completion.isValid;
  
  const totalIssues = structure.errors.length + completion.issues.length;
  const summary = isValid 
    ? '✅ Pattern state is valid and meets all criteria'
    : `❌ Pattern state has ${totalIssues} issue(s)`;

  return {
    isValid,
    summary,
    details: {
      structure,
      completion
    }
  };
}; 