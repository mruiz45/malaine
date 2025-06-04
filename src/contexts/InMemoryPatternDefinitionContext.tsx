'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  InMemoryPatternDefinition,
  InMemoryPatternDefinitionState,
  InMemoryPatternDefinitionContext,
  InMemoryNavigationState,
  PatternDefinitionAction
} from '@/types/patternDefinitionInMemory';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';
import { getGarmentTypeConfig } from '@/utils/garmentTypeConfig';

/**
 * Initial navigation state
 */
const initialNavigation: InMemoryNavigationState = {
  currentSection: null,
  availableSections: [],
  completedSections: [],
  requiredSections: []
};

/**
 * Initial context state
 */
const initialState: InMemoryPatternDefinitionState = {
  currentPattern: null,
  navigation: initialNavigation,
  isLoading: false,
  error: null
};

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate completed sections based on pattern data
 */
function calculateCompletedSections(pattern: InMemoryPatternDefinition): PatternDefinitionSection[] {
  const completedSections: PatternDefinitionSection[] = [];
  
  // Check each section for completion
  if (pattern.gauge?.isCompleted) completedSections.push('gauge');
  if (pattern.measurements?.isCompleted) completedSections.push('measurements');
  if (pattern.ease?.isCompleted) completedSections.push('ease');
  if (pattern.yarn?.isCompleted) completedSections.push('yarn');
  if (pattern.stitchPattern?.isCompleted) completedSections.push('stitchPattern');
  if (pattern.bodyStructure?.isCompleted) completedSections.push('bodyStructure');
  if (pattern.neckline?.isCompleted) completedSections.push('neckline');
  if (pattern.sleeves?.isCompleted) completedSections.push('sleeves');
  if (pattern.accessoryDefinition?.isCompleted) completedSections.push('accessoryDefinition');
  
  return completedSections;
}

/**
 * Get section data from pattern (with type safety)
 */
function getSectionData(pattern: InMemoryPatternDefinition, section: PatternDefinitionSection): any {
  switch (section) {
    case 'gauge':
      return pattern.gauge;
    case 'measurements':
      return pattern.measurements;
    case 'ease':
      return pattern.ease;
    case 'yarn':
      return pattern.yarn;
    case 'stitchPattern':
      return pattern.stitchPattern;
    case 'bodyStructure':
      return pattern.bodyStructure;
    case 'neckline':
      return pattern.neckline;
    case 'sleeves':
      return pattern.sleeves;
    case 'accessoryDefinition':
      return pattern.accessoryDefinition;
    case 'summary':
      return null; // Summary has no stored data
    default:
      return null;
  }
}

/**
 * Enhanced logging function for pattern definition dumps
 */
function logPatternDefinitionDump(
  action: string,
  currentSection: PatternDefinitionSection | null,
  pattern: InMemoryPatternDefinition | null,
  updateData?: any
) {
  console.group(`🏗️ [IN-MEMORY PATTERN DEFINITION DUMP] - ${action}`);
  
  console.log('📍 Current Section:', currentSection);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  if (updateData) {
    console.log('📝 Update Data:', updateData);
  }
  
  if (pattern) {
    console.log('🗄️ Complete Pattern State:');
    console.log('  ├── Session ID:', pattern.sessionId);
    console.log('  ├── Session Name:', pattern.sessionName);
    console.log('  ├── Garment Type:', pattern.garmentType);
    console.log('  ├── Craft Type:', pattern.craftType);
    console.log('  ├── Created:', pattern.createdAt.toISOString());
    console.log('  ├── Updated:', pattern.updatedAt.toISOString());
    console.log('  └── Section Data:');
    console.log('      ├── Gauge:', pattern.gauge ? '✓' : '❌');
    console.log('      ├── Measurements:', pattern.measurements ? '✓' : '❌');
    console.log('      ├── Ease:', pattern.ease ? '✓' : '❌');
    console.log('      ├── Yarn:', pattern.yarn ? '✓' : '❌');
    console.log('      ├── Stitch Pattern:', pattern.stitchPattern ? '✓' : '❌');
    console.log('      ├── Body Structure:', pattern.bodyStructure ? '✓' : '❌');
    console.log('      ├── Neckline:', pattern.neckline ? '✓' : '❌');
    console.log('      ├── Sleeves:', pattern.sleeves ? '✓' : '❌');
    console.log('      └── Accessory Definition:', pattern.accessoryDefinition ? '✓' : '❌');
    
    // Calculate and show completion status
    const completedSections = calculateCompletedSections(pattern);
    console.log('📊 Progress Analysis:');
    console.log('  ├── Completed Sections:', completedSections);
    console.log('  └── Completion Count:', completedSections.length);
  } else {
    console.log('❌ No pattern data available');
  }
  
  console.groupEnd();
}

