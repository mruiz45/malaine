/**
 * 3D Preview Types (PD_PH5_US001)
 * Types for real-time 3D garment preview functionality
 */

import { Vector3 } from 'three';

/**
 * Garment component types for distinct 3D meshes
 */
export type GarmentComponent = 
  | 'frontBody' 
  | 'backBody' 
  | 'leftSleeve' 
  | 'rightSleeve' 
  | 'necklineDetail' 
  | 'cuffDetail' 
  | 'hemDetail';

/**
 * Garment types supported for 3D preview
 */
export type GarmentType = 'sweater' | 'cardigan' | 'vest' | 'tank' | 'shawl';

/**
 * Camera view presets
 */
export type CameraViewPreset = 'front' | 'back' | 'side' | 'perspective';

/**
 * Finished garment dimensions calculated from measurements + ease
 */
export interface FinishedDimensions {
  /** Bust/chest circumference (finished) */
  bust: number;
  /** Waist circumference (finished) */
  waist?: number;
  /** Hip circumference (finished) */
  hip?: number;
  /** Total garment length */
  length: number;
  /** Sleeve length (if applicable) */
  sleeveLength?: number;
  /** Shoulder width */
  shoulderWidth?: number;
  /** Armhole depth */
  armholeDepth?: number;
  /** Neckline depth */
  necklineDepth?: number;
  /** Neckline width */
  necklineWidth?: number;
  /** Unit of measurement */
  unit: 'inch' | 'cm';
}

/**
 * Mesh configuration for visual differentiation
 */
export interface MeshConfiguration {
  /** Component visibility */
  visibility: Record<GarmentComponent, boolean>;
  /** Component colors for differentiation */
  colors: Record<GarmentComponent, string>;
  /** Component opacity */
  opacity: Record<GarmentComponent, number>;
  /** Wireframe mode */
  wireframe: boolean;
}

/**
 * Body structure parameters for 3D generation
 */
export interface BodyStructureParams {
  /** Construction method affects shape */
  constructionMethod?: string;
  /** Body shape affects silhouette */
  bodyShape?: string;
  /** Ease distribution affects fit */
  easeDistribution?: 'even' | 'concentrated_bust' | 'concentrated_waist';
}

/**
 * Neckline parameters (simplified for preview)
 */
export interface NecklineParams {
  /** Neckline type */
  type: 'crew' | 'v-neck' | 'scoop' | 'square';
  /** Depth in inches/cm */
  depth?: number;
  /** Width in inches/cm */
  width?: number;
}

/**
 * Neckline parameters for 3D modification (legacy)
 */
export interface Neckline3DParams {
  /** Neckline style */
  style?: string;
  /** Depth of neckline cut */
  depth: number;
  /** Width of neckline cut */
  width: number;
  /** Shape of neckline */
  shape: 'round' | 'v' | 'square' | 'boat' | 'scoop';
}

/**
 * Sleeve parameters (simplified for preview)
 */
export interface SleeveParams {
  /** Whether sleeves are enabled */
  enabled: boolean;
  /** Sleeve type */
  type?: 'short' | 'long' | '3/4' | 'cap';
  /** Fit type */
  fit?: 'fitted' | 'relaxed' | 'oversized';
}

/**
 * Sleeve parameters for 3D generation (legacy)
 */
export interface Sleeve3DParams {
  /** Sleeve style */
  style?: string;
  /** Sleeve length */
  length: number;
  /** Sleeve width at cuff */
  cuffWidth: number;
  /** Sleeve attachment angle */
  attachmentAngle: number;
  /** Sleeve taper */
  taper: 'straight' | 'tapered' | 'bell';
}

/**
 * Scene configuration (simplified for preview)
 */
export interface SceneConfiguration {
  /** Scene background color */
  backgroundColor: string;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Whether to show axes */
  showAxes?: boolean;
}

/**
 * 3D Scene configuration (legacy)
 */
export interface Scene3DConfig {
  /** Scene background color */
  backgroundColor: string;
  /** Lighting configuration */
  lighting: {
    ambient: { intensity: number; color: string };
    directional: { intensity: number; position: Vector3; color: string };
  };
  /** Camera configuration */
  camera: {
    position: Vector3;
    fov: number;
    near: number;
    far: number;
  };
  /** Grid helper visibility */
  showGrid: boolean;
  /** Axes helper visibility */
  showAxes: boolean;
}

/**
 * 3D Preview state
 */
export interface Preview3DState {
  /** Whether 3D preview is enabled */
  enabled: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Current camera view */
  currentView: CameraViewPreset;
  /** Finished dimensions */
  dimensions: FinishedDimensions | null;
  /** Mesh configuration */
  meshConfig: MeshConfiguration;
  /** Scene configuration */
  sceneConfig: SceneConfiguration;
  /** Whether auto-update is enabled */
  autoUpdate: boolean;
  /** Last update timestamp */
  lastUpdated: Date | null;
}

/**
 * Mesh generation parameters
 */
export interface MeshGenerationParams {
  /** Garment type */
  garmentType: string;
  /** Finished dimensions */
  dimensions: FinishedDimensions;
  /** Body structure parameters */
  bodyStructure?: BodyStructureParams;
  /** Neckline parameters */
  neckline?: Neckline3DParams;
  /** Sleeve parameters */
  sleeves?: Sleeve3DParams;
  /** Mesh configuration */
  meshConfig: MeshConfiguration;
}

