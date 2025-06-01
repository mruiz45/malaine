/**
 * Hook for managing stitch chart style preferences (US_12.8)
 * Handles persistence, loading, and management of style preferences in localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { 
  StitchChartStylePreferences, 
  DiagramStyleOptions,
  DEFAULT_STYLE_PREFERENCES 
} from '@/types/stitchChartStyles';
import { DEFAULT_STYLE_PREFERENCES as DEFAULT_PREFS } from '@/types/stitchChartStyles';

/**
 * Storage key for style preferences
 */
const STORAGE_KEY = 'malaine_stitch_chart_style_preferences';

/**
 * Current version for preferences data structure
 */
const CURRENT_VERSION = 1;

/**
 * Stored preferences structure with versioning
 */
interface StoredPreferences {
  version: number;
  preferences: StitchChartStylePreferences;
  lastUpdated: string;
}

/**
 * Hook result interface
 */
interface UseStitchChartStylePreferencesResult {
  /** Current style preferences */
  preferences: StitchChartStylePreferences;
  /** Whether preferences are currently loading */
  isLoading: boolean;
  /** Whether localStorage is available */
  isStorageAvailable: boolean;
  /** Update specific color options */
  updateColorOptions: (colors: Partial<StitchChartStylePreferences['colors']>) => void;
  /** Update specific grid options */
  updateGridOptions: (grid: Partial<StitchChartStylePreferences['grid']>) => void;
  /** Update specific repeat options */
  updateRepeatOptions: (repeats: Partial<StitchChartStylePreferences['repeats']>) => void;
  /** Update entire preferences object */
  updatePreferences: (preferences: Partial<StitchChartStylePreferences>) => void;
  /** Reset preferences to default values */
  resetToDefaults: () => void;
  /** Load a specific preset */
  loadPreset: (preset: StitchChartStylePreferences) => void;
  /** Get current preferences as DiagramStyleOptions for component use */
  getStyleOptions: () => DiagramStyleOptions;
  /** Export preferences for backup */
  exportPreferences: () => string;
  /** Import preferences from backup */
  importPreferences: (data: string) => boolean;
}

/**
 * Custom hook for managing stitch chart style preferences
 */