/**
 * Reducer for in-memory pattern definition state management
 */
function inMemoryPatternDefinitionReducer(
  state: InMemoryPatternDefinitionState,
  action: PatternDefinitionAction
): InMemoryPatternDefinitionState {
  switch (action.type) {
    case 'CREATE_PATTERN': {
      const { sessionName, craftType } = action.payload;
      const newPattern: InMemoryPatternDefinition = {
        sessionId: generateSessionId(),
        sessionName,
        craftType,
        garmentType: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      logPatternDefinitionDump('PATTERN_CREATED', null, newPattern);
      
      return {
        ...state,
        currentPattern: newPattern,
        navigation: {
          ...initialNavigation,
          currentSection: null // Will be set when garment type is selected
        },
        isLoading: false,
        error: null
      };
    }
    
    case 'SELECT_GARMENT_TYPE': {
      const garmentTypeKey = action.payload;
      const config = getGarmentTypeConfig(garmentTypeKey);
      
      if (!state.currentPattern || !config) {
        return { ...state, error: 'Invalid garment type or no active pattern' };
      }
      
      const updatedPattern: InMemoryPatternDefinition = {
        ...state.currentPattern,
        garmentType: garmentTypeKey,
        updatedAt: new Date()
      };
      
      const newNavigation: InMemoryNavigationState = {
        currentSection: config.defaultSection,
        availableSections: config.relevantSections,
        completedSections: calculateCompletedSections(updatedPattern),
        requiredSections: config.requiredSections
      };
      
      logPatternDefinitionDump('GARMENT_TYPE_SELECTED', config.defaultSection, updatedPattern, { garmentTypeKey, config });
      
      return {
        ...state,
        currentPattern: updatedPattern,
        navigation: newNavigation,
        error: null
      };
    }
    
    case 'SET_CURRENT_SECTION': {
      const section = action.payload;
      
      // Verify section is available for current garment type
      if (!state.navigation.availableSections.includes(section)) {
        return { ...state, error: `Section ${section} is not available for current garment type` };
      }
      
      logPatternDefinitionDump('SECTION_CHANGED', section, state.currentPattern);
      
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentSection: section
        },
        error: null
      };
    }
    
    case 'UPDATE_SECTION_DATA': {
      const { section, data } = action.payload;
      
      if (!state.currentPattern) {
        return { ...state, error: 'No active pattern' };
      }
      
      // Skip data updates for summary section
      if (section === 'summary') {
        return state;
      }
      
      const updatedPattern: InMemoryPatternDefinition = {
        ...state.currentPattern,
        ...{
          [section]: {
            ...getSectionData(state.currentPattern, section),
            ...data
          }
        },
        updatedAt: new Date()
      };
      
      const updatedNavigation: InMemoryNavigationState = {
        ...state.navigation,
        completedSections: calculateCompletedSections(updatedPattern)
      };
      
      logPatternDefinitionDump('SECTION_DATA_UPDATED', section, updatedPattern, { section, data });
      
      return {
        ...state,
        currentPattern: updatedPattern,
        navigation: updatedNavigation,
        error: null
      };
    }
    
    case 'MARK_SECTION_COMPLETED': {
      const section = action.payload;
      
      if (!state.currentPattern) {
        return { ...state, error: 'No active pattern' };
      }
      
      // Skip completion marking for summary section
      if (section === 'summary') {
        return state;
      }
      
      const currentSectionData = getSectionData(state.currentPattern, section);
      if (!currentSectionData) {
        return { ...state, error: `No data found for section ${section}` };
      }
      
      const updatedPattern: InMemoryPatternDefinition = {
        ...state.currentPattern,
        ...{
          [section]: {
            ...currentSectionData,
            isCompleted: true
          }
        },
        updatedAt: new Date()
      };
      
      const updatedNavigation: InMemoryNavigationState = {
        ...state.navigation,
        completedSections: calculateCompletedSections(updatedPattern)
      };
      
      logPatternDefinitionDump('SECTION_COMPLETED', section, updatedPattern, { section });
      
      return {
        ...state,
        currentPattern: updatedPattern,
        navigation: updatedNavigation,
        error: null
      };
    }
    
    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload };
    }
    
    case 'SET_ERROR': {
      return { ...state, error: action.payload, isLoading: false };
    }
    
    case 'CLEAR_PATTERN': {
      logPatternDefinitionDump('PATTERN_CLEARED', null, null);
      
      return {
        ...initialState
      };
    }
    
    default:
      return state;
  }
}

