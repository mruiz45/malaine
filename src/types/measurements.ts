/**
 * Types for measurement sets management in the Malaine knitting/crochet assistant
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */

/**
 * Measurement unit for body measurements
 */
export type MeasurementUnit = 'cm' | 'inch';

/**
 * Standard body measurements that can be stored
 */
export interface StandardMeasurements {
  chest_circumference?: number;
  waist_circumference?: number;
  hip_circumference?: number;
  shoulder_width?: number;
  arm_length?: number;
  inseam_length?: number;
  torso_length?: number;
  head_circumference?: number;
  neck_circumference?: number;
  wrist_circumference?: number;
  ankle_circumference?: number;
  foot_length?: number;
}

/**
 * Custom measurements stored as key-value pairs
 */
export interface CustomMeasurements {
  [key: string]: number;
}

/**
 * Individual measurement details with optional notes (US 3.1)
 */
export interface MeasurementDetails {
  [measurementKey: string]: {
    note?: string;
  };
}

/**
 * Complete measurement set as stored in the database
 */
export interface MeasurementSet extends StandardMeasurements {
  id: string;
  user_id: string;
  set_name: string;
  measurement_unit: MeasurementUnit;
  custom_measurements?: CustomMeasurements;
  notes?: string;
  measurement_details?: MeasurementDetails; // US 3.1: Individual notes for each measurement
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new measurement set
 */
export interface CreateMeasurementSet extends StandardMeasurements {
  set_name: string;
  measurement_unit: MeasurementUnit;
  custom_measurements?: CustomMeasurements;
  notes?: string;
  measurement_details?: MeasurementDetails; // US 3.1: Individual notes for each measurement
}

/**
 * Data that can be updated in an existing measurement set
 */
export interface UpdateMeasurementSet extends Partial<StandardMeasurements> {
  set_name?: string;
  measurement_unit?: MeasurementUnit;
  custom_measurements?: CustomMeasurements;
  notes?: string;
  measurement_details?: MeasurementDetails; // US 3.1: Individual notes for each measurement
}

/**
 * API response for measurement set operations
 */
export interface MeasurementSetResponse {
  success: boolean;
  data?: MeasurementSet;
  error?: string;
}

/**
 * API response for multiple measurement sets
 */
export interface MeasurementSetsResponse {
  success: boolean;
  data?: MeasurementSet[];
  error?: string;
}

/**
 * Form validation errors for measurement set forms
 */
export interface MeasurementSetFormErrors {
  set_name?: string;
  measurement_unit?: string;
  chest_circumference?: string;
  waist_circumference?: string;
  hip_circumference?: string;
  shoulder_width?: string;
  arm_length?: string;
  inseam_length?: string;
  torso_length?: string;
  head_circumference?: string;
  neck_circumference?: string;
  wrist_circumference?: string;
  ankle_circumference?: string;
  foot_length?: string;
  custom_measurements?: string;
  notes?: string;
  measurement_details?: string; // US 3.1: Validation errors for individual notes
}

/**
 * Measurement field definition for form generation
 */
export interface MeasurementField {
  key: keyof StandardMeasurements;
  label: string;
  description?: string;
  required?: boolean;
  min?: number;
  max?: number;
}

/**
 * Standard measurement fields configuration
 */
export const STANDARD_MEASUREMENT_FIELDS: MeasurementField[] = [
  {
    key: 'chest_circumference',
    label: 'Chest/Bust Circumference',
    description: 'Measure around the fullest part of the chest/bust',
    min: 10,
    max: 200
  },
  {
    key: 'waist_circumference',
    label: 'Waist Circumference',
    description: 'Measure around the natural waistline',
    min: 10,
    max: 200
  },
  {
    key: 'hip_circumference',
    label: 'Hip Circumference',
    description: 'Measure around the fullest part of the hips',
    min: 10,
    max: 200
  },
  {
    key: 'shoulder_width',
    label: 'Shoulder Width',
    description: 'Measure from shoulder point to shoulder point',
    min: 5,
    max: 100
  },
  {
    key: 'arm_length',
    label: 'Arm Length',
    description: 'Measure from shoulder to wrist',
    min: 10,
    max: 150
  },
  {
    key: 'inseam_length',
    label: 'Inseam Length',
    description: 'Measure from crotch to ankle',
    min: 10,
    max: 150
  },
  {
    key: 'torso_length',
    label: 'Torso Length',
    description: 'Measure from nape of neck to waist',
    min: 10,
    max: 100
  },
  {
    key: 'head_circumference',
    label: 'Head Circumference',
    description: 'Measure around the largest part of the head',
    min: 30,
    max: 80
  },
  {
    key: 'neck_circumference',
    label: 'Neck Circumference',
    description: 'Measure around the base of the neck',
    min: 10,
    max: 60
  },
  {
    key: 'wrist_circumference',
    label: 'Wrist Circumference',
    description: 'Measure around the wrist bone',
    min: 5,
    max: 30
  },
  {
    key: 'ankle_circumference',
    label: 'Ankle Circumference',
    description: 'Measure around the ankle bone',
    min: 10,
    max: 50
  },
  {
    key: 'foot_length',
    label: 'Foot Length',
    description: 'Measure from heel to longest toe',
    min: 10,
    max: 50
  }
];

// ============================================================================
// US 3.1: Measurement Guides Types
// ============================================================================

/**
 * Measurement guide content from the database
 */
export interface MeasurementGuide {
  id: number;
  measurement_key: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * API response for measurement guides
 */
export interface MeasurementGuidesResponse {
  success: boolean;
  data?: MeasurementGuide[];
  error?: string;
}

/**
 * API response for a single measurement guide
 */
export interface MeasurementGuideResponse {
  success: boolean;
  data?: MeasurementGuide;
  error?: string;
}

/**
 * Props for measurement guide modal component
 */
export interface MeasurementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurementKey: keyof StandardMeasurements;
  guide?: MeasurementGuide;
}

/**
 * Props for measurement guide button component
 */
export interface MeasurementGuideButtonProps {
  measurementKey: keyof StandardMeasurements;
  className?: string;
}

/**
 * Props for measurement note input component
 */
export interface MeasurementNoteInputProps {
  measurementKey: keyof StandardMeasurements;
  value?: string;
  onChange: (note: string) => void;
  placeholder?: string;
  className?: string;
} 