/**
 * Types for Accessory Garments (US_7.1)
 * Defines interfaces for beanie/hat and scarf/cowl accessories
 */

/**
 * Crown style options for beanies/hats
 */
export type CrownStyle = 'classic_tapered' | 'slouchy' | 'flat_top';

/**
 * Brim style options for beanies/hats
 */
export type BrimStyle = 'no_brim' | 'folded_ribbed_1x1' | 'rolled_edge';

/**
 * Work style options for scarves/cowls
 */
export type WorkStyle = 'flat' | 'in_the_round';

/**
 * Accessory type discriminator
 */
export type AccessoryType = 'scarf' | 'cowl';

/**
 * Beanie/Hat attributes interface
 * Corresponds to FR2 requirements in US_7.1
 */
export interface BeanieAttributes {
  /** Target finished head circumference in cm */
  target_circumference_cm: number;
  /** Desired finished hat height from crown to brim in cm */
  body_height_cm: number;
  /** Selected crown shaping style */
  crown_style: CrownStyle;
  /** Selected brim style */
  brim_style: BrimStyle;
  /** Brim depth in cm (if applicable) */
  brim_depth_cm?: number;
  /** Construction method */
  work_style: 'in_the_round';
}

/**
 * Scarf attributes interface
 * Corresponds to FR3 requirements for scarf in US_7.1
 */
export interface ScarfAttributes {
  /** Accessory type discriminator */
  type: 'scarf';
  /** Desired finished width in cm */
  width_cm: number;
  /** Desired finished length in cm */
  length_cm: number;
  /** Work style - flat for traditional scarves */
  work_style: WorkStyle;
}

/**
 * Cowl attributes interface
 * Corresponds to FR3 requirements for cowl in US_7.1
 */
export interface CowlAttributes {
  /** Accessory type discriminator */
  type: 'cowl';
  /** Finished circumference in cm */
  circumference_cm: number;
  /** Finished height in cm */
  height_cm: number;
  /** Work style - typically in the round for cowls */
  work_style: WorkStyle;
}

/**
 * Union type for scarf/cowl attributes
 */
export type ScarfCowlAttributes = ScarfAttributes | CowlAttributes;

/**
 * Complete accessory attributes union
 */
export type AccessoryAttributes = BeanieAttributes | ScarfCowlAttributes;

/**
 * Props for BeanieDefinitionForm component
 */
export interface BeanieDefinitionFormProps {
  /** Currently selected beanie attributes */
  selectedAttributes?: BeanieAttributes;
  /** Available measurement sets for head circumference */
  measurementSets?: Array<{
    id: string;
    set_name: string;
    head_circumference?: number;
    measurement_unit: 'cm' | 'inch';
  }>;
  /** Callback when beanie attributes are updated */
  onAttributesChange: (attributes: BeanieAttributes) => void;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Props for ScarfCowlDefinitionForm component
 */
export interface ScarfCowlDefinitionFormProps {
  /** Currently selected scarf/cowl attributes */
  selectedAttributes?: ScarfCowlAttributes;
  /** Callback when scarf/cowl attributes are updated */
  onAttributesChange: (attributes: ScarfCowlAttributes) => void;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Crown style option with metadata
 */
export interface CrownStyleOption {
  key: CrownStyle;
  name: string;
  description: string;
}

/**
 * Brim style option with metadata
 */
export interface BrimStyleOption {
  key: BrimStyle;
  name: string;
  description: string;
  default_depth_cm?: number;
}

/**
 * Predefined crown style options
 */
export const CROWN_STYLE_OPTIONS: CrownStyleOption[] = [
  {
    key: 'classic_tapered',
    name: 'Classic Tapered Crown',
    description: 'Traditional decrease pattern creating a tapered crown'
  },
  {
    key: 'slouchy',
    name: 'Slouchy Crown',
    description: 'Looser fit with extra fabric for a relaxed look'
  },
  {
    key: 'flat_top',
    name: 'Flat Top Crown',
    description: 'Minimal decreases for a flat-topped appearance'
  }
];

/**
 * Predefined brim style options
 */
export const BRIM_STYLE_OPTIONS: BrimStyleOption[] = [
  {
    key: 'no_brim',
    name: 'No Brim',
    description: 'Clean edge finish without additional brim'
  },
  {
    key: 'folded_ribbed_1x1',
    name: 'Folded Ribbed Brim (1x1)',
    description: 'Ribbed section that folds up for warmth and style',
    default_depth_cm: 5
  },
  {
    key: 'rolled_edge',
    name: 'Rolled Edge',
    description: 'Naturally rolling stockinette edge',
    default_depth_cm: 3
  }
];

/**
 * Validation functions
 */

/**
 * Validates beanie attributes
 */
export function validateBeanieAttributes(attributes: Partial<BeanieAttributes>): string[] {
  const errors: string[] = [];

  if (!attributes.target_circumference_cm || attributes.target_circumference_cm <= 0) {
    errors.push('Head circumference must be greater than 0');
  }

  if (!attributes.body_height_cm || attributes.body_height_cm <= 0) {
    errors.push('Hat height must be greater than 0');
  }

  if (!attributes.crown_style) {
    errors.push('Crown style must be selected');
  }

  if (!attributes.brim_style) {
    errors.push('Brim style must be selected');
  }

  if (attributes.brim_style !== 'no_brim' && (!attributes.brim_depth_cm || attributes.brim_depth_cm <= 0)) {
    errors.push('Brim depth must be specified for brim styles other than "no brim"');
  }

  return errors;
}

/**
 * Validates scarf attributes
 */
export function validateScarfAttributes(attributes: Partial<ScarfAttributes>): string[] {
  const errors: string[] = [];

  if (!attributes.width_cm || attributes.width_cm <= 0) {
    errors.push('Scarf width must be greater than 0');
  }

  if (!attributes.length_cm || attributes.length_cm <= 0) {
    errors.push('Scarf length must be greater than 0');
  }

  if (!attributes.work_style) {
    errors.push('Work style must be selected');
  }

  return errors;
}

/**
 * Validates cowl attributes
 */
export function validateCowlAttributes(attributes: Partial<CowlAttributes>): string[] {
  const errors: string[] = [];

  if (!attributes.circumference_cm || attributes.circumference_cm <= 0) {
    errors.push('Cowl circumference must be greater than 0');
  }

  if (!attributes.height_cm || attributes.height_cm <= 0) {
    errors.push('Cowl height must be greater than 0');
  }

  if (!attributes.work_style) {
    errors.push('Work style must be selected');
  }

  return errors;
}

/**
 * Validates scarf/cowl attributes based on type
 */
export function validateScarfCowlAttributes(attributes: Partial<ScarfCowlAttributes>): string[] {
  if (!attributes.type) {
    return ['Accessory type (scarf or cowl) must be selected'];
  }

  if (attributes.type === 'scarf') {
    return validateScarfAttributes(attributes as Partial<ScarfAttributes>);
  } else {
    return validateCowlAttributes(attributes as Partial<CowlAttributes>);
  }
} 