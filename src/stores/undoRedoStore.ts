/**
 * Generic Undo/Redo Store with Zustand
 * Custom implementation of undo/redo functionality for any state type
 */

import { create } from 'zustand';
import { 
  UndoRedoConfig, 
  UndoRedoState, 
  UseUndoRedoStoreReturn,
  DEFAULT_UNDO_REDO_CONFIG 
} from '@/types/undoRedo';

/**
 * Internal store state for undo/redo management
 */
interface UndoRedoStoreState<T> {
  /** Current state */
  present: T;
  /** Past states (undo stack) */
  past: T[];
  /** Future states (redo stack) */
  future: T[];
  /** Configuration */
  config: UndoRedoConfig;
}

/**
 * Actions for the undo/redo store
 */
interface UndoRedoStoreActions<T> {
  /** Set new state and optionally create snapshot */
  setState: (state: T, shouldSnapshot?: boolean) => void;
  /** Undo last action */
  undo: () => void;
  /** Redo previously undone action */
  redo: () => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Create manual snapshot */
  snapshot: () => void;
  /** Update configuration */
  updateConfig: (config: Partial<UndoRedoConfig>) => void;
}

/**
 * Complete store interface
 */
type UndoRedoStore<T> = UndoRedoStoreState<T> & UndoRedoStoreActions<T>;

/**
 * Create an undo/redo store for a specific state type
 */
export function createUndoRedoStore<T>(
  initialState: T,
  initialConfig: Partial<UndoRedoConfig> = {}
) {
  const config = { ...DEFAULT_UNDO_REDO_CONFIG, ...initialConfig };

  const useStore = create<UndoRedoStore<T>>((set, get) => ({
    // Initial state
    present: initialState,
    past: [],
    future: [],
    config,

    // Actions
    setState: (newState: T, shouldSnapshot: boolean = true) => {
      const { present, past, config: currentConfig } = get();
      
      if (!currentConfig.enabled) {
        set({ present: newState });
        return;
      }

      if (shouldSnapshot && currentConfig.autoSnapshot) {
        // Create snapshot by moving current state to past
        const newPast = [...past, present];
        
        // Limit history size
        if (newPast.length > currentConfig.maxHistorySize) {
          newPast.shift(); // Remove oldest entry
        }

        set({
          present: newState,
          past: newPast,
          future: [], // Clear future on new action
        });
      } else {
        // Direct state update without creating snapshot
        set({ present: newState });
      }
    },

    undo: () => {
      const { present, past, future, config: currentConfig } = get();
      
      if (!currentConfig.enabled || past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      const newFuture = [present, ...future];

      set({
        present: previous,
        past: newPast,
        future: newFuture,
      });
    },

    redo: () => {
      const { present, past, future, config: currentConfig } = get();
      
      if (!currentConfig.enabled || future.length === 0) return;

      const next = future[0];
      const newFuture = future.slice(1);
      const newPast = [...past, present];

      set({
        present: next,
        past: newPast,
        future: newFuture,
      });
    },

    clearHistory: () => {
      set((state) => ({
        ...state,
        past: [],
        future: [],
      }));
    },

    snapshot: () => {
      const { present, past, config: currentConfig } = get();
      
      if (!currentConfig.enabled) return;

      const newPast = [...past, present];
      
      // Limit history size
      if (newPast.length > currentConfig.maxHistorySize) {
        newPast.shift();
      }

      set({
        past: newPast,
        future: [], // Clear future on manual snapshot
      });
    },

    updateConfig: (newConfig: Partial<UndoRedoConfig>) => {
      set((state) => ({
        ...state,
        config: { ...state.config, ...newConfig },
      }));
    },
  }));

  /**
   * Hook to use the undo/redo store
   */
  const useUndoRedoStore = (): UseUndoRedoStoreReturn<T> => {
    const {
      present,
      past,
      future,
      config,
      setState,
      undo,
      redo,
      clearHistory,
      snapshot,
      updateConfig,
    } = useStore();

    const undoRedoState: UndoRedoState = {
      canUndo: config.enabled && past.length > 0,
      canRedo: config.enabled && future.length > 0,
      currentIndex: past.length,
      historySize: past.length + future.length + 1,
      config,
    };

    return {
      state: present,
      setState,
      undo,
      redo,
      snapshot,
      clearHistory,
      undoRedoState,
      updateConfig,
    };
  };

  return {
    useUndoRedoStore,
    store: useStore,
  };
}

/**
 * Utility function to create a simple undo/redo hook
 */
export function createSimpleUndoRedoHook<T>(
  initialState: T,
  config?: Partial<UndoRedoConfig>
) {
  const { useUndoRedoStore } = createUndoRedoStore(initialState, config);
  return useUndoRedoStore;
} 