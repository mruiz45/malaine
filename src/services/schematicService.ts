/**
 * Schematic Service (US_9.3)
 * Client-side service for schematic diagram operations
 */

import {
  SchematicDiagram,
  SchematicsGenerationRequest,
  SchematicsGenerationResponse,
  SchematicGenerationConfig
} from '@/types/schematics';

/**
 * Service class for schematic operations
 */
export class SchematicService {
  private baseUrl = '/api/patterns';

  /**
   * Generates schematics for pattern components
   * @param patternId - Pattern ID (for future use with specific patterns)
   * @param request - Generation request with session ID and component configs
   * @returns Generated schematic diagrams
   */
  async generateSchematics(
    patternId: string,
    request: SchematicsGenerationRequest
  ): Promise<SchematicDiagram[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${patternId}/schematics`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: SchematicsGenerationResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate schematics');
      }

      if (!result.data) {
        throw new Error('No schematic data returned');
      }

      return result.data;

    } catch (error) {
      console.error('Error generating schematics:', error);
      throw error;
    }
  }

  /**
   * Generates default schematics for all components in a pattern session
   * @param patternId - Pattern ID (for future use with specific patterns)
   * @param sessionId - Pattern definition session ID
   * @returns Generated schematic diagrams with default configurations
   */
  async generateDefaultSchematics(
    patternId: string,
    sessionId: string
  ): Promise<SchematicDiagram[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${patternId}/schematics?sessionId=${encodeURIComponent(sessionId)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: SchematicsGenerationResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate default schematics');
      }

      if (!result.data) {
        throw new Error('No schematic data returned');
      }

      return result.data;

    } catch (error) {
      console.error('Error generating default schematics:', error);
      throw error;
    }
  }

  /**
   * Generates schematics for a pattern session with simplified interface
   * This is the main method that components should use
   * @param sessionId - Pattern definition session ID
   * @param customConfigs - Optional custom configurations for specific components
   * @returns Generated schematic diagrams
   */
  async generateSchematicsForSession(
    sessionId: string,
    customConfigs?: SchematicGenerationConfig[]
  ): Promise<SchematicDiagram[]> {
    const patternId = sessionId; // Use sessionId as patternId for now

    if (customConfigs && customConfigs.length > 0) {
      // Use custom configurations
      return this.generateSchematics(patternId, {
        sessionId,
        components: customConfigs
      });
    } else {
      // Use default configurations
      return this.generateDefaultSchematics(patternId, sessionId);
    }
  }

  /**
   * Creates a data URL from SVG content for easy embedding
   * @param svgContent - SVG string content
   * @returns Data URL that can be used in img src
   */
  createSvgDataUrl(svgContent: string): string {
    const encodedSvg = encodeURIComponent(svgContent);
    return `data:image/svg+xml,${encodedSvg}`;
  }

  /**
   * Downloads an SVG schematic as a file
   * @param schematic - Schematic diagram to download
   * @param filename - Optional filename (defaults to component name)
   */
  downloadSchematic(schematic: SchematicDiagram, filename?: string): void {
    try {
      const blob = new Blob([schematic.svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${schematic.componentName.toLowerCase().replace(/\s+/g, '-')}-schematic.svg`;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading schematic:', error);
      throw error;
    }
  }

  /**
   * Validates schematic generation configuration
   * @param config - Configuration to validate
   * @returns Validation result with error messages if any
   */
  validateSchematicConfig(config: SchematicGenerationConfig): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.componentName || config.componentName.trim() === '') {
      errors.push('Component name is required');
    }

    if (!config.dimensions) {
      errors.push('Component dimensions are required');
    } else {
      if (config.dimensions.bottomWidth <= 0) {
        errors.push('Bottom width must be greater than 0');
      }
      if (config.dimensions.topWidth <= 0) {
        errors.push('Top width must be greater than 0');
      }
      if (config.dimensions.length <= 0) {
        errors.push('Length must be greater than 0');
      }
    }

    if (!config.shape) {
      errors.push('Shape type is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Default singleton instance for use throughout the application
 */
export const schematicService = new SchematicService(); 