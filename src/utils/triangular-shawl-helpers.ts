/**
 * Triangular Shawl Helper Functions (US_12.5)
 * Utility functions for extracting parameters and validating triangular shawl components
 */

import {
  TriangularShawlCalculationInput,
  TriangularShawlAttributes,
  TriangularShawlConstructionMethod
} from '@/types/triangular-shawl';
import {
  CalculationComponentDefinition,
  CalculationGaugeData,
  PatternCalculationInput
} from '@/types/pattern-calculation';

/**
 * Determines if a component requires triangular shawl calculations
 * @param component - Component definition to check
 * @returns True if component needs triangular shawl calculations
 */
export function componentRequiresTriangularShawlCalculation(component: CalculationComponentDefinition): boolean {
  // Check if component has triangular shawl attributes
  if (component.attributes && typeof component.attributes === 'object') {
    const attributes = component.attributes as any;
    return attributes.type === 'triangular_shawl' || 
           attributes.construction_method !== undefined ||
           (attributes.target_wingspan_cm !== undefined && attributes.target_depth_cm !== undefined);
  }
  
  return false;
}

/**
 * Extracts triangular shawl calculation input from component and global input
 * @param component - Component definition with triangular shawl attributes
 * @param input - Global pattern calculation input for gauge data
 * @returns Triangular shawl calculation input
 */
export function extractTriangularShawlInputFromComponent(
  component: CalculationComponentDefinition,
  input: PatternCalculationInput
): TriangularShawlCalculationInput {
  const attributes = component.attributes as TriangularShawlAttributes;
  
  if (!attributes || attributes.type !== 'triangular_shawl') {
    throw new Error('Component does not contain valid triangular shawl attributes');
  }

  // Validate required attributes
  if (!attributes.target_wingspan_cm || attributes.target_wingspan_cm <= 0) {
    throw new Error('Valid target_wingspan_cm is required for triangular shawl calculation');
  }

  if (!attributes.target_depth_cm || attributes.target_depth_cm <= 0) {
    throw new Error('Valid target_depth_cm is required for triangular shawl calculation');
  }

  if (!attributes.construction_method) {
    throw new Error('Construction method is required for triangular shawl calculation');
  }

  return {
    target_wingspan_cm: attributes.target_wingspan_cm,
    target_depth_cm: attributes.target_depth_cm,
    gauge_stitches_per_10cm: input.gauge.stitchesPer10cm,
    gauge_rows_per_10cm: input.gauge.rowsPer10cm,
    construction_method: attributes.construction_method,
    border_stitches_each_side: attributes.border_stitches_each_side || 0,
    work_style: attributes.work_style || 'flat'
  };
}

/**
 * Validates triangular shawl attributes within a component
 * @param component - Component to validate
 * @returns Array of validation error messages
 */
export function validateTriangularShawlComponent(component: CalculationComponentDefinition): string[] {
  const errors: string[] = [];

  if (!component.attributes) {
    errors.push('Component attributes are required for triangular shawl');
    return errors;
  }

  const attributes = component.attributes as any;

  if (attributes.type !== 'triangular_shawl') {
    errors.push('Component type must be "triangular_shawl"');
  }

  if (!attributes.target_wingspan_cm || typeof attributes.target_wingspan_cm !== 'number' || attributes.target_wingspan_cm <= 0) {
    errors.push('target_wingspan_cm must be a positive number');
  }

  if (!attributes.target_depth_cm || typeof attributes.target_depth_cm !== 'number' || attributes.target_depth_cm <= 0) {
    errors.push('target_depth_cm must be a positive number');
  }

  if (!attributes.construction_method) {
    errors.push('construction_method is required');
  } else {
    const validMethods: TriangularShawlConstructionMethod[] = ['top_down_center_out', 'side_to_side', 'bottom_up'];
    if (!validMethods.includes(attributes.construction_method)) {
      errors.push(`construction_method must be one of: ${validMethods.join(', ')}`);
    }
  }

  if (!attributes.work_style) {
    errors.push('work_style is required');
  } else if (!['flat', 'in_the_round'].includes(attributes.work_style)) {
    errors.push('work_style must be either "flat" or "in_the_round"');
  }

  if (attributes.border_stitches_each_side !== undefined) {
    if (typeof attributes.border_stitches_each_side !== 'number' || attributes.border_stitches_each_side < 0) {
      errors.push('border_stitches_each_side must be a non-negative number');
    }
  }

  return errors;
}

/**
 * Creates a default triangular shawl component definition
 * @param wingspan - Target wingspan in cm
 * @param depth - Target depth in cm  
 * @param method - Construction method
 * @returns Component definition with default triangular shawl attributes
 */
export function createDefaultTriangularShawlComponent(
  wingspan: number,
  depth: number,
  method: TriangularShawlConstructionMethod = 'top_down_center_out'
): CalculationComponentDefinition {
  const attributes: TriangularShawlAttributes = {
    type: 'triangular_shawl',
    target_wingspan_cm: wingspan,
    target_depth_cm: depth,
    construction_method: method,
    work_style: 'flat',
    border_stitches_each_side: 0
  };

  return {
    componentKey: 'triangular_shawl_body',
    displayName: 'Triangular Shawl',
    attributes
  };
}

/**
 * Estimates triangular shawl complexity for calculation planning
 * @param attributes - Triangular shawl attributes
 * @returns Complexity estimation
 */
export function estimateTriangularShawlComplexity(attributes: TriangularShawlAttributes): {
  complexity: 'low' | 'medium' | 'high';
  estimatedStitches: number;
  factors: string[];
} {
  const factors: string[] = [];

  // Estimate based on dimensions
  const area = attributes.target_wingspan_cm * attributes.target_depth_cm / 2; // Triangle area approximation
  let estimatedStitches = Math.round(area * 0.5); // Rough estimate

  if (area > 10000) { // Large shawl (>200cm wingspan x 100cm depth equivalent)
    factors.push('Large dimensions');
    estimatedStitches *= 1.2;
  } else if (area > 5000) {
    factors.push('Medium dimensions');
  } else {
    factors.push('Small to medium dimensions');
  }

  // Factor in construction method complexity
  switch (attributes.construction_method) {
    case 'top_down_center_out':
      factors.push('Top-down center-out construction (standard complexity)');
      break;
    case 'side_to_side':
      factors.push('Side-to-side construction (moderate complexity)');
      estimatedStitches *= 1.1;
      break;
    case 'bottom_up':
      factors.push('Bottom-up construction (high initial stitch count)');
      estimatedStitches *= 1.3;
      break;
  }

  // Factor in border stitches
  if (attributes.border_stitches_each_side && attributes.border_stitches_each_side > 0) {
    factors.push(`Border stitches: ${attributes.border_stitches_each_side} each side`);
    estimatedStitches += attributes.border_stitches_each_side * 4; // Rough border addition
  }

  // Determine complexity level based on area and construction method
  let complexity: 'low' | 'medium' | 'high' = 'low';
  
  if (area > 10000 || (area > 5000 && attributes.construction_method === 'bottom_up')) {
    complexity = 'high';
  } else if (area > 2000 || attributes.construction_method === 'side_to_side') {
    complexity = 'medium';
  }

  return {
    complexity,
    estimatedStitches: Math.round(estimatedStitches),
    factors
  };
} 