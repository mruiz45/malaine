/**
 * Types for morphology advisor tool in the Malaine knitting/crochet assistant
 * Corresponds to User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */

/**
 * Available morphology characteristics that users can select
 */
export type MorphologyCharacteristic = 
  | 'full_bust'
  | 'sway_back'
  | 'broad_shoulders'
  | 'sloping_shoulders'
  | 'long_torso'
  | 'short_torso'
  | 'long_arms'
  | 'short_arms';

/**
 * Morphology advisory data as stored in the database
 */
export interface MorphologyAdvisory {
  id: number;
  morphology_key: MorphologyCharacteristic;
  display_name: string;
  description: string;
  implications: string;
  measurement_focus: string;
  ease_considerations: string;
  adjustment_suggestions: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Request for getting morphology advice
 */
export interface MorphologyAdviceRequest {
  morphology_characteristics: MorphologyCharacteristic[];
}

/**
 * Response for morphology advice
 */
export interface MorphologyAdviceResponse {
  success: boolean;
  data?: MorphologyAdvisory[];
  error?: string;
}

/**
 * Response for single morphology advisory
 */
export interface MorphologyAdvisoryResponse {
  success: boolean;
  data?: MorphologyAdvisory;
  error?: string;
}

/**
 * Form data for the morphology advisor tool
 */
export interface MorphologyAdvisorFormData {
  selected_characteristics: MorphologyCharacteristic[];
}

/**
 * Form validation errors
 */
export interface MorphologyAdvisorFormErrors {
  selected_characteristics?: string;
}

/**
 * Configuration for morphology characteristics
 */
export interface MorphologyCharacteristicConfig {
  value: MorphologyCharacteristic;
  label: string;
  category: 'torso' | 'shoulders' | 'arms' | 'posture';
  description: string;
}

/**
 * Morphology characteristics configuration
 */
export const MORPHOLOGY_CHARACTERISTICS: MorphologyCharacteristicConfig[] = [
  {
    value: 'full_bust',
    label: 'Full Bust',
    category: 'torso',
    description: 'Larger bust measurement requiring additional shaping'
  },
  {
    value: 'sway_back',
    label: 'Sway Back',
    category: 'posture',
    description: 'Lower back curves inward more than average'
  },
  {
    value: 'broad_shoulders',
    label: 'Broad Shoulders',
    category: 'shoulders',
    description: 'Shoulder width wider than average proportionally'
  },
  {
    value: 'sloping_shoulders',
    label: 'Sloping Shoulders',
    category: 'shoulders',
    description: 'Shoulders that slope downward more than average'
  },
  {
    value: 'long_torso',
    label: 'Long Torso',
    category: 'torso',
    description: 'Torso longer than average in proportion to height'
  },
  {
    value: 'short_torso',
    label: 'Short Torso',
    category: 'torso',
    description: 'Torso shorter than average in proportion to height'
  },
  {
    value: 'long_arms',
    label: 'Long Arms',
    category: 'arms',
    description: 'Arms longer than average requiring longer sleeves'
  },
  {
    value: 'short_arms',
    label: 'Short Arms',
    category: 'arms',
    description: 'Arms shorter than average requiring shorter sleeves'
  }
];

/**
 * Props for the main morphology advisor tool component
 */
export interface MorphologyAdvisorToolProps {
  /** Initial selected characteristics */
  initialCharacteristics?: MorphologyCharacteristic[];
  /** Callback when characteristics are selected */
  onCharacteristicsChange?: (characteristics: MorphologyCharacteristic[]) => void;
  /** Whether to show the tool in compact mode */
  compact?: boolean;
}

/**
 * Props for morphology advice display component
 */
export interface MorphologyAdviceDisplayProps {
  /** The morphology advisory data to display */
  advisory: MorphologyAdvisory;
  /** Whether to show in expanded view */
  expanded?: boolean;
  /** Callback when expansion state changes */
  onToggleExpanded?: () => void;
}

/**
 * Props for morphology characteristics selector
 */
export interface MorphologyCharacteristicsSelectorProps {
  /** Currently selected characteristics */
  selectedCharacteristics: MorphologyCharacteristic[];
  /** Callback when selection changes */
  onSelectionChange: (characteristics: MorphologyCharacteristic[]) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
} 