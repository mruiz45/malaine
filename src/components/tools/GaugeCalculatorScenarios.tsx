'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type {
  CalculationScenario,
  GaugeInfo,
  ReverseGaugeCalculatorFormErrors
} from '@/types/reverseGaugeCalculator';
import type { MeasurementUnit } from '@/types/gauge';

interface GaugeCalculatorScenariosProps {
  selectedScenario: CalculationScenario;
  onScenarioChange: (scenario: CalculationScenario) => void;
  userGauge: GaugeInfo;
  onUserGaugeChange: (gauge: GaugeInfo) => void;
  patternGauge: GaugeInfo;
  onPatternGaugeChange: (gauge: GaugeInfo) => void;
  targetDimension: number;
  onTargetDimensionChange: (dimension: number) => void;
  dimensionUnit: MeasurementUnit;
  onDimensionUnitChange: (unit: MeasurementUnit) => void;
  calculateFor: 'stitches' | 'rows';
  onCalculateForChange: (calculateFor: 'stitches' | 'rows') => void;
  stitchOrRowCount: number;
  onStitchOrRowCountChange: (count: number) => void;
  calculateForDimension: 'dimension_width' | 'dimension_height';
  onCalculateForDimensionChange: (calculateFor: 'dimension_width' | 'dimension_height') => void;
  patternStitchRowCount: number;
  onPatternStitchRowCountChange: (count: number) => void;
  calculateForComponent: 'width' | 'height';
  onCalculateForComponentChange: (component: 'width' | 'height') => void;
  errors: ReverseGaugeCalculatorFormErrors;
  compact?: boolean;
}

/**
 * Component for selecting calculation scenarios and displaying corresponding forms
 */
