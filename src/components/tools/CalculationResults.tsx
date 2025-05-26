'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CalculationResult } from '@/types/reverseGaugeCalculator';

interface CalculationResultsProps {
  result: CalculationResult;
  compact?: boolean;
  className?: string;
}

/**
 * Component for displaying calculation results from the Reverse Gauge Calculator
 */
export default function CalculationResults({
  result,
  compact = false,
  className = ''
}: CalculationResultsProps) {
  const { t } = useTranslation();

  /**
   * Renders results for Scenario A (Target to Stitches)
   */
  const renderScenarioAResults = (result: CalculationResult) => {
    if (result.scenario !== 'target_to_stitches') return null;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            {t('tools.reverse_gauge_calculator.results.scenario_a.title')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {t('tools.reverse_gauge_calculator.results.target_dimension')}:
              </span>
              <span className="ml-2 font-medium">
                {result.target_dimension} {result.dimension_unit}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">
                {t('tools.reverse_gauge_calculator.results.calculating_for')}:
              </span>
              <span className="ml-2 font-medium">
                {result.calculate_for === 'stitches' 
                  ? t('tools.reverse_gauge_calculator.form.stitches')
                  : t('tools.reverse_gauge_calculator.form.rows')
                }
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <div className="text-lg font-bold text-blue-900">
              {t('tools.reverse_gauge_calculator.results.required_count')}: {result.required_count}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {result.calculate_for === 'stitches' 
                ? t('tools.reverse_gauge_calculator.results.stitches_needed')
                : t('tools.reverse_gauge_calculator.results.rows_needed')
              }
            </div>
          </div>
        </div>

        {/* Gauge Used */}
        <div className="text-xs text-gray-500">
          {t('tools.reverse_gauge_calculator.results.gauge_used')}: {result.gauge_used.stitches} sts, {result.gauge_used.rows} rows / {result.gauge_used.unit_dimension} {result.gauge_used.unit}
        </div>
      </div>
    );
  };

  /**
   * Renders results for Scenario B (Stitches to Dimension)
   */
  const renderScenarioBResults = (result: CalculationResult) => {
    if (result.scenario !== 'stitches_to_dimension') return null;

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">
            {t('tools.reverse_gauge_calculator.results.scenario_b.title')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">
                {result.calculate_for === 'dimension_width' 
                  ? t('tools.reverse_gauge_calculator.results.stitches_used')
                  : t('tools.reverse_gauge_calculator.results.rows_used')
                }:
              </span>
              <span className="ml-2 font-medium">
                {result.stitch_or_row_count}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">
                {t('tools.reverse_gauge_calculator.results.calculating_for')}:
              </span>
              <span className="ml-2 font-medium">
                {result.calculate_for === 'dimension_width' 
                  ? t('tools.reverse_gauge_calculator.form.width')
                  : t('tools.reverse_gauge_calculator.form.height')
                }
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <div className="text-lg font-bold text-green-900">
              {t('tools.reverse_gauge_calculator.results.resulting_dimension')}: {result.resulting_dimension} {result.dimension_unit}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {result.calculate_for === 'dimension_width' 
                ? t('tools.reverse_gauge_calculator.results.final_width')
                : t('tools.reverse_gauge_calculator.results.final_height')
              }
            </div>
          </div>
        </div>

        {/* Gauge Used */}
        <div className="text-xs text-gray-500">
          {t('tools.reverse_gauge_calculator.results.gauge_used')}: {result.gauge_used.stitches} sts, {result.gauge_used.rows} rows / {result.gauge_used.unit_dimension} {result.gauge_used.unit}
        </div>
      </div>
    );
  };

  /**
   * Renders results for Scenario C (Gauge Comparison)
   */
  const renderScenarioCResults = (result: CalculationResult) => {
    if (result.scenario !== 'gauge_comparison') return null;

    const dimensionDifference = result.dimension_with_user_gauge - result.original_dimension;
    const isDifferent = Math.abs(dimensionDifference) > 0.1;

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">
            {t('tools.reverse_gauge_calculator.results.scenario_c.title')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-gray-600">
                {t('tools.reverse_gauge_calculator.results.pattern_count')}:
              </span>
              <span className="ml-2 font-medium">
                {result.pattern_count} {result.calculate_for_component === 'width' ? 'sts' : 'rows'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">
                {t('tools.reverse_gauge_calculator.results.calculating_for')}:
              </span>
              <span className="ml-2 font-medium">
                {result.calculate_for_component === 'width' 
                  ? t('tools.reverse_gauge_calculator.form.width')
                  : t('tools.reverse_gauge_calculator.form.height')
                }
              </span>
            </div>
          </div>

          {/* Original Pattern Dimension */}
          <div className="mb-3 p-3 bg-white rounded border">
            <div className="font-medium text-purple-900">
              {t('tools.reverse_gauge_calculator.results.original_pattern_dimension')}
            </div>
            <div className="text-lg font-bold">
              {result.original_dimension} {result.dimension_unit}
            </div>
            <div className="text-xs text-gray-600">
              {t('tools.reverse_gauge_calculator.results.with_pattern_gauge')}: {result.pattern_gauge.stitches} sts, {result.pattern_gauge.rows} rows / {result.pattern_gauge.unit_dimension} {result.pattern_gauge.unit}
            </div>
          </div>

          {/* Your Gauge Result */}
          <div className={`mb-3 p-3 rounded border ${isDifferent ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
            <div className="font-medium text-gray-900">
              {t('tools.reverse_gauge_calculator.results.with_your_gauge')}
            </div>
            <div className="text-lg font-bold">
              {result.dimension_with_user_gauge} {result.dimension_unit}
            </div>
            {isDifferent && (
              <div className="text-sm text-yellow-700 mt-1">
                {dimensionDifference > 0 ? '+' : ''}{dimensionDifference.toFixed(1)} {result.dimension_unit} {t('tools.reverse_gauge_calculator.results.difference')}
              </div>
            )}
            <div className="text-xs text-gray-600">
              {t('tools.reverse_gauge_calculator.results.with_your_gauge_detail')}: {result.user_gauge.stitches} sts, {result.user_gauge.rows} rows / {result.user_gauge.unit_dimension} {result.user_gauge.unit}
            </div>
          </div>

          {/* Adjustment Needed */}
          {isDifferent && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="font-medium text-blue-900">
                {t('tools.reverse_gauge_calculator.results.adjustment_needed')}
              </div>
              <div className="text-lg font-bold text-blue-900">
                {result.adjusted_count_for_original_dimension} {result.calculate_for_component === 'width' ? 'sts' : 'rows'}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {t('tools.reverse_gauge_calculator.results.to_achieve_original_dimension')}
              </div>
            </div>
          )}

          {!isDifferent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-green-800 font-medium">
                ✓ {t('tools.reverse_gauge_calculator.results.gauges_match')}
              </div>
              <div className="text-sm text-green-700">
                {t('tools.reverse_gauge_calculator.results.no_adjustment_needed')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
          {t('tools.reverse_gauge_calculator.results.title')}
        </h3>
      </div>

      {result.scenario === 'target_to_stitches' && renderScenarioAResults(result)}
      {result.scenario === 'stitches_to_dimension' && renderScenarioBResults(result)}
      {result.scenario === 'gauge_comparison' && renderScenarioCResults(result)}
    </div>
  );
} 