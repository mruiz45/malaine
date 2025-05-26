'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CalculatorIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { 
  YarnQuantityEstimationInput,
  YarnQuantityEstimation,
  ProjectType,
  GarmentSize,
  DimensionUnit,
  EstimationGaugeInfo,
  EstimationYarnInfo,
  FormattedEstimationResults
} from '@/types/yarnQuantityEstimator';
import type { GaugeProfile } from '@/types/gauge';
import type { YarnProfile, YarnWeightCategory } from '@/types/yarn';
import { 
  estimateYarnQuantity, 
  formatEstimationResults,
  getProjectTypeDisplayName,
  getGarmentSizeDisplayName
} from '@/services/yarnQuantityEstimatorService';
import { getGaugeProfiles } from '@/services/gaugeService';
import { getYarnProfiles } from '@/services/yarnProfileService';
import { getProjectTypeConfig } from '@/utils/yarnEstimationConstants';

/**
 * Yarn Quantity Estimator Tool Component (US_2.2)
 * Provides estimation of yarn requirements based on gauge, yarn, and project specifications
 */
export default function YarnQuantityEstimator() {
  const { t } = useTranslation();

  // State for form inputs
  const [projectType, setProjectType] = useState<ProjectType>('scarf');
  const [garmentSize, setGarmentSize] = useState<GarmentSize>('M');
  const [dimensions, setDimensions] = useState({
    width: 20,
    length: 150,
    unit: 'cm' as DimensionUnit
  });

  // Gauge selection state
  const [gaugeMode, setGaugeMode] = useState<'profile' | 'manual'>('profile');
  const [selectedGaugeProfile, setSelectedGaugeProfile] = useState<string>('');
  const [manualGauge, setManualGauge] = useState<EstimationGaugeInfo>({
    stitch_count: 20,
    row_count: 28,
    measurement_unit: 'cm',
    swatch_width: 10,
    swatch_height: 10
  });

  // Yarn selection state
  const [yarnMode, setYarnMode] = useState<'profile' | 'manual'>('profile');
  const [selectedYarnProfile, setSelectedYarnProfile] = useState<string>('');
  const [manualYarn, setManualYarn] = useState<EstimationYarnInfo>({
    yarn_weight_category: 'Worsted',
    skein_meterage: 200,
    skein_weight_grams: 100
  });

  // Data state
  const [gaugeProfiles, setGaugeProfiles] = useState<GaugeProfile[]>([]);
  const [yarnProfiles, setYarnProfiles] = useState<YarnProfile[]>([]);
  const [estimation, setEstimation] = useState<YarnQuantityEstimation | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // Update dimensions when project type changes
  useEffect(() => {
    const config = getProjectTypeConfig(projectType);
    if (config.default_dimensions) {
      setDimensions(config.default_dimensions);
    }
  }, [projectType]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const [gaugeData, yarnData] = await Promise.all([
        getGaugeProfiles(),
        getYarnProfiles()
      ]);
      setGaugeProfiles(gaugeData);
      setYarnProfiles(yarnData);
    } catch (err) {
      console.error('Error loading profiles:', err);
      setError(t('tools.yarn_quantity_estimator.messages.loading_profiles'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEstimate = async () => {
    setIsEstimating(true);
    setError(null);

    try {
      const config = getProjectTypeConfig(projectType);
      
      const input: YarnQuantityEstimationInput = {
        project_type: projectType,
        gauge_profile_id: gaugeMode === 'profile' ? selectedGaugeProfile : undefined,
        gauge_info: gaugeMode === 'manual' ? manualGauge : undefined,
        yarn_profile_id: yarnMode === 'profile' ? selectedYarnProfile : undefined,
        yarn_info: yarnMode === 'manual' ? manualYarn : undefined,
        dimensions: config.requires_dimensions ? dimensions : undefined,
        garment_size: config.requires_size ? garmentSize : undefined
      };

      const result = await estimateYarnQuantity(input);
      setEstimation(result);
    } catch (err) {
      console.error('Error estimating yarn quantity:', err);
      setError(err instanceof Error ? err.message : t('tools.yarn_quantity_estimator.messages.estimation_error'));
    } finally {
      setIsEstimating(false);
    }
  };

  const handleReset = () => {
    setProjectType('scarf');
    setGarmentSize('M');
    setDimensions({ width: 20, length: 150, unit: 'cm' });
    setGaugeMode('profile');
    setSelectedGaugeProfile('');
    setYarnMode('profile');
    setSelectedYarnProfile('');
    setEstimation(null);
    setError(null);
  };

  const projectConfig = getProjectTypeConfig(projectType);
  const formattedResults = estimation ? formatEstimationResults(estimation) : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CalculatorIcon className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            {t('tools.yarn_quantity_estimator.title')}
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {t('tools.yarn_quantity_estimator.description')}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          {t('tools.yarn_quantity_estimator.subtitle')}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Gauge Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tools.yarn_quantity_estimator.gauge_section')}
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="profile"
                    checked={gaugeMode === 'profile'}
                    onChange={(e) => setGaugeMode(e.target.value as 'profile' | 'manual')}
                    className="mr-2"
                  />
                  {t('tools.yarn_quantity_estimator.gauge_selection.use_saved_profile')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={gaugeMode === 'manual'}
                    onChange={(e) => setGaugeMode(e.target.value as 'profile' | 'manual')}
                    className="mr-2"
                  />
                  {t('tools.yarn_quantity_estimator.gauge_selection.enter_manually')}
                </label>
              </div>

              {gaugeMode === 'profile' ? (
                <div>
                  <select
                    value={selectedGaugeProfile}
                    onChange={(e) => setSelectedGaugeProfile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">
                      {isLoading 
                        ? t('tools.yarn_quantity_estimator.messages.loading_profiles')
                        : t('tools.yarn_quantity_estimator.gauge_selection.select_profile')
                      }
                    </option>
                    {gaugeProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.profile_name} ({profile.stitch_count}st, {profile.row_count}r)
                      </option>
                    ))}
                  </select>
                  {gaugeProfiles.length === 0 && !isLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t('tools.yarn_quantity_estimator.gauge_selection.no_profiles')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_gauge.stitch_count')}
                    </label>
                    <input
                      type="number"
                      value={manualGauge.stitch_count}
                      onChange={(e) => setManualGauge(prev => ({ ...prev, stitch_count: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_gauge.row_count')}
                    </label>
                    <input
                      type="number"
                      value={manualGauge.row_count}
                      onChange={(e) => setManualGauge(prev => ({ ...prev, row_count: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_gauge.swatch_width')}
                    </label>
                    <input
                      type="number"
                      value={manualGauge.swatch_width}
                      onChange={(e) => setManualGauge(prev => ({ ...prev, swatch_width: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_gauge.swatch_height')}
                    </label>
                    <input
                      type="number"
                      value={manualGauge.swatch_height}
                      onChange={(e) => setManualGauge(prev => ({ ...prev, swatch_height: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_gauge.measurement_unit')}
                    </label>
                    <select
                      value={manualGauge.measurement_unit}
                      onChange={(e) => setManualGauge(prev => ({ ...prev, measurement_unit: e.target.value as DimensionUnit }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cm">{t('tools.yarn_quantity_estimator.dimensions.cm')}</option>
                      <option value="inch">{t('tools.yarn_quantity_estimator.dimensions.inch')}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Yarn Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tools.yarn_quantity_estimator.yarn_section')}
            </h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="profile"
                    checked={yarnMode === 'profile'}
                    onChange={(e) => setYarnMode(e.target.value as 'profile' | 'manual')}
                    className="mr-2"
                  />
                  {t('tools.yarn_quantity_estimator.yarn_selection.use_saved_profile')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="manual"
                    checked={yarnMode === 'manual'}
                    onChange={(e) => setYarnMode(e.target.value as 'profile' | 'manual')}
                    className="mr-2"
                  />
                  {t('tools.yarn_quantity_estimator.yarn_selection.enter_manually')}
                </label>
              </div>

              {yarnMode === 'profile' ? (
                <div>
                  <select
                    value={selectedYarnProfile}
                    onChange={(e) => setSelectedYarnProfile(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="">
                      {isLoading 
                        ? t('tools.yarn_quantity_estimator.messages.loading_profiles')
                        : t('tools.yarn_quantity_estimator.yarn_selection.select_profile')
                      }
                    </option>
                    {yarnProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.yarn_name} ({profile.yarn_weight_category})
                      </option>
                    ))}
                  </select>
                  {yarnProfiles.length === 0 && !isLoading && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t('tools.yarn_quantity_estimator.yarn_selection.no_profiles')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('tools.yarn_quantity_estimator.manual_yarn.yarn_weight_category')}
                    </label>
                    <select
                      value={manualYarn.yarn_weight_category || ''}
                      onChange={(e) => setManualYarn(prev => ({ ...prev, yarn_weight_category: e.target.value as YarnWeightCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Lace">{t('yarnProfile.weight_categories.lace')}</option>
                      <option value="Fingering">{t('yarnProfile.weight_categories.fingering')}</option>
                      <option value="DK">{t('yarnProfile.weight_categories.dk')}</option>
                      <option value="Worsted">{t('yarnProfile.weight_categories.worsted')}</option>
                      <option value="Bulky">{t('yarnProfile.weight_categories.bulky')}</option>
                      <option value="Super Bulky">{t('yarnProfile.weight_categories.super_bulky')}</option>
                      <option value="Jumbo">{t('yarnProfile.weight_categories.jumbo')}</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.yarn_quantity_estimator.manual_yarn.skein_meterage')}
                      </label>
                      <input
                        type="number"
                        value={manualYarn.skein_meterage || ''}
                        onChange={(e) => setManualYarn(prev => ({ ...prev, skein_meterage: Number(e.target.value) || undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('tools.yarn_quantity_estimator.manual_yarn.optional')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('tools.yarn_quantity_estimator.manual_yarn.skein_weight_grams')}
                      </label>
                      <input
                        type="number"
                        value={manualYarn.skein_weight_grams || ''}
                        onChange={(e) => setManualYarn(prev => ({ ...prev, skein_weight_grams: Number(e.target.value) || undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('tools.yarn_quantity_estimator.manual_yarn.optional')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Project Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('tools.yarn_quantity_estimator.project_section')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tools.yarn_quantity_estimator.project_types.title')}
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scarf">{t('tools.yarn_quantity_estimator.project_types.scarf')}</option>
                  <option value="baby_blanket">{t('tools.yarn_quantity_estimator.project_types.baby_blanket')}</option>
                  <option value="simple_hat">{t('tools.yarn_quantity_estimator.project_types.simple_hat')}</option>
                  <option value="adult_sweater">{t('tools.yarn_quantity_estimator.project_types.adult_sweater')}</option>
                </select>
              </div>

              {projectConfig.requires_size && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('tools.yarn_quantity_estimator.garment_sizes.title')}
                  </label>
                  <select
                    value={garmentSize}
                    onChange={(e) => setGarmentSize(e.target.value as GarmentSize)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="S">{t('tools.yarn_quantity_estimator.garment_sizes.S')}</option>
                    <option value="M">{t('tools.yarn_quantity_estimator.garment_sizes.M')}</option>
                    <option value="L">{t('tools.yarn_quantity_estimator.garment_sizes.L')}</option>
                    <option value="XL">{t('tools.yarn_quantity_estimator.garment_sizes.XL')}</option>
                  </select>
                </div>
              )}

              {projectConfig.requires_dimensions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tools.yarn_quantity_estimator.dimensions.title')}
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('tools.yarn_quantity_estimator.dimensions.width')}
                      </label>
                      <input
                        type="number"
                        value={dimensions.width}
                        onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('tools.yarn_quantity_estimator.dimensions.length')}
                      </label>
                      <input
                        type="number"
                        value={dimensions.length}
                        onChange={(e) => setDimensions(prev => ({ ...prev, length: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        {t('tools.yarn_quantity_estimator.dimensions.unit')}
                      </label>
                      <select
                        value={dimensions.unit}
                        onChange={(e) => setDimensions(prev => ({ ...prev, unit: e.target.value as DimensionUnit }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="cm">{t('tools.yarn_quantity_estimator.dimensions.cm')}</option>
                        <option value="inch">{t('tools.yarn_quantity_estimator.dimensions.inch')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleEstimate}
              disabled={isEstimating || isLoading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isEstimating ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  {t('tools.yarn_quantity_estimator.estimating')}
                </>
              ) : (
                <>
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  {t('tools.yarn_quantity_estimator.estimate')}
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={isEstimating}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('tools.yarn_quantity_estimator.reset')}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {formattedResults && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('tools.yarn_quantity_estimator.results_section')}
              </h2>
              
              <div className="space-y-4">
                {/* Main Results */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">
                      {t('tools.yarn_quantity_estimator.results.total_length')}
                    </h3>
                    <p className="text-2xl font-bold text-blue-700">
                      {formattedResults.totalLength.meters} {t('tools.yarn_quantity_estimator.results.meters')}
                    </p>
                    <p className="text-sm text-blue-600">
                      ({formattedResults.totalLength.yards} {t('tools.yarn_quantity_estimator.results.yards')})
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">
                      {t('tools.yarn_quantity_estimator.results.total_weight')}
                    </h3>
                    <p className="text-2xl font-bold text-green-700">
                      {formattedResults.totalWeight.grams} {t('tools.yarn_quantity_estimator.results.grams')}
                    </p>
                    <p className="text-sm text-green-600">
                      ({formattedResults.totalWeight.ounces} {t('tools.yarn_quantity_estimator.results.ounces')})
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">
                      {t('tools.yarn_quantity_estimator.results.number_of_skeins')}
                    </h3>
                    <p className="text-2xl font-bold text-purple-700">
                      {formattedResults.numberOfSkeins} {t('tools.yarn_quantity_estimator.results.skeins')}
                    </p>
                  </div>
                </div>

                {/* Calculation Details */}
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {t('tools.yarn_quantity_estimator.results.calculation_details')}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">
                        {t('tools.yarn_quantity_estimator.results.surface_area')}:
                      </span>
                      <span className="ml-2 font-medium">
                        {formattedResults.surfaceArea} {t('tools.yarn_quantity_estimator.results.square_meters')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {t('tools.yarn_quantity_estimator.results.buffer_included')}:
                      </span>
                      <span className="ml-2 font-medium">
                        {formattedResults.bufferPercentage}%
                      </span>
                    </div>
                    {formattedResults.yarnWeightUsed && (
                      <div className="col-span-2">
                        <span className="text-gray-600">
                          {t('tools.yarn_quantity_estimator.results.yarn_weight_used')}:
                        </span>
                        <span className="ml-2 font-medium">
                          {formattedResults.yarnWeightUsed}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900 mb-2">
                  {t('tools.yarn_quantity_estimator.disclaimer.title')}
                </h3>
                <p className="text-amber-800 text-sm mb-3">
                  {t('tools.yarn_quantity_estimator.disclaimer.content')}
                </p>
                <ul className="text-amber-700 text-sm space-y-1 mb-3">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Stitch pattern complexity</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Individual knitting/crochet tension</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Exact project sizing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Yarn characteristics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pattern modifications</span>
                  </li>
                </ul>
                <p className="text-amber-800 text-sm font-medium">
                  {t('tools.yarn_quantity_estimator.disclaimer.recommendation')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 