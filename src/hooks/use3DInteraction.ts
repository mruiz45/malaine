/**
 * 3D Interaction Hook (PD_PH5_US002)
 * Custom hook for managing 3D garment part interactions and navigation
 */

import { useCallback, useMemo } from 'react';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import {
  GarmentComponent,
  GarmentPartClickEvent,
  VisibilityToggleEvent,
  GarmentComponentSectionMapping,
  DEFAULT_COMPONENT_SECTION_MAPPING,
  Interactive3DConfig,
  DEFAULT_INTERACTIVE_3D_CONFIG
} from '@/types/3d-preview';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';

/**
 * Hook for 3D interaction functionality
 */
export function use3DInteraction(
  /** Custom component-to-section mapping (optional) */
  customMapping?: Partial<GarmentComponentSectionMapping>,
  /** Interactive configuration (optional) */
  interactiveConfig: Interactive3DConfig = DEFAULT_INTERACTIVE_3D_CONFIG
) {
  const { state, navigateToSection } = useInMemoryPatternDefinition();
  const { currentPattern, navigation } = state;

  /**
   * Complete mapping between components and sections
   */
  const componentSectionMapping = useMemo((): GarmentComponentSectionMapping => {
    return {
      ...DEFAULT_COMPONENT_SECTION_MAPPING,
      ...customMapping
    };
  }, [customMapping]);

  /**
   * Get available components for current garment type
   */
  const availableComponents = useMemo((): GarmentComponent[] => {
    if (!currentPattern?.garmentType) {
      return [];
    }

    // Base components for all garments
    const baseComponents: GarmentComponent[] = ['frontBody', 'backBody'];

    // Add sleeves for garments that have them
    if (['sweater', 'cardigan', 'tank'].includes(currentPattern.garmentType)) {
      baseComponents.push('leftSleeve', 'rightSleeve', 'cuffDetail');
    }

    // Add neckline for most garments (exclude scarves)
    if (currentPattern.garmentType !== 'scarf') {
      baseComponents.push('necklineDetail');
    }

    // Add hem for long garments
    if (['sweater', 'cardigan', 'vest'].includes(currentPattern.garmentType)) {
      baseComponents.push('hemDetail');
    }

    return baseComponents;
  }, [currentPattern?.garmentType]);

  /**
   * Check if a component can be navigated to
   */
  const canNavigateToComponent = useCallback((component: GarmentComponent): boolean => {
    const sectionKey = componentSectionMapping[component];
    return navigation.availableSections.includes(sectionKey as PatternDefinitionSection);
  }, [componentSectionMapping, navigation.availableSections]);

  /**
   * Get section key for a component
   */
  const getSectionForComponent = useCallback((component: GarmentComponent): string | null => {
    const sectionKey = componentSectionMapping[component];
    return canNavigateToComponent(component) ? sectionKey : null;
  }, [componentSectionMapping, canNavigateToComponent]);

  /**
   * Handle garment part click - navigate to corresponding section
   */
  const handlePartClick = useCallback((
    component: GarmentComponent,
    screenPosition?: { x: number; y: number }
  ) => {
    if (!interactiveConfig.enabled) {
      return;
    }

    const sectionKey = getSectionForComponent(component);
    if (!sectionKey) {
      console.warn(`Cannot navigate to section for component: ${component}`);
      return;
    }

    // Create click event data
    const clickEvent: GarmentPartClickEvent = {
      component,
      screenPosition: screenPosition || { x: 0, y: 0 },
      sectionKey,
      metadata: {
        timestamp: Date.now(),
        garmentType: currentPattern?.garmentType,
        currentSection: navigation.currentSection
      }
    };

    // Navigate to the section
    navigateToSection(sectionKey as PatternDefinitionSection);

    // Optional: Emit event for analytics or other listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('3d-part-clicked', { 
        detail: clickEvent 
      }));
    }
  }, [
    interactiveConfig.enabled,
    getSectionForComponent,
    navigateToSection,
    currentPattern?.garmentType,
    navigation.currentSection
  ]);

  /**
   * Handle visibility toggle for a component
   */
  const handleVisibilityToggle = useCallback((
    component: GarmentComponent,
    visible: boolean,
    source: VisibilityToggleEvent['source'] = 'user'
  ) => {
    const toggleEvent: VisibilityToggleEvent = {
      component,
      visible,
      source
    };

    // Optional: Emit event for other components to listen
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('3d-visibility-toggled', { 
        detail: toggleEvent 
      }));
    }
  }, []);

  /**
   * Get click hint text for a component
   */
  const getClickHintForComponent = useCallback((component: GarmentComponent): string | null => {
    if (!interactiveConfig.showClickHints) {
      return null;
    }

    const sectionKey = getSectionForComponent(component);
    if (!sectionKey) {
      return null;
    }

    // Generate user-friendly hint text
    const componentNames: Record<GarmentComponent, string> = {
      frontBody: 'Front Body',
      backBody: 'Back Body', 
      leftSleeve: 'Left Sleeve',
      rightSleeve: 'Right Sleeve',
      necklineDetail: 'Neckline',
      cuffDetail: 'Cuff',
      hemDetail: 'Hem'
    };

    const sectionNames: Record<string, string> = {
      bodyStructure: 'Body Structure',
      sleeves: 'Sleeves',
      neckline: 'Neckline',
      measurements: 'Measurements'
    };

    const componentName = componentNames[component];
    const sectionName = sectionNames[sectionKey] || sectionKey;

    return `Click ${componentName} to go to ${sectionName} section`;
  }, [interactiveConfig.showClickHints, getSectionForComponent]);

  /**
   * Check if a component should show hover effects
   */
  const shouldShowHoverEffect = useCallback((component: GarmentComponent): boolean => {
    return (
      interactiveConfig.enabled &&
      interactiveConfig.showHoverEffects &&
      canNavigateToComponent(component)
    );
  }, [interactiveConfig.enabled, interactiveConfig.showHoverEffects, canNavigateToComponent]);

  return {
    // State
    availableComponents,
    componentSectionMapping,
    interactiveConfig,

    // Actions
    handlePartClick,
    handleVisibilityToggle,

    // Utilities
    canNavigateToComponent,
    getSectionForComponent,
    getClickHintForComponent,
    shouldShowHoverEffect
  };
} 