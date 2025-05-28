'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  PatternDefinitionSessionWithData,
  PatternDefinitionContext as IPatternDefinitionContext,
  PatternDefinitionContextState,
  DefinitionStep,
  DefinitionNavigation,
  CreatePatternDefinitionSessionData,
  UpdatePatternDefinitionSessionData,
  SessionSummary,
  StepSummary
} from '@/types/patternDefinition';
import { patternDefinitionService } from '@/services/patternDefinitionService';

/**
 * Available steps in the pattern definition process
 */
const DEFINITION_STEPS: DefinitionStep[] = [
  'garment-type',
  'gauge',
  'measurements', 
  'ease',
  'yarn',
  'stitch-pattern',
  'garment-structure',
  'neckline',
  'sleeves',
  'summary'
];

/**
 * Initial navigation state
 */
const initialNavigation: DefinitionNavigation = {
  currentStep: 'garment-type',
  availableSteps: DEFINITION_STEPS,
  completedSteps: [],
  canProceed: false
};

/**
 * Initial context state
 */
const initialState: PatternDefinitionContextState = {
  currentSession: undefined,
  navigation: initialNavigation,
  isLoading: false,
  error: undefined,
  autoSave: true
};

/**
 * Action types for the reducer
 */
type PatternDefinitionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'SET_SESSION'; payload: PatternDefinitionSessionWithData | undefined }
  | { type: 'SET_CURRENT_STEP'; payload: DefinitionStep }
  | { type: 'SET_COMPLETED_STEPS'; payload: DefinitionStep[] }
  | { type: 'SET_AUTO_SAVE'; payload: boolean }
  | { type: 'UPDATE_SESSION_DATA'; payload: Partial<PatternDefinitionSessionWithData> }
  | { type: 'CLEAR_SESSION' };

/**
 * Reducer for pattern definition state management
 */
function patternDefinitionReducer(
  state: PatternDefinitionContextState,
  action: PatternDefinitionAction
): PatternDefinitionContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_SESSION':
      return { 
        ...state, 
        currentSession: action.payload,
        isLoading: false,
        error: undefined
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentStep: action.payload
        }
      };
    
    case 'SET_COMPLETED_STEPS':
      const canProceed = action.payload.length > 0;
      return {
        ...state,
        navigation: {
          ...state.navigation,
          completedSteps: action.payload,
          canProceed
        }
      };
    
    case 'SET_AUTO_SAVE':
      return { ...state, autoSave: action.payload };
    
    case 'UPDATE_SESSION_DATA':
      if (!state.currentSession) return state;
      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          ...action.payload
        }
      };
    
    case 'CLEAR_SESSION':
      return {
        ...state,
        currentSession: undefined,
        navigation: initialNavigation,
        error: undefined
      };
    
    default:
      return state;
  }
}

/**
 * Pattern Definition Context
 */
const PatternDefinitionContext = createContext<IPatternDefinitionContext | undefined>(undefined);

/**
 * Pattern Definition Provider Props
 */
interface PatternDefinitionProviderProps {
  children: React.ReactNode;
}

/**
 * Pattern Definition Provider Component
 */
