/**
 * Ease Advice Rules Configuration
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 * 
 * This file contains the heuristic rules for providing ease advice
 * based on garment category, fit preference, and yarn weight.
 */

import type { 
  EaseAdviceRule, 
  EaseAdvisorConfig,
  GarmentCategory,
  FitPreference,
  YarnWeightCategory
} from '@/types/easeAdvisor';

/**
 * Garment categories configuration
 */
export const GARMENT_CATEGORIES: Array<{ value: GarmentCategory; label: string }> = [
  { value: 'sweater', label: 'Sweater' },
  { value: 'cardigan', label: 'Cardigan' },
  { value: 'hat', label: 'Hat' },
  { value: 'socks', label: 'Socks' },
  { value: 'shawl', label: 'Shawl' }
];

/**
 * Fit preferences configuration
 */
export const FIT_PREFERENCES: Array<{ value: FitPreference; label: string }> = [
  { value: 'very_close_fitting', label: 'Very Close-fitting/Negative Ease' },
  { value: 'close_fitting', label: 'Close-fitting/Zero Ease' },
  { value: 'classic', label: 'Classic/Slightly Positive Ease' },
  { value: 'relaxed', label: 'Relaxed Fit' },
  { value: 'oversized', label: 'Oversized' }
];

/**
 * Yarn weight categories configuration
 */
export const YARN_WEIGHTS: Array<{ value: YarnWeightCategory; label: string }> = [
  { value: 'fingering', label: 'Fingering Weight' },
  { value: 'sport', label: 'Sport Weight' },
  { value: 'dk', label: 'DK Weight' },
  { value: 'worsted', label: 'Worsted Weight' },
  { value: 'bulky', label: 'Bulky Weight' }
];

/**
 * Ease advice rules database
 * Rules are matched by garment category, fit preference, and optionally yarn weight
 */
