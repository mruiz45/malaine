/**
 * Schematic Types (US_9.3)
 * Types for generating and displaying garment component schematics
 */

/**
 * Basic 2D coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Dimensions for a garment component
 */
export interface ComponentDimensions {
  /** Width at cast-on/bottom edge (in cm) */
  bottomWidth: number;
  /** Width at top edge (in cm) */
  topWidth: number;
  /** Total length/height (in cm) */
  length: number;
  /** Additional width measurements for complex shapes */
  additionalWidths?: { [key: string]: number };
  /** Additional length measurements for complex shapes */
  additionalLengths?: { [key: string]: number };
}

/**
 * Dimension label for the schematic
 */
export interface DimensionLabel {
  /** Label text (e.g., "50 cm", "20 stitches") */
  text: string;
  /** Position coordinates */
  position: Point;
  /** Anchor point for the label (start, middle, end) */
  anchor: 'start' | 'middle' | 'end';
  /** Rotation angle in degrees */
  rotation?: number;
}

/**
 * Available schematic shapes
 */
export type SchematicShape = 'rectangle' | 'trapezoid' | 'sleeve' | 'custom';

/**
 * Schematic diagram data
 */
export interface SchematicDiagram {
  /** Unique identifier for the schematic */
  id: string;
  /** Component name this schematic represents */
  componentName: string;
  /** Shape type of the schematic */
  shape: SchematicShape;
  /** SVG content as a string */
  svgContent: string;
  /** Viewbox dimensions */
  viewBox: {
    width: number;
    height: number;
  };
  /** Generated timestamp */
  generatedAt: string;
}

/**
 * Configuration for schematic generation
 */
export interface SchematicGenerationConfig {
  /** Component name */
  componentName: string;
  /** Component dimensions */
  dimensions: ComponentDimensions;
  /** Preferred shape type */
  shape: SchematicShape;
  /** Canvas size configuration */
  canvasSize?: {
    width: number;
    height: number;
    padding: number;
  };
  /** Style configuration */
  style?: {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    fontSize: number;
    fontFamily: string;
  };
}

/**
 * API response for schematic generation
 */
export interface SchematicGenerationResponse {
  success: boolean;
  data?: SchematicDiagram;
  error?: string;
}

/**
 * Request for generating schematics for multiple components
 */
export interface SchematicsGenerationRequest {
  /** Pattern session ID */
  sessionId: string;
  /** List of component configurations */
  components: SchematicGenerationConfig[];
}

/**
 * Response for multiple schematics generation
 */
export interface SchematicsGenerationResponse {
  success: boolean;
  data?: SchematicDiagram[];
  error?: string;
} 