/**
 * Assembly Visualization Hook (US_12.9)
 * Custom hook for managing 2D garment assembly visualization state and interactions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GarmentAssemblyData, 
  AssemblyViewerState,
  AssemblyComponent,
  AssemblyConnection,
  AssemblyVisualizationConfig
} from '@/types/assembly-visualization';
import { assemblyVisualizationService } from '@/services/assemblyVisualizationService';

/**
 * Configuration options for the assembly visualization hook
 */
interface UseAssemblyVisualizationOptions {
  /** Whether to include edge metadata */
  includeEdges?: boolean;
  /** Whether to use automatic layout */
  autoLayout?: boolean;
  /** Whether to enable drag and drop (FR6) */
  enableDragDrop?: boolean;
  /** Custom visualization configuration */
  config?: Partial<AssemblyVisualizationConfig>;
  /** Callback when component is selected */
  onComponentSelect?: (componentKey: string) => void;
  /** Callback when connection is clicked */
  onConnectionClick?: (connectionId: string) => void;
}

/**
 * Return type for the assembly visualization hook
 */
interface UseAssemblyVisualizationReturn {
  /** Current assembly viewer state */
  state: AssemblyViewerState;
  /** Assembly data (convenience accessor) */
  assemblyData: GarmentAssemblyData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Function to load assembly data */
  loadAssemblyData: () => Promise<void>;
  /** Function to refresh assembly data */
  refreshAssemblyData: () => Promise<void>;
  /** Function to select a component */
  selectComponent: (componentKey: string | undefined) => void;
  /** Function to highlight a connection */
  highlightConnection: (connectionId: string | undefined) => void;
  /** Function to update component position (for drag & drop) */
  updateComponentPosition: (componentKey: string, position: { x: number; y: number }) => void;
  /** Function to toggle drag mode */
  toggleDragMode: () => void;
  /** Function to zoom in/out */
  setZoomLevel: (level: number) => void;
  /** Function to pan the view */
  setPanOffset: (offset: { x: number; y: number }) => void;
  /** Function to reset view to default */
  resetView: () => void;
  /** Function to auto-arrange components */
  autoArrangeComponents: () => void;
  /** Validation result for current assembly data */
  validationResult: { isValid: boolean; errors: string[] };
}

/**
 * Default visualization configuration
 */
const DEFAULT_CONFIG: AssemblyVisualizationConfig = {
  canvas: {
    width: 1000,
    height: 800,
    background_color: '#F9FAFB'
  },
  component_style: {
    default_stroke_color: '#374151',
    selected_stroke_color: '#3B82F6',
    hover_stroke_color: '#10B981',
    stroke_width: 2,
    fill_opacity: 0.1
  },
  connection_style: {
    default_color: '#6B7280',
    highlight_color: '#F59E0B',
    line_width: 2,
    arrow_size: 8
  },
  layout: {
    component_spacing: 200,
    auto_arrange: true,
    snap_to_grid: false,
    grid_size: 20
  },
  interaction: {
    enable_drag: true,
    enable_zoom: true,
    enable_pan: true,
    drag_sensitivity: 1.0
  }
};

/**
 * Custom hook for assembly visualization management
 */
