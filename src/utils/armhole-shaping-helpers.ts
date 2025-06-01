/**
 * Armhole Shaping Helper Utilities (US_11.3)
 * Support functions for armhole shaping calculations
 */

import {
  ArmholeShapingInput,
  ArmholeShapingSchedule,
  ArmholeType,
  ArmholeParameters,
  RoundedArmholeRatios
} from '@/types/armhole-shaping';
import { CalculationGaugeData } from '@/types/pattern-calculation';
import { ConstructionMethod } from '@/types/sweaterStructure';

/**
 * Extract armhole attributes from component definition
 * Used to build ArmholeShapingInput from existing pattern data
 */
export function extractArmholeShapingInput(
  componentData: any,
  gauge: CalculationGaugeData,
  componentKey: string
): ArmholeShapingInput | null {
  try {
    // Check if component has armhole attributes or construction method requiring armhole shaping
    const armholeAttributes = componentData.attributes?.armhole;
    const constructionMethod = componentData.attributes?.construction_method;
    
    // Determine armhole type from construction method if not explicitly set
    let armholeType: ArmholeType | null = null;
    
    if (armholeAttributes?.type) {
      armholeType = armholeAttributes.type;
    } else if (constructionMethod) {
      armholeType = mapConstructionMethodToArmholeType(constructionMethod);
    }
    
    if (!armholeType) {
      return null; // No armhole configuration
    }

    // Extract armhole parameters
    const armholeParameters: ArmholeParameters = extractArmholeParameters(
      componentData,
      armholeType
    );
    
    if (!armholeParameters.depth_cm || !armholeParameters.width_cm) {
      return null; // Insufficient armhole data
    }

    // Get panel width and shoulder measurements
    const totalPanelWidthStitches = componentData.stitchCount || 
                                  componentData.detailedCalculations?.castOnStitches ||
                                  0;
    
    const finishedShoulderWidthCm = componentData.attributes?.shoulderWidth || 
                                   extractShoulderWidthFromMeasurements(componentData) ||
                                   10; // Default shoulder width

    // Validate essential parameters
    if (!armholeType || !totalPanelWidthStitches || totalPanelWidthStitches <= 0) {
      return null;
    }

    return {
      armholeType,
      armholeParameters,
      totalPanelWidthStitches,
      finishedShoulderWidthCm,
      gauge,
      componentKey
    };

  } catch (error) {
    console.warn('Error extracting armhole shaping input:', error);
    return null;
  }
}

/**
 * Check if a component requires armhole shaping calculations
 * Based on component type and construction method
 */
export function componentRequiresArmholeShaping(component: any): boolean {
  if (!component) return false;
  
  const componentKey = component.componentKey?.toLowerCase() || '';
  const constructionMethod = component.attributes?.construction_method;
  
  // Body panels typically need armhole shaping for set-in sleeves and raglan
  const isBodyPanel = componentKey.includes('front') || 
                     componentKey.includes('back') || 
                     componentKey.includes('body');
  
  if (!isBodyPanel) return false;
  
  // Check construction methods that require armhole shaping
  const requiresArmholeShaping = [
    'set_in_sleeve',
    'raglan'
  ].includes(constructionMethod);
  
  return requiresArmholeShaping;
}

/**
 * Map construction method to armhole type
 */
function mapConstructionMethodToArmholeType(constructionMethod: ConstructionMethod): ArmholeType | null {
  switch (constructionMethod) {
    case 'set_in_sleeve':
      return 'rounded_set_in';
    case 'raglan':
      return 'raglan';
    case 'drop_shoulder':
    case 'dolman':
      return null; // These don't typically require complex armhole shaping
    default:
      return null;
  }
}

/**
 * Extract armhole parameters from component data
 */
function extractArmholeParameters(
  componentData: any,
  armholeType: ArmholeType
): ArmholeParameters {
  const attributes = componentData.attributes || {};
  const armholeAttrs = attributes.armhole || {};
  
  // Extract depth (required)
  const depth_cm = armholeAttrs.depth_cm || 
                  attributes.armhole_depth_cm || 
                  getDefaultArmholeDepth(armholeType);
  
  // Extract width (required)
  const width_cm = armholeAttrs.width_cm || 
                  attributes.armhole_width_cm || 
                  getDefaultArmholeWidth(armholeType);
  
  // Extract raglan-specific parameters
  let raglan_line_length_cm: number | undefined;
  if (armholeType === 'raglan') {
    raglan_line_length_cm = armholeAttrs.raglan_line_length_cm || 
                           attributes.raglan_line_length_cm || 
                           depth_cm; // Default to armhole depth
  }
  
  // Extract construction details
  const construction_details = {
    underarm_ease_cm: armholeAttrs.underarm_ease_cm || attributes.underarm_ease_cm || 2,
    base_bind_off_preference: armholeAttrs.base_bind_off_preference || 'standard'
  };
  
  return {
    depth_cm,
    width_cm,
    raglan_line_length_cm,
    construction_details
  };
}

/**
 * Extract shoulder width from measurement data
 */
function extractShoulderWidthFromMeasurements(componentData: any): number | null {
  const measurements = componentData.measurements || {};
  const attributes = componentData.attributes || {};
  
  // Try various sources for shoulder width
  return measurements.shoulder_width || 
         measurements.shoulder_width_cm || 
         attributes.shoulder_width || 
         attributes.shoulder_width_cm || 
         null;
}

/**
 * Get default armhole depth based on type
 */
function getDefaultArmholeDepth(armholeType: ArmholeType): number {
  switch (armholeType) {
    case 'rounded_set_in':
      return 22; // Standard set-in sleeve armhole depth
    case 'raglan':
      return 25; // Standard raglan depth
    default:
      return 20;
  }
}

