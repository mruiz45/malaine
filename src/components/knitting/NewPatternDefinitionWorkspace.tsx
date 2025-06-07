/**
 * New Pattern Definition Workspace (PD_PH1_US001)
 * Complete rewrite with garment-centric approach and dynamic section loading
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';
import { SECTION_METADATA } from '@/utils/garmentTypeConfig';
import PatternDefinitionNavigation from './PatternDefinitionNavigation';
import GarmentTypeSelector from './GarmentTypeSelector';
import Preview3D from './Preview3D';
import { GarmentType } from '@/types/garment';

// Import all the selector components
import { GaugeSelector } from '@/components/gauge';
import { MeasurementSelector } from '@/components/measurements';
import { EaseSelector } from '@/components/ease';
import { YarnSelector } from '@/components/yarn';

// Import necessary types
import type { GaugeProfile } from '@/types/gauge';
import type { MeasurementSet } from '@/types/measurements';
import type { EasePreference, EaseType } from '@/types/ease';
import type { YarnProfile } from '@/types/yarn';

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
}

function SectionHeader({ title, description, isRequired, isCompleted }: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center space-x-2">
          {isRequired && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {t('common.required', 'Required')}
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('common.completed', 'Completed')}
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

/**
 * Section Content Component
 * Renders the appropriate content based on the current section
 */
interface SectionContentProps {
  section: PatternDefinitionSection;
  garmentTypeKey: string;
}

