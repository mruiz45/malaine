/**
 * Pattern Viewer Service (US_9.1)
 * Client-side service for pattern viewer operations
 */

import {
  AssembledPattern,
  AssemblePatternRequest,
  AssemblePatternResponse
} from '@/types/assembled-pattern';

/**
 * Service class for pattern viewer operations
 */
export class PatternViewerService {
  private baseUrl = '/api/pattern-viewer';

  /**
   * Assembles a complete pattern from session data
   * @param sessionId - Pattern definition session ID
   * @param options - Assembly options
   * @returns Assembled pattern data
   */
  async assemblePattern(
    sessionId: string,
    options?: {
      includeShapingSummaries?: boolean;
      includeYarnEstimates?: boolean;
      language?: 'en' | 'fr';
    }
  ): Promise<AssembledPattern> {
    try {
      const requestData: AssemblePatternRequest = {
        sessionId,
        options: {
          includeShapingSummaries: options?.includeShapingSummaries ?? true,
          includeYarnEstimates: options?.includeYarnEstimates ?? true,
          language: options?.language ?? 'en'
        }
      };

      const response = await fetch(`${this.baseUrl}/assemble`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: AssemblePatternResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to assemble pattern');
      }

      if (!result.data) {
        throw new Error('No pattern data returned from assembly');
      }

      return result.data;

    } catch (error) {
      console.error('Error assembling pattern:', error);
      throw error;
    }
  }

  /**
   * Assembles a pattern with default options for quick viewing
   * @param sessionId - Pattern definition session ID
   * @returns Assembled pattern data
   */
  async assemblePatternQuick(sessionId: string): Promise<AssembledPattern> {
    return this.assemblePattern(sessionId, {
      includeShapingSummaries: true,
      includeYarnEstimates: true,
      language: 'en' // Default to English
    });
  }

  /**
   * Assembles a pattern for printing with all details
   * @param sessionId - Pattern definition session ID
   * @param language - Language for the pattern
   * @returns Assembled pattern data optimized for printing
   */
  async assemblePatternForPrint(
    sessionId: string, 
    language: 'en' | 'fr' = 'en'
  ): Promise<AssembledPattern> {
    return this.assemblePattern(sessionId, {
      includeShapingSummaries: true,
      includeYarnEstimates: true,
      language
    });
  }

  /**
   * Validates that a session exists and is ready for pattern assembly
   * @param sessionId - Pattern definition session ID
   * @returns Boolean indicating if session is valid for assembly
   */
  async validateSessionForAssembly(sessionId: string): Promise<boolean> {
    try {
      // Attempt to assemble the pattern - if it fails, session is not ready
      await this.assemblePatternQuick(sessionId);
      return true;
    } catch (error) {
      console.warn('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Gets pattern metadata without full assembly (for preview purposes)
   * This is a lighter operation that can be used for navigation/previews
   * @param sessionId - Pattern definition session ID
   * @returns Basic pattern information
   */
  async getPatternMetadata(sessionId: string): Promise<{
    title: string;
    craftType: 'knitting' | 'crochet';
    estimatedDifficulty?: string;
    componentCount: number;
  }> {
    try {
      // For now, we'll do a full assembly but only return metadata
      // In a future optimization, this could be a separate lighter endpoint
      const pattern = await this.assemblePatternQuick(sessionId);
      
      return {
        title: pattern.patternTitle,
        craftType: pattern.craftType,
        estimatedDifficulty: 'Unknown', // Would need to be calculated from pattern complexity
        componentCount: pattern.components.length
      };
    } catch (error) {
      console.error('Error getting pattern metadata:', error);
      throw error;
    }
  }
}

/**
 * Default singleton instance for use throughout the application
 */
export const patternViewerService = new PatternViewerService(); 