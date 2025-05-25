/**
 * Pattern Definition Service (US_1.6)
 * Client-side service for managing pattern definition sessions
 */

import {
  PatternDefinitionSession,
  PatternDefinitionSessionWithData,
  CreatePatternDefinitionSessionData,
  UpdatePatternDefinitionSessionData,
  PatternDefinitionSessionResponse,
  PatternDefinitionSessionsResponse
} from '@/types/patternDefinition';

/**
 * Service class for pattern definition session operations
 */
export class PatternDefinitionService {
  private baseUrl = '/api/pattern-definition-sessions';

  /**
   * Fetch all pattern definition sessions for the current user
   */
  async getAllSessions(): Promise<PatternDefinitionSessionWithData[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PatternDefinitionSessionsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sessions');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching pattern definition sessions:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific pattern definition session by ID
   */
  async getSession(sessionId: string): Promise<PatternDefinitionSessionWithData> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PatternDefinitionSessionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch session');
      }

      if (!result.data) {
        throw new Error('No session data received');
      }

      return result.data as PatternDefinitionSessionWithData;
    } catch (error) {
      console.error('Error fetching pattern definition session:', error);
      throw error;
    }
  }

  /**
   * Create a new pattern definition session
   */
  async createSession(data?: CreatePatternDefinitionSessionData): Promise<PatternDefinitionSession> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PatternDefinitionSessionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create session');
      }

      if (!result.data) {
        throw new Error('No session data received');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating pattern definition session:', error);
      throw error;
    }
  }

  /**
   * Update a pattern definition session
   */
  async updateSession(
    sessionId: string,
    data: UpdatePatternDefinitionSessionData
  ): Promise<PatternDefinitionSession> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PatternDefinitionSessionResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update session');
      }

      if (!result.data) {
        throw new Error('No session data received');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating pattern definition session:', error);
      throw error;
    }
  }

  /**
   * Delete a pattern definition session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Session not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting pattern definition session:', error);
      throw error;
    }
  }

  /**
   * Update a specific step in the session
   */
  async updateStep(
    sessionId: string,
    stepData: Partial<UpdatePatternDefinitionSessionData>
  ): Promise<PatternDefinitionSession> {
    return this.updateSession(sessionId, stepData);
  }

  /**
   * Save session with auto-generated snapshot
   */
  async saveSessionWithSnapshot(
    sessionId: string,
    sessionData: PatternDefinitionSessionWithData
  ): Promise<PatternDefinitionSession> {
    // Generate parameter snapshot (simplified for now)
    const snapshot = {
      gauge: sessionData.selected_gauge_profile_id ? {
        id: sessionData.selected_gauge_profile_id,
        stitch_count: sessionData.gauge_stitch_count,
        row_count: sessionData.gauge_row_count,
        unit: sessionData.gauge_unit
      } : null,
      measurements: sessionData.selected_measurement_set_id ? {
        id: sessionData.selected_measurement_set_id
      } : null,
      ease: sessionData.ease_type ? {
        type: sessionData.ease_type,
        value_bust: sessionData.ease_value_bust,
        unit: sessionData.ease_unit
      } : null,
      yarn: sessionData.selected_yarn_profile_id ? {
        id: sessionData.selected_yarn_profile_id
      } : null,
      stitch_pattern: sessionData.selected_stitch_pattern_id ? {
        id: sessionData.selected_stitch_pattern_id
      } : null,
      timestamp: new Date().toISOString()
    };

    return this.updateSession(sessionId, {
      parameter_snapshot: snapshot
    });
  }
}

// Export singleton instance
export const patternDefinitionService = new PatternDefinitionService(); 