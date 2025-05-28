/**
 * Pattern Calculation Input Builder Service (US_6.1)
 * Transforms pattern definition session data into calculation engine input format
 */

import {
  PatternCalculationInput,
  CalculationGaugeData,
  CalculationYarnProfile,
  CalculationStitchPattern,
  CalculationGarmentDefinition,
  CalculationComponentDefinition,
  CalculationMeasurements,
  CalculationUnits,
  TransformationResult,
  TransformationContext
} from '@/types/pattern-calculation';
import {
  PatternDefinitionSessionWithData
} from '@/types/patternDefinition';
import { applyEaseToMeasurements } from '@/utils/measurement-calculations';
import { validatePatternCalculationInput } from '@/utils/pattern-calculation-validators';

/**
 * Current schema version for calculation input
 */
const CALCULATION_SCHEMA_VERSION = '1.0.0';

/**
 * Service class for building pattern calculation input from session data
 */
export class PatternCalculationInputBuilderService {

  /**
   * Transforms a pattern definition session into calculation engine input
   * @param sessionData - Complete session data with populated relationships
   * @param options - Transformation options
   * @returns Transformation result with input data or errors
   */
  async buildCalculationInput(
    sessionData: PatternDefinitionSessionWithData,
    options?: TransformationContext['options']
  ): Promise<TransformationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const debugInfo: Record<string, any> = {};

    try {
      // Validate session data completeness
      const sessionValidation = this.validateSessionData(sessionData);
      if (!sessionValidation.isValid) {
        return {
          success: false,
          errors: sessionValidation.errors,
          warnings: sessionValidation.warnings
        };
      }

      // Build calculation input step by step
      const units = this.buildUnits(sessionData);
      const gauge = this.buildGaugeData(sessionData);
      const yarn = this.buildYarnProfile(sessionData);
      const stitchPattern = this.buildStitchPattern(sessionData);
      
      // Calculate finished measurements by applying ease
      const measurementsResult = await this.buildFinishedMeasurements(sessionData);
      if (!measurementsResult.success) {
        errors.push(...(measurementsResult.errors || []));
        warnings.push(...(measurementsResult.warnings || []));
      }

      const garment = await this.buildGarmentDefinition(sessionData, measurementsResult.finishedMeasurements!);

      // Construct the complete input
      const calculationInput: PatternCalculationInput = {
        version: CALCULATION_SCHEMA_VERSION,
        sessionId: sessionData.id,
        units,
        gauge,
        yarn,
        stitchPattern,
        garment,
        requestedAt: new Date().toISOString()
      };

      // Add debug information if requested
      if (options?.includeDebugInfo) {
        debugInfo.sessionData = {
          id: sessionData.id,
          status: sessionData.status,
          garmentType: sessionData.garment_type?.type_key,
          componentsCount: sessionData.components?.length || 0
        };
        debugInfo.transformationSteps = {
          unitsBuilt: !!units,
          gaugeBuilt: !!gauge,
          yarnBuilt: !!yarn,
          stitchPatternBuilt: !!stitchPattern,
          measurementsCalculated: !!measurementsResult.finishedMeasurements,
          garmentBuilt: !!garment
        };
      }

      // Validate the constructed input if requested
      if (options?.validateInput) {
        const validation = validatePatternCalculationInput(calculationInput);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          warnings.push(...validation.warnings);
        }
      }