export function useAssemblyVisualization(
  sessionId: string,
  options: UseAssemblyVisualizationOptions = {}
): UseAssemblyVisualizationReturn {
  
  // Initialize state
  const [state, setState] = useState<AssemblyViewerState>({
    assembly_data: null,
    is_loading: false,
    error: null,
    selected_component: undefined,
    hovered_component: undefined,
    highlighted_connection: undefined,
    drag_mode_enabled: options.enableDragDrop ?? true,
    zoom_level: 1.0,
    pan_offset: { x: 0, y: 0 }
  });

  // Merge configuration with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...options.config
  }), [options.config]);

  /**
   * Loads assembly data from the API
   */
  const loadAssemblyData = useCallback(async () => {
    if (!sessionId) {
      setState(prev => ({ 
        ...prev, 
        error: 'Session ID is required',
        is_loading: false 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      is_loading: true, 
      error: null 
    }));

    try {
      const assemblyData = await assemblyVisualizationService.getAssemblyData(
        sessionId,
        {
          includeEdges: options.includeEdges ?? true,
          autoLayout: options.autoLayout ?? true
        }
      );

      setState(prev => ({
        ...prev,
        assembly_data: assemblyData,
        is_loading: false,
        error: null
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assembly data';
      console.error('Error loading assembly data:', error);
      
      setState(prev => ({
        ...prev,
        assembly_data: null,
        is_loading: false,
        error: errorMessage
      }));
    }
  }, [sessionId, options.includeEdges, options.autoLayout]);

  /**
   * Refreshes assembly data (alias for loadAssemblyData)
   */
  const refreshAssemblyData = useCallback(() => {
    return loadAssemblyData();
  }, [loadAssemblyData]);

  /**
   * Selects a component and calls the callback
   */
  const selectComponent = useCallback((componentKey: string | undefined) => {
    setState(prev => ({ 
      ...prev, 
      selected_component: componentKey 
    }));
    
    if (componentKey && options.onComponentSelect) {
      options.onComponentSelect(componentKey);
    }
  }, [options.onComponentSelect]);

  /**
   * Highlights a connection
   */
  const highlightConnection = useCallback((connectionId: string | undefined) => {
    setState(prev => ({ 
      ...prev, 
      highlighted_connection: connectionId 
    }));
    
    if (connectionId && options.onConnectionClick) {
      options.onConnectionClick(connectionId);
    }
  }, [options.onConnectionClick]);

  /**
   * Updates component position (for drag & drop)
   */
  const updateComponentPosition = useCallback((
    componentKey: string, 
    position: { x: number; y: number }
  ) => {
    setState(prev => {
      if (!prev.assembly_data) return prev;

      const updatedComponents = prev.assembly_data.components.map(component => {
        if (component.component_key === componentKey) {
          return {
            ...component,
            layout: {
              ...component.layout,
              position
            }
          };
        }
        return component;
      });

      return {
        ...prev,
        assembly_data: {
          ...prev.assembly_data,
          components: updatedComponents
        }
      };
    });

    // Optionally sync with backend (not implemented in US_12.9)
    if (options.enableDragDrop) {
      assemblyVisualizationService.updateComponentPosition(sessionId, componentKey, position)
        .catch(error => console.warn('Failed to sync position to backend:', error));
    }
  }, [sessionId, options.enableDragDrop]);

  /**
   * Toggles drag mode
   */
  const toggleDragMode = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      drag_mode_enabled: !prev.drag_mode_enabled 
    }));
  }, []);

  /**
   * Sets zoom level
   */
  const setZoomLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0.1, Math.min(3.0, level));
    setState(prev => ({ 
      ...prev, 
      zoom_level: clampedLevel 
    }));
  }, []);

  /**
   * Sets pan offset
   */
  const setPanOffset = useCallback((offset: { x: number; y: number }) => {
    setState(prev => ({ 
      ...prev, 
      pan_offset: offset 
    }));
  }, []);

  /**
   * Resets view to default state
   */
  const resetView = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom_level: 1.0,
      pan_offset: { x: 0, y: 0 },
      selected_component: undefined,
      highlighted_connection: undefined
    }));
  }, []);

  /**
   * Auto-arranges components using the service
   */
  const autoArrangeComponents = useCallback(() => {
    setState(prev => {
      if (!prev.assembly_data) return prev;

      const arrangedComponents = assemblyVisualizationService.calculateAutoLayout(
        prev.assembly_data.components,
        config.canvas.width,
        config.canvas.height
      );

      return {
        ...prev,
        assembly_data: {
          ...prev.assembly_data,
          components: arrangedComponents
        }
      };
    });
  }, [config.canvas.width, config.canvas.height]);

  /**
   * Validation result for current assembly data
   */
  const validationResult = useMemo(() => {
    if (!state.assembly_data) {
      return { isValid: false, errors: ['No assembly data available'] };
    }
    
    return assemblyVisualizationService.validateAssemblyData(state.assembly_data);
  }, [state.assembly_data]);

  // Load assembly data on mount or when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadAssemblyData();
    }
  }, [sessionId, loadAssemblyData]);

  return {
    state,
    assemblyData: state.assembly_data,
    isLoading: state.is_loading,
    error: state.error,
    loadAssemblyData,
    refreshAssemblyData,
    selectComponent,
    highlightConnection,
    updateComponentPosition,
    toggleDragMode,
    setZoomLevel,
    setPanOffset,
    resetView,
    autoArrangeComponents,
    validationResult
  };
} 