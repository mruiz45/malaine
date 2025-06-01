/**
 * Pattern Progress Hook (US_11.7)
 * Custom hook for managing pattern progress state and localStorage synchronization
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  PatternProgress, 
  ProgressNavigation,
  PatternProgressState,
  ProgressInitializationOptions
} from '@/types/pattern-progress';
import { AssembledPattern, PatternComponent } from '@/types/assembled-pattern';
import { patternProgressService } from '@/services/patternProgressService';

/**
 * Hook for managing pattern progress
 */
export function usePatternProgress(
  sessionId: string | null,
  pattern: AssembledPattern | null,
  options: ProgressInitializationOptions = {}
) {
  const {
    loadExisting = true,
    enableAutoSave = true,
    autoSaveInterval = 2000
  } = options;

  // State
  const [state, setState] = useState<PatternProgressState>({
    progress: null,
    navigation: {
      canGoPrevious: false,
      canGoNext: false,
      currentPosition: 0,
      totalSteps: 0,
      currentComponent: undefined
    },
    isLoading: false,
    error: undefined,
    autoSave: enableAutoSave
  });

  // Auto-save timer reference
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Calculate navigation state based on current progress and pattern
   */
  const calculateNavigation = useCallback((
    progress: PatternProgress | null,
    pattern: AssembledPattern | null
  ): ProgressNavigation => {
    if (!pattern || !progress) {
      return {
        canGoPrevious: false,
        canGoNext: false,
        currentPosition: 0,
        totalSteps: 0,
        currentComponent: undefined
      };
    }

    // Calculate total steps across all components
    const totalSteps = pattern.components.reduce(
      (total, component) => total + component.instructions.length,
      0
    );

    // Find current position
    let currentPosition = 0;
    let currentComponentIndex = -1;
    
    if (progress.currentComponent && progress.currentInstructionStep !== undefined) {
      currentComponentIndex = pattern.components.findIndex(
        c => c.componentName === progress.currentComponent
      );
      
      if (currentComponentIndex >= 0) {
        // Add steps from previous components
        for (let i = 0; i < currentComponentIndex; i++) {
          currentPosition += pattern.components[i].instructions.length;
        }
        // Add current step within component
        currentPosition += progress.currentInstructionStep;
      }
    }

    return {
      canGoPrevious: currentPosition > 0,
      canGoNext: currentPosition < totalSteps - 1,
      currentPosition,
      totalSteps,
      currentComponent: progress.currentComponent
    };
  }, []);

  /**
   * Load progress from localStorage
   */
  const loadProgress = useCallback(async () => {
    if (!sessionId) return;

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      let progress: PatternProgress | null = null;
      
      if (loadExisting) {
        progress = await patternProgressService.loadProgress(sessionId);
      }

      if (!progress) {
        progress = patternProgressService.createInitialProgress(sessionId);
      }

      const navigation = calculateNavigation(progress, pattern);

      setState(prev => ({
        ...prev,
        progress,
        navigation,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading pattern progress:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load progress',
        isLoading: false
      }));
    }
  }, [sessionId, loadExisting, pattern, calculateNavigation]);

  /**
   * Save progress to localStorage
   */
  const saveProgress = useCallback(async () => {
    if (!state.progress) return false;

    try {
      const success = await patternProgressService.saveProgress(state.progress);
      if (!success) {
        setState(prev => ({
          ...prev,
          error: 'Failed to save progress'
        }));
      }
      return success;
    } catch (error) {
      console.error('Error saving progress:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save progress'
      }));
      return false;
    }
  }, [state.progress]);

  /**
   * Schedule auto-save
   */
  const scheduleAutoSave = useCallback(() => {
    if (!state.autoSave) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      saveProgress();
    }, autoSaveInterval);
  }, [state.autoSave, autoSaveInterval, saveProgress]);

  /**
   * Update progress and navigation state
   */
  const updateProgressState = useCallback((
    updater: (progress: PatternProgress) => PatternProgress
  ) => {
    setState(prev => {
      if (!prev.progress) return prev;

      const newProgress = updater(prev.progress);
      const newNavigation = calculateNavigation(newProgress, pattern);

      return {
        ...prev,
        progress: newProgress,
        navigation: newNavigation
      };
    });

    scheduleAutoSave();
  }, [pattern, calculateNavigation, scheduleAutoSave]);

  /**
   * Initialize progress for a session
   */
  const initializeProgress = useCallback((newSessionId: string) => {
    if (newSessionId === sessionId) return;
    
    // This will be handled by the effect when sessionId changes
  }, [sessionId]);

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback((componentName: string, stepNumber: number) => {
    updateProgressState(progress => ({
      ...progress,
      currentComponent: componentName,
      currentInstructionStep: stepNumber,
      currentRowNumber: stepNumber + 1 // Assuming 1-based row numbering
    }));
  }, [updateProgressState]);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (!state.navigation.canGoPrevious || !pattern || !state.progress) return;

    const currentComponent = state.progress.currentComponent;
    const currentStep = state.progress.currentInstructionStep;

    if (currentComponent && currentStep !== undefined) {
      const componentIndex = pattern.components.findIndex(
        c => c.componentName === currentComponent
      );

      if (componentIndex >= 0) {
        if (currentStep > 0) {
          // Go to previous step in same component
          goToStep(currentComponent, currentStep - 1);
        } else if (componentIndex > 0) {
          // Go to last step of previous component
          const prevComponent = pattern.components[componentIndex - 1];
          goToStep(prevComponent.componentName, prevComponent.instructions.length - 1);
        }
      }
    }
  }, [state.navigation.canGoPrevious, state.progress, pattern, goToStep]);

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    if (!state.navigation.canGoNext || !pattern || !state.progress) return;

    const currentComponent = state.progress.currentComponent;
    const currentStep = state.progress.currentInstructionStep;

    if (currentComponent && currentStep !== undefined) {
      const componentIndex = pattern.components.findIndex(
        c => c.componentName === currentComponent
      );

      if (componentIndex >= 0) {
        const component = pattern.components[componentIndex];
        
        if (currentStep < component.instructions.length - 1) {
          // Go to next step in same component
          goToStep(currentComponent, currentStep + 1);
        } else if (componentIndex < pattern.components.length - 1) {
          // Go to first step of next component
          const nextComponent = pattern.components[componentIndex + 1];
          goToStep(nextComponent.componentName, 0);
        }
      }
    }
  }, [state.navigation.canGoNext, state.progress, pattern, goToStep]);

  /**
   * Update repetition counter
   */
  const updateRepetitionCounter = useCallback((counterId: string, increment: number) => {
    updateProgressState(progress => {
      const currentCount = progress.repetitionCounters[counterId] || 0;
      const newCount = Math.max(0, currentCount + increment);
      
      return {
        ...progress,
        repetitionCounters: {
          ...progress.repetitionCounters,
          [counterId]: newCount
        }
      };
    });
  }, [updateProgressState]);

  /**
   * Reset repetition counter
   */
  const resetRepetitionCounter = useCallback((counterId: string) => {
    updateProgressState(progress => {
      const newCounters = { ...progress.repetitionCounters };
      delete newCounters[counterId];
      
      return {
        ...progress,
        repetitionCounters: newCounters
      };
    });
  }, [updateProgressState]);

  /**
   * Clear all progress
   */
  const clearProgress = useCallback(() => {
    if (!sessionId) return;

    patternProgressService.clearProgress(sessionId);
    
    const initialProgress = patternProgressService.createInitialProgress(sessionId);
    const navigation = calculateNavigation(initialProgress, pattern);

    setState(prev => ({
      ...prev,
      progress: initialProgress,
      navigation
    }));
  }, [sessionId, pattern, calculateNavigation]);

  /**
   * Update current row for chart synchronization
   */
  const updateCurrentRow = useCallback((rowNumber: number) => {
    updateProgressState(progress => ({
      ...progress,
      currentRowNumber: rowNumber
    }));
  }, [updateProgressState]);

  // Load progress when sessionId or pattern changes
  useEffect(() => {
    if (sessionId) {
      loadProgress();
    }
  }, [sessionId, loadProgress]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, []);

  return {
    ...state,
    initializeProgress,
    goToStep,
    goToPreviousStep,
    goToNextStep,
    updateRepetitionCounter,
    resetRepetitionCounter,
    clearProgress,
    saveProgress,
    updateCurrentRow
  };
}