export const EASE_ADVICE_RULES: EaseAdviceRule[] = [
  // SWEATER RULES
  {
    id: 'sweater-very-close-fitting-light',
    garment_category: 'sweater',
    fit_preference: 'very_close_fitting',
    yarn_weight_categories: ['fingering', 'sport', 'dk'],
    advised_ease: {
      bust_ease: { min: -5, max: -2, recommended: -3 },
      waist_ease: { min: -4, max: -1, recommended: -2 },
      hip_ease: { min: -4, max: -1, recommended: -2 },
      sleeve_ease: { min: -3, max: -1, recommended: -2 }
    },
    explanation: 'Very close-fitting sweater relies on fabric stretch. Works best with stretchy fibers and lighter weights.',
    priority: 1
  },
  {
    id: 'sweater-very-close-fitting-heavy',
    garment_category: 'sweater',
    fit_preference: 'very_close_fitting',
    yarn_weight_categories: ['worsted', 'bulky'],
    advised_ease: {
      bust_ease: { min: -3, max: 0, recommended: -1 },
      waist_ease: { min: -2, max: 1, recommended: 0 },
      hip_ease: { min: -2, max: 1, recommended: 0 },
      sleeve_ease: { min: -2, max: 0, recommended: -1 }
    },
    explanation: 'Close-fitting sweater in heavier yarn. Less negative ease due to reduced stretch in bulkier yarns.',
    priority: 1
  },
  {
    id: 'sweater-close-fitting',
    garment_category: 'sweater',
    fit_preference: 'close_fitting',
    advised_ease: {
      bust_ease: { min: 0, max: 3, recommended: 1 },
      waist_ease: { min: 0, max: 2, recommended: 1 },
      hip_ease: { min: 0, max: 2, recommended: 1 },
      sleeve_ease: { min: 0, max: 2, recommended: 1 }
    },
    explanation: 'Close-fitting sweater with minimal ease. Follows body contours without being tight.',
    priority: 2
  },
  {
    id: 'sweater-classic-light',
    garment_category: 'sweater',
    fit_preference: 'classic',
    yarn_weight_categories: ['fingering', 'sport'],
    advised_ease: {
      bust_ease: { min: 3, max: 8, recommended: 5 },
      waist_ease: { min: 2, max: 6, recommended: 4 },
      hip_ease: { min: 2, max: 6, recommended: 4 },
      sleeve_ease: { min: 2, max: 4, recommended: 3 }
    },
    explanation: 'Classic fit sweater in fine yarn. Provides comfortable ease for everyday wear.',
    priority: 1
  },
  {
    id: 'sweater-classic-medium',
    garment_category: 'sweater',
    fit_preference: 'classic',
    yarn_weight_categories: ['dk', 'worsted'],
    advised_ease: {
      bust_ease: { min: 5, max: 10, recommended: 7 },
      waist_ease: { min: 3, max: 8, recommended: 5 },
      hip_ease: { min: 3, max: 8, recommended: 5 },
      sleeve_ease: { min: 2, max: 5, recommended: 3 }
    },
    explanation: 'Classic fit sweater in medium weight yarn. Traditional comfortable fit allowing for light layering.',
    priority: 1
  },
  {
    id: 'sweater-classic-bulky',
    garment_category: 'sweater',
    fit_preference: 'classic',
    yarn_weight_categories: ['bulky'],
    advised_ease: {
      bust_ease: { min: 8, max: 12, recommended: 10 },
      waist_ease: { min: 6, max: 10, recommended: 8 },
      hip_ease: { min: 6, max: 10, recommended: 8 },
      sleeve_ease: { min: 3, max: 6, recommended: 4 }
    },
    explanation: 'Classic fit sweater in bulky yarn. Extra ease compensates for the bulk of the yarn.',
    priority: 1
  },
  {
    id: 'sweater-relaxed',
    garment_category: 'sweater',
    fit_preference: 'relaxed',
    advised_ease: {
      bust_ease: { min: 10, max: 15, recommended: 12 },
      waist_ease: { min: 8, max: 12, recommended: 10 },
      hip_ease: { min: 8, max: 12, recommended: 10 },
      sleeve_ease: { min: 4, max: 7, recommended: 5 }
    },
    explanation: 'Relaxed fit sweater. Comfortable loose fit perfect for layering and casual wear.',
    priority: 2
  },
  {
    id: 'sweater-oversized',
    garment_category: 'sweater',
    fit_preference: 'oversized',
    advised_ease: {
      bust_ease: { min: 15, max: 25, recommended: 20 },
      waist_ease: { min: 12, max: 20, recommended: 16 },
      hip_ease: { min: 12, max: 20, recommended: 16 },
      sleeve_ease: { min: 6, max: 10, recommended: 8 }
    },
    explanation: 'Oversized sweater with generous ease. Creates a trendy, relaxed silhouette.',
    priority: 2
  },

  // CARDIGAN RULES (similar to sweaters but with slight adjustments for open front)
  {
    id: 'cardigan-close-fitting',
    garment_category: 'cardigan',
    fit_preference: 'close_fitting',
    advised_ease: {
      bust_ease: { min: 2, max: 5, recommended: 3 },
      waist_ease: { min: 1, max: 4, recommended: 2 },
      hip_ease: { min: 1, max: 4, recommended: 2 },
      sleeve_ease: { min: 0, max: 2, recommended: 1 }
    },
    explanation: 'Close-fitting cardigan. Slightly more ease than sweater due to open front construction.',
    priority: 2
  },
  {
    id: 'cardigan-classic',
    garment_category: 'cardigan',
    fit_preference: 'classic',
    advised_ease: {
      bust_ease: { min: 5, max: 12, recommended: 8 },
      waist_ease: { min: 3, max: 10, recommended: 6 },
      hip_ease: { min: 3, max: 10, recommended: 6 },
      sleeve_ease: { min: 2, max: 5, recommended: 3 }
    },
    explanation: 'Classic fit cardigan. Comfortable ease allowing for layering underneath.',
    priority: 2
  },
  {
    id: 'cardigan-relaxed',
    garment_category: 'cardigan',
    fit_preference: 'relaxed',
    advised_ease: {
      bust_ease: { min: 12, max: 18, recommended: 15 },
      waist_ease: { min: 10, max: 15, recommended: 12 },
      hip_ease: { min: 10, max: 15, recommended: 12 },
      sleeve_ease: { min: 4, max: 7, recommended: 5 }
    },
    explanation: 'Relaxed cardigan perfect for layering over other garments.',
    priority: 2
  },
  {
    id: 'cardigan-oversized',
    garment_category: 'cardigan',
    fit_preference: 'oversized',
    advised_ease: {
      bust_ease: { min: 18, max: 30, recommended: 24 },
      waist_ease: { min: 15, max: 25, recommended: 20 },
      hip_ease: { min: 15, max: 25, recommended: 20 },
      sleeve_ease: { min: 6, max: 12, recommended: 9 }
    },
    explanation: 'Oversized cardigan with generous ease for a cozy, enveloping fit.',
    priority: 2
  },

  // HAT RULES
  {
    id: 'hat-very-close-fitting',
    garment_category: 'hat',
    fit_preference: 'very_close_fitting',
    advised_ease: {
      head_circumference: { min: -5, max: -2, recommended: -3 }
    },
    explanation: 'Snug-fitting hat with negative ease. Relies on fabric stretch to stay in place securely.',
    priority: 1
  },
  {
    id: 'hat-close-fitting',
    garment_category: 'hat',
    fit_preference: 'close_fitting',
    advised_ease: {
      head_circumference: { min: -2, max: 1, recommended: 0 }
    },
    explanation: 'Close-fitting hat that follows head shape. Comfortable without being tight.',
    priority: 2
  },
  {
    id: 'hat-classic',
    garment_category: 'hat',
    fit_preference: 'classic',
    advised_ease: {
      head_circumference: { min: 1, max: 3, recommended: 2 }
    },
    explanation: 'Classic hat fit with slight positive ease for comfort and easy wearing.',
    priority: 2
  },
  {
    id: 'hat-relaxed',
    garment_category: 'hat',
    fit_preference: 'relaxed',
    advised_ease: {
      head_circumference: { min: 3, max: 6, recommended: 4 }
    },
    explanation: 'Relaxed hat fit. Comfortable and easy to wear, suitable for various head shapes.',
    priority: 2
  },

  // SOCKS RULES
  {
    id: 'socks-very-close-fitting',
    garment_category: 'socks',
    fit_preference: 'very_close_fitting',
    advised_ease: {
      foot_circumference: { min: -3, max: -1, recommended: -2 }
    },
    explanation: 'Snug-fitting socks with negative ease. Provides secure fit and prevents slipping.',
    priority: 1
  },
  {
    id: 'socks-close-fitting',
    garment_category: 'socks',
    fit_preference: 'close_fitting',
    advised_ease: {
      foot_circumference: { min: -1, max: 1, recommended: 0 }
    },
    explanation: 'Close-fitting socks that follow foot contours. Comfortable everyday fit.',
    priority: 2
  },
  {
    id: 'socks-classic',
    garment_category: 'socks',
    fit_preference: 'classic',
    advised_ease: {
      foot_circumference: { min: 1, max: 3, recommended: 2 }
    },
    explanation: 'Classic sock fit with slight positive ease. Comfortable for extended wear.',
    priority: 2
  },

  // SHAWL RULES (minimal ease requirements)
  {
    id: 'shawl-classic',
    garment_category: 'shawl',
    fit_preference: 'classic',
    advised_ease: {},
    explanation: 'Shawls typically don\'t require specific ease measurements as they drape freely around the body.',
    priority: 2
  },
  {
    id: 'shawl-relaxed',
    garment_category: 'shawl',
    fit_preference: 'relaxed',
    advised_ease: {},
    explanation: 'Relaxed shawl draping. Focus on desired finished dimensions rather than body ease.',
    priority: 2
  },
  {
    id: 'shawl-oversized',
    garment_category: 'shawl',
    fit_preference: 'oversized',
    advised_ease: {},
    explanation: 'Large, enveloping shawl. Consider generous finished dimensions for maximum coverage.',
    priority: 2
  }
];