/**
 * Create the context
 */
const InMemoryPatternDefinitionContextInstance = createContext<InMemoryPatternDefinitionContext | undefined>(undefined);

/**
 * Provider component props
 */
interface InMemoryPatternDefinitionProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for in-memory pattern definition context
 */
export function InMemoryPatternDefinitionProvider({ children }: InMemoryPatternDefinitionProviderProps) {
  const [state, dispatch] = useReducer(inMemoryPatternDefinitionReducer, initialState);
  
  /**
   * Create a new pattern
   */
  const createPattern = useCallback((sessionName: string, craftType: 'knitting' | 'crochet') => {
    dispatch({ type: 'CREATE_PATTERN', payload: { sessionName, craftType } });
  }, []);
  
  /**
   * Select garment type and update available sections
   */
  const selectGarmentType = useCallback((garmentTypeKey: string) => {
    dispatch({ type: 'SELECT_GARMENT_TYPE', payload: garmentTypeKey });
  }, []);
  
  /**
   * Navigate to a specific section
   */
  const navigateToSection = useCallback((section: PatternDefinitionSection) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
  }, []);
  
  /**
   * Update section data
   */
  const updateSectionData = useCallback((section: PatternDefinitionSection, data: any) => {
    dispatch({ type: 'UPDATE_SECTION_DATA', payload: { section, data } });
  }, []);
  
  /**
   * Mark section as completed
   */
  const markSectionCompleted = useCallback((section: PatternDefinitionSection) => {
    dispatch({ type: 'MARK_SECTION_COMPLETED', payload: section });
  }, []);
  
  /**
   * Clear current pattern
   */
  const clearPattern = useCallback(() => {
    dispatch({ type: 'CLEAR_PATTERN' });
  }, []);
  
  const contextValue: InMemoryPatternDefinitionContext = {
    state,
    createPattern,
    selectGarmentType,
    navigateToSection,
    updateSectionData,
    markSectionCompleted,
    clearPattern
  };
  
  return (
    <InMemoryPatternDefinitionContextInstance.Provider value={contextValue}>
      {children}
    </InMemoryPatternDefinitionContextInstance.Provider>
  );
}

/**
 * Hook to use the in-memory pattern definition context
 */
export function useInMemoryPatternDefinition(): InMemoryPatternDefinitionContext {
  const context = useContext(InMemoryPatternDefinitionContextInstance);
  if (context === undefined) {
    throw new Error('useInMemoryPatternDefinition must be used within an InMemoryPatternDefinitionProvider');
  }
  return context;
} 