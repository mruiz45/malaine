'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CalculationScenario,
  CalculationResult,
  GaugeInfo,
  ScenarioAInput,
  ScenarioBInput,
  ScenarioCInput,
  ReverseGaugeCalculatorFormErrors
} from '@/types/reverseGaugeCalculator';
import type { MeasurementUnit } from '@/types/gauge';
import { calculateReverseGaugeAPI, validateCalculationInput } from '@/services/reverseGaugeCalculatorService';
import GaugeCalculatorScenarios from './GaugeCalculatorScenarios';
import CalculationResults from './CalculationResults';

interface ReverseGaugeCalculatorProps {
  /** Optional CSS classes for styling */
  className?: string;
  /** Optional initial gauge data */
  initialGauge?: Partial<GaugeInfo>;
  /** Callback when calculation is completed */
  onCalculationComplete?: (result: CalculationResult) => void;
  /** Whether to show the tool in compact mode */
  compact?: boolean;
}

/**
 * Reverse Gauge Calculator Tool Component
 * Reusable component that can be integrated anywhere in the application
 * Supports three calculation scenarios as specified in US_2.1
 */
export default function ReverseGaugeCalculator({
  className = '',
  initialGauge,
  onCalculationComplete,
  compact = false
}: ReverseGaugeCalculatorProps) {
  const { t } = useTranslation();

  // State management
  const [selectedScenario, setSelectedScenario] = useState<CalculationScenario>('target_to_stitches');
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<ReverseGaugeCalculatorFormErrors>({});

  // Form data state
  const [userGauge, setUserGauge] = useState<GaugeInfo>({
    stitches: initialGauge?.stitches || 22,
    rows: initialGauge?.rows || 30,
    unit_dimension: initialGauge?.unit_dimension || 10,
    unit: initialGauge?.unit || 'cm'
  });

  const [patternGauge, setPatternGauge] = useState<GaugeInfo>({
    stitches: 20,
    rows: 28,
    unit_dimension: 10,
    unit: 'cm'
  });

  // Scenario-specific form data
  const [targetDimension, setTargetDimension] = useState<number>(50);
  const [dimensionUnit, setDimensionUnit] = useState<MeasurementUnit>('cm');
  const [calculateFor, setCalculateFor] = useState<'stitches' | 'rows'>('stitches');
  const [stitchOrRowCount, setStitchOrRowCount] = useState<number>(100);
  const [calculateForDimension, setCalculateForDimension] = useState<'dimension_width' | 'dimension_height'>('dimension_width');
  const [patternStitchRowCount, setPatternStitchRowCount] = useState<number>(100);
  const [calculateForComponent, setCalculateForComponent] = useState<'width' | 'height'>('width');

  /**
   * Handles form submission and calculation
   */
  const handleCalculate = async () => {
    setIsCalculating(true);
    setErrors({});
    setResult(null);

    try {
      let input: ScenarioAInput | ScenarioBInput | ScenarioCInput;

      // Prepare input based on selected scenario
      switch (selectedScenario) {
        case 'target_to_stitches':
          input = {
            user_gauge: userGauge,
            target_dimension: targetDimension,
            dimension_unit: dimensionUnit,
            calculate_for: calculateFor
          } as ScenarioAInput;
          break;

        case 'stitches_to_dimension':
          input = {
            user_gauge: userGauge,
            stitch_or_row_count: stitchOrRowCount,
            calculate_for: calculateForDimension
          } as ScenarioBInput;
          break;

        case 'gauge_comparison':
          input = {
            pattern_gauge: patternGauge,
            pattern_stitch_row_count: patternStitchRowCount,
            user_gauge: userGauge,
            calculate_for_component: calculateForComponent
          } as ScenarioCInput;
          break;

        default:
          throw new Error('Invalid scenario selected');
      }

      // Validate input
      const validationErrors = validateCalculationInput(selectedScenario, input);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      // Perform calculation
      const calculationResult = await calculateReverseGaugeAPI(selectedScenario, input);
      setResult(calculationResult);

      // Call callback if provided
      if (onCalculationComplete) {
        onCalculationComplete(calculationResult);
      }

    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({
        calculate_for: error instanceof Error ? error.message : t('tools.reverse_gauge_calculator.calculation_error')
      });
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Resets the calculator to initial state
   */
  const handleReset = () => {
    setResult(null);
    setErrors({});
    setTargetDimension(50);
    setStitchOrRowCount(100);
    setPatternStitchRowCount(100);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${compact ? 'p-4' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
          {t('tools.reverse_gauge_calculator.title')}
        </h2>
        {!compact && (
          <p className="text-gray-600 text-sm">
            {t('tools.reverse_gauge_calculator.description')}
          </p>
        )}
      </div>

      {/* Scenario Selection and Form */}
      <GaugeCalculatorScenarios
        selectedScenario={selectedScenario}
        onScenarioChange={setSelectedScenario}
        userGauge={userGauge}
        onUserGaugeChange={setUserGauge}
        patternGauge={patternGauge}
        onPatternGaugeChange={setPatternGauge}
        targetDimension={targetDimension}
        onTargetDimensionChange={setTargetDimension}
        dimensionUnit={dimensionUnit}
        onDimensionUnitChange={setDimensionUnit}
        calculateFor={calculateFor}
        onCalculateForChange={setCalculateFor}
        stitchOrRowCount={stitchOrRowCount}
        onStitchOrRowCountChange={setStitchOrRowCount}
        calculateForDimension={calculateForDimension}
        onCalculateForDimensionChange={setCalculateForDimension}
        patternStitchRowCount={patternStitchRowCount}
        onPatternStitchRowCountChange={setPatternStitchRowCount}
        calculateForComponent={calculateForComponent}
        onCalculateForComponentChange={setCalculateForComponent}
        errors={errors}
        compact={compact}
      />

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCalculating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('tools.reverse_gauge_calculator.calculating')}
            </span>
          ) : (
            t('tools.reverse_gauge_calculator.calculate')
          )}
        </button>

        {result && (
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {t('tools.reverse_gauge_calculator.reset')}
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <CalculationResults
          result={result}
          compact={compact}
          className="mt-6"
        />
      )}

      {/* General Errors */}
      {errors.calculate_for && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.calculate_for}</p>
        </div>
      )}
    </div>
  );
} 