/**
 * Complete configuration for the ease advisor tool
 */
export const EASE_ADVISOR_CONFIG: EaseAdvisorConfig = {
  garment_categories: GARMENT_CATEGORIES,
  fit_preferences: FIT_PREFERENCES,
  yarn_weight_categories: YARN_WEIGHTS
};

/**
 * Finds matching ease advice rules based on criteria
 * @param garment_category - The garment category
 * @param fit_preference - The desired fit preference
 * @param yarn_weight_category - Optional yarn weight category
 * @returns Array of matching rules, sorted by priority
 */
export function findMatchingRules(
  garment_category: string,
  fit_preference: string,
  yarn_weight_category?: string
): EaseAdviceRule[] {
  const matchingRules = EASE_ADVICE_RULES.filter(rule => {
    // Must match garment category and fit preference
    if (rule.garment_category !== garment_category || rule.fit_preference !== fit_preference) {
      return false;
    }

    // If yarn weight is specified, check if rule supports it
    if (yarn_weight_category && rule.yarn_weight_categories) {
      return rule.yarn_weight_categories.includes(yarn_weight_category as YarnWeightCategory);
    }

    // If no yarn weight specified, or rule doesn't specify yarn weights, it's a match
    return true;
  });

  // Sort by priority (lower number = higher priority)
  return matchingRules.sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

/**
 * Gets the best matching rule for given criteria
 * @param garment_category - The garment category
 * @param fit_preference - The desired fit preference  
 * @param yarn_weight_category - Optional yarn weight category
 * @returns The best matching rule or null if none found
 */
export function getBestMatchingRule(
  garment_category: string,
  fit_preference: string,
  yarn_weight_category?: string
): EaseAdviceRule | null {
  const matchingRules = findMatchingRules(garment_category, fit_preference, yarn_weight_category);
  return matchingRules.length > 0 ? matchingRules[0] : null;
} 