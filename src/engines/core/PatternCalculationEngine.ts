/**
 * Core Pattern Calculation Engine (PD_PH6_US002)
 * Main orchestrator for the modular pattern calculation system
 */

import {
  CoreCalculationInput,
  CalculatedPatternDetails,
  CalculationContext,
  BaseCalculator,
  EngineConfiguration,
  ValidationResult,
  InterdependencyResolutionResult
} from '@/types/core-pattern-calculation';
import { InMemoryPatternDefinition } from '@/types/patternDefinitionInMemory';
import { BodyCalculator } from '../calculators/BodyCalculator';
import { SleeveCalculator } from '../calculators/SleeveCalculator';
import { NecklineShapingCalculator } from '../calculators/NecklineShapingCalculator';
import { AccessoryCalculator } from '../calculators/AccessoryCalculator';
import { InterdependencyResolver } from '../calculators/interdependency/InterdependencyResolver';
import { EngineInputValidator } from '../validators/EngineInputValidator';

/**
 * Default engine configuration
 */
const DEFAULT_CONFIG: EngineConfiguration = {
  enabledCalculators: ['body', 'sleeve', 'neckline', 'accessory'],
  maxIterations: 5,
  safetyMargins: {
    yarn: 0.15, // 15% safety margin for yarn
    stitchCount: 0.02 // 2% rounding margin for stitch counts
  },
  precision: {
    dimensions: 1, // 1 decimal place for dimensions
    stitchCount: 0 // Whole stitches only
  }
};

/**
 * Core Pattern Calculation Engine
 * Orchestrates modular calculators to produce complete pattern calculations
 */
export class PatternCalculationEngine {
  private calculators: Map<string, BaseCalculator>;
  private config: EngineConfiguration;
  private validator: EngineInputValidator;
  private interdependencyResolver: InterdependencyResolver;

  constructor(config?: Partial<EngineConfiguration>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.calculators = new Map();
    this.validator = new EngineInputValidator();
    this.interdependencyResolver = new InterdependencyResolver();
    
    this.initializeCalculators();
  }

  /**
   * Main calculation method
   * Processes pattern state and returns calculated pattern details
   */
  async calculate(input: CoreCalculationInput): Promise<CalculatedPatternDetails> {
    try {
      // Step 1: Validate input
      const validation = this.validateInput(input);
      if (!validation.isValid) {
        return this.createErrorResult(input.patternState.sessionId, validation.errors);
      }

      // Step 2: Create calculation context
      const context = await this.createCalculationContext(input);

      // Step 3: Execute calculations with interdependency resolution
      const calculationResult = await this.executeCalculations(context);

      // Step 4: Assemble final result
      const result = this.assembleResult(calculationResult, context);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
      return this.createErrorResult(
        input.patternState.sessionId,
        [errorMessage]
      );
    }
  }

  /**
   * Validate calculation input
   */
  private validateInput(input: CoreCalculationInput): ValidationResult {
    return this.validator.validateInput(input);
  }

  /**
   * Create calculation context from input
   */
  private async createCalculationContext(input: CoreCalculationInput): Promise<CalculationContext> {
    const { patternState, options } = input;

    // Extract gauge information
    const gauge = this.extractGaugeData(patternState);
    
    // Calculate finished measurements
    const finishedMeasurements = await this.calculateFinishedMeasurements(patternState);

    const context: CalculationContext = {
      patternState,
      options: options || {},
      sessionId: patternState.sessionId,
      gauge,
      finishedMeasurements,
      interdependencies: {},
      calculatedAt: new Date()
    };

    return context;
  }

  /**
   * Execute calculations with interdependency resolution
   */
  private async executeCalculations(context: CalculationContext): Promise<{
    success: boolean;
    pieces: Record<string, any>;
    warnings: string[];
    errors: string[];
  }> {
    const allPieces: Record<string, any> = {};
    const allWarnings: string[] = [];
    const allErrors: string[] = [];
    let currentContext = { ...context };

    // Determine which calculators to run based on garment type
    const activeCalculators = this.getActiveCalculators(context.patternState.garmentType);

    // Execute calculations with interdependency resolution
    let iteration = 0;
    let hasInterdependencies = true;

    while (hasInterdependencies && iteration < this.config.maxIterations) {
      iteration++;
      let contextChanged = false;

      for (const calculatorName of activeCalculators) {
        const calculator = this.calculators.get(calculatorName);
        if (!calculator) continue;

        // Validate calculator input
        const validation = calculator.validateInput(currentContext);
        if (!validation.isValid) {
          allErrors.push(...validation.errors);
          allWarnings.push(...validation.warnings);
          continue;
        }

        // Execute calculation
        const result = await calculator.calculate(currentContext);
        
        if (result.success) {
          // Merge pieces
          Object.assign(allPieces, result.pieces);
          
          // Apply context updates for interdependencies
          if (result.contextUpdates) {
            Object.assign(currentContext, result.contextUpdates);
            contextChanged = true;
          }
          
          allWarnings.push(...(result.warnings || []));
        } else {
          allErrors.push(...(result.errors || []));
        }
      }

      // Check if we need another iteration for interdependencies
      if (this.config.enabledCalculators.includes('interdependency')) {
        const resolutionResult = await this.interdependencyResolver.resolve(currentContext, allPieces);
        if (resolutionResult.success && resolutionResult.actions.length > 0) {
          currentContext = resolutionResult.resolvedContext;
          contextChanged = true;
          allWarnings.push(...(resolutionResult.warnings || []));
        }
      }

      hasInterdependencies = contextChanged;
    }

    if (iteration >= this.config.maxIterations && hasInterdependencies) {
      allWarnings.push(`Maximum iterations (${this.config.maxIterations}) reached for interdependency resolution`);
    }

    return {
      success: allErrors.length === 0,
      pieces: allPieces,
      warnings: allWarnings,
      errors: allErrors
    };
  }