export default function GaugeCalculatorScenarios({
  selectedScenario,
  onScenarioChange,
  userGauge,
  onUserGaugeChange,
  patternGauge,
  onPatternGaugeChange,
  targetDimension,
  onTargetDimensionChange,
  dimensionUnit,
  onDimensionUnitChange,
  calculateFor,
  onCalculateForChange,
  stitchOrRowCount,
  onStitchOrRowCountChange,
  calculateForDimension,
  onCalculateForDimensionChange,
  patternStitchRowCount,
  onPatternStitchRowCountChange,
  calculateForComponent,
  onCalculateForComponentChange,
  errors
}: GaugeCalculatorScenariosProps) {
  const { t } = useTranslation();

  /**
   * Renders gauge input fields
   */
  const renderGaugeInput = (
    gauge: GaugeInfo,
    onChange: (gauge: GaugeInfo) => void,
    prefix: 'user_gauge' | 'pattern_gauge',
    label: string
  ) => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{label}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Stitches */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tools.reverse_gauge_calculator.form.stitches')} *
          </label>
          <input
            type="number"
            value={gauge.stitches}
            onChange={(e) => onChange({ ...gauge, stitches: parseFloat(e.target.value) || 0 })}
            step="0.1"
            min="0.1"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[prefix]?.stitches ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors[prefix]?.stitches && (
            <p className="mt-1 text-sm text-red-600">{errors[prefix]?.stitches}</p>
          )}
        </div>

        {/* Rows */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tools.reverse_gauge_calculator.form.rows')} *
          </label>
          <input
            type="number"
            value={gauge.rows}
            onChange={(e) => onChange({ ...gauge, rows: parseFloat(e.target.value) || 0 })}
            step="0.1"
            min="0.1"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[prefix]?.rows ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors[prefix]?.rows && (
            <p className="mt-1 text-sm text-red-600">{errors[prefix]?.rows}</p>
          )}
        </div>

        {/* Unit Dimension */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tools.reverse_gauge_calculator.form.unit_dimension')} *
          </label>
          <input
            type="number"
            value={gauge.unit_dimension}
            onChange={(e) => onChange({ ...gauge, unit_dimension: parseFloat(e.target.value) || 0 })}
            step="0.1"
            min="0.1"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[prefix]?.unit_dimension ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors[prefix]?.unit_dimension && (
            <p className="mt-1 text-sm text-red-600">{errors[prefix]?.unit_dimension}</p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('tools.reverse_gauge_calculator.form.unit')} *
          </label>
          <select
            value={gauge.unit}
            onChange={(e) => onChange({ ...gauge, unit: e.target.value as MeasurementUnit })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors[prefix]?.unit ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="cm">{t('gauge.form.unit_cm')}</option>
            <option value="inch">{t('gauge.form.unit_inch')}</option>
          </select>
          {errors[prefix]?.unit && (
            <p className="mt-1 text-sm text-red-600">{errors[prefix]?.unit}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {t('tools.reverse_gauge_calculator.scenario_selection')}
        </h3>
        <div className="space-y-3">
          {/* Scenario A */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="scenario"
              value="target_to_stitches"
              checked={selectedScenario === 'target_to_stitches'}
              onChange={(e) => onScenarioChange(e.target.value as CalculationScenario)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <div className="font-medium text-gray-900">
                {t('tools.reverse_gauge_calculator.scenarios.target_to_stitches.title')}
              </div>
              <div className="text-sm text-gray-600">
                {t('tools.reverse_gauge_calculator.scenarios.target_to_stitches.description')}
              </div>
            </div>
          </label>

          {/* Scenario B */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="scenario"
              value="stitches_to_dimension"
              checked={selectedScenario === 'stitches_to_dimension'}
              onChange={(e) => onScenarioChange(e.target.value as CalculationScenario)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <div className="font-medium text-gray-900">
                {t('tools.reverse_gauge_calculator.scenarios.stitches_to_dimension.title')}
              </div>
              <div className="text-sm text-gray-600">
                {t('tools.reverse_gauge_calculator.scenarios.stitches_to_dimension.description')}
              </div>
            </div>
          </label>

          {/* Scenario C */}
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="scenario"
              value="gauge_comparison"
              checked={selectedScenario === 'gauge_comparison'}
              onChange={(e) => onScenarioChange(e.target.value as CalculationScenario)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div>
              <div className="font-medium text-gray-900">
                {t('tools.reverse_gauge_calculator.scenarios.gauge_comparison.title')}
              </div>
              <div className="text-sm text-gray-600">
                {t('tools.reverse_gauge_calculator.scenarios.gauge_comparison.description')}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Scenario-specific Forms */}
      <div className="border-t pt-6">
        {/* Scenario A: Target to Stitches */}
        {selectedScenario === 'target_to_stitches' && (
          <div className="space-y-6">
            {renderGaugeInput(
              userGauge,
              onUserGaugeChange,
              'user_gauge',
              t('tools.reverse_gauge_calculator.form.your_gauge')
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.target_dimension')} *
                </label>
                <input
                  type="number"
                  value={targetDimension}
                  onChange={(e) => onTargetDimensionChange(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0.1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.target_dimension ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.target_dimension && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_dimension}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.dimension_unit')} *
                </label>
                <select
                  value={dimensionUnit}
                  onChange={(e) => onDimensionUnitChange(e.target.value as MeasurementUnit)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cm">{t('gauge.form.unit_cm')}</option>
                  <option value="inch">{t('gauge.form.unit_inch')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.calculate_for')} *
                </label>
                <select
                  value={calculateFor}
                  onChange={(e) => onCalculateForChange(e.target.value as 'stitches' | 'rows')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="stitches">{t('tools.reverse_gauge_calculator.form.stitches')}</option>
                  <option value="rows">{t('tools.reverse_gauge_calculator.form.rows')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Scenario B: Stitches to Dimension */}
        {selectedScenario === 'stitches_to_dimension' && (
          <div className="space-y-6">
            {renderGaugeInput(
              userGauge,
              onUserGaugeChange,
              'user_gauge',
              t('tools.reverse_gauge_calculator.form.your_gauge')
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.stitch_or_row_count')} *
                </label>
                <input
                  type="number"
                  value={stitchOrRowCount}
                  onChange={(e) => onStitchOrRowCountChange(parseFloat(e.target.value) || 0)}
                  step="1"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.stitch_or_row_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.stitch_or_row_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.stitch_or_row_count}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.calculate_dimension_for')} *
                </label>
                <select
                  value={calculateForDimension}
                  onChange={(e) => onCalculateForDimensionChange(e.target.value as 'dimension_width' | 'dimension_height')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="dimension_width">{t('tools.reverse_gauge_calculator.form.width')}</option>
                  <option value="dimension_height">{t('tools.reverse_gauge_calculator.form.height')}</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Scenario C: Gauge Comparison */}
        {selectedScenario === 'gauge_comparison' && (
          <div className="space-y-6">
            {renderGaugeInput(
              patternGauge,
              onPatternGaugeChange,
              'pattern_gauge',
              t('tools.reverse_gauge_calculator.form.pattern_gauge')
            )}

            {renderGaugeInput(
              userGauge,
              onUserGaugeChange,
              'user_gauge',
              t('tools.reverse_gauge_calculator.form.your_gauge')
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.pattern_stitch_row_count')} *
                </label>
                <input
                  type="number"
                  value={patternStitchRowCount}
                  onChange={(e) => onPatternStitchRowCountChange(parseFloat(e.target.value) || 0)}
                  step="1"
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.pattern_stitch_row_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pattern_stitch_row_count && (
                  <p className="mt-1 text-sm text-red-600">{errors.pattern_stitch_row_count}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.reverse_gauge_calculator.form.calculate_component_for')} *
                </label>
                <select
                  value={calculateForComponent}
                  onChange={(e) => onCalculateForComponentChange(e.target.value as 'width' | 'height')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="width">{t('tools.reverse_gauge_calculator.form.width')}</option>
                  <option value="height">{t('tools.reverse_gauge_calculator.form.height')}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 