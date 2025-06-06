/**
 * In-Memory Pattern Definition Context with Undo/Redo (PD_PH3_US001)
 * Enhanced version of the in-memory pattern definition context with undo/redo functionality
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import {
  InMemoryPatternDefinition,
  InMemoryPatternDefinitionState,
  InMemoryNavigationState,
  PatternDefinitionSection
} from '@/types/patternDefinitionInMemory';
import { getGarmentTypeConfig } from '@/utils/garmentTypeConfig';
import { useInMemoryPatternUndoRedo, patternDefinitionUndoRedoUtils } from '@/stores/patternDefinitionUndoRedoStore';
import { UndoRedoState } from '@/types/undoRedo';
import { RestorePoint, StateWithoutRestorePoints } from '@/types/restorePoints';
import { useRestorePoints } from '@/hooks/useRestorePoints';

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
 * Enhanced logging for undo/redo actions
 */
function logUndoRedoAction(
  action: string,
  pattern: InMemoryPatternDefinition | null,
  undoRedoState: UndoRedoState
) {
  console.group(`🔄 [UNDO/REDO ACTION] - ${action}`);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('🔄 Undo/Redo State:', undoRedoState);
  console.log('🏗️ Pattern State:', pattern ? `${pattern.sessionName} (${pattern.sessionId})` : 'null');
  console.groupEnd();
}

/**
 * Enhanced context interface with undo/redo and restore point capabilities
 */
export interface InMemoryPatternDefinitionWithUndoRedoContext {
  /** Current pattern definition */
  currentPattern: InMemoryPatternDefinition | null;
  /** Navigation state */
  navigation: InMemoryNavigationState;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Undo/Redo state */
  undoRedoState: UndoRedoState;
  
  // Pattern actions
  /** Create a new pattern */
  createPattern: (sessionName: string, craftType: 'knitting' | 'crochet') => void;
  /** Select garment type */
  selectGarmentType: (garmentTypeKey: string) => void;
  /** Navigate to a specific section */
  navigateToSection: (section: PatternDefinitionSection) => void;
  /** Update section data */
  updateSectionData: (section: PatternDefinitionSection, data: any) => void;
  /** Mark section as completed */
  markSectionCompleted: (section: PatternDefinitionSection) => void;
  /** Clear current pattern */
  clearPattern: () => void;
  
  // Undo/Redo actions
  /** Undo last action */
  undo: () => void;
  /** Redo previously undone action */
  redo: () => void;
  /** Clear undo/redo history */
  clearHistory: () => void;
  /** Create manual snapshot */
  createSnapshot: () => void;
  /** Update undo/redo configuration */
  updateUndoRedoConfig: (config: { maxHistorySize?: number; enabled?: boolean }) => void;
  
  // Restore Point actions (PD_PH3_US002)
  /** Create a new restore point */
  createRestorePoint: (name?: string, description?: string) => RestorePoint<StateWithoutRestorePoints<InMemoryPatternDefinition>>;
  /** Revert to a specific restore point */
  revertToRestorePoint: (restorePointId: string) => void;
  /** Delete a specific restore point */
  deleteRestorePoint: (restorePointId: string) => void;
  /** Clear all restore points */
  clearAllRestorePoints: () => void;
  /** Get all restore points */
  getAllRestorePoints: () => RestorePoint<StateWithoutRestorePoints<InMemoryPatternDefinition>>[];
  /** Whether there are any restore points available */
  hasRestorePoints: boolean;
  /** Whether the maximum number of restore points has been reached */
  isAtMaxRestorePointCapacity: boolean;
}

/**
 * Context instance
 */
const InMemoryPatternDefinitionWithUndoRedoContextInstance = createContext<InMemoryPatternDefinitionWithUndoRedoContext | null>(null);

/**
 * Provider props
 */
interface InMemoryPatternDefinitionWithUndoRedoProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component
 */