/**
 * Get default armhole width based on type
 */
function getDefaultArmholeWidth(armholeType: ArmholeType): number {
  switch (armholeType) {
    case 'rounded_set_in':
      return 12; // Standard set-in sleeve armhole width
    case 'raglan':
      return 15; // Standard raglan armhole width
    default:
      return 12;
  }
}

/**
 * Calculate the starting row for armhole shaping within a component
 * Based on component length and armhole depth
 */
export function calculateArmholeShapingStartRow(
  totalComponentRows: number,
  armholeDepthRows: number,
  armholeParameters: ArmholeParameters
): number {
  // For most garments, armhole shaping starts after the body length
  // Leave some rows at the very top for shoulder construction if needed
  const shoulderRows = 2; // Minimal rows for shoulder finishing
  
  // Calculate start row (counting from bottom of component)
  const startRow = Math.max(1, totalComponentRows - armholeDepthRows - shoulderRows);
  
  return startRow;
}

/**
 * Adjust armhole ratios based on armhole type and depth
 * Provides type-specific ratio adjustments
 */
export function getAdjustedArmholeRatios(
  armholeType: ArmholeType,
  armholeDepthCm: number,
  armholeWidthCm: number
): RoundedArmholeRatios {
  // Base ratios for rounded armholes
  const baseRatios: RoundedArmholeRatios = {
    baseBindOffRatio: 1/4,
    rapidDecreaseRatio: 1/2,
    gradualDecreaseRatio: 1/2,
    rapidDecreaseRowInterval: 2,
    gradualDecreaseRowInterval: 4
  };

  // Only apply to rounded armholes
  if (armholeType !== 'rounded_set_in') {
    return baseRatios;
  }

  // Adjust ratios based on armhole characteristics
  
  // Deep armholes - more gradual shaping
  if (armholeDepthCm > 25) {
    baseRatios.rapidDecreaseRowInterval = 3;
    baseRatios.gradualDecreaseRowInterval = 6;
    baseRatios.rapidDecreaseRatio = 0.4; // Less rapid decreases
    baseRatios.gradualDecreaseRatio = 0.6; // More gradual decreases
  }
  
  // Shallow armholes - more aggressive shaping
  if (armholeDepthCm < 18) {
    baseRatios.rapidDecreaseRowInterval = 1; // Every row
    baseRatios.gradualDecreaseRowInterval = 2;
    baseRatios.rapidDecreaseRatio = 0.6; // More rapid decreases
    baseRatios.gradualDecreaseRatio = 0.4; // Less gradual decreases
  }
  
  // Wide armholes - larger base bind-off
  if (armholeWidthCm > 15) {
    baseRatios.baseBindOffRatio = 1/3; // Larger base bind-off
  }
  
  // Narrow armholes - smaller base bind-off
  if (armholeWidthCm < 10) {
    baseRatios.baseBindOffRatio = 1/6; // Smaller base bind-off
  }

  return baseRatios;
}

/**
 * Estimate armhole dimensions from garment measurements
 * Used when explicit armhole dimensions are not provided
 */
export function estimateArmholeDimensions(
  componentData: any,
  armholeType: ArmholeType
): { depth_cm: number; width_cm: number } {
  const measurements = componentData.measurements || {};
  const attributes = componentData.attributes || {};
  
  // Try to get chest/bust measurement for proportion calculations
  const chestCircumference = measurements.chest_circumference || 
                           measurements.bust_circumference || 
                           100; // Default 100cm chest
  
  // Calculate armhole dimensions as proportions of chest measurement
  let depth_cm: number;
  let width_cm: number;
  
  switch (armholeType) {
    case 'rounded_set_in':
      // Set-in sleeve: deeper but narrower
      depth_cm = chestCircumference * 0.22; // ~22% of chest circumference
      width_cm = chestCircumference * 0.12; // ~12% of chest circumference
      break;
      
    case 'raglan':
      // Raglan: slightly deeper and wider
      depth_cm = chestCircumference * 0.25; // ~25% of chest circumference
      width_cm = chestCircumference * 0.15; // ~15% of chest circumference
      break;
      
    default:
      depth_cm = getDefaultArmholeDepth(armholeType);
      width_cm = getDefaultArmholeWidth(armholeType);
  }
  
  return { depth_cm, width_cm };
}

/**
 * Validate armhole schedule compatibility with component dimensions
 * Ensures the calculated shaping fits within the component structure
 */
export function validateArmholeScheduleCompatibility(
  schedule: ArmholeShapingSchedule,
  componentData: any,
  gauge: CalculationGaugeData
): { isCompatible: boolean; warnings: string[] } {
  const warnings: string[] = [];
  let isCompatible = true;
  
  const totalPanelStitches = componentData.stitchCount || 
                           componentData.detailedCalculations?.castOnStitches || 
                           0;
  
  const totalPanelRows = componentData.detailedCalculations?.totalRows || 
                        Math.round(componentData.attributes?.length_cm * (gauge.rowsPer10cm / 10)) || 
                        0;
  
  // Check if armhole width is reasonable relative to panel width
  const armholeStitches = schedule.base_bind_off_stitches + 
                         schedule.shaping_details.reduce((sum, action) => {
                           return sum + (action.stitches * (action.repeats || 1));
                         }, 0);
  
  if (armholeStitches > totalPanelStitches * 0.4) {
    warnings.push('Armhole shaping removes more than 40% of panel width - may be too wide');
    isCompatible = false;
  }
  
  // Check if shaping rows fit within component height
  if (schedule.total_rows_for_shaping > totalPanelRows * 0.6) {
    warnings.push('Armhole shaping height is more than 60% of total component height');
  }
  
  return { isCompatible, warnings };
} 