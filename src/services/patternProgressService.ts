/**
 * Pattern Progress Service (US_11.7)
 * Service for managing pattern progress persistence in localStorage
 */

import type { 
  PatternProgress, 
  RepetitionInstruction,
  ProgressExport 
} from '@/types/pattern-progress';

/**
 * Storage key prefix for pattern progress
 */
const STORAGE_KEY_PREFIX = 'malaine_pattern_progress_';

/**
 * Current version for progress data structure
 */
const CURRENT_VERSION = 1;

/**
 * Service class for pattern progress operations
 */
export class PatternProgressService {
  
  /**
   * Generate storage key for a session
   */
  private getStorageKey(sessionId: string): string {
    return `${STORAGE_KEY_PREFIX}${sessionId}`;
  }

  /**
   * Check if localStorage is available
   */
  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load progress data for a session
   */
  async loadProgress(sessionId: string): Promise<PatternProgress | null> {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      const key = this.getStorageKey(sessionId);
      const data = localStorage.getItem(key);
      
      if (!data) return null;

      const progress: PatternProgress = JSON.parse(data);
      
      // Validate the loaded data
      if (!this.isValidProgress(progress)) {
        console.warn('Invalid progress data found, clearing it');
        this.clearProgress(sessionId);
        return null;
      }

      // Migrate if necessary
      if (progress.version < CURRENT_VERSION) {
        const migrated = this.migrateProgress(progress);
        if (migrated) {
          await this.saveProgress(migrated);
          return migrated;
        }
      }

      return progress;
    } catch (error) {
      console.error('Error loading pattern progress:', error);
      return null;
    }
  }

  /**
   * Save progress data for a session
   */
  async saveProgress(progress: PatternProgress): Promise<boolean> {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const key = this.getStorageKey(progress.sessionId);
      const data = JSON.stringify({
        ...progress,
        lastUpdated: new Date().toISOString(),
        version: CURRENT_VERSION
      });
      
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.error('Error saving pattern progress:', error);
      return false;
    }
  }

  /**
   * Create initial progress for a session
   */
  createInitialProgress(sessionId: string): PatternProgress {
    return {
      sessionId,
      currentComponent: undefined,
      currentInstructionStep: undefined,
      currentRowNumber: undefined,
      repetitionCounters: {},
      lastUpdated: new Date().toISOString(),
      version: CURRENT_VERSION
    };
  }

  /**
   * Clear progress for a session
   */
  clearProgress(sessionId: string): boolean {
    if (!this.isLocalStorageAvailable()) return false;

    try {
      const key = this.getStorageKey(sessionId);
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error clearing pattern progress:', error);
      return false;
    }
  }

  /**
   * Get all saved progress sessions
   */
  getAllProgressSessions(): string[] {
    if (!this.isLocalStorageAvailable()) return [];

    try {
      const sessions: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
          const sessionId = key.replace(STORAGE_KEY_PREFIX, '');
          sessions.push(sessionId);
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('Error getting progress sessions:', error);
      return [];
    }
  }

  /**
   * Update repetition counter
   */
  async updateRepetitionCounter(
    sessionId: string, 
    counterId: string, 
    newValue: number
  ): Promise<boolean> {
    const progress = await this.loadProgress(sessionId);
    if (!progress) return false;

    progress.repetitionCounters[counterId] = Math.max(0, newValue);
    return await this.saveProgress(progress);
  }

  /**
   * Reset repetition counter
   */
  async resetRepetitionCounter(sessionId: string, counterId: string): Promise<boolean> {
    const progress = await this.loadProgress(sessionId);
    if (!progress) return false;

    delete progress.repetitionCounters[counterId];
    return await this.saveProgress(progress);
  }

  /**
   * Update current position
   */
  async updateCurrentPosition(
    sessionId: string,
    componentName?: string,
    instructionStep?: number,
    rowNumber?: number
  ): Promise<boolean> {
    const progress = await this.loadProgress(sessionId);
    if (!progress) return false;

    if (componentName !== undefined) progress.currentComponent = componentName;
    if (instructionStep !== undefined) progress.currentInstructionStep = instructionStep;
    if (rowNumber !== undefined) progress.currentRowNumber = rowNumber;

    return await this.saveProgress(progress);
  }

  /**
   * Export progress data
   */
  async exportProgress(sessionId: string): Promise<ProgressExport | null> {
    const progress = await this.loadProgress(sessionId);
    if (!progress) return null;

    return {
      progress,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0'
    };
  }

  /**
   * Import progress data
   */
  async importProgress(exportData: ProgressExport): Promise<boolean> {
    try {
      // Validate export data
      if (!exportData.progress || !this.isValidProgress(exportData.progress)) {
        return false;
      }

      return await this.saveProgress(exportData.progress);
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }

  /**
   * Validate progress data structure
   */
  private isValidProgress(progress: any): progress is PatternProgress {
    return (
      progress &&
      typeof progress.sessionId === 'string' &&
      typeof progress.repetitionCounters === 'object' &&
      typeof progress.lastUpdated === 'string' &&
      typeof progress.version === 'number'
    );
  }

  /**
   * Migrate progress data to current version
   */
  private migrateProgress(progress: PatternProgress): PatternProgress | null {
    try {
      // For now, just update version
      // Future migrations would go here
      return {
        ...progress,
        version: CURRENT_VERSION
      };
    } catch (error) {
      console.error('Error migrating progress:', error);
      return null;
    }
  }

  /**
   * Clean up old progress data (older than specified days)
   */
  async cleanupOldProgress(daysToKeep: number = 30): Promise<number> {
    if (!this.isLocalStorageAvailable()) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let cleaned = 0;

    try {
      const sessions = this.getAllProgressSessions();
      
      for (const sessionId of sessions) {
        const progress = await this.loadProgress(sessionId);
        if (progress) {
          const lastUpdated = new Date(progress.lastUpdated);
          if (lastUpdated < cutoffDate) {
            this.clearProgress(sessionId);
            cleaned++;
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old progress:', error);
    }

    return cleaned;
  }
}

/**
 * Default singleton instance
 */
export const patternProgressService = new PatternProgressService();

/**
 * Utility functions for pattern progress
 */

/**
 * Generate a unique repetition counter ID
 */
export function generateRepetitionId(
  componentName: string, 
  instructionStep: number, 
  description: string
): string {
  const cleaned = description.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${componentName}_step${instructionStep}_${cleaned}`.substring(0, 50);
}

/**
 * Parse repetition instructions from instruction text
 */
export function parseRepetitionInstructions(
  instructionText: string,
  componentName: string,
  instructionStep: number
): RepetitionInstruction[] {
  const repetitions: RepetitionInstruction[] = [];
  
  // Look for patterns like "Repeat rows 1-4 another 9 times"
  const repeatPattern = /repeat.*?(\d+)\s*times?/gi;
  const matches = instructionText.matchAll(repeatPattern);
  
  for (const match of matches) {
    const maxRepetitions = parseInt(match[1], 10);
    if (maxRepetitions > 0) {
      repetitions.push({
        id: generateRepetitionId(componentName, instructionStep, match[0]),
        description: match[0],
        maxRepetitions,
        currentCount: 0,
        instructionStep,
        componentName
      });
    }
  }
  
  return repetitions;
}

/**
 * Check if instruction text contains repetition patterns
 */
export function hasRepetitionPattern(instructionText: string): boolean {
  const repeatPattern = /repeat.*?\d+\s*times?/gi;
  return repeatPattern.test(instructionText);
} 