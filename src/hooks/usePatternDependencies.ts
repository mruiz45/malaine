'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useContext } from 'react';
import { PatternContext } from '@/contexts/PatternContext';
import { usePatternLogger } from './usePatternLogger';
import { getPatternDependencyService } from '@/services/PatternDependencyService';
import { getLoggingService } from '@/services/LoggingService';
import { PatternState, SleevesData } from '@/types/pattern';

/**
 * Hook configuration interface
 */
interface UsePatternDependenciesConfig {
  /** Component name for logging context */
  componentName?: string;
  /** Whether to show user notifications for dependencies */
  showNotifications?: boolean;
  /** Whether to automatically handle dependencies */
  autoHandle?: boolean;
}

/**
 * Return type for the usePatternDependencies hook
 */
interface PatternDependenciesHook {
  /** Check for dependencies when sleeve type changes */
  handleSleeveTypeChange: (oldType: SleevesData['sleeveType'], newType: SleevesData['sleeveType']) => void;
  
  /** Get summary of pending recalculations */
  getPendingRecalculations: () => string[];
  
  /** Check if a section has pending recalculations */
  hasPendingRecalculations: (sectionName: string) => boolean;
  
  /** Clear recalculation flags for a section */
  clearRecalculationFlags: (sectionName: string) => void;
  
  /** Manually trigger dependency check for current state */
  checkDependencies: () => void;
}

/**
 * Custom hook for managing pattern section dependencies (PD_PH4_US003)
 * Provides automatic detection and handling of interdependent calculations
 * 
 * @param config - Optional configuration for the dependency handler
 * @returns PatternDependenciesHook object with dependency management methods
 */
export function usePatternDependencies(config?: UsePatternDependenciesConfig): PatternDependenciesHook {
  const context = useContext(PatternContext);
  if (!context) {
    throw new Error('usePatternDependencies must be used within a PatternProvider');
  }
  const { state, dispatch } = context;
  const logger = usePatternLogger({ 
    componentName: config?.componentName || 'PatternDependencies' 
  });
  
  // Get services
  const loggingService = getLoggingService();
  const dependencyService = getPatternDependencyService(loggingService);
  
  // Keep previous state for comparison
  const previousState = useRef<PatternState>(state);
  
  // Auto-handle dependencies when pattern state changes
  useEffect(() => {
    if (config?.autoHandle !== false) {
      const prevSleeves = previousState.current.sleeves;
      const currentSleeves = state.sleeves;
      
      // Check if sleeve type changed
      if (prevSleeves.sleeveType !== currentSleeves.sleeveType) {
        handleSleeveTypeChange(prevSleeves.sleeveType, currentSleeves.sleeveType);
      }
    }
    
    // Update previous state reference
    previousState.current = state;
  }, [state.sleeves.sleeveType, config?.autoHandle]);

  /**
   * Handle sleeve type change and update dependencies
   */
  const handleSleeveTypeChange = useCallback((
    oldType: SleevesData['sleeveType'], 
    newType: SleevesData['sleeveType']
  ) => {
    if (oldType === newType) return;

    logger.log('DEBUG', 'SLEEVE_TYPE_DEPENDENCY_DETECTED', {
      oldSleeveType: oldType || 'null',
      newSleeveType: newType || 'null',
      component: config?.componentName || 'PatternDependencies'
    });

    // Use dependency service to handle the change
    const updatedState = dependencyService.handleSleevesUpdate(
      { ...state.sleeves, sleeveType: oldType },
      { ...state.sleeves, sleeveType: newType },
      state
    );

    // If state was updated, dispatch the changes
    if (updatedState !== state) {
      // Update body structure with recalculation flag
      dispatch({ 
        type: 'UPDATE_BODY_STRUCTURE', 
        payload: updatedState.bodyStructure 
      });

      logger.log('INFO', 'BODY_STRUCTURE_RECALCULATION_FLAGGED', {
        triggerSection: 'sleeves',
        triggerEvent: 'sleeveType_changed',
        flaggedCalculations: ['armhole'],
        oldSleeveType: oldType || 'null',
        newSleeveType: newType || 'null'
      });

      // Optional user notification
      if (config?.showNotifications) {
        console.info(
          `🔄 Pattern Dependency: Changing sleeve type may require adjustments to armhole depth/shape. ` +
          `These will be calculated in the final pattern.`
        );
      }
    }
  }, [state, dispatch, dependencyService, logger, config]);

  /**
   * Get summary of pending recalculations
   */
  const getPendingRecalculations = useCallback((): string[] => {
    return dependencyService.getPendingRecalculationSummary(state);
  }, [state, dependencyService]);

  /**
   * Check if a section has pending recalculations
   */
  const hasPendingRecalculations = useCallback((sectionName: string): boolean => {
    return dependencyService.hasPendingRecalculations(state, sectionName);
  }, [state, dependencyService]);

  /**
   * Clear recalculation flags for a section
   */
  const clearRecalculationFlags = useCallback((sectionName: string) => {
    const updatedState = dependencyService.clearRecalculationFlags(state, sectionName);
    
    if (updatedState !== state) {
      switch (sectionName) {
        case 'bodyStructure':
          dispatch({ 
            type: 'UPDATE_BODY_STRUCTURE', 
            payload: updatedState.bodyStructure 
          });
          break;
        // Future sections can be added here
      }
      
      logger.log('INFO', 'STATE_MUTATION', {
        mutation: `Cleared recalculation flags for ${sectionName}`,
        component: config?.componentName
      });
    }
  }, [state, dispatch, dependencyService, logger, config]);

  /**
   * Manually trigger dependency check for current state
   */
  const checkDependencies = useCallback(() => {
    logger.log('DEBUG', 'USER_INPUT_CHANGED', {
      inputName: 'manual_dependency_check',
      component: config?.componentName
    });

    // For now, just log current pending recalculations
    const pending = getPendingRecalculations();
    if (pending.length > 0) {
      logger.log('INFO', 'VALIDATION_ERROR', {
        field: 'dependencies',
        error: `Pending recalculations: ${pending.join(', ')}`,
        component: config?.componentName
      });
    }
  }, [getPendingRecalculations, logger, config]);

  return {
    handleSleeveTypeChange,
    getPendingRecalculations,
    hasPendingRecalculations,
    clearRecalculationFlags,
    checkDependencies
  };
}

// HOC temporarily removed due to TypeScript syntax issues
// TODO: Re-implement withPatternDependencies HOC in future iteration 