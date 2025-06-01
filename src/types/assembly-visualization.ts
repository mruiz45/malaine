/**
 * Assembly Visualization Types (US_12.9)
 * Types for 2D garment assembly preview and planning
 */

import { Point, SchematicDiagram } from './schematics';

/**
 * Type of edge on a garment component
 */
export type ComponentEdgeType = 
  | 'shoulder' 
  | 'side_seam' 
  | 'armhole' 
  | 'sleeve_cap' 
  | 'hem' 
  | 'neckline'
  | 'center_front'
  | 'center_back'
  | 'cuff'
  | 'waistband';

/**
 * Type of assembly connection
 */
export type AssemblyConnectionType = 
  | 'seam' 
  | 'join' 
  | 'pickup'
  | 'graft'
  | 'bind_together';

/**
 * Edge metadata for a garment component (FR1)
 */
export interface ComponentEdge {
  /** Unique identifier for this edge */
  edge_id: string;
  /** Type of edge (shoulder, side seam, etc.) */
  edge_type: ComponentEdgeType;
  /** Component key this edge connects to */
  connects_to_component_key: string;
  /** Edge ID on the target component */
  connects_to_edge_id: string;
  /** Length of this edge in cm */
  length_cm: number;
  /** Connection points along this edge (for drawing connections) */
  connection_points: Point[];
  /** Optional label for this edge */
  label?: string;
}

/**
 * Assembly connection between two edges (FR4, FR5)
 */
export interface AssemblyConnection {
  /** Unique identifier for this connection */
  connection_id: string;
  /** Source component key */
  from_component: string;
  /** Source edge ID */
  from_edge: string;
  /** Target component key */
  to_component: string;
  /** Target edge ID */
  to_edge: string;
  /** Type of connection */
  connection_type: AssemblyConnectionType;
  /** Instruction text for this connection */
  instructions: string;
  /** Visual style for the connection indicator */
  visual_style?: {
    color: string;
    line_style: 'solid' | 'dashed' | 'dotted';
    width: number;
  };
}

/**
 * Position and layout information for a component in the assembly view
 */
export interface ComponentLayout {
  /** Position in the assembly workspace */
  position: Point;
  /** Rotation angle in degrees */
  rotation?: number;
  /** Scale factor (default 1.0) */
  scale?: number;
  /** Z-index for layering */
  z_index?: number;
  /** Whether this component is currently selected */
  is_selected?: boolean;
  /** Whether this component is draggable (FR6) */
  is_draggable?: boolean;
}

/**
 * Component data for assembly visualization (FR2, FR3)
 */
export interface AssemblyComponent {
  /** Component key identifier */
  component_key: string;
  /** Display name */
  component_name: string;
  /** 2D schematic diagram (from US_9.3) */
  schematic: SchematicDiagram;
  /** Edge metadata for assembly connections */
  edges: ComponentEdge[];
  /** Layout position and properties */
  layout: ComponentLayout;
  /** Component dimensions in cm */
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Complete garment assembly data structure (FR1)
 */
export interface GarmentAssemblyData {
  /** Pattern session ID */
  session_id: string;
  /** Garment type */
  garment_type: string;
  /** Component schematics with assembly metadata */
  components: AssemblyComponent[];
  /** Assembly connections between components */
  connections: AssemblyConnection[];
  /** Default layout configuration */
  default_layout: {
    canvas_width: number;
    canvas_height: number;
    auto_arrange: boolean;
  };
  /** Generation metadata */
  generated_at: string;
}

/**
 * Assembly viewer state for UI management
 */
export interface AssemblyViewerState {
  /** Current assembly data */
  assembly_data: GarmentAssemblyData | null;
  /** Loading state */
  is_loading: boolean;
  /** Error state */
  error: string | null;
  /** Currently selected component */
  selected_component?: string;
  /** Currently hovered component */
  hovered_component?: string;
  /** Currently highlighted connection */
  highlighted_connection?: string;
  /** Whether drag mode is enabled (FR6) */
  drag_mode_enabled: boolean;
  /** Zoom level */
  zoom_level: number;
  /** Pan offset */
  pan_offset: Point;
}

/**
 * Configuration for assembly visualization rendering
 */
export interface AssemblyVisualizationConfig {
  /** Canvas dimensions */
  canvas: {
    width: number;
    height: number;
    background_color: string;
  };
  /** Component styling */
  component_style: {
    default_stroke_color: string;
    selected_stroke_color: string;
    hover_stroke_color: string;
    stroke_width: number;
    fill_opacity: number;
  };
  /** Connection line styling */
  connection_style: {
    default_color: string;
    highlight_color: string;
    line_width: number;
    arrow_size: number;
  };
  /** Layout settings */
  layout: {
    component_spacing: number;
    auto_arrange: boolean;
    snap_to_grid: boolean;
    grid_size: number;
  };
  /** Interaction settings */
  interaction: {
    enable_drag: boolean;
    enable_zoom: boolean;
    enable_pan: boolean;
    drag_sensitivity: number;
  };
}

/**
 * Props for the main GarmentAssemblyViewer component
 */
export interface GarmentAssemblyViewerProps {
  /** Pattern session ID */
  session_id: string;
  /** Whether in print mode */
  print_mode?: boolean;
  /** Custom configuration */
  config?: Partial<AssemblyVisualizationConfig>;
  /** Callback when component is selected */
  on_component_select?: (component_key: string) => void;
  /** Callback when connection is clicked */
  on_connection_click?: (connection_id: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * API request for generating assembly visualization data
 */
export interface AssemblyDataGenerationRequest {
  /** Pattern session ID */
  session_id: string;
  /** Whether to include edge metadata */
  include_edges?: boolean;
  /** Whether to auto-generate layout positions */
  auto_layout?: boolean;
}

/**
 * API response for assembly visualization data
 */
export interface AssemblyDataGenerationResponse {
  success: boolean;
  data?: GarmentAssemblyData;
  error?: string;
} 