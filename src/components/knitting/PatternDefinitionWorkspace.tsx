'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import DefinitionStepper from './DefinitionStepper';
import DefinitionSummary from './DefinitionSummary';
import SessionHeader from './SessionHeader';
import GarmentTypeSelector from './GarmentTypeSelector';
import SweaterStructureSelector from './SweaterStructureSelector';
import NecklineSelector from './NecklineSelector';
import SleeveSelector from './SleeveSelector';
import BeanieDefinitionForm from './BeanieDefinitionForm';
import ScarfCowlDefinitionForm from './ScarfCowlDefinitionForm';
import ColorSchemeSimulator from '../tools/ColorSchemeSimulator';
import PatternOutlineViewer from './PatternOutlineViewer';
import StitchIntegrationAdvisor from './StitchIntegrationAdvisor';
import StitchPatternSelector from './StitchPatternSelector';
import { GarmentType } from '@/types/garment';
import { ConstructionMethod, BodyShape, SweaterStructureAttributes } from '@/types/sweaterStructure';
import { NecklineStyle, NecklineParameters, NecklineAttributes } from '@/types/neckline';
import { SleeveStyle, SleeveLength, CuffStyle, SleeveAttributes, CuffParameters } from '@/types/sleeve';
import { BeanieAttributes, ScarfCowlAttributes } from '@/types/accessories';
import { ColorScheme } from '@/types/colorScheme';
import { PatternOutline } from '@/types/patternDefinition';
import { ComponentForIntegration } from '@/types/stitch-integration';
import { patternDefinitionService } from '@/services/patternDefinitionService';
import { SwatchIcon, DocumentTextIcon, SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { MeasurementSelector } from '@/components/measurements';
import { YarnSelector } from '@/components/yarn';
import { GaugeSelector } from '@/components/gauge';
import { EaseSelector } from '@/components/ease';
import { MeasurementSet } from '@/types/measurements';
import { YarnProfile } from '@/types/yarn';
import { GaugeProfile } from '@/types/gauge';
import { EasePreference, EaseType } from '@/types/ease';
import { StitchPattern, CraftType } from '@/types/stitchPattern';

/**
 * Pattern Definition Workspace Component (US_1.6)
 * Main workspace for pattern definition sessions
 */
export default function PatternDefinitionWorkspace() {
  const { t } = useTranslation();
  const {
    currentSession,
    navigation,
    isLoading,
    error
  } = usePatternDefinition();

  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              {t('patternDefinition.noSession', 'No Active Session')}
            </h2>
            <p className="text-yellow-700">
              {t('patternDefinition.noSessionDescription', 'Please create or select a pattern definition session to continue.')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Header */}
      <SessionHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-md">
                {/* Step Navigation */}
                <div className="border-b border-gray-200 p-6">
                  <DefinitionStepper />
                </div>

                {/* Step Content */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  ) : (
                    <StepContent currentStep={navigation.currentStep} />
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="sticky top-8">
                <DefinitionSummary />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step Content Component
 * Renders the appropriate content based on the current step
 */
function StepContent({ currentStep }: { currentStep: string }) {
  const { t } = useTranslation();
  const { currentSession, updateSession, navigation, previousStep, nextStep } = usePatternDefinition();
  
  // State for color scheme simulator
  const [showColorSimulator, setShowColorSimulator] = useState(false);

  // State for pattern outline viewer (US_5.3)
  const [showOutlineViewer, setShowOutlineViewer] = useState(false);
  const [currentOutline, setCurrentOutline] = useState<PatternOutline | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);

  // State for stitch integration advisor (US_8.2)
  const [showStitchIntegrationAdvisor, setShowStitchIntegrationAdvisor] = useState(false);

  // Mock data for available components (in real implementation, this would come from the session)
  const availableComponents: ComponentForIntegration[] = [
    {
      id: 'front-panel',
      name: 'Front Panel',
      target_stitch_count: 120
    },
    {
      id: 'back-panel', 
      name: 'Back Panel',
      target_stitch_count: 120
    },
    {
      id: 'left-sleeve',
      name: 'Left Sleeve',
      target_stitch_count: 80
    },
    {
      id: 'right-sleeve',
      name: 'Right Sleeve', 
      target_stitch_count: 80
    }
  ];

  const handleGaugeProfileSelect = async (gaugeProfile: GaugeProfile | null) => {
    await updateSession({
      selected_gauge_profile_id: gaugeProfile?.id || undefined
    });
  };

  const handleManualGaugeChange = async (gauge: { stitch_count: number; row_count: number; unit: string } | null) => {
    await updateSession({
      gauge_stitch_count: gauge?.stitch_count || undefined,
      gauge_row_count: gauge?.row_count || undefined,
      gauge_unit: gauge?.unit || undefined
    });
  };

  const handleMeasurementSetSelect = async (measurementSet: MeasurementSet | null) => {
    await updateSession({
      selected_measurement_set_id: measurementSet?.id || undefined
    });
  };

  const handleEasePreferenceSelect = async (easePreference: EasePreference | null) => {
    await updateSession({
      ease_type: easePreference?.ease_type || undefined,
      ease_value_bust: easePreference?.bust_ease || undefined,
      ease_unit: easePreference?.measurement_unit || undefined
    });
  };

  const handleQuickEaseChange = async (ease: { type: EaseType; value_bust: number; unit?: string } | null) => {
    await updateSession({
      ease_type: ease?.type || undefined,
      ease_value_bust: ease?.value_bust || undefined,
      ease_unit: ease?.unit || undefined
    });
  };

  const handleYarnProfileSelect = async (yarnProfile: YarnProfile | null) => {
    await updateSession({
      selected_yarn_profile_id: yarnProfile?.id || undefined
    });
  };

  const handleStitchPatternSelect = async (stitchPattern: StitchPattern | null) => {
    await updateSession({
      selected_stitch_pattern_id: stitchPattern?.id || undefined
    });
  };

  const handleGarmentTypeSelect = async (garmentType: GarmentType) => {
    await updateSession({
      selected_garment_type_id: garmentType.id
    });
  };

  /**
   * Handle sweater structure selections (US_4.3)
   */
  const handleConstructionMethodSelect = async (method: ConstructionMethod) => {
    // For now, we'll store this in the session's parameter_snapshot
    // In a full implementation, this would be stored in pattern_definition_components
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sweaterStructure: SweaterStructureAttributes = {
      ...currentSnapshot.sweater_structure,
      construction_method: method
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      }
    });
  };

  const handleBodyShapeSelect = async (shape: BodyShape) => {
    // For now, we'll store this in the session's parameter_snapshot
    // In a full implementation, this would be stored in pattern_definition_components
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sweaterStructure: SweaterStructureAttributes = {
      ...currentSnapshot.sweater_structure,
      body_shape: shape
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sweater_structure: sweaterStructure
      }
    });
  };

  /**
   * Handle neckline selections (US_4.4)
   */
  const handleNecklineStyleSelect = async (style: NecklineStyle) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const neckline: NecklineAttributes = {
      ...currentSnapshot.neckline,
      style: style
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        neckline: neckline
      }
    });
  };

  const handleNecklineParametersUpdate = async (parameters: NecklineParameters) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const neckline: NecklineAttributes = {
      ...currentSnapshot.neckline,
      parameters: parameters
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        neckline: neckline
      }
    });
  };

  /**
   * Handle sleeve selections (US_4.5)
   */
  const handleSleeveStyleSelect = async (style: SleeveStyle) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      style: style
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  const handleSleeveLengthSelect = async (length: SleeveLength, customLength?: number) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      length_key: length,
      ...(length === 'custom' && customLength ? { custom_length_cm: customLength } : {})
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  const handleCuffStyleSelect = async (cuffStyle: CuffStyle, parameters?: CuffParameters) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    const sleeves: SleeveAttributes = {
      ...currentSnapshot.sleeves,
      cuff_style: cuffStyle,
      ...(parameters || {})
    };

    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        sleeves: sleeves
      }
    });
  };

  /**
   * Handle color scheme save (US_5.1)
   */
  const handleColorSchemeSave = async (colorScheme: ColorScheme) => {
    try {
      if (!currentSession?.id) {
        throw new Error('No active session');
      }

      await patternDefinitionService.saveColorScheme(currentSession.id, colorScheme);
      
      // Update the session's parameter_snapshot to include the color scheme
      const currentSnapshot = currentSession.parameter_snapshot || {};
      await updateSession({
        parameter_snapshot: {
          ...currentSnapshot,
          color_scheme: colorScheme
        }
      });

      setShowColorSimulator(false);
    } catch (error) {
      console.error('Error saving color scheme:', error);
      // Handle error appropriately
    }
  };

  /**
   * Handle beanie attributes update (US_7.1 - FR2)
   */
  const handleBeanieAttributesChange = async (attributes: BeanieAttributes) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        beanie: attributes
      }
    });
  };

  /**
   * Handle scarf/cowl attributes update (US_7.1 - FR3)
   */
  const handleScarfCowlAttributesChange = async (attributes: ScarfCowlAttributes) => {
    const currentSnapshot = currentSession?.parameter_snapshot || {};
    await updateSession({
      parameter_snapshot: {
        ...currentSnapshot,
        scarf_cowl: attributes
      }
    });
  };

  /**
   * Handle pattern outline generation (US_5.3)
   */
  const handleGenerateOutline = async () => {
    try {
      if (!currentSession?.id) {
        throw new Error('No active session');
      }

      setIsGeneratingOutline(true);
      const outline = await patternDefinitionService.generateOutline(currentSession.id);
      setCurrentOutline(outline);
      setShowOutlineViewer(true);
    } catch (error) {
      console.error('Error generating pattern outline:', error);
      // Handle error appropriately - could show a toast notification
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  /**
   * Handle closing the outline viewer
   */
  const handleCloseOutlineViewer = () => {
    setShowOutlineViewer(false);
    setCurrentOutline(null);
  };

  /**
   * Handle opening the stitch integration advisor (US_8.2)
   */
  const handleOpenStitchIntegrationAdvisor = () => {
    setShowStitchIntegrationAdvisor(true);
  };

  /**
   * Handle closing the stitch integration advisor
   */
  const handleCloseStitchIntegrationAdvisor = () => {
    setShowStitchIntegrationAdvisor(false);
  };

  /**
   * Handle successful stitch integration
   */
  const handleStitchIntegrationSuccess = (componentId: string, integration: any) => {
    console.log('Stitch integration applied successfully:', { componentId, integration });
    // In a real implementation, this would update the session state
    // For now, we'll just log the success
  };

  /**
   * Check if current step can proceed to next
   */
  const canProceedToNext = () => {
    const currentIndex = navigation.availableSteps.indexOf(currentStep as any);
    const isLastStep = currentIndex === navigation.availableSteps.length - 1;
    
    // Allow navigation to next step if current step is completed
    const isCurrentStepCompleted = navigation.completedSteps.includes(currentStep as any);
    
    return !isLastStep && isCurrentStepCompleted;
  };

  /**
   * Check if can go to previous step
   */
  const canGoToPrevious = () => {
    const currentIndex = navigation.availableSteps.indexOf(currentStep as any);
    return currentIndex > 0;
  };

  /**
   * Navigation buttons component
   */
  const NavigationButtons = () => (
    <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
      <button
        onClick={previousStep}
        disabled={!canGoToPrevious()}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
          canGoToPrevious()
            ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
        }`}
      >
        <ChevronLeftIcon className="h-4 w-4 mr-2" />
        {t('navigation.previous', 'Précédent')}
      </button>

      <div className="text-sm text-gray-500">
        Étape {navigation.availableSteps.indexOf(currentStep as any) + 1} sur {navigation.availableSteps.length}
      </div>

      <button
        onClick={nextStep}
        disabled={!canProceedToNext()}
        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
          canProceedToNext()
            ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
        }`}
      >
        {t('navigation.next', 'Suivant')}
        <ChevronRightIcon className="h-4 w-4 ml-2" />
      </button>
    </div>
  );

  switch (currentStep) {
    case 'garment-type':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('garmentType.title', 'Select Garment Type')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('garmentType.description', 'Choose the type of garment you want to create. This will determine the available configuration options.')}
          </p>
          <GarmentTypeSelector 
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            onGarmentTypeSelect={handleGarmentTypeSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'gauge':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('gauge.title', 'Gauge Information')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('gauge.description', 'Enter your gauge information. This is crucial for accurate pattern calculations.')}
          </p>
          <GaugeSelector
            selectedGaugeProfile={currentSession?.selected_gauge_profile_id ? {
              id: currentSession.selected_gauge_profile_id,
              profile_name: 'Selected Gauge Profile', // This would be fetched in a real implementation
              stitch_count: currentSession.gauge_stitch_count || 20,
              row_count: currentSession.gauge_row_count || 28,
              measurement_unit: 'cm',
              swatch_width: 10,
              swatch_height: 10,
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onGaugeProfileSelect={handleGaugeProfileSelect}
            manualGauge={currentSession?.gauge_stitch_count ? {
              stitch_count: currentSession.gauge_stitch_count,
              row_count: currentSession.gauge_row_count || 28,
              unit: currentSession.gauge_unit || '10cm'
            } : null}
            onManualGaugeChange={handleManualGaugeChange}
            onCreateNew={() => {
              // TODO: Navigate to gauge profile creation
              console.log('Create new gauge profile');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'measurements':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('measurements.title', 'Measurements')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('measurements.description', 'Select or enter your measurements. These will be used to calculate the pattern dimensions.')}
          </p>
          <MeasurementSelector
            selectedMeasurementSet={currentSession?.selected_measurement_set_id ? {
              id: currentSession.selected_measurement_set_id,
              set_name: 'Selected Measurement Set', // This would be fetched in a real implementation
              measurement_unit: 'cm',
              created_at: '',
              updated_at: '',
              user_id: ''
            } : null}
            onMeasurementSetSelect={handleMeasurementSetSelect}
            onCreateNew={() => {
              // TODO: Navigate to measurement set creation
              console.log('Create new measurement set');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'ease':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('ease.title', 'Ease Preferences')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('ease.description', 'Choose your ease preferences. This determines how fitted or loose your garment will be.')}
          </p>
          <EaseSelector
            selectedEasePreference={currentSession?.ease_type ? {
              id: 'current-ease',
              preference_name: 'Current Ease',
              ease_type: currentSession.ease_type as EaseType,
              bust_ease: currentSession.ease_value_bust || 5,
              measurement_unit: (currentSession.ease_unit || 'cm') as any,
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onEasePreferenceSelect={handleEasePreferenceSelect}
            quickEase={currentSession?.ease_type ? {
              type: currentSession.ease_type as EaseType,
              value_bust: currentSession.ease_value_bust || 5,
              unit: currentSession.ease_unit
            } : null}
            onQuickEaseChange={handleQuickEaseChange}
            onCreateNew={() => {
              // TODO: Navigate to ease preference creation
              console.log('Create new ease preference');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'yarn':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('yarn.title', 'Yarn Selection')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('yarn.description', 'Select your yarn. This information helps with pattern calculations and recommendations.')}
          </p>
          <YarnSelector
            selectedYarnProfile={currentSession?.selected_yarn_profile_id ? {
              id: currentSession.selected_yarn_profile_id,
              yarn_name: 'Selected Yarn', // This would be fetched in a real implementation
              brand_name: 'Selected Brand',
              yarn_weight_category: 'DK' as any,
              fiber_content: [{ fiber: 'Wool', percentage: 100 }],
              user_id: '',
              created_at: '',
              updated_at: ''
            } : null}
            onYarnProfileSelect={handleYarnProfileSelect}
            onCreateNew={() => {
              // TODO: Navigate to yarn profile creation
              console.log('Create new yarn profile');
            }}
          />
          <NavigationButtons />
        </div>
      );

    case 'stitch-pattern':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('stitchPattern.title', 'Stitch Pattern')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('stitchPattern.description', 'Choose your main stitch pattern. This will be used throughout the garment.')}
          </p>
          <StitchPatternSelector
            selectedPattern={currentSession?.selected_stitch_pattern_id ? {
              id: currentSession.selected_stitch_pattern_id,
              stitch_name: 'Selected Pattern', // This would be fetched in a real implementation
              craft_type: 'knitting' as CraftType,
              is_basic: true,
              created_at: '',
              updated_at: ''
            } : null}
            onPatternSelect={handleStitchPatternSelect}
            basicOnly={true}
          />
          <NavigationButtons />
        </div>
      );

    case 'garment-structure':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('garmentStructure.title', 'Garment Structure')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('garmentStructure.description', 'Define the construction method and body shape for your garment.')}
          </p>
          <SweaterStructureSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedBodyShape={currentSession?.parameter_snapshot?.sweater_structure?.body_shape}
            onConstructionMethodSelect={handleConstructionMethodSelect}
            onBodyShapeSelect={handleBodyShapeSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'neckline':
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('neckline.title', 'Neckline Style')}
          </h2>
          <p className="text-gray-600 mb-8">
            {t('neckline.description', 'Choose the neckline style and specify any custom parameters.')}
          </p>
          <NecklineSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedNecklineStyle={currentSession?.parameter_snapshot?.neckline?.style}
            selectedNecklineParameters={currentSession?.parameter_snapshot?.neckline?.parameters}
            onNecklineStyleSelect={handleNecklineStyleSelect}
            onNecklineParametersUpdate={handleNecklineParametersUpdate}
          />
          <NavigationButtons />
        </div>
      );

    case 'sleeves':
      return (
        <div>
          <SleeveSelector
            selectedGarmentTypeId={currentSession?.selected_garment_type_id}
            selectedConstructionMethod={currentSession?.parameter_snapshot?.sweater_structure?.construction_method}
            selectedSleeveAttributes={currentSession?.parameter_snapshot?.sleeves}
            onSleeveStyleSelect={handleSleeveStyleSelect}
            onSleeveLengthSelect={handleSleeveLengthSelect}
            onCuffStyleSelect={handleCuffStyleSelect}
          />
          <NavigationButtons />
        </div>
      );

    case 'accessory-definition':
      // For accessories like beanies and scarves/cowls
      const selectedGarmentType = currentSession?.garment_type?.type_key;
      
      if (selectedGarmentType === 'beanie') {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('beanie.title', 'Beanie Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('beanie.description', 'Define the specific parameters for your beanie.')}
            </p>
            <BeanieDefinitionForm
              selectedAttributes={currentSession?.parameter_snapshot?.beanie}
              onAttributesChange={handleBeanieAttributesChange}
            />
            <NavigationButtons />
          </div>
        );
      } else if (selectedGarmentType === 'scarf' || selectedGarmentType === 'cowl') {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('scarfCowl.title', 'Scarf/Cowl Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('scarfCowl.description', 'Define the specific parameters for your scarf or cowl.')}
            </p>
            <ScarfCowlDefinitionForm
              selectedAttributes={currentSession?.parameter_snapshot?.scarf_cowl}
              onAttributesChange={handleScarfCowlAttributesChange}
            />
            <NavigationButtons />
          </div>
        );
      } else {
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('accessoryDefinition.title', 'Accessory Definition')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('accessoryDefinition.notRequired', 'No additional accessory definition required for this garment type.')}
            </p>
            <NavigationButtons />
          </div>
        );
      }

    case 'summary':
      return (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('patternDefinition.summary.title', 'Pattern Definition Summary')}
            </h2>
            <p className="text-gray-600">
              {t('patternDefinition.summary.description', 'Review your pattern definition before proceeding to calculation.')}
            </p>
          </div>

          {/* Pattern Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Color Scheme Simulator */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SwatchIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('colorScheme.title', 'Color Scheme Simulator')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('colorScheme.description', 'Visualize different color combinations for your pattern.')}
              </p>
              <button
                onClick={() => setShowColorSimulator(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
              >
                {t('colorScheme.openSimulator', 'Open Simulator')}
              </button>
            </div>

            {/* Stitch Integration Advisor */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SparklesIcon className="h-6 w-6 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('stitchIntegration.title', 'Stitch Integration Advisor')}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {t('stitchIntegration.description', 'Get recommendations for integrating stitch patterns.')}
              </p>
              <button
                onClick={handleOpenStitchIntegrationAdvisor}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm font-medium"
              >
                {t('stitchIntegration.openAdvisor', 'Open Advisor')}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-300">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleGenerateOutline}
                disabled={isGeneratingOutline}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>
                  {isGeneratingOutline 
                    ? t('patternDefinition.outline.generating', 'Generating outline...')
                    : t('patternDefinition.outline.generateButton', 'Generate Outline')
                  }
                </span>
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium">
                Proceed to Pattern Calculation
              </button>
            </div>
          </div>
          <NavigationButtons />

          {/* Modal Components - These were missing! */}
          {/* Color Scheme Simulator Modal */}
          {showColorSimulator && (
            <ColorSchemeSimulator
              onClose={() => setShowColorSimulator(false)}
              onSchemeSaved={handleColorSchemeSave}
              isModal={true}
            />
          )}

          {/* Pattern Outline Viewer Modal */}
          {showOutlineViewer && currentOutline && (
            <PatternOutlineViewer
              outline={currentOutline}
              isOpen={showOutlineViewer}
              onClose={handleCloseOutlineViewer}
            />
          )}

          {/* Stitch Integration Advisor Modal */}
          {showStitchIntegrationAdvisor && (
            <StitchIntegrationAdvisor
              sessionId={currentSession?.id || ''}
              availableComponents={availableComponents}
              onClose={handleCloseStitchIntegrationAdvisor}
              onSuccess={handleStitchIntegrationSuccess}
            />
          )}
        </div>
      );

    default:
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('patternDefinition.unknownStep', 'Unknown Step')}
          </h2>
          <p className="text-gray-600">
            {t('patternDefinition.unknownStepDescription', 'This step is not implemented yet.')}
          </p>
          <NavigationButtons />
        </div>
      );
  }
} 