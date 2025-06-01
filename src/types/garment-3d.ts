/**
 * Types for 3D Garment Wireframe Visualization (US_12.10)
 * Defines interfaces for basic 3D garment modeling
 */

import type { FinishedMeasurements } from './assembled-pattern';

/**
 * 3D position and rotation parameters
 */
export interface Transform3D {
  /** Position in 3D space */
  position: {
    x: number;
    y: number;
    z: number;
  };
  /** Rotation in radians */
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Cylinder geometry parameters for garment parts
 */
export interface CylinderParams {
  /** Top radius in cm */
  radiusTop: number;
  /** Bottom radius in cm */
  radiusBottom: number;
  /** Height in cm */
  height: number;
  /** Number of radial segments for wireframe */
  radialSegments: number;
  /** Transform (position/rotation) */
  transform: Transform3D;
}

/**
 * Basic garment component in 3D space
 */
export interface GarmentComponent3D {
  /** Component identifier */
  id: string;
  /** Component name */
  name: string;
  /** Component type */
  type: 'body' | 'sleeve' | 'neck' | 'other';
  /** Cylinder geometry parameters */
  geometry: CylinderParams;
  /** Whether this component is visible */
  visible: boolean;
}

/**
 * Complete 3D garment wireframe model
 */
export interface GarmentWireframe3D {
  /** All components of the garment */
  components: GarmentComponent3D[];
  /** Scene bounds for camera positioning */
  sceneBounds: {
    width: number;
    height: number;
    depth: number;
  };
  /** Original measurements used */
  sourceMeasurements: FinishedMeasurements;
  /** Generation metadata */
  metadata: {
    /** When this model was generated */
    generatedAt: string;
    /** Version of the conversion algorithm */
    algorithmVersion: string;
    /** Approximation warnings */
    warnings: string[];
  };
}

/**
 * Configuration for 3D preview rendering
 */
export interface Preview3DConfig {
  /** Camera settings */
  camera: {
    /** Initial distance from model */
    distance: number;
    /** Field of view in degrees */
    fov: number;
    /** Near clipping plane */
    near: number;
    /** Far clipping plane */
    far: number;
  };
  /** Wireframe material settings */
  wireframe: {
    /** Line color in hex */
    color: string;
    /** Line width */
    lineWidth: number;
    /** Opacity */
    opacity: number;
  };
  /** Controls settings */
  controls: {
    /** Enable rotation */
    enableRotate: boolean;
    /** Enable zoom */
    enableZoom: boolean;
    /** Enable panning */
    enablePan: boolean;
    /** Auto-rotate speed */
    autoRotateSpeed: number;
  };
  /** Performance settings */
  performance: {
    /** Target frame rate */
    targetFps: number;
    /** Enable anti-aliasing */
    antialias: boolean;
  };
}

/**
 * Props for Basic3DPreview component
 */
export interface Basic3DPreviewProps {
  /** Finished measurements to convert to 3D */
  measurements: FinishedMeasurements;
  /** Garment type for specialized conversion */
  garmentType?: 'sweater' | 'cardigan' | 'vest' | 'pullover';
  /** Configuration overrides */
  config?: Partial<Preview3DConfig>;
  /** Whether to show in print mode (simplified view) */
  printMode?: boolean;
  /** Callback when model is loaded */
  onModelLoad?: (model: GarmentWireframe3D) => void;
  /** Callback when errors occur */
  onError?: (error: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Conversion result from 2D measurements to 3D model
 */
export interface MeasurementsTo3DResult {
  /** Success status */
  success: boolean;
  /** Generated 3D model */
  model?: GarmentWireframe3D;
  /** Error message if conversion failed */
  error?: string;
  /** Validation warnings */
  warnings: string[];
}

/**
 * Default configuration values
 */
export const DEFAULT_3D_CONFIG: Preview3DConfig = {
  camera: {
    distance: 200,
    fov: 75,
    near: 0.1,
    far: 1000
  },
  wireframe: {
    color: '#4F46E5', // Indigo-600
    lineWidth: 1,
    opacity: 0.8
  },
  controls: {
    enableRotate: true,
    enableZoom: true,
    enablePan: false,
    autoRotateSpeed: 0
  },
  performance: {
    targetFps: 30,
    antialias: true
  }
};

/**
 * Minimum valid measurements for 3D conversion
 */
export const MIN_MEASUREMENTS = {
  chest: 30, // cm
  length: 20, // cm
  arm_length: 10, // cm
  upper_arm: 15 // cm
} as const; 