/**
 * Hook for managing repetition counters only
 */
export function useRepetitionCounters(sessionId: string | null) {
  const [counters, setCounters] = useState<Record<string, number>>({});

  // Load counters from localStorage
  useEffect(() => {
    if (!sessionId) return;

    const loadCounters = async () => {
      try {
        const progress = await patternProgressService.loadProgress(sessionId);
        if (progress) {
          setCounters(progress.repetitionCounters);
        }
      } catch (error) {
        console.error('Error loading repetition counters:', error);
      }
    };

    loadCounters();
  }, [sessionId]);

  // Update counter
  const updateCounter = useCallback(async (counterId: string, increment: number) => {
    if (!sessionId) return;

    const newValue = Math.max(0, (counters[counterId] || 0) + increment);
    
    setCounters(prev => ({
      ...prev,
      [counterId]: newValue
    }));

    // Save to localStorage
    await patternProgressService.updateRepetitionCounter(sessionId, counterId, newValue);
  }, [sessionId, counters]);

  // Reset counter
  const resetCounter = useCallback(async (counterId: string) => {
    if (!sessionId) return;

    setCounters(prev => {
      const newCounters = { ...prev };
      delete newCounters[counterId];
      return newCounters;
    });

    // Remove from localStorage
    await patternProgressService.resetRepetitionCounter(sessionId, counterId);
  }, [sessionId]);

  return {
    counters,
    updateCounter,
    resetCounter
  };
} 