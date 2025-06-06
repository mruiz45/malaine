'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  PatternState, 
  PatternAction, 
  PatternContextValue,
  GarmentType,
  PatternSection,
  GaugeData,
  MeasurementsData,
  EaseData,
  BodyStructureData,
  NecklineData,
  SleevesData,
  FinishingData
} from '@/types/pattern';

/**
 * Initial state for a new pattern
 */
const createInitialState = (): PatternState => ({
  version: '1.0.0',
  metadata: {
    patternId: null,
    createdAt: null,
    updatedAt: null,
    designName: 'Untitled Pattern',
    description: null,
    tags: []
  },
  garmentType: null,
  uiSettings: {
    currentSection: 'gauge',
    completedSections: [],
    sidebarCollapsed: false
  },
  gauge: {
    isSet: false,
    stitchesPer10cm: null,
    rowsPer10cm: null,
    yarnUsed: null,
    needleSize: null,
    tensionNotes: null
  },
  measurements: {
    isSet: false,
    mode: 'custom', // Default to custom measurements
    standardSizeId: null,
    standardSizeLabel: null,
    length: null,
    width: null,
    chestCircumference: null,
    bodyLength: null,
    sleeveLength: null,
    shoulderWidth: null,
    armholeDepth: null,
    headCircumference: null,
    hatHeight: null,
    scarfLength: null,
    scarfWidth: null
  },
  ease: {
    isSet: false,
    chestEase: null,
    lengthEase: null,
    sleeveEase: null,
    easeType: null
  },
  bodyStructure: {
    isSet: false,
    construction: null,
    shaping: null,
    frontStyle: null
  },
  neckline: {
    isSet: false,
    necklineType: null,
    necklineDepth: null,
    necklineWidth: null
  },
  sleeves: {
    isSet: false,
    sleeveType: null, // Will default to 'setIn' in SchematicPreview2D when null
    sleeveLength: null,
    cuffStyle: null,
    cuffLength: null
  },
  finishing: {
    isSet: false,
    edgeTreatment: null,
    buttonhole: false,
    buttonholeCount: null,
    closureType: null
  }
});

/**
 * Pattern state reducer
 * Handles all pattern state updates with proper immutability
 */
