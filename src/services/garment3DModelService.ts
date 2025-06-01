/**
 * Garment 3D Model Service (US_12.10)
 * Converts 2D garment measurements to 3D wireframe parameters
 */

import type { FinishedMeasurements } from '@/types/assembled-pattern';
import type {
  GarmentWireframe3D,
  GarmentComponent3D,
  CylinderParams,
  MeasurementsTo3DResult
} from '@/types/garment-3d';
import { MIN_MEASUREMENTS } from '@/types/garment-3d';

/**
 * Parses a measurement string to extract numeric value in cm
 * Handles formats like "96 cm", "38 in", "96cm", etc.
 */
function parseMeasurementToCm(measurement: string | undefined): number | null {
  if (!measurement) return null;
  
  // Remove whitespace and convert to lowercase
  const clean = measurement.toLowerCase().replace(/\s+/g, '');
  
  // Extract number and unit
  const match = clean.match(/^(\d+(?:\.\d+)?)(cm|in|inch|inches)?$/);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'cm'; // Default to cm
  
  // Convert inches to cm if needed
  if (unit === 'in' || unit === 'inch' || unit === 'inches') {
    return value * 2.54;
  }
  
  return value;
}

/**
 * Validates that measurements meet minimum requirements for 3D conversion
 */
function validateMeasurements(measurements: FinishedMeasurements): string[] {
  const errors: string[] = [];
  
  const chest = parseMeasurementToCm(measurements.chest);
  const length = parseMeasurementToCm(measurements.length);
  const armLength = parseMeasurementToCm(measurements.arm_length);
  const upperArm = parseMeasurementToCm(measurements.upper_arm);
  
  if (!chest || chest < MIN_MEASUREMENTS.chest) {
    errors.push(`Chest measurement must be at least ${MIN_MEASUREMENTS.chest}cm`);
  }
  
  if (!length || length < MIN_MEASUREMENTS.length) {
    errors.push(`Length measurement must be at least ${MIN_MEASUREMENTS.length}cm`);
  }
  
  if (!armLength || armLength < MIN_MEASUREMENTS.arm_length) {
    errors.push(`Arm length measurement must be at least ${MIN_MEASUREMENTS.arm_length}cm`);
  }
  
  if (!upperArm || upperArm < MIN_MEASUREMENTS.upper_arm) {
    errors.push(`Upper arm measurement must be at least ${MIN_MEASUREMENTS.upper_arm}cm`);
  }
  
  return errors;
}

/**
 * Creates cylinder parameters for the garment body
 */
function createBodyCylinder(
  chestCircumference: number,
  bodyLength: number,
  waistCircumference?: number
): CylinderParams {
  // Calculate radius from circumference (C = 2πr)
  const chestRadius = chestCircumference / (2 * Math.PI);
  const waistRadius = waistCircumference ? waistCircumference / (2 * Math.PI) : chestRadius;
  
  return {
    radiusTop: chestRadius,
    radiusBottom: waistRadius,
    height: bodyLength,
    radialSegments: 12, // 12 segments for smooth wireframe
    transform: {
      position: { x: 0, y: 0, z: 0 }, // Center the body
      rotation: { x: 0, y: 0, z: 0 }
    }
  };
}

/**
 * Creates cylinder parameters for a sleeve
 */
function createSleeveCylinder(
  upperArmCircumference: number,
  armLength: number,
  side: 'left' | 'right',
  shoulderWidth: number = 0
): CylinderParams {
  const armRadius = upperArmCircumference / (2 * Math.PI);
  
  // Position sleeve at shoulder level
  // If shoulder width is unknown, estimate based on chest measurement
  const shoulderOffset = shoulderWidth > 0 ? shoulderWidth / 2 : upperArmCircumference * 0.8;
  const xOffset = side === 'left' ? -shoulderOffset : shoulderOffset;
  
  return {
    radiusTop: armRadius,
    radiusBottom: armRadius * 0.8, // Slight taper towards wrist
    height: armLength,
    radialSegments: 8, // Fewer segments for sleeves
    transform: {
      position: { 
        x: xOffset, 
        y: armLength / 2, // Position so sleeve extends down from shoulder
        z: 0 
      },
      rotation: { x: 0, y: 0, z: Math.PI / 2 } // Rotate to horizontal
    }
  };
}

/**
 * Creates cylinder parameters for neckline (optional)
 */
function createNeckCylinder(neckCircumference: number): CylinderParams {
  const neckRadius = neckCircumference / (2 * Math.PI);
  
  return {
    radiusTop: neckRadius,
    radiusBottom: neckRadius,
    height: 5, // Small height for neck opening
    radialSegments: 8,
    transform: {
      position: { x: 0, y: 2.5, z: 0 }, // Position at top of body
      rotation: { x: 0, y: 0, z: 0 }
    }
  };
}

/**
 * Converts finished measurements to 3D wireframe model
 */