/**
 * Garment mesh data
 */
export interface GarmentMeshData {
  /** Component identifier */
  component: GarmentComponent;
  /** Mesh geometry type */
  geometryType: 'cylinder' | 'box' | 'sphere' | 'cone' | 'torus';
  /** Position in 3D space */
  position: Vector3;
  /** Rotation in 3D space */
  rotation: Vector3;
  /** Scale in 3D space */
  scale: Vector3;
  /** Geometry parameters */
  geometryParams: Record<string, number>;
  /** Material properties */
  material: {
    color: string;
    opacity: number;
    wireframe: boolean;
    transparent: boolean;
  };
}

/**
 * 3D Interaction types (PD_PH5_US002)
 */

/**
 * Garment part click event data
 */
export interface GarmentPartClickEvent {
  /** The garment component that was clicked */
  component: GarmentComponent;
  /** Screen coordinates of the click */
  screenPosition: { x: number; y: number };
  /** The section key to navigate to */
  sectionKey: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Visibility toggle event data
 */
export interface VisibilityToggleEvent {
  /** The component being toggled */
  component: GarmentComponent;
  /** New visibility state */
  visible: boolean;
  /** Source of the toggle (user, auto, etc.) */
  source: 'user' | 'auto' | 'reset';
}

/**
 * Mapping between garment components and UI sections
 */
export type GarmentComponentSectionMapping = Record<GarmentComponent, string>;

/**
 * Interactive 3D configuration
 */
export interface Interactive3DConfig {
  /** Whether interaction is enabled */
  enabled: boolean;
  /** Whether to show hover effects */
  showHoverEffects: boolean;
  /** Whether to show click hints */
  showClickHints: boolean;
  /** Hover highlight color */
  hoverColor: string;
  /** Click feedback duration (ms) */
  clickFeedbackDuration: number;
}

/**
 * Update events for 3D preview
 */
export type Preview3DUpdateEvent = 
  | { type: 'DIMENSIONS_CHANGED'; payload: FinishedDimensions }
  | { type: 'NECKLINE_CHANGED'; payload: Neckline3DParams }
  | { type: 'SLEEVES_CHANGED'; payload: Sleeve3DParams }
  | { type: 'GARMENT_TYPE_CHANGED'; payload: string }
  | { type: 'MESH_CONFIG_CHANGED'; payload: Partial<MeshConfiguration> }
  | { type: 'SCENE_CONFIG_CHANGED'; payload: Partial<Scene3DConfig> }
  | { type: 'VIEW_CHANGED'; payload: CameraViewPreset }
  | { type: 'TOGGLE_PREVIEW'; payload: boolean }
  | { type: 'PART_CLICKED'; payload: GarmentPartClickEvent }
  | { type: 'VISIBILITY_TOGGLED'; payload: VisibilityToggleEvent };

/**
 * Default configurations
 */
export const DEFAULT_MESH_CONFIG: MeshConfiguration = {
  visibility: {
    frontBody: true,
    backBody: true,
    leftSleeve: true,
    rightSleeve: true,
    necklineDetail: true,
    cuffDetail: true,
    hemDetail: false
  },
  colors: {
    frontBody: '#4F46E5',      // Indigo for main body
    backBody: '#4F46E5',       // Same as front
    leftSleeve: '#7C3AED',     // Purple for sleeves
    rightSleeve: '#7C3AED',    // Same as left
    necklineDetail: '#DC2626', // Red for neckline
    cuffDetail: '#059669',     // Green for cuffs
    hemDetail: '#D97706'       // Orange for hem
  },
  opacity: {
    frontBody: 0.9,
    backBody: 0.9,
    leftSleeve: 0.9,
    rightSleeve: 0.9,
    necklineDetail: 0.8,
    cuffDetail: 0.8,
    hemDetail: 0.8
  },
  wireframe: false
};

export const DEFAULT_SCENE_CONFIG: Scene3DConfig = {
  backgroundColor: '#f8fafc',
  lighting: {
    ambient: { intensity: 0.6, color: '#ffffff' },
    directional: { intensity: 0.8, position: new Vector3(10, 10, 5), color: '#ffffff' }
  },
  camera: {
    position: new Vector3(0, 0, 8),
    fov: 75,
    near: 0.1,
    far: 1000
  },
  showGrid: false,
  showAxes: false
};

/**
 * Default mapping between garment components and UI sections (PD_PH5_US002)
 */
export const DEFAULT_COMPONENT_SECTION_MAPPING: GarmentComponentSectionMapping = {
  frontBody: 'bodyStructure',
  backBody: 'bodyStructure',
  leftSleeve: 'sleeves',
  rightSleeve: 'sleeves',
  necklineDetail: 'neckline',
  cuffDetail: 'sleeves',
  hemDetail: 'bodyStructure'
};

/**
 * Default interactive 3D configuration (PD_PH5_US002)
 */
export const DEFAULT_INTERACTIVE_3D_CONFIG: Interactive3DConfig = {
  enabled: true,
  showHoverEffects: true,
  showClickHints: true,
  hoverColor: '#60A5FA', // Blue-400
  clickFeedbackDuration: 300
}; 