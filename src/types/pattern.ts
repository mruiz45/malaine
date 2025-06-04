/**
 * Types for Pattern State Management
 * Defines the complete data structure for pattern design sessions
 */

/**
 * Available garment types for pattern design
 */
export type GarmentType = 'sweater' | 'scarf' | 'hat' | 'cardigan' | 'vest' | null;

/**
 * Available sections in the pattern designer UI
 */
export type PatternSection = 'gauge' | 'measurements' | 'ease' | 'bodyStructure' | 'neckline' | 'sleeves' | 'finishing';

/**
 * Base interface for sections that can be marked as complete
 */
interface PatternSectionBase {
  isSet: boolean;
}

/**
 * Gauge section data structure
 */
export interface GaugeData extends PatternSectionBase {
  stitchesPer10cm: number | null;
  rowsPer10cm: number | null;
  yarnUsed: string | null; // Reference to yarn profile ID or name
  needleSize: number | null; // in mm
  tensionNotes: string | null;
}

/**
 * Measurements section data structure
 * Structured to accommodate different garment types
 */
export interface MeasurementsData extends PatternSectionBase {
  // Common measurements
  length: number | null; // cm
  width: number | null; // cm
  
  // Sweater/Cardigan specific
  chestCircumference: number | null; // cm
  bodyLength: number | null; // cm
  sleeveLength: number | null; // cm
  shoulderWidth: number | null; // cm
  armholeDepth: number | null; // cm
  
  // Hat specific
  headCircumference: number | null; // cm
  hatHeight: number | null; // cm
  
  // Scarf specific
  scarfLength: number | null; // cm
  scarfWidth: number | null; // cm
}

/**
 * Ease section data structure
 */
export interface EaseData extends PatternSectionBase {
  chestEase: number | null; // cm or percentage
  lengthEase: number | null; // cm
  sleeveEase: number | null; // cm
  easeType: 'positive' | 'negative' | 'zero' | null;
}

/**
 * Body structure section data structure
 */
export interface BodyStructureData extends PatternSectionBase {
  construction: 'topDown' | 'bottomUp' | 'seamless' | 'seamed' | null;
  shaping: 'waistShaping' | 'straightSilhouette' | 'aLine' | null;
  frontStyle: 'plain' | 'buttonBand' | 'zipper' | null;
}

/**
 * Neckline section data structure
 */
export interface NecklineData extends PatternSectionBase {
  necklineType: 'crewneck' | 'vneck' | 'scoop' | 'turtleneck' | 'cowl' | null;
  necklineDepth: number | null; // cm
  necklineWidth: number | null; // cm
}

/**
 * Sleeves section data structure
 */
export interface SleevesData extends PatternSectionBase {
  sleeveType: 'setIn' | 'raglan' | 'dolman' | 'sleeveless' | null;
  sleeveLength: 'long' | 'threeQuarter' | 'short' | 'cap' | null;
  cuffStyle: 'ribbed' | 'plain' | 'folded' | null;
  cuffLength: number | null; // cm
}

/**
 * Finishing section data structure
 */
export interface FinishingData extends PatternSectionBase {
  edgeTreatment: 'ribbing' | 'garter' | 'seedStitch' | 'rolledEdge' | null;
  buttonhole: boolean;
  buttonholeCount: number | null;
  closureType: 'buttons' | 'zipper' | 'none' | null;
}

/**
 * Pattern metadata
 */
export interface PatternMetadata {
  patternId: string | null; // UUID generated on first save
  createdAt: Date | null;
  updatedAt: Date | null;
  designName: string;
  description: string | null;
  tags: string[];
}

/**
 * UI settings for the pattern designer
 */
export interface PatternUISettings {
  currentSection: PatternSection;
  completedSections: PatternSection[];
  sidebarCollapsed: boolean;
}

/**
 * Complete pattern state structure
 */
export interface PatternState {
  version: string; // For future migrations
  metadata: PatternMetadata;
  garmentType: GarmentType;
  uiSettings: PatternUISettings;
  
  // Pattern data sections
  gauge: GaugeData;
  measurements: MeasurementsData;
  ease: EaseData;
  bodyStructure: BodyStructureData;
  neckline: NecklineData;
  sleeves: SleevesData;
  finishing: FinishingData;
}

/**
 * Actions for pattern state management
 */
export type PatternAction =
  | { type: 'SET_GARMENT_TYPE'; payload: GarmentType }
  | { type: 'SET_CURRENT_SECTION'; payload: PatternSection }
  | { type: 'UPDATE_GAUGE'; payload: Partial<GaugeData> }
  | { type: 'UPDATE_MEASUREMENTS'; payload: Partial<MeasurementsData> }
  | { type: 'UPDATE_EASE'; payload: Partial<EaseData> }
  | { type: 'UPDATE_BODY_STRUCTURE'; payload: Partial<BodyStructureData> }
  | { type: 'UPDATE_NECKLINE'; payload: Partial<NecklineData> }
  | { type: 'UPDATE_SLEEVES'; payload: Partial<SleevesData> }
  | { type: 'UPDATE_FINISHING'; payload: Partial<FinishingData> }
  | { type: 'UPDATE_METADATA'; payload: Partial<PatternMetadata> }
  | { type: 'UPDATE_UI_SETTINGS'; payload: Partial<PatternUISettings> }
  | { type: 'RESET_PATTERN' }
  | { type: 'RESET_SECTION'; payload: PatternSection };

/**
 * Pattern context value interface
 */
export interface PatternContextValue {
  state: PatternState;
  dispatch: React.Dispatch<PatternAction>;
  
  // Convenience methods
  setGarmentType: (garmentType: GarmentType) => void;
  setCurrentSection: (section: PatternSection) => void;
  updateGauge: (data: Partial<GaugeData>) => void;
  updateMeasurements: (data: Partial<MeasurementsData>) => void;
  updateEase: (data: Partial<EaseData>) => void;
  updateBodyStructure: (data: Partial<BodyStructureData>) => void;
  updateNeckline: (data: Partial<NecklineData>) => void;
  updateSleeves: (data: Partial<SleevesData>) => void;
  updateFinishing: (data: Partial<FinishingData>) => void;
  resetPattern: () => void;
  resetSection: (section: PatternSection) => void;
} 