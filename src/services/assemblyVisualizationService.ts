/**
 * Assembly Visualization Service (US_12.9)
 * Service for fetching and managing 2D garment assembly visualization data
 */

import { 
  GarmentAssemblyData, 
  AssemblyDataGenerationResponse,
  AssemblyDataGenerationRequest,
  AssemblyComponent,
  AssemblyConnection
} from '@/types/assembly-visualization';

/**
 * Assembly Visualization Service Class
 * Handles all assembly visualization related API interactions
 */
export class AssemblyVisualizationService {
  private readonly baseUrl = '/api/pattern-assembly';

  /**
   * Fetches assembly visualization data for a pattern session
   * @param sessionId - Pattern session ID
   * @param options - Optional parameters for generation
   * @returns Promise with assembly visualization data
   */
  async getAssemblyData(
    sessionId: string,
    options?: {
      includeEdges?: boolean;
      autoLayout?: boolean;
    }
  ): Promise<GarmentAssemblyData> {
    const params = new URLSearchParams();
    
    if (options?.includeEdges !== undefined) {
      params.append('include_edges', options.includeEdges.toString());
    }
    if (options?.autoLayout !== undefined) {
      params.append('auto_layout', options.autoLayout.toString());
    }

    const url = `${this.baseUrl}/${sessionId}${params.toString() ? `?${params.toString()}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch assembly data`);
      }

      const data: AssemblyDataGenerationResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Failed to fetch assembly data');
      }

      return data.data;

    } catch (error) {
      console.error('Error fetching assembly data:', error);
      throw error instanceof Error ? error : new Error('Unknown error occurred');
    }
  }

  /**
   * Updates component layout position (for drag & drop functionality)
   * This would typically be a separate API endpoint, but for now we simulate local state
   * @param sessionId - Pattern session ID
   * @param componentKey - Component to update
   * @param newPosition - New position coordinates
   */
  async updateComponentPosition(
    sessionId: string,
    componentKey: string,
    newPosition: { x: number; y: number }
  ): Promise<void> {
    // For US_12.9, this is not implemented on backend
    // This would be used for the optional drag & drop feature (FR6)
    console.log('updateComponentPosition called (not yet implemented on backend)', {
      sessionId,
      componentKey,
      newPosition
    });
    
    // In a full implementation, this would call:
    // PUT /api/pattern-assembly/[sessionId]/components/[componentKey]
    // with the new layout data
  }

  /**
   * Calculates optimal automatic layout for components
   * @param components - Array of components to arrange
   * @param canvasWidth - Available canvas width
   * @param canvasHeight - Available canvas height
   * @returns Components with updated layout positions
   */
  calculateAutoLayout(
    components: AssemblyComponent[],
    canvasWidth: number = 1000,
    canvasHeight: number = 800
  ): AssemblyComponent[] {
    const arrangedComponents = [...components];
    const padding = 50;
    const componentSpacing = 200;

    // Simple grid-based auto-layout algorithm
    const cols = Math.floor((canvasWidth - padding * 2) / componentSpacing);
    const rows = Math.ceil(components.length / cols);

    arrangedComponents.forEach((component, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = padding + col * componentSpacing;
      const y = padding + row * componentSpacing;

      component.layout.position = { x, y };
    });

    return arrangedComponents;
  }

  /**
   * Calculates connection line paths between components
   * @param connection - Assembly connection data
   * @param fromComponent - Source component
   * @param toComponent - Target component
   * @returns SVG path data for drawing the connection
   */
  calculateConnectionPath(
    connection: AssemblyConnection,
    fromComponent: AssemblyComponent,
    toComponent: AssemblyComponent
  ): string {
    // Find the relevant edges
    const fromEdge = fromComponent.edges.find(edge => edge.edge_id === connection.from_edge);
    const toEdge = toComponent.edges.find(edge => edge.edge_id === connection.to_edge);

    if (!fromEdge || !toEdge) {
      console.warn('Could not find edges for connection', connection);
      return '';
    }

    // Calculate start and end points based on component positions and edge connection points
    const fromPos = fromComponent.layout.position;
    const toPos = toComponent.layout.position;

    // Use the first connection point from each edge as start/end points
    const startPoint = fromEdge.connection_points[0] || { x: 0, y: 0 };
    const endPoint = toEdge.connection_points[0] || { x: 0, y: 0 };

    const fromX = fromPos.x + startPoint.x;
    const fromY = fromPos.y + startPoint.y;
    const toX = toPos.x + endPoint.x;
    const toY = toPos.y + endPoint.y;

    // Create a simple curved path between the points
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;
    
    // Add a slight curve for better visual representation
    const controlOffset = 20;
    const controlX = midX + (fromX > toX ? controlOffset : -controlOffset);
    const controlY = midY + (fromY > toY ? controlOffset : -controlOffset);

    return `M ${fromX},${fromY} Q ${controlX},${controlY} ${toX},${toY}`;
  }

  /**
   * Gets connection visual style based on connection type
   * @param connection - Assembly connection
   * @returns CSS styling object for the connection line
   */
  getConnectionStyle(connection: AssemblyConnection): React.CSSProperties {
    const baseStyle: React.CSSProperties = {
      stroke: connection.visual_style?.color || '#3B82F6',
      strokeWidth: connection.visual_style?.width || 2,
      fill: 'none',
    };

    switch (connection.visual_style?.line_style) {
      case 'dashed':
        baseStyle.strokeDasharray = '5,5';
        break;
      case 'dotted':
        baseStyle.strokeDasharray = '2,2';
        break;
      default:
        baseStyle.strokeDasharray = 'none';
    }

    return baseStyle;
  }

  /**
   * Validates assembly data for completeness
   * @param assemblyData - Assembly data to validate
   * @returns Validation result with any errors
   */
  validateAssemblyData(assemblyData: GarmentAssemblyData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    if (!assemblyData.session_id) {
      errors.push('Session ID is required');
    }

    if (!assemblyData.components || assemblyData.components.length === 0) {
      errors.push('At least one component is required');
    }

    // Validate each component
    assemblyData.components?.forEach((component, index) => {
      if (!component.component_key) {
        errors.push(`Component ${index + 1}: component_key is required`);
      }
      if (!component.schematic?.svgContent) {
        errors.push(`Component ${index + 1}: schematic SVG content is required`);
      }
      if (!component.layout?.position) {
        errors.push(`Component ${index + 1}: layout position is required`);
      }
    });

    // Validate connections reference existing components
    assemblyData.connections?.forEach((connection, index) => {
      const fromExists = assemblyData.components.some(c => c.component_key === connection.from_component);
      const toExists = assemblyData.components.some(c => c.component_key === connection.to_component);
      
      if (!fromExists) {
        errors.push(`Connection ${index + 1}: from_component '${connection.from_component}' not found`);
      }
      if (!toExists) {
        errors.push(`Connection ${index + 1}: to_component '${connection.to_component}' not found`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Default singleton instance for use throughout the application
 */
export const assemblyVisualizationService = new AssemblyVisualizationService(); 