/**
 * Core Pattern Calculation Engine Service (PD_PH6_US002)
 * Service layer for the core pattern calculation engine
 */

import {
  CoreCalculationInput,
  CalculatedPatternDetails,
  CoreCalculationOptions
} from '@/types/core-pattern-calculation';
import { InMemoryPatternDefinition } from '@/types/patternDefinitionInMemory';
import { PatternCalculationEngine } from '@/engines/core/PatternCalculationEngine';

/**
 * Service for orchestrating core pattern calculations
 * Follows the established pattern: Page -> Service -> API -> Engine
 */
export class CorePatternCalculationEngineService {
  private baseUrl = '/api/pattern-calculator';

  /**
   * Calculate pattern from in-memory pattern state
   */
  async calculateFromPatternState(
    patternState: InMemoryPatternDefinition,
    options?: CoreCalculationOptions
  ): Promise<{
    success: boolean;
    result?: CalculatedPatternDetails;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/calculate-core`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patternState,
          options: options || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Pattern calculation failed');
      }

      return {
        success: true,
        result: result.data
      };
    } catch (error) {
      console.error('Error in core pattern calculation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown calculation error'
      };
    }
  }

  /**
   * Calculate pattern directly using the engine (for testing/development)
   */
  async calculateDirect(
    patternState: InMemoryPatternDefinition,
    options?: CoreCalculationOptions
  ): Promise<{
    success: boolean;
    result?: CalculatedPatternDetails;
    error?: string;
  }> {
    try {
      const engine = new PatternCalculationEngine();
      
      const input: CoreCalculationInput = {
        patternState,
        options: options || {}
      };

      const result = await engine.calculate(input);

      return {
        success: !result.errors || result.errors.length === 0,
        result
      };
    } catch (error) {
      console.error('Error in direct pattern calculation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown calculation error'
      };
    }
  }

  /**
   * Validate pattern state for calculation readiness
   */
  async validatePatternState(patternState: InMemoryPatternDefinition): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    missingData: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-pattern-state`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patternState }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating pattern state:', error);
      return {
        isValid: false,
        errors: ['Validation service unavailable'],
        warnings: [],
        missingData: []
      };
    }
  }

  /**
   * Get supported garment types for calculation
   */
  getSupportedGarmentTypes(): string[] {
    return ['sweater', 'cardigan', 'hat', 'beanie', 'scarf', 'shawl'];
  }

  /**
   * Get default calculation options
   */
  getDefaultOptions(): CoreCalculationOptions {
    return {
      includeDetailedShaping: true,
      includeYarnEstimation: true,
      validateInterdependencies: true,
      debugMode: false
    };
  }

  /**
   * Check if a garment type is supported
   */
  isGarmentTypeSupported(garmentType: string): boolean {
    return this.getSupportedGarmentTypes().includes(garmentType.toLowerCase());
  }

  /**
   * Get required measurements for a garment type
   */
  getRequiredMeasurements(garmentType: string): string[] {
    switch (garmentType.toLowerCase()) {
      case 'sweater':
      case 'cardigan':
        return ['bust', 'length', 'armLength', 'upperArmCircumference'];
      
      case 'hat':
      case 'beanie':
        return ['headCircumference'];
      
      case 'scarf':
        return ['scarfLength', 'scarfWidth'];
      
      case 'shawl':
        return ['shawlWidth', 'shawlLength'];
      
      default:
        return [];
    }
  }

  /**
   * Get recommended measurements for a garment type
   */
  getRecommendedMeasurements(garmentType: string): string[] {
    switch (garmentType.toLowerCase()) {
      case 'sweater':
      case 'cardigan':
        return ['waist', 'hip', 'shoulderWidth', 'neckCircumference', 'wristCircumference'];
      
      case 'hat':
      case 'beanie':
        return ['hatHeight'];
      
      default:
        return [];
    }
  }
} 