export function convertMeasurementsTo3D(
  measurements: FinishedMeasurements,
  garmentType: string = 'sweater'
): MeasurementsTo3DResult {
  const warnings: string[] = [];
  
  // Validate measurements
  const validationErrors = validateMeasurements(measurements);
  if (validationErrors.length > 0) {
    return {
      success: false,
      error: `Invalid measurements: ${validationErrors.join(', ')}`,
      warnings: []
    };
  }
  
  try {
    // Parse required measurements
    const chest = parseMeasurementToCm(measurements.chest)!;
    const length = parseMeasurementToCm(measurements.length)!;
    const armLength = parseMeasurementToCm(measurements.arm_length)!;
    const upperArm = parseMeasurementToCm(measurements.upper_arm)!;
    
    // Parse optional measurements
    const waist = parseMeasurementToCm(measurements.waist);
    const shoulderWidth = parseMeasurementToCm(measurements.shoulder_width);
    const neck = parseMeasurementToCm(measurements.neck);
    
    const components: GarmentComponent3D[] = [];
    
    // Create body component (FR1, FR2)
    const bodyGeometry = createBodyCylinder(chest, length, waist || undefined);
    components.push({
      id: 'body',
      name: 'Body',
      type: 'body',
      geometry: bodyGeometry,
      visible: true
    });
    
    // Create sleeve components (FR2)
    if (garmentType !== 'vest') {
      const leftSleeveGeometry = createSleeveCylinder(
        upperArm, 
        armLength, 
        'left', 
        shoulderWidth || 0
      );
      const rightSleeveGeometry = createSleeveCylinder(
        upperArm, 
        armLength, 
        'right', 
        shoulderWidth || 0
      );
      
      components.push({
        id: 'sleeve-left',
        name: 'Left Sleeve',
        type: 'sleeve',
        geometry: leftSleeveGeometry,
        visible: true
      });
      
      components.push({
        id: 'sleeve-right',
        name: 'Right Sleeve',
        type: 'sleeve',
        geometry: rightSleeveGeometry,
        visible: true
      });
    }
    
    // Create neck component if measurement available
    if (neck && neck > 0) {
      const neckGeometry = createNeckCylinder(neck);
      components.push({
        id: 'neck',
        name: 'Neckline',
        type: 'neck',
        geometry: neckGeometry,
        visible: true
      });
    }
    
    // Calculate scene bounds for camera positioning
    const maxRadius = Math.max(chest / (2 * Math.PI), upperArm / (2 * Math.PI));
    const maxWidth = shoulderWidth || chest * 0.6;
    const sceneBounds = {
      width: maxWidth + (upperArm / Math.PI), // Account for sleeve width
      height: Math.max(length, armLength),
      depth: maxRadius * 2
    };
    
    // Add warnings for approximations (FR5)
    if (!shoulderWidth) {
      warnings.push('Shoulder width not provided - estimated from other measurements');
    }
    if (!waist) {
      warnings.push('Waist measurement not provided - using chest measurement');
    }
    if (!neck) {
      warnings.push('Neck measurement not provided - neckline not displayed');
    }
    
    const model: GarmentWireframe3D = {
      components,
      sceneBounds,
      sourceMeasurements: measurements,
      metadata: {
        generatedAt: new Date().toISOString(),
        algorithmVersion: '1.0.0',
        warnings
      }
    };
    
    return {
      success: true,
      model,
      warnings
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to convert measurements to 3D: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings
    };
  }
}

/**
 * Estimates measurements from component calculations when finished measurements are incomplete
 */
export function estimateMeasurementsFromCalculations(
  finishedMeasurements: FinishedMeasurements,
  componentCalculations?: Array<{ target_width_cm?: number; target_length_cm?: number; actual_width_cm?: number; actual_length_cm?: number }>
): FinishedMeasurements {
  const estimated = { ...finishedMeasurements };
  
  if (!componentCalculations || componentCalculations.length === 0) {
    return estimated;
  }
  
  // Try to estimate missing measurements from calculations
  const bodyComponent = componentCalculations.find(calc => 
    calc.target_width_cm && calc.target_length_cm
  );
  
  if (bodyComponent) {
    if (!estimated.chest && bodyComponent.target_width_cm) {
      // Convert width to circumference (assuming width is half circumference)
      estimated.chest = `${bodyComponent.target_width_cm * 2} cm`;
    }
    
    if (!estimated.length && bodyComponent.target_length_cm) {
      estimated.length = `${bodyComponent.target_length_cm} cm`;
    }
  }
  
  return estimated;
}

/**
 * Gets appropriate garment type from craft type and components
 */
export function inferGarmentType(
  craftType: 'knitting' | 'crochet',
  componentNames: string[]
): 'sweater' | 'cardigan' | 'vest' | 'pullover' {
  const names = componentNames.map(name => name.toLowerCase());
  
  if (names.some(name => name.includes('cardigan') || name.includes('front') && name.includes('button'))) {
    return 'cardigan';
  }
  
  if (names.some(name => name.includes('vest')) || !names.some(name => name.includes('sleeve'))) {
    return 'vest';
  }
  
  // Default to sweater/pullover
  return 'sweater';
} 