export function PatternDefinitionProvider({ children }: PatternDefinitionProviderProps) {
  const [state, dispatch] = useReducer(patternDefinitionReducer, initialState);

  /**
   * Create a new pattern definition session
   */
  const createSession = useCallback(async (data?: CreatePatternDefinitionSessionData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const newSession = await patternDefinitionService.createSession(data);
      
      // Load the full session data
      const fullSession = await patternDefinitionService.getSession(newSession.id);
      
      dispatch({ type: 'SET_SESSION', payload: fullSession });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'garment-type' });
      dispatch({ type: 'SET_COMPLETED_STEPS', payload: [] });

      return newSession;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const session = await patternDefinitionService.getSession(sessionId);
      
      dispatch({ type: 'SET_SESSION', payload: session });
      
      // Calculate completed steps based on session data
      const completedSteps = calculateCompletedSteps(session);
      dispatch({ type: 'SET_COMPLETED_STEPS', payload: completedSteps });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Update the current session
   */
  const updateSession = useCallback(async (data: UpdatePatternDefinitionSessionData) => {
    if (!state.currentSession) {
      throw new Error('No active session to update');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      const updatedSession = await patternDefinitionService.updateSession(
        state.currentSession.id,
        data
      );

      // Reload full session data
      const fullSession = await patternDefinitionService.getSession(updatedSession.id);
      dispatch({ type: 'SET_SESSION', payload: fullSession });

      // Recalculate completed steps
      const completedSteps = calculateCompletedSteps(fullSession);
      dispatch({ type: 'SET_COMPLETED_STEPS', payload: completedSteps });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.currentSession]);

  /**
   * Save the current session
   */
  const saveSession = useCallback(async () => {
    if (!state.currentSession) {
      throw new Error('No active session to save');
    }

    try {
      await patternDefinitionService.saveSessionWithSnapshot(
        state.currentSession.id,
        state.currentSession
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.currentSession]);

  /**
   * Navigate to a specific step
   */
  const navigateToStep = useCallback((step: DefinitionStep) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  /**
   * Move to the next step
   */
  const nextStep = useCallback(() => {
    const currentIndex = DEFINITION_STEPS.indexOf(state.navigation.currentStep);
    if (currentIndex < DEFINITION_STEPS.length - 1) {
      const nextStep = DEFINITION_STEPS[currentIndex + 1];
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStep });
    }
  }, [state.navigation.currentStep]);

  /**
   * Move to the previous step
   */
  const previousStep = useCallback(() => {
    const currentIndex = DEFINITION_STEPS.indexOf(state.navigation.currentStep);
    if (currentIndex > 0) {
      const prevStep = DEFINITION_STEPS[currentIndex - 1];
      dispatch({ type: 'SET_CURRENT_STEP', payload: prevStep });
    }
  }, [state.navigation.currentStep]);

  /**
   * Generate session summary
   */
  const generateSummary = useCallback((): SessionSummary => {
    if (!state.currentSession) {
      throw new Error('No active session to summarize');
    }

    const steps: StepSummary[] = DEFINITION_STEPS.map(step => {
      const completed = state.navigation.completedSteps.includes(step);
      const summary = getStepSummary(step, state.currentSession!);
      
      return {
        step,
        completed,
        summary,
        data: getStepData(step, state.currentSession!)
      };
    });

    const completionPercentage = Math.round(
      (state.navigation.completedSteps.length / DEFINITION_STEPS.length) * 100
    );

    const readyForCalculation = state.navigation.completedSteps.length >= 4; // At least gauge, measurements, ease, yarn

    return {
      session: state.currentSession,
      steps,
      completionPercentage,
      readyForCalculation
    };
  }, [state.currentSession, state.navigation.completedSteps]);

  /**
   * Clear the current session
   */
  const clearSession = useCallback(() => {
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  /**
   * Auto-save effect
   */
  useEffect(() => {
    if (state.autoSave && state.currentSession && !state.isLoading) {
      const timeoutId = setTimeout(() => {
        saveSession().catch(console.error);
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [state.autoSave, state.currentSession, state.isLoading, saveSession]);

  /**
   * Context value
   */
  const contextValue: IPatternDefinitionContext = {
    ...state,
    createSession,
    loadSession,
    updateSession,
    saveSession,
    navigateToStep,
    nextStep,
    previousStep,
    generateSummary,
    clearSession
  };

  return (
    <PatternDefinitionContext.Provider value={contextValue}>
      {children}
    </PatternDefinitionContext.Provider>
  );
}

/**
 * Hook to use the Pattern Definition Context
 */
export function usePatternDefinition(): IPatternDefinitionContext {
  const context = useContext(PatternDefinitionContext);
  if (!context) {
    throw new Error('usePatternDefinition must be used within a PatternDefinitionProvider');
  }
  return context;
}

/**
 * Calculate completed steps based on session data
 */
function calculateCompletedSteps(session: PatternDefinitionSessionWithData): DefinitionStep[] {
  const completed: DefinitionStep[] = [];

  if (session.selected_garment_type_id) {
    completed.push('garment-type');
  }

  if (session.selected_gauge_profile_id) {
    completed.push('gauge');
  }
  
  if (session.selected_measurement_set_id) {
    completed.push('measurements');
  }
  
  if (session.ease_type) {
    completed.push('ease');
  }
  
  if (session.selected_yarn_profile_id) {
    completed.push('yarn');
  }
  
  if (session.selected_stitch_pattern_id) {
    completed.push('stitch-pattern');
  }

  // Check for garment structure (sweater structure)
  if (session.parameter_snapshot?.sweater_structure?.construction_method) {
    completed.push('garment-structure');
  }

  // Check for neckline selection (US_4.4)
  if (session.parameter_snapshot?.neckline?.style) {
    completed.push('neckline');
  }

  // Check for sleeve selection (US_4.5)
  if (session.parameter_snapshot?.sleeves?.style) {
    completed.push('sleeves');
  }

  return completed;
}

/**
 * Get summary text for a step
 */
function getStepSummary(step: DefinitionStep, session: PatternDefinitionSessionWithData): string | undefined {
  switch (step) {
    case 'garment-type':
      return session.selected_garment_type_id ? 
        `Garment Type Selected${session.garment_type ? ` (${session.garment_type.display_name})` : ''}` : 
        undefined;
    
    case 'gauge':
      return session.selected_gauge_profile_id ? 
        `Gauge Profile Selected${session.gauge_stitch_count ? ` (${session.gauge_stitch_count} sts, ${session.gauge_row_count} rows)` : ''}` : 
        undefined;
    
    case 'measurements':
      return session.selected_measurement_set_id ? 'Measurement Set Selected' : undefined;
    
    case 'ease':
      return session.ease_type ? 
        `${session.ease_type} ease${session.ease_value_bust ? ` (${session.ease_value_bust}${session.ease_unit})` : ''}` : 
        undefined;
    
    case 'yarn':
      return session.selected_yarn_profile_id ? 'Yarn Profile Selected' : undefined;
    
    case 'stitch-pattern':
      return session.selected_stitch_pattern_id ? 'Stitch Pattern Selected' : undefined;
    
    case 'garment-structure':
      return session.parameter_snapshot?.sweater_structure?.construction_method ? 
        `Structure: ${session.parameter_snapshot.sweater_structure.construction_method}${session.parameter_snapshot.sweater_structure.body_shape ? `, ${session.parameter_snapshot.sweater_structure.body_shape}` : ''}` : 
        undefined;
    
    case 'neckline':
      return session.parameter_snapshot?.neckline?.style ? 
        `Neckline: ${session.parameter_snapshot.neckline.style}${session.parameter_snapshot.neckline.parameters?.depth_cm ? ` (${session.parameter_snapshot.neckline.parameters.depth_cm}cm depth)` : ''}` : 
        undefined;
    
    case 'sleeves':
      return session.parameter_snapshot?.sleeves?.style ? 
        `Sleeves: ${session.parameter_snapshot.sleeves.style}${session.parameter_snapshot.sleeves.length_key ? `, ${session.parameter_snapshot.sleeves.length_key}` : ''}${session.parameter_snapshot.sleeves.cuff_style ? `, ${session.parameter_snapshot.sleeves.cuff_style}` : ''}` : 
        undefined;
    
    case 'summary':
      return 'Pattern definition summary';
    
    default:
      return undefined;
  }
}

/**
 * Get data for a step
 */
function getStepData(step: DefinitionStep, session: PatternDefinitionSessionWithData): Record<string, any> | undefined {
  switch (step) {
    case 'garment-type':
      return session.selected_garment_type_id ? { 
        id: session.selected_garment_type_id,
        type_key: session.garment_type?.type_key,
        display_name: session.garment_type?.display_name
      } : undefined;
    
    case 'gauge':
      return session.selected_gauge_profile_id ? { 
        id: session.selected_gauge_profile_id,
        stitch_count: session.gauge_stitch_count,
        row_count: session.gauge_row_count,
        unit: session.gauge_unit
      } : undefined;
    
    case 'measurements':
      return session.selected_measurement_set_id ? { id: session.selected_measurement_set_id } : undefined;
    
    case 'ease':
      return session.ease_type ? {
        type: session.ease_type,
        value_bust: session.ease_value_bust,
        unit: session.ease_unit
      } : undefined;
    
    case 'yarn':
      return session.selected_yarn_profile_id ? { id: session.selected_yarn_profile_id } : undefined;
    
    case 'stitch-pattern':
      return session.selected_stitch_pattern_id ? { id: session.selected_stitch_pattern_id } : undefined;
    
    case 'garment-structure':
      return session.parameter_snapshot?.sweater_structure ? session.parameter_snapshot.sweater_structure : undefined;
    
    case 'neckline':
      return session.parameter_snapshot?.neckline ? session.parameter_snapshot.neckline : undefined;
    
    case 'sleeves':
      return session.parameter_snapshot?.sleeves ? session.parameter_snapshot.sleeves : undefined;
    
    default:
      return undefined;
  }
} 