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
  'accessory-definition',
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
  autoSave: false // Disabled for memory-only mode
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
 * Enhanced logging function for pattern definition dumps
 */
function logPatternDefinitionDump(
  action: string, 
  currentStep: DefinitionStep, 
  sessionData: PatternDefinitionSessionWithData | undefined,
  updateData?: UpdatePatternDefinitionSessionData
) {
  console.group(`🏗️ [PATTERN DEFINITION DUMP] - ${action}`);
  
  console.log('📍 Current Step:', currentStep);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  if (updateData) {
    console.log('📝 Update Data:', updateData);
  }
  
  if (sessionData) {
    console.log('🗄️ Complete Session State:');
    console.log('  ├── Session ID:', sessionData.id);
    console.log('  ├── Session Name:', sessionData.session_name);
    console.log('  ├── Garment Type ID:', sessionData.selected_garment_type_id);
    console.log('  ├── Gauge Data:');
    console.log('  │   ├── Profile ID:', sessionData.selected_gauge_profile_id);
    console.log('  │   ├── Stitch Count:', sessionData.gauge_stitch_count);
    console.log('  │   ├── Row Count:', sessionData.gauge_row_count);
    console.log('  │   └── Unit:', sessionData.gauge_unit);
    console.log('  ├── Measurements:');
    console.log('  │   └── Set ID:', sessionData.selected_measurement_set_id);
    console.log('  ├── Ease Data:');
    console.log('  │   ├── Type:', sessionData.ease_type);
    console.log('  │   ├── Bust Value:', sessionData.ease_value_bust);
    console.log('  │   └── Unit:', sessionData.ease_unit);
    console.log('  ├── Yarn Profile ID:', sessionData.selected_yarn_profile_id);
    console.log('  ├── Stitch Pattern ID:', sessionData.selected_stitch_pattern_id);
    console.log('  └── Parameter Snapshot:');
    
    if (sessionData.parameter_snapshot) {
      console.log('      ├── Sweater Structure:', sessionData.parameter_snapshot.sweater_structure);
      console.log('      ├── Neckline:', sessionData.parameter_snapshot.neckline);
      console.log('      ├── Sleeves:', sessionData.parameter_snapshot.sleeves);
      console.log('      ├── Beanie:', sessionData.parameter_snapshot.beanie);
      console.log('      ├── Scarf/Cowl:', sessionData.parameter_snapshot.scarf_cowl);
      console.log('      └── Color Scheme:', sessionData.parameter_snapshot.color_scheme);
    } else {
      console.log('      (empty)');
    }
    
    // Calculate and show completion status
    const completedSteps = calculateCompletedSteps(sessionData);
    console.log('📊 Progress Analysis:');
    console.log('  ├── Completed Steps:', completedSteps);
    console.log('  ├── Total Steps:', DEFINITION_STEPS.length);
    console.log('  ├── Completion %:', Math.round((completedSteps.length / DEFINITION_STEPS.length) * 100));
    console.log('  └── Ready for Calculation:', completedSteps.length >= 6);
    
  } else {
    console.log('❌ No session data available');
  }
  
  console.groupEnd();
}

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
      logPatternDefinitionDump('SESSION_LOADED', state.navigation.currentStep, action.payload);
      return { 
        ...state, 
        currentSession: action.payload,
        isLoading: false,
        error: undefined
      };
    
    case 'SET_CURRENT_STEP':
      logPatternDefinitionDump('STEP_CHANGED', action.payload, state.currentSession);
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
      
      const updatedSession = {
        ...state.currentSession,
        ...action.payload
      };
      
      logPatternDefinitionDump('SESSION_UPDATED', state.navigation.currentStep, updatedSession, action.payload);
      
      return {
        ...state,
        currentSession: updatedSession
      };
    
    case 'CLEAR_SESSION':
      logPatternDefinitionDump('SESSION_CLEARED', state.navigation.currentStep, undefined);
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
   * Create a new pattern definition session (memory-only)
   */
  const createSession = useCallback(async (data?: CreatePatternDefinitionSessionData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      // Create a mock session in memory instead of hitting the database
      const mockSession: PatternDefinitionSessionWithData = {
        id: `mock-session-${Date.now()}`,
        session_name: data?.session_name || 'Unnamed Pattern',
        user_id: 'mock-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        craft_type: data?.craft_type || 'knitting',
        status: data?.status || 'draft',
        selected_garment_type_id: undefined,
        selected_gauge_profile_id: undefined,
        gauge_stitch_count: undefined,
        gauge_row_count: undefined,
        gauge_unit: undefined,
        selected_measurement_set_id: undefined,
        ease_type: undefined,
        ease_value_bust: undefined,
        ease_unit: undefined,
        selected_yarn_profile_id: undefined,
        selected_stitch_pattern_id: undefined,
        parameter_snapshot: undefined,
        components: []
      };
      
      dispatch({ type: 'SET_SESSION', payload: mockSession });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'garment-type' });
      dispatch({ type: 'SET_COMPLETED_STEPS', payload: [] });

      logPatternDefinitionDump('SESSION_CREATED', 'garment-type', mockSession);

      return mockSession;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  /**
   * Load an existing session (fallback to database if needed)
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
   * Update the current session (memory-only, no database save)
   */
  const updateSession = useCallback(async (data: UpdatePatternDefinitionSessionData) => {
    console.log('🔄 [CONTEXT] updateSession called with data:', data);
    
    if (!state.currentSession) {
      console.error('🔄 [CONTEXT] No active session to update');
      throw new Error('No active session to update');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: undefined });

      // Create the updated session data immediately
      const updatedSession = { ...state.currentSession, ...data };

      // Update session data directly in memory
      dispatch({ type: 'UPDATE_SESSION_DATA', payload: data });

      // Recalculate completed steps using the updated session data
      setTimeout(() => {
        const completedSteps = calculateCompletedSteps(updatedSession);
        dispatch({ type: 'SET_COMPLETED_STEPS', payload: completedSteps });
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 100);

      console.log('🔄 [CONTEXT] updateSession completed (memory-only)');

    } catch (error) {
      console.error('🔄 [CONTEXT] Error in updateSession:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update session';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [state.currentSession]);

  /**
   * Save the current session (optional database save)
   */
  const saveSession = useCallback(async () => {
    if (!state.currentSession) {
      throw new Error('No active session to save');
    }

    // For now, this is a no-op in memory-only mode
    // Could be extended to save to localStorage or database on demand
    console.log('💾 [CONTEXT] saveSession called (memory-only mode, no action taken)');
    logPatternDefinitionDump('SAVE_REQUESTED', state.navigation.currentStep, state.currentSession);
  }, [state.currentSession, state.navigation.currentStep]);

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

  console.log('📊 [CALCULATE_STEPS] Starting calculation for session:', session.id);

  if (session.selected_garment_type_id) {
    completed.push('garment-type');
    console.log('✅ [CALCULATE_STEPS] garment-type completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] garment-type missing');
  }

  // Check for gauge - either from profile or direct input
  if (session.selected_gauge_profile_id || 
      (session.gauge_stitch_count && session.gauge_row_count && session.gauge_unit)) {
    completed.push('gauge');
    console.log('✅ [CALCULATE_STEPS] gauge completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] gauge missing');
  }
  
  if (session.selected_measurement_set_id) {
    completed.push('measurements');
    console.log('✅ [CALCULATE_STEPS] measurements completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] measurements missing');
  }
  
  if (session.ease_type) {
    completed.push('ease');
    console.log('✅ [CALCULATE_STEPS] ease completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] ease missing');
  }
  
  if (session.selected_yarn_profile_id) {
    completed.push('yarn');
    console.log('✅ [CALCULATE_STEPS] yarn completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] yarn missing');
  }
  
  if (session.selected_stitch_pattern_id) {
    completed.push('stitch-pattern');
    console.log('✅ [CALCULATE_STEPS] stitch-pattern completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] stitch-pattern missing');
  }

  // Check for garment structure (sweater structure)
  console.log('🔍 [CALCULATE_STEPS] Checking garment-structure...');
  console.log('🔍 [CALCULATE_STEPS] parameter_snapshot:', session.parameter_snapshot);
  console.log('🔍 [CALCULATE_STEPS] sweater_structure:', session.parameter_snapshot?.sweater_structure);
  if (session.parameter_snapshot?.sweater_structure?.construction_method) {
    completed.push('garment-structure');
    console.log('✅ [CALCULATE_STEPS] garment-structure completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] garment-structure missing');
  }

  // Check for neckline selection (US_4.4)
  console.log('🔍 [CALCULATE_STEPS] Checking neckline...');
  console.log('🔍 [CALCULATE_STEPS] neckline data:', session.parameter_snapshot?.neckline);
  console.log('🔍 [CALCULATE_STEPS] neckline style:', session.parameter_snapshot?.neckline?.style);
  if (session.parameter_snapshot?.neckline?.style) {
    completed.push('neckline');
    console.log('✅ [CALCULATE_STEPS] neckline completed with style:', session.parameter_snapshot.neckline.style);
  } else {
    console.log('❌ [CALCULATE_STEPS] neckline missing - no style found');
  }

  // Check for sleeve selection (US_4.5)
  console.log('🔍 [CALCULATE_STEPS] Checking sleeves...');
  console.log('🔍 [CALCULATE_STEPS] sleeves data:', session.parameter_snapshot?.sleeves);
  if (session.parameter_snapshot?.sleeves && (
      session.parameter_snapshot.sleeves.style || 
      session.parameter_snapshot.sleeves.length_key || 
      session.parameter_snapshot.sleeves.cuff_style
    )) {
    completed.push('sleeves');
    console.log('✅ [CALCULATE_STEPS] sleeves completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] sleeves missing');
  }

  // Check for accessory definition (US_7.1)
  // Mark as completed if:
  // 1. Specific accessories are defined (beanie, scarf_cowl), OR
  // 2. The garment type doesn't require accessory definition
  const garmentTypeKey = session.garment_type?.type_key;
  const requiresAccessoryDefinition = garmentTypeKey === 'beanie' || garmentTypeKey === 'scarf' || garmentTypeKey === 'cowl';
  
  console.log('🔍 [CALCULATE_STEPS] Checking accessory-definition...');
  console.log('🔍 [CALCULATE_STEPS] garmentTypeKey:', garmentTypeKey);
  console.log('🔍 [CALCULATE_STEPS] requiresAccessoryDefinition:', requiresAccessoryDefinition);
  
  if (session.parameter_snapshot?.beanie || 
      session.parameter_snapshot?.scarf_cowl || 
      !requiresAccessoryDefinition) {
    completed.push('accessory-definition');
    console.log('✅ [CALCULATE_STEPS] accessory-definition completed');
  } else {
    console.log('❌ [CALCULATE_STEPS] accessory-definition missing');
  }

  console.log('📊 [CALCULATE_STEPS] Final completed steps:', completed);
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
      if (session.selected_gauge_profile_id) {
        return `Gauge Profile Selected${session.gauge_stitch_count ? ` (${session.gauge_stitch_count} sts, ${session.gauge_row_count} rows)` : ''}`;
      } else if (session.gauge_stitch_count && session.gauge_row_count && session.gauge_unit) {
        return `Gauge: ${session.gauge_stitch_count} sts, ${session.gauge_row_count} rows per ${session.gauge_unit}`;
      }
      return undefined;
    
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
    
    case 'accessory-definition':
      const beanieAttrs = session.parameter_snapshot?.beanie;
      const scarfCowlAttrs = session.parameter_snapshot?.scarf_cowl;
      const garmentTypeKey = session.garment_type?.type_key;
      const requiresAccessoryDefinition = garmentTypeKey === 'beanie' || garmentTypeKey === 'scarf' || garmentTypeKey === 'cowl';
      
      if (beanieAttrs) {
        return `Beanie: ${beanieAttrs.target_circumference_cm}cm circumference, ${beanieAttrs.crown_style} crown`;
      } else if (scarfCowlAttrs) {
        return `${scarfCowlAttrs.type}: ${scarfCowlAttrs.type === 'scarf' ? `${scarfCowlAttrs.width_cm}x${scarfCowlAttrs.length_cm}cm` : `${scarfCowlAttrs.circumference_cm}cm circumference`}`;
      } else if (!requiresAccessoryDefinition) {
        return 'No accessory definition required for this garment type';
      }
      return undefined;
    
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
      if (session.selected_gauge_profile_id) {
        return { 
          id: session.selected_gauge_profile_id,
          stitch_count: session.gauge_stitch_count,
          row_count: session.gauge_row_count,
          unit: session.gauge_unit
        };
      } else if (session.gauge_stitch_count && session.gauge_row_count && session.gauge_unit) {
        return { 
          stitch_count: session.gauge_stitch_count,
          row_count: session.gauge_row_count,
          unit: session.gauge_unit
        };
      }
      return undefined;
    
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
    
    case 'accessory-definition':
      const beanieData = session.parameter_snapshot?.beanie;
      const scarfCowlData = session.parameter_snapshot?.scarf_cowl;
      const garmentTypeKey = session.garment_type?.type_key;
      const requiresAccessoryDefinition = garmentTypeKey === 'beanie' || garmentTypeKey === 'scarf' || garmentTypeKey === 'cowl';
      
      if (beanieData || scarfCowlData) {
        return { beanie: beanieData, scarf_cowl: scarfCowlData };
      } else if (!requiresAccessoryDefinition) {
        return { not_required: true, garment_type: garmentTypeKey };
      }
      return undefined;
    
    default:
      return undefined;
  }
} 