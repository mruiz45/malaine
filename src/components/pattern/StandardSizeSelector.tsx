/**
 * Standard Size Selector Component (PD_PH2_US004)
 * Handles selection of standard sizes with dynamic filtering
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StandardSizesService } from '@/services/StandardSizesService';
import { 
  StandardSizeSelectionState, 
  AppliedSizeFilters,
  StandardSizeChart,
  StandardSize,
  formatSizeLabel,
  getChartDisplayName,
  SizeRegion,
  AgeCategory,
  TargetGroup
} from '@/types/standardSizes';
import { GarmentType } from '@/types/pattern';

interface StandardSizeSelectorProps {
  /** Current garment type to filter charts */
  garmentType: GarmentType;
  /** Callback when a standard size is selected */
  onSizeSelected: (sizeId: string, sizeLabel: string) => void;
  /** Current selected size ID (if any) */
  selectedSizeId?: string | null;
  /** Loading state */
  isLoading?: boolean;
  /** CSS classes */
  className?: string;
}

/**
 * Component for selecting standard sizes with dynamic filtering
 */
export const StandardSizeSelector: React.FC<StandardSizeSelectorProps> = ({
  garmentType,
  onSizeSelected,
  selectedSizeId,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation();

  // Selection state
  const [state, setState] = useState<StandardSizeSelectionState>({
    mode: 'standard',
    filters: {
      garment_type: garmentType
    },
    availableCharts: [],
    availableSizes: [],
    isLoading: false,
  });

  /**
   * Load available filters when garment type changes
   */
  const loadAvailableFilters = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const result = await StandardSizesService.getAvailableFilters(garmentType);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          availableFilters: result.data,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to load filter options',
          isLoading: false
        }));
      }
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load filter options',
        isLoading: false
      }));
    }
  }, [garmentType]);

  /**
   * Load size charts based on current filters
   */
  const loadSizeCharts = useCallback(async () => {
    if (!state.filters.age_category || !state.filters.target_group || !state.filters.region) {
      setState(prev => ({ ...prev, availableCharts: [], availableSizes: [], selectedChart: undefined }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await StandardSizesService.getSizeCharts(state.filters);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          availableCharts: result.data!.charts,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to load size charts',
          isLoading: false
        }));
      }
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load size charts',
        isLoading: false
      }));
    }
  }, [state.filters]);

  /**
   * Load sizes for a specific chart
   */
  const loadSizesForChart = useCallback(async (chart: StandardSizeChart) => {
    setState(prev => ({ ...prev, isLoading: true, selectedChart: chart }));

    try {
      const result = await StandardSizesService.getStandardSizes(chart.size_chart_id);
      
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          availableSizes: result.data!.sizes,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to load sizes',
          isLoading: false
        }));
      }
    } catch (_error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load sizes',
        isLoading: false
      }));
    }
  }, []);

  // Load filters when garment type changes
  useEffect(() => {
    if (garmentType) {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, garment_type: garmentType },
        availableCharts: [],
        availableSizes: [],
        selectedChart: undefined
      }));
      loadAvailableFilters();
    }
  }, [garmentType, loadAvailableFilters]);

  // Load charts when filters change
  useEffect(() => {
    loadSizeCharts();
  }, [loadSizeCharts]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (filterType: keyof AppliedSizeFilters, value: string) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value
      },
      availableCharts: [],
      availableSizes: [],
      selectedChart: undefined
    }));
  };

  /**
   * Handle chart selection
   */
  const handleChartSelection = (chart: StandardSizeChart) => {
    loadSizesForChart(chart);
  };

  /**
   * Handle size selection
   */
  const handleSizeSelection = (size: StandardSize) => {
    onSizeSelected(size.standard_size_id, formatSizeLabel(size));
  };

  const showLoading = state.isLoading || isLoading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Age Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('measurements.standardSizes.ageCategory', 'Age Category')}
          </label>
          <select
            value={state.filters.age_category || ''}
            onChange={(e) => handleFilterChange('age_category', e.target.value as AgeCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={showLoading}
          >
            <option value="">{t('common.select', 'Select...')}</option>
            {state.availableFilters?.age_categories.map(category => (
              <option key={category} value={category}>
                {t(`measurements.standardSizes.ageCategoryLabels.${category.toLowerCase()}`, category)}
              </option>
            ))}
          </select>
        </div>

        {/* Target Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('measurements.standardSizes.targetGroup', 'Target Group')}
          </label>
          <select
            value={state.filters.target_group || ''}
            onChange={(e) => handleFilterChange('target_group', e.target.value as TargetGroup)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={showLoading}
          >
            <option value="">{t('common.select', 'Select...')}</option>
            {state.availableFilters?.target_groups.map(group => (
              <option key={group} value={group}>
                {t(`measurements.standardSizes.targetGroupLabels.${group.toLowerCase()}`, group)}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('measurements.standardSizes.region', 'Size System')}
          </label>
          <select
            value={state.filters.region || ''}
            onChange={(e) => handleFilterChange('region', e.target.value as SizeRegion)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={showLoading}
          >
            <option value="">{t('common.select', 'Select...')}</option>
            {state.availableFilters?.regions.map(region => (
              <option key={region} value={region}>
                {t(`measurements.standardSizes.regionLabels.${region.toLowerCase()}`, region)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {showLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">{t('common.loading', 'Loading...')}</p>
        </div>
      )}

      {/* Size Charts */}
      {state.availableCharts.length > 0 && !showLoading && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('measurements.standardSizes.availableCharts', 'Available Size Charts')}
          </label>
          <div className="space-y-2">
            {state.availableCharts.map(chart => (
              <button
                key={chart.size_chart_id}
                onClick={() => handleChartSelection(chart)}
                className={`w-full px-4 py-3 text-left border rounded-md transition-colors ${
                  state.selectedChart?.size_chart_id === chart.size_chart_id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{chart.chart_name}</div>
                <div className="text-sm text-gray-600">{getChartDisplayName(chart)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Standard Sizes */}
      {state.availableSizes.length > 0 && state.selectedChart && !showLoading && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('measurements.standardSizes.selectSize', 'Select Size')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {state.availableSizes.map(size => (
              <button
                key={size.standard_size_id}
                onClick={() => handleSizeSelection(size)}
                className={`px-4 py-3 text-center border rounded-md transition-colors ${
                  selectedSizeId === size.standard_size_id
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{formatSizeLabel(size)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {!showLoading && state.filters.age_category && state.filters.target_group && state.filters.region && state.availableCharts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('measurements.standardSizes.noChartsFound', 'No size charts found for the selected filters.')}</p>
        </div>
      )}
    </div>
  );
}; 