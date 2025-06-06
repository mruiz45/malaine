/**
 * Custom Hook for Restore Points Management (PD_PH3_US002)
 * Handles creation, management, and restoration of pattern state snapshots
 */

'use client';

import { useCallback, useMemo } from 'react';
import { 
  RestorePoint,
  RestorePointConfig,
  RestorePointState,
  UseRestorePointsReturn,
  DEFAULT_RESTORE_POINT_CONFIG,
  StateWithoutRestorePoints,
  CreateRestorePointOptions,
  RestorePointOperationResult
} from '@/types/restorePoints';
import { InMemoryPatternDefinition } from '@/types/patternDefinitionInMemory';

/**
 * Generate a unique ID for restore points
 */
const generateRestorePointId = (): string => {
  return `rp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a deep copy of an object excluding specified keys
 */
const createStateSnapshot = <T extends Record<string, any>>(
  state: T, 
  excludeKeys: (keyof T)[] = []
): StateWithoutRestorePoints<T> => {
  const snapshot = { ...state };
  
  // Remove excluded keys
  excludeKeys.forEach(key => {
    delete snapshot[key];
  });
  
  // Create deep copy to avoid reference issues
  return JSON.parse(JSON.stringify(snapshot));
};

/**
 * Generate auto name for restore point
 */
const generateAutoName = (
  config: RestorePointConfig,
  existingRestorePoints: RestorePoint<any>[]
): string => {
  const count = existingRestorePoints.length + 1;
  return `${config.defaultNamePrefix} ${count}`;
};

/**
 * Custom hook for managing restore points
 */
export function useRestorePoints<T extends InMemoryPatternDefinition>(
  currentState: T | null,
  setState: (state: T | null, shouldSnapshot?: boolean) => void,
  initialConfig: Partial<RestorePointConfig> = {}
): UseRestorePointsReturn<StateWithoutRestorePoints<T>> {
  
  const config = useMemo(() => ({
    ...DEFAULT_RESTORE_POINT_CONFIG,
    ...initialConfig
  }), [initialConfig]);

  // Get restore points from current state
  const restorePoints = useMemo((): RestorePoint<StateWithoutRestorePoints<T>>[] => {
    return (currentState?.restorePoints || []) as RestorePoint<StateWithoutRestorePoints<T>>[];
  }, [currentState?.restorePoints]);

  // Derive state information
  const hasRestorePoints = restorePoints.length > 0;
  const isAtMaxCapacity = restorePoints.length >= config.maxRestorePoints;

  const state: RestorePointState = {
    restorePoints,
    config,
    isProcessing: false,
    error: undefined
  };

  /**
   * Create a new restore point
   */
  const createRestorePoint = useCallback((
    name?: string,
    description?: string
  ): RestorePoint<StateWithoutRestorePoints<T>> => {
    if (!currentState || !config.enabled) {
      throw new Error('Cannot create restore point: no current state or restore points disabled');
    }

    // Generate name if not provided
    const finalName = name || (config.autoGenerateNames 
      ? generateAutoName(config, restorePoints)
      : 'Unnamed Restore Point');

    // Create state snapshot excluding restorePoints to avoid recursion
    const stateSnapshot = createStateSnapshot(currentState, ['restorePoints']);

    // Create new restore point
    const newRestorePoint: RestorePoint<StateWithoutRestorePoints<T>> = {
      id: generateRestorePointId(),
      name: finalName,
      timestamp: new Date().toISOString(),
      state: stateSnapshot,
      description
    };

    // Update current state with new restore point
    const updatedRestorePoints = [...restorePoints, newRestorePoint];
    
    // Enforce max capacity by removing oldest if necessary
    if (updatedRestorePoints.length > config.maxRestorePoints) {
      updatedRestorePoints.shift(); // Remove oldest
    }

    const updatedState: T = {
      ...currentState,
      restorePoints: updatedRestorePoints,
      updatedAt: new Date()
    };

    // Update state without creating undo snapshot (restore point creation itself shouldn't be undoable)
    setState(updatedState, false);
    
    console.log('💾 [RESTORE POINT CREATED]', finalName, newRestorePoint.id);
    
    return newRestorePoint;
  }, [currentState, config, restorePoints, setState]);

  /**
   * Revert to a specific restore point
   */
  const revertToRestorePoint = useCallback((restorePointId: string): void => {
    if (!currentState || !config.enabled) {
      throw new Error('Cannot revert: no current state or restore points disabled');
    }

    const targetRestorePoint = restorePoints.find(rp => rp.id === restorePointId);
    if (!targetRestorePoint) {
      throw new Error(`Restore point with ID ${restorePointId} not found`);
    }

    // Restore the state but keep the current restorePoints array
    const restoredState: T = {
      ...targetRestorePoint.state as T,
      restorePoints: currentState.restorePoints, // Keep current restore points
      updatedAt: new Date()
    };

    // This action should be undoable, so create a snapshot
    setState(restoredState, true);
    
    console.log('⏪ [RESTORED TO RESTORE POINT]', targetRestorePoint.name, restorePointId);
  }, [currentState, config.enabled, restorePoints, setState]);

  /**
   * Delete a specific restore point
   */
  const deleteRestorePoint = useCallback((restorePointId: string): void => {
    if (!currentState || !config.enabled) {
      throw new Error('Cannot delete restore point: no current state or restore points disabled');
    }

    const updatedRestorePoints = restorePoints.filter(rp => rp.id !== restorePointId);
    
    const updatedState: T = {
      ...currentState,
      restorePoints: updatedRestorePoints,
      updatedAt: new Date()
    };

    // Update state without creating undo snapshot
    setState(updatedState, false);
    
    console.log('🗑️ [RESTORE POINT DELETED]', restorePointId);
  }, [currentState, config.enabled, restorePoints, setState]);

  /**
   * Clear all restore points
   */
  const clearRestorePoints = useCallback((): void => {
    if (!currentState || !config.enabled) {
      throw new Error('Cannot clear restore points: no current state or restore points disabled');
    }

    const updatedState: T = {
      ...currentState,
      restorePoints: [],
      updatedAt: new Date()
    };

    // Update state without creating undo snapshot
    setState(updatedState, false);
    
    console.log('🗑️ [ALL RESTORE POINTS CLEARED]');
  }, [currentState, config.enabled, setState]);

  /**
   * Get all restore points
   */
  const getRestorePoints = useCallback((): RestorePoint<StateWithoutRestorePoints<T>>[] => {
    return restorePoints;
  }, [restorePoints]);

  /**
   * Update configuration (this could be extended to persist config)
   */
  const updateConfig = useCallback((newConfig: Partial<RestorePointConfig>): void => {
    // For now, this just logs the config update
    // In a full implementation, this might update stored configuration
    console.log('⚙️ [RESTORE POINT CONFIG UPDATE]', newConfig);
  }, []);

  return {
    // State
    state,
    hasRestorePoints,
    isAtMaxCapacity,
    
    // Actions
    createRestorePoint,
    revertToRestorePoint,
    deleteRestorePoint,
    clearRestorePoints,
    getRestorePoints,
    updateConfig
  };
} 