  /**
   * Assemble final calculation result
   */
  private assembleResult(
    calculationResult: { success: boolean; pieces: Record<string, any>; warnings: string[]; errors: string[] },
    context: CalculationContext
  ): CalculatedPatternDetails {
    const result: CalculatedPatternDetails = {
      patternInfo: {
        sessionId: context.sessionId,
        garmentType: context.patternState.garmentType || 'unknown',
        craftType: context.patternState.craftType,
        calculatedAt: context.calculatedAt.toISOString(),
        schemaVersion: '1.0.0'
      },
      pieces: calculationResult.pieces,
      warnings: calculationResult.warnings.length > 0 ? calculationResult.warnings : undefined,
      errors: calculationResult.errors.length > 0 ? calculationResult.errors : undefined
    };

    // Add yarn estimation if requested
    if (context.options.includeYarnEstimation) {
      result.yarnEstimation = this.calculateYarnEstimation(calculationResult.pieces, context);
    }

    return result;
  }

  /**
   * Initialize all calculator modules
   */
  private initializeCalculators(): void {
    // Register all available calculators
    this.calculators.set('body', new BodyCalculator());
    this.calculators.set('sleeve', new SleeveCalculator());
    this.calculators.set('neckline', new NecklineShapingCalculator());
    this.calculators.set('accessory', new AccessoryCalculator());
  }

  /**
   * Get active calculators based on garment type
   */
  private getActiveCalculators(garmentType: string | null): string[] {
    if (!garmentType) return [];

    const baseCalculators = this.config.enabledCalculators.filter(calc => 
      this.calculators.has(calc)
    );

    // Filter calculators based on garment type
    switch (garmentType.toLowerCase()) {
      case 'sweater':
      case 'cardigan':
        return baseCalculators.filter(calc => ['body', 'sleeve', 'neckline'].includes(calc));
      
      case 'hat':
      case 'beanie':
      case 'scarf':
      case 'shawl':
        return baseCalculators.filter(calc => ['accessory'].includes(calc));
      
      default:
        return baseCalculators;
    }
  }

  /**
   * Extract gauge data from pattern state
   */
  private extractGaugeData(patternState: InMemoryPatternDefinition): {
    stitchesPerCm: number;
    rowsPerCm: number;
    unit: 'cm' | 'inch';
  } {
    const gauge = patternState.gauge;
    if (!gauge) {
      throw new Error('Gauge information is required for calculations');
    }

    const unit = gauge.unit;
    const conversionFactor = unit === 'inch' ? 2.54 : 1; // Convert inches to cm

    return {
      stitchesPerCm: gauge.stitchCount / (unit === 'inch' ? 2.54 : 1),
      rowsPerCm: gauge.rowCount / (unit === 'inch' ? 2.54 : 1),
      unit: 'cm' // Always work in cm internally
    };
  }

  /**
   * Calculate finished measurements with ease applied
   */
  private async calculateFinishedMeasurements(patternState: InMemoryPatternDefinition): Promise<Record<string, number>> {
    const measurements = patternState.measurements?.measurements || {};
    const ease = patternState.ease || { type: 'positive', values: {} };
    
    const finished: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(measurements)) {
      if (typeof value === 'number') {
        const easeValue = (ease.values && ease.values[key as keyof typeof ease.values] && typeof ease.values[key as keyof typeof ease.values] === 'number') 
          ? ease.values[key as keyof typeof ease.values] as number
          : 0;
        finished[key] = value + easeValue;
      }
    }

    return finished;
  }

  /**
   * Calculate yarn estimation for all pieces
   */
  private calculateYarnEstimation(pieces: Record<string, any>, context: CalculationContext): any {
    // This is a simplified estimation - would be expanded with actual yarn calculation logic
    const totalStitches = Object.values(pieces).reduce((sum: number, piece: any) => {
      return sum + (piece.castOnStitches * piece.lengthInRows);
    }, 0);

    // Basic estimation: ~4 stitches per meter for worsted weight yarn
    const estimatedLength = totalStitches / 4;
    const safetyMargin = this.config.safetyMargins.yarn;

    return {
      totalLength_m: Math.round(estimatedLength * (1 + safetyMargin)),
      totalWeight_g: Math.round(estimatedLength * 0.25), // ~4m per gram for worsted
      byPiece: Object.fromEntries(
        Object.entries(pieces).map(([key, piece]: [string, any]) => [
          key,
          {
            length_m: Math.round((piece.castOnStitches * piece.lengthInRows) / 4),
            weight_g: Math.round((piece.castOnStitches * piece.lengthInRows) / 16),
            percentage: (piece.castOnStitches * piece.lengthInRows) / totalStitches * 100
          }
        ])
      ),
      safetyMargin,
      confidence: 'medium' as const,
      factors: ['Yarn weight assumed as worsted', 'Basic stitch-to-length ratio used']
    };
  }

  /**
   * Create error result
   */
  private createErrorResult(sessionId: string, errors: string[]): CalculatedPatternDetails {
    return {
      patternInfo: {
        sessionId,
        garmentType: 'unknown',
        craftType: 'knitting',
        calculatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0'
      },
      pieces: {},
      errors
    };
  }
} 