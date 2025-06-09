import { type User } from '@supabase/supabase-js';

export type UserDetails = User & {
  role: string;
};

// Types pour les tailles standards (nouvelle table)
export interface SizeStandard {
  id: string;
  region: 'europe' | 'us' | 'uk' | 'asia';
  demographic: 'adult_female' | 'adult_male' | 'child' | 'baby';
  size_key: string;
  
  // Équivalences entre systèmes
  eu_equivalent?: string;
  us_equivalent?: string;
  uk_equivalent?: string;
  asia_equivalent?: string;
  
  // Les 15 mesures standards (en cm)
  chest_bust_cm: number;
  back_neck_to_wrist_cm?: number;
  back_waist_length_cm?: number;
  cross_back_cm?: number;
  arm_length_to_underarm_cm?: number;
  upper_arm_cm?: number;
  armhole_depth_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  head_circumference_cm?: number;
  overall_garment_length_cm?: number;
  shoulder_width_cm?: number;
  wrist_circumference_cm?: number;
  leg_length_cm?: number;
  shoe_size_reference?: string;
  
  source_reference?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les équivalences de tailles
export interface SizeEquivalences {
  eu?: string;
  us?: string;
  uk?: string;
  asia?: string;
}

// Types pour les mesures standards avec équivalences
export interface StandardMeasurements {
  chest_bust_cm: number;
  back_neck_to_wrist_cm?: number;
  back_waist_length_cm?: number;
  cross_back_cm?: number;
  arm_length_to_underarm_cm?: number;
  upper_arm_cm?: number;
  armhole_depth_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  head_circumference_cm?: number;
  overall_garment_length_cm?: number;
  shoulder_width_cm?: number;
  wrist_circumference_cm?: number;
  leg_length_cm?: number;
  shoe_size_reference?: string;
}

// Extension des types de mesures utilisateur avec standards
export interface ExtendedUserMeasurements {
  // Mesures existantes
  chest_bust_cm?: number;
  back_neck_to_wrist_cm?: number;
  back_waist_length_cm?: number;
  cross_back_cm?: number;
  arm_length_to_underarm_cm?: number;
  upper_arm_cm?: number;
  armhole_depth_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  head_circumference_cm?: number;
  overall_garment_length_cm?: number;
  shoulder_width_cm?: number;
  wrist_circumference_cm?: number;
  leg_length_cm?: number;
  shoe_size?: string;
  
  preferred_unit: 'cm' | 'inches';
  demographic_category: 'baby' | 'child' | 'adult';
  gender_category: 'male' | 'female' | 'neutral';
  garment_type?: string;
  
  // Nouvelles colonnes pour standards
  is_standard_size?: boolean;
  standard_region?: 'europe' | 'us' | 'uk' | 'asia';
  standard_demographic?: 'adult_female' | 'adult_male' | 'child' | 'baby';
  standard_size?: string;
  modified_measurements?: string[]; // JSON array des champs modifiés
} 