const patternReducer = (state: PatternState, action: PatternAction): PatternState => {
  const updatedAt = new Date();

  switch (action.type) {
    case 'SET_GARMENT_TYPE': {
      // When garment type changes, reset measurements to appropriate defaults
      const newMeasurements = { ...state.measurements };
      
      // Reset standard size selection when garment type changes
      newMeasurements.mode = 'custom';
      newMeasurements.standardSizeId = null;
      newMeasurements.standardSizeLabel = null;
      
      // Reset garment-specific measurements
      if (action.payload !== 'sweater' && action.payload !== 'cardigan') {
        newMeasurements.chestCircumference = null;
        newMeasurements.bodyLength = null;
        newMeasurements.sleeveLength = null;
        newMeasurements.shoulderWidth = null;
        newMeasurements.armholeDepth = null;
      }
      
      if (action.payload !== 'hat') {
        newMeasurements.headCircumference = null;
        newMeasurements.hatHeight = null;
      }
      
      if (action.payload !== 'scarf') {
        newMeasurements.scarfLength = null;
        newMeasurements.scarfWidth = null;
      }

      return {
        ...state,
        garmentType: action.payload,
        measurements: newMeasurements,
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };
    }

    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        uiSettings: {
          ...state.uiSettings,
          currentSection: action.payload
        }
      };

    case 'UPDATE_GAUGE':
      return {
        ...state,
        gauge: {
          ...state.gauge,
          ...action.payload,
          isSet: true // Mark as set when updated
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_MEASUREMENTS':
      return {
        ...state,
        measurements: {
          ...state.measurements,
          ...action.payload,
          isSet: true
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_EASE':
      return {
        ...state,
        ease: {
          ...state.ease,
          ...action.payload,
          isSet: true
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_BODY_STRUCTURE':
      return {
        ...state,
        bodyStructure: {
          ...state.bodyStructure,
          ...action.payload,
          isSet: true
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_NECKLINE':
      return {
        ...state,
        neckline: {
          ...state.neckline,
          ...action.payload,
          isSet: true
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_SLEEVES': {
      const updatedSleeves = {
        ...state.sleeves,
        ...action.payload,
        isSet: true
      };

      // Check for sleeve type dependency (PD_PH4_US003)
      let updatedBodyStructure = state.bodyStructure;
      
      // If sleeve type changed, flag armhole recalculation
      if (state.sleeves.sleeveType !== updatedSleeves.sleeveType && updatedSleeves.sleeveType !== null) {
        updatedBodyStructure = {
          ...state.bodyStructure,
          armholeRequiresRecalculation: true
        };
      }

      return {
        ...state,
        sleeves: updatedSleeves,
        bodyStructure: updatedBodyStructure,
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };
    }

    case 'UPDATE_FINISHING':
      return {
        ...state,
        finishing: {
          ...state.finishing,
          ...action.payload,
          isSet: true
        },
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };

    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload,
          updatedAt
        }
      };

    case 'UPDATE_UI_SETTINGS':
      return {
        ...state,
        uiSettings: {
          ...state.uiSettings,
          ...action.payload
        }
      };

    case 'RESET_PATTERN':
      return createInitialState();

    case 'RESET_SECTION': {
      const initialState = createInitialState();
      const sectionKey = action.payload;
      
      return {
        ...state,
        [sectionKey]: initialState[sectionKey],
        metadata: {
          ...state.metadata,
          updatedAt
        }
      };
    }

    case 'CLEAR_RECALCULATION_FLAGS': {
      const { section } = action.payload;
      
      switch (section) {
        case 'bodyStructure':
          return {
            ...state,
            bodyStructure: {
              ...state.bodyStructure,
              armholeRequiresRecalculation: false
            },
            metadata: {
              ...state.metadata,
              updatedAt
            }
          };
        default:
          return state;
      }
    }

    default:
      return state;
  }
};

/**
 * Pattern Context
 */
export const PatternContext = createContext<PatternContextValue | undefined>(undefined);

/**
 * Pattern Provider Props
 */
interface PatternProviderProps {
  children: ReactNode;
  initialState?: Partial<PatternState>;
}

/**
 * Pattern Provider Component
 * Provides pattern state management to child components
 */
export const PatternProvider: React.FC<PatternProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const [state, dispatch] = useReducer(
    patternReducer, 
    initialState ? { ...createInitialState(), ...initialState } : createInitialState()
  );

  // Convenience methods with useCallback for performance
  const setGarmentType = useCallback((garmentType: GarmentType) => {
    dispatch({ type: 'SET_GARMENT_TYPE', payload: garmentType });
  }, []);

  const setCurrentSection = useCallback((section: PatternSection) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
  }, []);

  const updateGauge = useCallback((data: Partial<GaugeData>) => {
    dispatch({ type: 'UPDATE_GAUGE', payload: data });
  }, []);

  const updateMeasurements = useCallback((data: Partial<MeasurementsData>) => {
    dispatch({ type: 'UPDATE_MEASUREMENTS', payload: data });
  }, []);

  const updateEase = useCallback((data: Partial<EaseData>) => {
    dispatch({ type: 'UPDATE_EASE', payload: data });
  }, []);

  const updateBodyStructure = useCallback((data: Partial<BodyStructureData>) => {
    dispatch({ type: 'UPDATE_BODY_STRUCTURE', payload: data });
  }, []);

  const updateNeckline = useCallback((data: Partial<NecklineData>) => {
    dispatch({ type: 'UPDATE_NECKLINE', payload: data });
  }, []);

  const updateSleeves = useCallback((data: Partial<SleevesData>) => {
    dispatch({ type: 'UPDATE_SLEEVES', payload: data });
  }, []);

  const updateFinishing = useCallback((data: Partial<FinishingData>) => {
    dispatch({ type: 'UPDATE_FINISHING', payload: data });
  }, []);

  const resetPattern = useCallback(() => {
    dispatch({ type: 'RESET_PATTERN' });
  }, []);

  const resetSection = useCallback((section: PatternSection) => {
    dispatch({ type: 'RESET_SECTION', payload: section });
  }, []);

  const clearRecalculationFlags = useCallback((section: string) => {
    dispatch({ type: 'CLEAR_RECALCULATION_FLAGS', payload: { section } });
  }, []);

  const contextValue: PatternContextValue = {
    state,
    dispatch,
    setGarmentType,
    setCurrentSection,
    updateGauge,
    updateMeasurements,
    updateEase,
    updateBodyStructure,
    updateNeckline,
    updateSleeves,
    updateFinishing,
    resetPattern,
    resetSection,
    clearRecalculationFlags
  };

  return (
    <PatternContext.Provider value={contextValue}>
      {children}
    </PatternContext.Provider>
  );
};

/**
 * Hook to use the Pattern Context
 * Must be used within a PatternProvider
 */
export function usePattern(): PatternContextValue {
  const context = useContext(PatternContext);
  if (!context) {
    throw new Error('usePattern must be used within a PatternProvider');
  }
  return context;
} 