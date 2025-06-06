/**
 * Hook for calculating finished dimensions with ease applied
 * Implements PD_PH4_US001: Basic Interdependency - Ease Affecting Finished Dimensions
 */

import { useMemo } from 'react';
import { MeasurementsData, EaseData, GarmentType } from '@/types/pattern';

/**
 * Finished dimensions interface
 * Represents final garment dimensions after applying ease to body measurements
 */
export interface FinishedDimensions {
  // Common finished dimensions
  finishedLength?: number;
  finishedWidth?: number;
  
  // Sweater/Cardigan/Vest specific finished dimensions
  finishedChestCircumference?: number;
  finishedBodyLength?: number;
  finishedSleeveLength?: number;
  finishedShoulderWidth?: number;
  finishedArmholeDepth?: number;
  
  // Hat specific finished dimensions
  finishedHeadCircumference?: number;
  finishedHatHeight?: number;
  
  // Scarf specific finished dimensions
  finishedScarfLength?: number;
  finishedScarfWidth?: number;
}

/**
 * Hook to calculate finished dimensions by applying ease to body measurements
 * 
 * @param measurements - Raw body measurements
 * @param ease - Ease values to apply
 * @param garmentType - Type of garment being designed
 * @returns Calculated finished dimensions
 */
export const useFinishedDimensions = (
  measurements: MeasurementsData,
  ease: EaseData,
  garmentType: GarmentType | null
): FinishedDimensions => {
  
  const finishedDimensions = useMemo(() => {
    const result: FinishedDimensions = {};
    
    // Early return if no garment type selected
    if (!garmentType) {
      return result;
    }
    
    // Helper function to apply ease to a measurement
    const applyEase = (baseMeasurement: number | null, easeValue: number | null): number | undefined => {
      if (baseMeasurement === null || baseMeasurement === undefined) {
        return undefined;
      }
      
      // If no ease is specified, return the base measurement
      if (easeValue === null || easeValue === undefined) {
        return baseMeasurement;
      }
      
      // Apply ease (can be positive or negative)
      return baseMeasurement + easeValue;
    };
    
    // Calculate finished dimensions based on garment type
    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
      case 'vest': {
        // Apply ease to chest circumference
        result.finishedChestCircumference = applyEase(
          measurements.chestCircumference,
          ease.chestEase
        );
        
        // Apply ease to body length
        result.finishedBodyLength = applyEase(
          measurements.bodyLength,
          ease.lengthEase
        );
        
        // Apply ease to sleeve length (not applicable for vest)
        if (garmentType !== 'vest') {
          result.finishedSleeveLength = applyEase(
            measurements.sleeveLength,
            ease.sleeveEase
          );
        }
        
        // For measurements without specific ease, use raw measurements
        result.finishedShoulderWidth = measurements.shoulderWidth || undefined;
        result.finishedArmholeDepth = measurements.armholeDepth || undefined;
        
        // Common measurements (if applicable)
        result.finishedLength = result.finishedBodyLength;
        result.finishedWidth = result.finishedChestCircumference;
        
        break;
      }
      
      case 'scarf': {
        // For scarves, ease is typically not applicable, but we support it
        result.finishedScarfLength = applyEase(
          measurements.scarfLength,
          ease.lengthEase
        );
        
        result.finishedScarfWidth = applyEase(
          measurements.scarfWidth,
          ease.chestEase // Using chestEase as width ease for scarves
        );
        
        // Common measurements
        result.finishedLength = result.finishedScarfLength;
        result.finishedWidth = result.finishedScarfWidth;
        
        break;
      }
      
      case 'hat': {
        // For hats, ease is typically minimal but can be applied
        result.finishedHeadCircumference = applyEase(
          measurements.headCircumference,
          ease.chestEase // Using chestEase as circumference ease for hats
        );
        
        result.finishedHatHeight = applyEase(
          measurements.hatHeight,
          ease.lengthEase
        );
        
        // Common measurements
        result.finishedLength = result.finishedHatHeight;
        result.finishedWidth = result.finishedHeadCircumference;
        
        break;
      }
      
      default:
        // For unknown garment types, return empty result
        break;
    }
    
    return result;
  }, [measurements, ease, garmentType]);
  
  return finishedDimensions;
};

/**
 * Helper hook to determine if ease is applicable for a given garment type
 * 
 * @param garmentType - Type of garment being designed
 * @returns Object indicating which ease types are applicable
 */
export const useEaseApplicability = (garmentType: GarmentType | null) => {
  return useMemo(() => {
    if (!garmentType) {
      return {
        chestEaseApplicable: false,
        lengthEaseApplicable: false,
        sleeveEaseApplicable: false
      };
    }
    
    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
        return {
          chestEaseApplicable: true,
          lengthEaseApplicable: true,
          sleeveEaseApplicable: true
        };
        
      case 'vest':
        return {
          chestEaseApplicable: true,
          lengthEaseApplicable: true,
          sleeveEaseApplicable: false // Vests don't have sleeves
        };
        
      case 'scarf':
        return {
          chestEaseApplicable: true, // Width ease
          lengthEaseApplicable: true, // Length ease
          sleeveEaseApplicable: false
        };
        
      case 'hat':
        return {
          chestEaseApplicable: true, // Circumference ease
          lengthEaseApplicable: true, // Height ease
          sleeveEaseApplicable: false
        };
        
      default:
        return {
          chestEaseApplicable: false,
          lengthEaseApplicable: false,
          sleeveEaseApplicable: false
        };
    }
  }, [garmentType]);
}; 