export function InMemoryPatternDefinitionWithUndoRedoProvider({ 
  children 
}: InMemoryPatternDefinitionWithUndoRedoProviderProps) {
  const {
    state: pattern,
    setState: setPattern,
    undo,
    redo,
    clearHistory,
    snapshot: createSnapshot,
    undoRedoState,
    updateConfig,
  } = useInMemoryPatternUndoRedo();

  // Initialize restore points hook (PD_PH3_US002)
  const restorePointsManager = useRestorePoints(pattern, setPattern);

  // Derive navigation state from current pattern
  const navigation: InMemoryNavigationState = React.useMemo(() => {
    if (!pattern?.garmentType) {
      return initialNavigation;
    }

    const config = getGarmentTypeConfig(pattern.garmentType);
    if (!config) {
      return initialNavigation;
    }

    return {
      currentSection: config.defaultSection,
      availableSections: config.relevantSections,
      completedSections: calculateCompletedSections(pattern),
      requiredSections: config.requiredSections,
    };
  }, [pattern]);

  // Loading and error states (simplified for this context)
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Track if this is the initial pattern creation to avoid unwanted snapshots
  const isCreatingPattern = useRef(false);

  /**
   * Create a new pattern
   */
  const createPattern = useCallback((sessionName: string, craftType: 'knitting' | 'crochet') => {
    isCreatingPattern.current = true;
    
    const newPattern: InMemoryPatternDefinition = {
      sessionId: generateSessionId(),
      sessionName,
      craftType,
      garmentType: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set pattern without creating snapshot (it's a new pattern)
    setPattern(newPattern, false);
    clearHistory(); // Clear any previous history
    setError(null);
    
    console.log('🆕 [PATTERN CREATED]', newPattern.sessionName);
    
    isCreatingPattern.current = false;
  }, [setPattern, clearHistory]);

  /**
   * Select garment type
   */
  const selectGarmentType = useCallback((garmentTypeKey: string) => {
    if (!pattern) {
      setError('No active pattern to update');
      return;
    }

    const config = getGarmentTypeConfig(garmentTypeKey);
    if (!config) {
      setError('Invalid garment type');
      return;
    }

    const updatedPattern: InMemoryPatternDefinition = {
      ...pattern,
      garmentType: garmentTypeKey,
      updatedAt: new Date()
    };

    // Create snapshot before significant change
    setPattern(updatedPattern, true);
    setError(null);
    
    console.log('🎯 [GARMENT TYPE SELECTED]', garmentTypeKey);
  }, [pattern, setPattern]);

  /**
   * Navigate to section (no snapshot needed, UI state only)
   */
  const navigateToSection = useCallback((section: PatternDefinitionSection) => {
    // This is just UI navigation, no pattern data change
    console.log('🧭 [SECTION NAVIGATION]', section);
  }, []);

  /**
   * Update section data
   */
  const updateSectionData = useCallback((section: PatternDefinitionSection, data: any) => {
    if (!pattern) {
      setError('No active pattern to update');
      return;
    }

    if (section === 'summary') {
      // Skip data updates for summary section
      return;
    }

    // Get current section data and merge with new data
    const currentSectionData = pattern[section as keyof InMemoryPatternDefinition];
    const newSectionData = currentSectionData && typeof currentSectionData === 'object' 
      ? { ...currentSectionData, ...data }
      : data;

    const updatedPattern: InMemoryPatternDefinition = {
      ...pattern,
      [section]: newSectionData,
      updatedAt: new Date()
    };

    // Create snapshot for field changes (as requested: toute modification de champ)
    setPattern(updatedPattern, true);
    setError(null);
    
    console.log('📝 [SECTION DATA UPDATED]', section, data);
  }, [pattern, setPattern]);

  /**
   * Mark section as completed
   */
  const markSectionCompleted = useCallback((section: PatternDefinitionSection) => {
    if (!pattern || section === 'summary') {
      return;
    }

    const currentSectionData = pattern[section as keyof InMemoryPatternDefinition];
    if (!currentSectionData || typeof currentSectionData !== 'object') {
      setError(`No data found for section ${section}`);
      return;
    }

    const updatedSectionData = {
      ...currentSectionData,
      isCompleted: true
    };

    const updatedPattern: InMemoryPatternDefinition = {
      ...pattern,
      [section]: updatedSectionData,
      updatedAt: new Date()
    };

    // Create snapshot for completion marking
    setPattern(updatedPattern, true);
    setError(null);
    
    console.log('✅ [SECTION COMPLETED]', section);
  }, [pattern, setPattern]);

  /**
   * Clear pattern
   */
  const clearPattern = useCallback(() => {
    setPattern(null, false);
    clearHistory();
    setError(null);
    
    console.log('🗑️ [PATTERN CLEARED]');
  }, [setPattern, clearHistory]);

  /**
   * Undo wrapper with logging
   */
  const undoWithLogging = useCallback(() => {
    undo();
    logUndoRedoAction('UNDO', pattern, undoRedoState);
  }, [undo, pattern, undoRedoState]);

  /**
   * Redo wrapper with logging
   */
  const redoWithLogging = useCallback(() => {
    redo();
    logUndoRedoAction('REDO', pattern, undoRedoState);
  }, [redo, pattern, undoRedoState]);

  /**
   * Update undo/redo configuration
   */
  const updateUndoRedoConfig = useCallback((config: { maxHistorySize?: number; enabled?: boolean }) => {
    updateConfig(config);
    console.log('⚙️ [UNDO/REDO CONFIG UPDATED]', config);
  }, [updateConfig]);

  /**
   * Context value
   */
  const contextValue: InMemoryPatternDefinitionWithUndoRedoContext = {
    // State
    currentPattern: pattern,
    navigation,
    isLoading,
    error,
    undoRedoState,
    
    // Pattern actions
    createPattern,
    selectGarmentType,
    navigateToSection,
    updateSectionData,
    markSectionCompleted,
    clearPattern,
    
    // Undo/Redo actions
    undo: undoWithLogging,
    redo: redoWithLogging,
    clearHistory,
    createSnapshot,
    updateUndoRedoConfig,
    
    // Restore Point actions (PD_PH3_US002)
    createRestorePoint: restorePointsManager.createRestorePoint,
    revertToRestorePoint: restorePointsManager.revertToRestorePoint,
    deleteRestorePoint: restorePointsManager.deleteRestorePoint,
    clearAllRestorePoints: restorePointsManager.clearRestorePoints,
    getAllRestorePoints: restorePointsManager.getRestorePoints,
    hasRestorePoints: restorePointsManager.hasRestorePoints,
    isAtMaxRestorePointCapacity: restorePointsManager.isAtMaxCapacity,
  };

  return (
    <InMemoryPatternDefinitionWithUndoRedoContextInstance.Provider value={contextValue}>
      {children}
    </InMemoryPatternDefinitionWithUndoRedoContextInstance.Provider>
  );
}

/**
 * Hook to use the enhanced context
 */
export function useInMemoryPatternDefinitionWithUndoRedo(): InMemoryPatternDefinitionWithUndoRedoContext {
  const context = useContext(InMemoryPatternDefinitionWithUndoRedoContextInstance);
  if (!context) {
    throw new Error('useInMemoryPatternDefinitionWithUndoRedo must be used within InMemoryPatternDefinitionWithUndoRedoProvider');
  }
  return context;
} 