      return {
        success: errors.length === 0,
        input: calculationInput,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        debugInfo: Object.keys(debugInfo).length > 0 ? debugInfo : undefined
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown transformation error';
      return {
        success: false,
        errors: [errorMessage],
        debugInfo: options?.includeDebugInfo ? debugInfo : undefined
      };
    }
  }

  /**
   * Validates that session data has all required information
   */
  private validateSessionData(sessionData: PatternDefinitionSessionWithData): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required session fields
    if (!sessionData.id) {
      errors.push('Missing session ID');
    }

    if (!sessionData.gauge_profile && (!sessionData.gauge_stitch_count || !sessionData.gauge_row_count)) {
      errors.push('Missing gauge information');
    }

    if (!sessionData.measurement_set) {
      errors.push('Missing measurement set');
    }

    if (!sessionData.ease_preference) {
      errors.push('Missing ease preference');
    }

    if (!sessionData.yarn_profile) {
      warnings.push('Missing yarn profile - using default values');
    }

    if (!sessionData.stitch_pattern) {
      warnings.push('Missing stitch pattern - using default stockinette');
    }

    if (!sessionData.garment_type) {
      errors.push('Missing garment type');
    }

    if (!sessionData.components || sessionData.components.length === 0) {
      warnings.push('No garment components defined');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Builds calculation units from session data
   */
  private buildUnits(sessionData: PatternDefinitionSessionWithData): CalculationUnits {
    // Use measurement set unit as primary, fallback to gauge unit, then default to cm
    const primaryUnit = sessionData.measurement_set?.measurement_unit || 
                       sessionData.gauge_unit || 
                       'cm';

    return {
      dimensionUnit: primaryUnit as 'cm' | 'inches',
      gaugeUnit: (sessionData.gauge_unit || primaryUnit) as 'cm' | 'inches'
    };
  }

  /**
   * Builds gauge data from session
   */
  private buildGaugeData(sessionData: PatternDefinitionSessionWithData): CalculationGaugeData {
    // Use cached values if available, otherwise use profile values
    const stitchCount = sessionData.gauge_stitch_count || sessionData.gauge_profile?.stitch_count || 20;
    const rowCount = sessionData.gauge_row_count || sessionData.gauge_profile?.row_count || 28;
    const unit = sessionData.gauge_unit || sessionData.gauge_profile?.measurement_unit || 'cm';

    return {
      stitchesPer10cm: stitchCount,
      rowsPer10cm: rowCount,
      unit,
      profileName: sessionData.gauge_profile?.profile_name
    };
  }

  /**
   * Builds yarn profile data
   */
  private buildYarnProfile(sessionData: PatternDefinitionSessionWithData): CalculationYarnProfile {
    const yarnProfile = sessionData.yarn_profile;

    // Convert fiber content array to string
    const fiberString = yarnProfile?.fiber_content?.map(f => `${f.fiber} ${f.percentage}%`).join(', ');

    return {
      name: yarnProfile?.yarn_name || 'Unknown Yarn',
      weightCategory: yarnProfile?.yarn_weight_category || 'DK',
      fiber: fiberString,
      metadata: yarnProfile ? {
        brand: yarnProfile.brand_name,
        colorway: yarnProfile.color_name,
        yardage: yarnProfile.skein_yardage,
        unitWeight: yarnProfile.skein_weight_grams,
        dyeLot: yarnProfile.dye_lot,
        ravelryId: yarnProfile.ravelry_id
      } : undefined
    };
  }

  /**
   * Builds stitch pattern data
   */
  private buildStitchPattern(sessionData: PatternDefinitionSessionWithData): CalculationStitchPattern {
    const stitchPattern = sessionData.stitch_pattern;

    return {
      name: stitchPattern?.stitch_name || 'Stockinette Stitch',
      horizontalRepeat: stitchPattern?.stitch_repeat_width || 1,
      verticalRepeat: stitchPattern?.stitch_repeat_height || 1,
      patternType: stitchPattern?.is_basic ? 'basic' : 'custom',
      metadata: stitchPattern ? {
        description: stitchPattern.description,
        properties: stitchPattern.properties,
        swatchImageUrl: stitchPattern.swatch_image_url
      } : undefined
    };
  }

  /**
   * Calculates finished measurements by applying ease to body measurements
   */
  private async buildFinishedMeasurements(sessionData: PatternDefinitionSessionWithData): Promise<{ success: boolean; finishedMeasurements?: CalculationMeasurements; errors?: string[]; warnings?: string[] }> {
    if (!sessionData.measurement_set || !sessionData.ease_preference) {
      return {
        success: false,
        errors: ['Missing measurement set or ease preference']
      };
    }

    const garmentTypeKey = sessionData.garment_type?.type_key || 'sweater';
    
    return applyEaseToMeasurements(
      sessionData.measurement_set,
      sessionData.ease_preference,
      garmentTypeKey
    );
  }

  /**
   * Builds garment definition with components
   */
  private async buildGarmentDefinition(
    sessionData: PatternDefinitionSessionWithData,
    finishedMeasurements: CalculationMeasurements
  ): Promise<CalculationGarmentDefinition> {
    const garmentType = sessionData.garment_type!;
    
    // Build components from session components
    const components: CalculationComponentDefinition[] = [];
    
    if (sessionData.components && sessionData.components.length > 0) {
      for (const component of sessionData.components) {
        const componentDef = this.buildComponentDefinition(component, finishedMeasurements);
        components.push(componentDef);
      }
    } else {
      // Create default components based on garment type
      components.push(...this.createDefaultComponents(garmentType.type_key, finishedMeasurements));
    }

    return {
      typeKey: garmentType.type_key,
      displayName: garmentType.display_name,
      constructionMethod: this.extractConstructionMethod(garmentType),
      bodyShape: this.extractBodyShape(garmentType),
      measurements: finishedMeasurements,
      components,
      attributes: garmentType.metadata
    };
  }

  /**
   * Builds a component definition from session component data
   */
  private buildComponentDefinition(
    sessionComponent: any,
    finishedMeasurements: CalculationMeasurements
  ): CalculationComponentDefinition {
    const template = sessionComponent.component_template;
    const componentKey = template.component_key;

    // Calculate target dimensions based on component type and measurements
    const targetDimensions = this.calculateComponentDimensions(componentKey, finishedMeasurements);

    return {
      componentKey,
      displayName: sessionComponent.component_label || template.display_name,
      targetWidth: targetDimensions.width,
      targetLength: targetDimensions.length,
      targetCircumference: targetDimensions.circumference,
      attributes: {
        ...sessionComponent.selected_attributes,
        measurementOverrides: sessionComponent.measurement_overrides,
        easeOverrides: sessionComponent.ease_overrides,
        notes: sessionComponent.notes
      }
    };
  }

  /**
   * Calculates target dimensions for a component
   */
  private calculateComponentDimensions(
    componentKey: string,
    measurements: CalculationMeasurements
  ): { width?: number; length?: number; circumference?: number } {
    switch (componentKey) {
      case 'body_panel':
      case 'front_body_panel':
      case 'back_body_panel':
        return {
          width: measurements.finishedChestCircumference / 2, // Half circumference for flat panel
          length: measurements.finishedLength
        };
      
      case 'sleeve':
        return {
          length: measurements.finishedArmLength || 60,
          circumference: measurements.finishedUpperArmCircumference || (measurements.finishedChestCircumference * 0.35)
        };
      
      case 'neckband':
      case 'collar':
        return {
          circumference: measurements.finishedNeckCircumference || (measurements.finishedChestCircumference * 0.4)
        };
      
      default:
        return {};
    }
  }

  /**
   * Creates default components for a garment type
   */
  private createDefaultComponents(
    garmentTypeKey: string,
    measurements: CalculationMeasurements
  ): CalculationComponentDefinition[] {
    const components: CalculationComponentDefinition[] = [];

    // Basic sweater components
    if (garmentTypeKey.includes('sweater') || garmentTypeKey.includes('pullover')) {
      components.push(
        {
          componentKey: 'front_body_panel',
          displayName: 'Front Body Panel',
          targetWidth: measurements.finishedChestCircumference / 2,
          targetLength: measurements.finishedLength,
          attributes: {}
        },
        {
          componentKey: 'back_body_panel',
          displayName: 'Back Body Panel',
          targetWidth: measurements.finishedChestCircumference / 2,
          targetLength: measurements.finishedLength,
          attributes: {}
        },
        {
          componentKey: 'sleeve',
          displayName: 'Sleeve',
          targetLength: measurements.finishedArmLength || 60,
          targetCircumference: measurements.finishedUpperArmCircumference || (measurements.finishedChestCircumference * 0.35),
          attributes: { quantity: 2 }
        }
      );
    }

    return components;
  }

  /**
   * Extracts construction method from garment metadata
   */
  private extractConstructionMethod(garmentType: any): string {
    return garmentType.metadata?.construction_methods?.[0] || 
           garmentType.metadata?.construction_method || 
           'drop_shoulder';
  }

  /**
   * Extracts body shape from garment metadata
   */
  private extractBodyShape(garmentType: any): string {
    return garmentType.metadata?.body_shape || 
           garmentType.metadata?.fit || 
           'straight';
  }
} 