export function useStitchChartStylePreferences(): UseStitchChartStylePreferencesResult {
  const [preferences, setPreferences] = useState<StitchChartStylePreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [isStorageAvailable, setIsStorageAvailable] = useState(false);

  /**
   * Check if localStorage is available
   */
  const checkStorageAvailability = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Load preferences from localStorage
   */
  const loadPreferences = useCallback((): StitchChartStylePreferences => {
    if (!checkStorageAvailability()) return DEFAULT_PREFS;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_PREFS;

      const parsed: StoredPreferences = JSON.parse(stored);
      
      // Version check for future compatibility
      if (parsed.version !== CURRENT_VERSION) {
        console.warn('Style preferences version mismatch, using defaults');
        return DEFAULT_PREFS;
      }

      // Validate structure
      if (!parsed.preferences || typeof parsed.preferences !== 'object') {
        return DEFAULT_PREFS;
      }

      // Merge with defaults to ensure all properties exist
      const loadedPreferences: StitchChartStylePreferences = {
        ...DEFAULT_PREFS,
        ...parsed.preferences,
        colors: { ...DEFAULT_PREFS.colors, ...parsed.preferences.colors },
        grid: { ...DEFAULT_PREFS.grid, ...parsed.preferences.grid },
        repeats: { ...DEFAULT_PREFS.repeats, ...parsed.preferences.repeats },
        updatedAt: new Date().toISOString()
      };

      return loadedPreferences;
    } catch (error) {
      console.error('Error loading style preferences:', error);
      return DEFAULT_PREFS;
    }
  }, [checkStorageAvailability]);

  /**
   * Save preferences to localStorage
   */
  const savePreferences = useCallback((prefs: StitchChartStylePreferences): boolean => {
    if (!checkStorageAvailability()) return false;

    try {
      const dataToStore: StoredPreferences = {
        version: CURRENT_VERSION,
        preferences: {
          ...prefs,
          updatedAt: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      return true;
    } catch (error) {
      console.error('Error saving style preferences:', error);
      return false;
    }
  }, [checkStorageAvailability]);

  /**
   * Initialize preferences on component mount
   */
  useEffect(() => {
    const storageAvailable = checkStorageAvailability();
    setIsStorageAvailable(storageAvailable);

    if (storageAvailable) {
      const loadedPrefs = loadPreferences();
      setPreferences(loadedPrefs);
    } else {
      setPreferences(DEFAULT_PREFS);
    }

    setIsLoading(false);
  }, [checkStorageAvailability, loadPreferences]);

  /**
   * Update color options
   */
  const updateColorOptions = useCallback((colors: Partial<StitchChartStylePreferences['colors']>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        colors: { ...prev.colors, ...colors }
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  /**
   * Update grid options
   */
  const updateGridOptions = useCallback((grid: Partial<StitchChartStylePreferences['grid']>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        grid: { ...prev.grid, ...grid }
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  /**
   * Update repeat options
   */
  const updateRepeatOptions = useCallback((repeats: Partial<StitchChartStylePreferences['repeats']>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        repeats: { ...prev.repeats, ...repeats }
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  /**
   * Update entire preferences object
   */
  const updatePreferences = useCallback((updates: Partial<StitchChartStylePreferences>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        ...updates,
        colors: { ...prev.colors, ...updates.colors },
        grid: { ...prev.grid, ...updates.grid },
        repeats: { ...prev.repeats, ...updates.repeats }
      };
      savePreferences(updated);
      return updated;
    });
  }, [savePreferences]);

  /**
   * Reset preferences to default values
   */
  const resetToDefaults = useCallback(() => {
    const defaultsWithTimestamp = {
      ...DEFAULT_PREFS,
      id: `default_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    setPreferences(defaultsWithTimestamp);
    savePreferences(defaultsWithTimestamp);
  }, [savePreferences]);

  /**
   * Load a specific preset
   */
  const loadPreset = useCallback((preset: StitchChartStylePreferences) => {
    const presetWithTimestamp = {
      ...preset,
      updatedAt: new Date().toISOString()
    };
    setPreferences(presetWithTimestamp);
    savePreferences(presetWithTimestamp);
  }, [savePreferences]);

  /**
   * Get current preferences as DiagramStyleOptions for component use
   */
  const getStyleOptions = useCallback((): DiagramStyleOptions => {
    return {
      colors: preferences.colors,
      grid: preferences.grid,
      repeats: preferences.repeats
    };
  }, [preferences]);

  /**
   * Export preferences for backup
   */
  const exportPreferences = useCallback((): string => {
    const exportData = {
      preferences,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0'
    };
    return JSON.stringify(exportData, null, 2);
  }, [preferences]);

  /**
   * Import preferences from backup
   */
  const importPreferences = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data);
      
      if (!parsed.preferences || typeof parsed.preferences !== 'object') {
        return false;
      }

      // Validate and merge with defaults
      const importedPrefs: StitchChartStylePreferences = {
        ...DEFAULT_PREFS,
        ...parsed.preferences,
        colors: { ...DEFAULT_PREFS.colors, ...parsed.preferences.colors },
        grid: { ...DEFAULT_PREFS.grid, ...parsed.preferences.grid },
        repeats: { ...DEFAULT_PREFS.repeats, ...parsed.preferences.repeats },
        id: `imported_${Date.now()}`,
        updatedAt: new Date().toISOString()
      };

      setPreferences(importedPrefs);
      savePreferences(importedPrefs);
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }, [savePreferences]);

  return {
    preferences,
    isLoading,
    isStorageAvailable,
    updateColorOptions,
    updateGridOptions,
    updateRepeatOptions,
    updatePreferences,
    resetToDefaults,
    loadPreset,
    getStyleOptions,
    exportPreferences,
    importPreferences
  };
} 