function SectionContent({ section, garmentTypeKey }: SectionContentProps) {
  const { t } = useTranslation();
  const { state, updateSectionData, markSectionCompleted } = useInMemoryPatternDefinition();
  const { currentPattern, navigation } = state;

  // Get section metadata for display
  const isRequired = navigation.requiredSections.includes(section);
  const isCompleted = navigation.completedSections.includes(section);
  const metadata = SECTION_METADATA[section];

  // Handler to update section data and mark as completed
  const handleSectionUpdate = (data: any, completed: boolean = false) => {
    updateSectionData(section, { ...data, isCompleted: completed });
    if (completed) {
      markSectionCompleted(section);
    }
  };

  // Section handlers with debounce to handle multiple rapid calls
  const [gaugeUpdateTimeout, setGaugeUpdateTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const [easeUpdateTimeout, setEaseUpdateTimeout] = React.useState<NodeJS.Timeout | null>(null);
  
  const handleGaugeProfileSelect = (gaugeProfile: GaugeProfile | null) => {
    // Clear any existing timeout
    if (gaugeUpdateTimeout) {
      clearTimeout(gaugeUpdateTimeout);
    }
    
    // Set a new timeout to process the update after a short delay
    const timeout = setTimeout(() => {
      if (gaugeProfile) {
        handleSectionUpdate({
          type: 'profile',
          selectedGaugeProfile: gaugeProfile,
          stitch_count: gaugeProfile.stitch_count,
          row_count: gaugeProfile.row_count,
          unit: gaugeProfile.measurement_unit === 'cm' ? '10cm' : '4inch'
        }, true);
      } else {
        // Only clear if we don't have a recent valid selection
        const currentGaugeData = getSectionData('gauge') as any;
        if (!currentGaugeData?.selectedGaugeProfile) {
          handleSectionUpdate({ type: 'profile', selectedGaugeProfile: null }, false);
        }
      }
    }, 100); // 100ms debounce
    
    setGaugeUpdateTimeout(timeout);
  };

  const handleManualGaugeChange = (gauge: { stitch_count: number; row_count: number; unit: string } | null) => {
    if (gauge) {
      handleSectionUpdate({
        type: 'manual',
        stitch_count: gauge.stitch_count,
        row_count: gauge.row_count,
        unit: gauge.unit
      }, true);
    } else {
      handleSectionUpdate({ type: 'manual' }, false);
    }
  };

  // Measurement section handlers
  const handleMeasurementSetSelect = (measurementSet: MeasurementSet | null) => {
    if (measurementSet) {
      // Format data for use3DPreview compatibility
      const measurementData = {
        bust: measurementSet.chest_circumference,
        waist: measurementSet.waist_circumference,
        hip: measurementSet.hip_circumference,
        length: measurementSet.torso_length,
        sleeveLength: measurementSet.arm_length,
        shoulderWidth: measurementSet.shoulder_width,
        armholeDepth: undefined, // Calculate or set default
        necklineDepth: undefined, // Calculate or set default
        necklineWidth: undefined // Calculate or set default
      };

      handleSectionUpdate({
        selectedMeasurementSet: measurementSet,
        measurements: measurementData, // Format attendu par use3DPreview
        unit: measurementSet.measurement_unit
      }, true);
    } else {
      handleSectionUpdate({ 
        selectedMeasurementSet: null,
        measurements: null,
        unit: null
      }, false);
    }
  };

  // Ease section handlers
  const handleEasePreferenceSelect = (easePreference: EasePreference | null) => {
    // Clear any existing timeout
    if (easeUpdateTimeout) {
      clearTimeout(easeUpdateTimeout);
    }

    // If we have a valid ease preference, process it after a short delay
    if (easePreference) {
      const newTimeout = setTimeout(() => {
        handleSectionUpdate({
          type: 'preference',
          selectedEasePreference: easePreference,
          ease_type: easePreference.ease_type,
          value_bust: easePreference.bust_ease,
          unit: easePreference.measurement_unit
        }, true);
      }, 100);
      
      setEaseUpdateTimeout(newTimeout);
    }
    // Ignore null values when we have a pending valid update
  };

  const handleQuickEaseChange = (ease: { type: EaseType; value_bust: number; unit?: string } | null) => {
    if (ease) {
      handleSectionUpdate({
        type: 'quick',
        ease_type: ease.type,
        value_bust: ease.value_bust,
        unit: ease.unit
      }, true);
    } else {
      handleSectionUpdate({ type: 'quick' }, false);
    }
  };

  // Yarn section handlers
  const handleYarnProfileSelect = (yarnProfile: YarnProfile | null) => {
    if (yarnProfile) {
      handleSectionUpdate({
        selectedYarnProfile: yarnProfile,
        yarn_name: yarnProfile.yarn_name,
        brand_name: yarnProfile.brand_name,
        yarn_weight_category: yarnProfile.yarn_weight_category
      }, true);
    } else {
      handleSectionUpdate({ selectedYarnProfile: null }, false);
    }
  };

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return () => {
      if (gaugeUpdateTimeout) {
        clearTimeout(gaugeUpdateTimeout);
      }
      if (easeUpdateTimeout) {
        clearTimeout(easeUpdateTimeout);
      }
    };
  }, [gaugeUpdateTimeout, easeUpdateTimeout]);

  // Get current section data
  const getSectionData = (sectionKey: PatternDefinitionSection) => {
    return currentPattern?.[sectionKey as keyof typeof currentPattern] || null;
  };

  const renderSectionContent = () => {
    switch (section) {
      case 'gauge': {
        const gaugeData = getSectionData('gauge') as any;
        return (
          <GaugeSelector
            selectedGaugeProfile={gaugeData?.selectedGaugeProfile || null}
            onGaugeProfileSelect={handleGaugeProfileSelect}
            allowManualInput={true}
            manualGauge={gaugeData?.type === 'manual' ? {
              stitch_count: gaugeData.stitch_count || 20,
              row_count: gaugeData.row_count || 28,
              unit: gaugeData.unit || '10cm'
            } : null}
            onManualGaugeChange={handleManualGaugeChange}
            disabled={false}
            className="w-full"
          />
        );
      }

      case 'measurements': {
        const measurementData = getSectionData('measurements') as any;
        return (
          <MeasurementSelector
            selectedMeasurementSet={measurementData?.selectedMeasurementSet || null}
            onMeasurementSetSelect={handleMeasurementSetSelect}
            disabled={false}
            className="w-full"
          />
        );
      }

      case 'ease': {
        const easeData = getSectionData('ease') as any;
        return (
          <EaseSelector
            selectedEasePreference={easeData?.selectedEasePreference || null}
            onEasePreferenceSelect={handleEasePreferenceSelect}
            allowQuickSelection={true}
            quickEase={easeData?.type === 'quick' ? {
              type: easeData.ease_type,
              value_bust: easeData.value_bust,
              unit: easeData.unit
            } : null}
            onQuickEaseChange={handleQuickEaseChange}
            disabled={false}
            className="w-full"
          />
        );
      }

      case 'yarn': {
        const yarnData = getSectionData('yarn') as any;
        return (
          <YarnSelector
            selectedYarnProfile={yarnData?.selectedYarnProfile || null}
            onYarnProfileSelect={handleYarnProfileSelect}
            disabled={false}
            className="w-full"
          />
        );
      }

      default: {
        // For sections that don't have selectors yet (stitch-pattern, body-structure, etc.)
        return (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t(`sections.${section}.placeholder.title`, `${metadata.displayName} Configuration`)}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {t(`sections.${section}.placeholder.description`, 
                  `This is where you would configure the ${metadata.displayName.toLowerCase()} for your ${garmentTypeKey} pattern.`
                )}
              </p>
              
              {/* Show current data if any */}
              {currentPattern && currentPattern[section as keyof typeof currentPattern] && (
                <div className="bg-white rounded p-4 mb-4">
                  <h4 className="font-medium mb-2">{t('common.currentData', 'Current Data')}:</h4>
                  <pre className="text-xs text-gray-600 text-left overflow-auto">
                    {JSON.stringify(currentPattern[section as keyof typeof currentPattern], null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Mock interaction */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded p-4">
                  <p className="text-sm text-gray-500 mb-3">
                    {t('common.placeholderInfo', 'This component will be implemented in a future phase.')}
                  </p>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => handleSectionUpdate({}, true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      {t('common.markCompleted', 'Mark as Completed')}
                    </button>
                  )}
                  
                  {isCompleted && (
                    <div className="flex items-center justify-center text-green-600">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('common.completed', 'Completed')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div>
      <SectionHeader
        title={metadata.displayName}
        description={metadata.description}
        isRequired={isRequired}
        isCompleted={isCompleted}
      />
      
      {/* Render the appropriate selector or placeholder */}
      <div className="space-y-6">
        {renderSectionContent()}
      </div>
      
      {/* Special handling for summary section */}
      {section === 'summary' && (
        <div className="mt-8 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t('summary.patternOverview', 'Pattern Overview')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">{t('summary.garmentType', 'Garment Type')}: </span>
              <span className="capitalize">{garmentTypeKey}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.sessionName', 'Session Name')}: </span>
              <span>{currentPattern?.sessionName}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.created', 'Created')}: </span>
              <span>{currentPattern?.createdAt.toLocaleString()}</span>
            </div>
            
            <div>
              <span className="font-medium">{t('summary.lastUpdated', 'Last Updated')}: </span>
              <span>{currentPattern?.updatedAt.toLocaleString()}</span>
            </div>
            
            {/* Progress Status */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-2">{t('summary.progress', 'Progress')}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>
                  <span>{t('summary.completedSections', 'Completed sections')}: </span>
                  <span className="font-medium">{navigation.completedSections.length} / {navigation.availableSections.length}</span>
                </div>
                <div>
                  <span>{t('summary.requiredSections', 'Required sections')}: </span>
                  <span className="font-medium">
                    {navigation.requiredSections.filter(s => navigation.completedSections.includes(s)).length} / {navigation.requiredSections.length}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Available sections */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">{t('summary.availableSections', 'Available Sections')}</h4>
              <div className="flex flex-wrap gap-2">
                {navigation.availableSections.map((sectionKey) => {
                  const sectionMeta = SECTION_METADATA[sectionKey];
                  const completed = navigation.completedSections.includes(sectionKey);
                  const required = navigation.requiredSections.includes(sectionKey);
                  
                  return (
                    <span
                      key={sectionKey}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        completed 
                          ? 'bg-green-100 text-green-800' 
                          : required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {sectionMeta.displayName}
                      {required && ' *'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main New Pattern Definition Workspace Component
 */
export default function NewPatternDefinitionWorkspace() {
  const { t } = useTranslation();
  const { state, selectGarmentType } = useInMemoryPatternDefinition();
  
  const { currentPattern, navigation, isLoading, error } = state;
  const { currentSection } = navigation;

  /**
   * Handle garment type selection
   */
  const handleGarmentTypeSelect = (garmentType: GarmentType) => {
    selectGarmentType(garmentType.type_key);
  };

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-4">
                {t('common.error', 'Error')}
              </h2>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render garment type selection if no pattern or no garment type selected
   */
  if (!currentPattern || !currentPattern.garmentType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('patternDefinition.newWorkspace.title', 'Pattern Definition')}
              </h1>
              <p className="text-gray-600">
                {t('patternDefinition.newWorkspace.subtitle', 'Create your knitting pattern step by step')}
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8">
              <GarmentTypeSelector
                selectedGarmentTypeId={undefined}
                onGarmentTypeSelect={handleGarmentTypeSelect}
                disabled={false}
                isLoading={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render main workspace with navigation and section content
   */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentPattern.sessionName}
                </h1>
                <p className="text-gray-600 capitalize">
                  {currentPattern.garmentType?.replace('_', ' ')}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {t('common.lastUpdated', 'Last updated')}: {currentPattern.updatedAt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <div className="sticky top-8">
                <PatternDefinitionNavigation variant="sidebar" />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-6 order-1 xl:order-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                {currentSection ? (
                  <SectionContent 
                    section={currentSection} 
                    garmentTypeKey={currentPattern.garmentType} 
                  />
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('patternDefinition.noSectionSelected', 'No Section Selected')}
                    </h2>
                    <p className="text-gray-600">
                      {t('patternDefinition.selectSectionFromNavigation', 'Please select a section from the navigation panel to begin.')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3D Preview Area */}
            <div className="xl:col-span-4 order-3">
              <div className="sticky top-8">
                <Preview3D />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 