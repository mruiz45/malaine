/**
 * Pattern Calculator Service (US_6.1)
 * Client-side service for pattern calculation operations
 */

import {
  PatternCalculationRequest,
  PatternCalculationResponse,
  PatternCalculationResult,
  PatternCalculationInput,
  TransformationResult
} from '@/types/pattern-calculation';
import { PatternDefinitionSessionWithData } from '@/types/patternDefinition';
import { PatternCalculationInputBuilderService } from './PatternCalculationInputBuilderService';

/**
 * Service class for pattern calculation operations
 */
export class PatternCalculatorService {
  private baseUrl = '/api/pattern-calculator';
  private inputBuilder = new PatternCalculationInputBuilderService();

  /**
   * Calculates a pattern from session data
   * @param sessionData - Complete session data with populated relationships
   * @param options - Calculation options
   * @returns Pattern calculation result
   */
  async calculatePatternFromSession(
    sessionData: PatternDefinitionSessionWithData,
    options?: {
      includeShaping?: boolean;
      includeYarnEstimate?: boolean;
      instructionFormat?: 'text' | 'chart' | 'both';
      validateInput?: boolean;
      includeDebugInfo?: boolean;
    }
  ): Promise<PatternCalculationResult> {
    try {
      // Transform session data to calculation input
      const transformationResult = await this.inputBuilder.buildCalculationInput(
        sessionData,
        {
          validateInput: options?.validateInput ?? true,
          includeDebugInfo: options?.includeDebugInfo ?? false
        }
      );

      if (!transformationResult.success || !transformationResult.input) {
        throw new Error(
          `Failed to transform session data: ${transformationResult.errors?.join(', ') || 'Unknown error'}`
        );
      }

      // Log warnings if any
      if (transformationResult.warnings && transformationResult.warnings.length > 0) {
        console.warn('Transformation warnings:', transformationResult.warnings);
      }

      // Calculate pattern using the transformed input
      return await this.calculatePattern(transformationResult.input, {
        includeShaping: options?.includeShaping,
        includeYarnEstimate: options?.includeYarnEstimate,
        instructionFormat: options?.instructionFormat
      });

    } catch (error) {
      console.error('Error calculating pattern from session:', error);
      throw error;
    }
  }

  /**
   * Calculates a pattern from prepared input data
   * @param input - Pattern calculation input
   * @param options - Calculation options
   * @returns Pattern calculation result
   */
  async calculatePattern(
    input: PatternCalculationInput,
    options?: {
      includeShaping?: boolean;
      includeYarnEstimate?: boolean;
      instructionFormat?: 'text' | 'chart' | 'both';
    }
  ): Promise<PatternCalculationResult> {
    try {
      const request: PatternCalculationRequest = {
        input,
        options
      };

      const response = await fetch(`${this.baseUrl}/calculate-pattern`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.validationErrors?.join(', ') || 
          `HTTP error! status: ${response.status}`
        );
      }

      const result: PatternCalculationResponse = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || 
          result.validationErrors?.join(', ') || 
          'Pattern calculation failed'
        );
      }

      if (!result.data) {
        throw new Error('No calculation result received');
      }

      return result.data;

    } catch (error) {
      console.error('Error calculating pattern:', error);
      throw error;
    }
  }

  /**
   * Transforms session data to calculation input without performing calculation
   * @param sessionData - Complete session data
   * @param options - Transformation options
   * @returns Transformation result with input data
   */
  async buildCalculationInput(
    sessionData: PatternDefinitionSessionWithData,
    options?: {
      validateInput?: boolean;
      includeDebugInfo?: boolean;
    }
  ): Promise<TransformationResult> {
    try {
      return await this.inputBuilder.buildCalculationInput(sessionData, options);
    } catch (error) {
      console.error('Error building calculation input:', error);
      throw error;
    }
  }

  /**
   * Validates calculation input without performing calculation
   * @param input - Pattern calculation input to validate
   * @returns Validation result
   */
  validateCalculationInput(input: PatternCalculationInput) {
    const { validatePatternCalculationInput } = require('@/utils/pattern-calculation-validators');
    return validatePatternCalculationInput(input);
  }

  /**
   * Estimates calculation complexity and time
   * @param sessionData - Session data to analyze
   * @returns Complexity estimation
   */
  async estimateCalculationComplexity(
    sessionData: PatternDefinitionSessionWithData
  ): Promise<{
    estimatedComponents: number;
    estimatedStitches: number;
    estimatedComplexity: 'low' | 'medium' | 'high';
    estimatedTime: string;
    warnings: string[];
  }> {
    try {
      const transformationResult = await this.buildCalculationInput(sessionData, {
        validateInput: false,
        includeDebugInfo: false
      });

      if (!transformationResult.success || !transformationResult.input) {
        return {
          estimatedComponents: 0,
          estimatedStitches: 0,
          estimatedComplexity: 'low',
          estimatedTime: 'Unknown',
          warnings: transformationResult.errors || ['Failed to analyze session data']
        };
      }

      const input = transformationResult.input;
      const componentCount = input.garment.components.length;
      
      // Rough stitch estimation
      let estimatedStitches = 0;
      for (const component of input.garment.components) {
        if (component.targetWidth && component.targetLength) {
          estimatedStitches += Math.round(
            (component.targetWidth / 10) * input.gauge.stitchesPer10cm *
            (component.targetLength / 10) * input.gauge.rowsPer10cm
          );
        } else if (component.targetCircumference) {
          estimatedStitches += Math.round(
            (component.targetCircumference / 10) * input.gauge.stitchesPer10cm * 20 // Assume 2cm height
          );
        }
      }

      // Determine complexity
      let complexity: 'low' | 'medium' | 'high' = 'low';
      if (componentCount > 5 || estimatedStitches > 20000) {
        complexity = 'high';
      } else if (componentCount > 3 || estimatedStitches > 10000) {
        complexity = 'medium';
      }

      // Estimate time (simplified)
      const baseRate = 400; // stitches per hour
      const estimatedHours = Math.ceil(estimatedStitches / baseRate);
      let estimatedTime = `${estimatedHours} hours`;
      
      if (estimatedHours > 24) {
        const days = Math.ceil(estimatedHours / 8);
        estimatedTime = `${days} days`;
      }

      return {
        estimatedComponents: componentCount,
        estimatedStitches,
        estimatedComplexity: complexity,
        estimatedTime,
        warnings: transformationResult.warnings || []
      };

    } catch (error) {
      console.error('Error estimating calculation complexity:', error);
      return {
        estimatedComponents: 0,
        estimatedStitches: 0,
        estimatedComplexity: 'low',
        estimatedTime: 'Unknown',
        warnings: [`Error analyzing complexity: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
} 