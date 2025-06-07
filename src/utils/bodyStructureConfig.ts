/**
 * Body Structure Configuration
 * Configuration for construction methods and body shapes with metadata
 */

import type { 
  ConstructionMethod, 
  BodyShape, 
  ConstructionMethodOption, 
  BodyShapeOption 
} from '@/types/sweaterStructure';

/**
 * Available construction methods with metadata
 */
export const CONSTRUCTION_METHODS: ConstructionMethodOption[] = [
  {
    key: 'drop_shoulder',
    display_name: 'Drop Shoulder',
    description: 'Simple construction with straight sleeve line from shoulder',
    icon: 'RectangleStackIcon',
    difficulty: 'beginner',
    compatible_garment_types: ['sweater_pullover', 'cardigan']
  },
  {
    key: 'set_in_sleeve',
    display_name: 'Set-in Sleeve',
    description: 'Traditional fitted construction with shaped armholes and sleeve caps',
    icon: 'CubeIcon',
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater_pullover', 'cardigan']
  },
  {
    key: 'raglan',
    display_name: 'Raglan',
    description: 'Diagonal seam from armpit to neckline, knitted bottom-up',
    icon: 'ArrowUpRightIcon',
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater_pullover', 'cardigan']
  },
  {
    key: 'raglan_top_down',
    display_name: 'Raglan Top-Down',
    description: 'Raglan construction knitted from neckline down',
    icon: 'ArrowDownIcon',
    difficulty: 'advanced',
    compatible_garment_types: ['sweater_pullover', 'cardigan']
  },
  {
    key: 'dolman',
    display_name: 'Dolman',
    description: 'Wide, loose sleeves integrated with the body',
    icon: 'RectangleGroupIcon',
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater_pullover', 'cardigan']
  }
];

/**
 * Available body shapes with metadata
 */
export const BODY_SHAPES: BodyShapeOption[] = [
  {
    key: 'straight',
    display_name: 'Straight',
    description: 'Straight silhouette with minimal shaping',
    icon: 'Bars3Icon',
    fit_type: 'loose',
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan', 'raglan_top_down', 'dolman']
  },
  {
    key: 'a_line',
    display_name: 'A-Line',
    description: 'Wider at the bottom, fitted at the top',
    icon: 'FunnelIcon',
    fit_type: 'fitted',
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan', 'raglan_top_down']
  },
  {
    key: 'fitted_shaped_waist',
    display_name: 'Fitted with Shaped Waist',
    description: 'Tailored fit with waist shaping',
    icon: 'AdjustmentsHorizontalIcon',
    fit_type: 'fitted',
    compatible_construction_methods: ['set_in_sleeve']
  },
  {
    key: 'oversized_boxy',
    display_name: 'Oversized Boxy',
    description: 'Relaxed, oversized fit with minimal shaping',
    icon: 'Square3Stack3DIcon',
    fit_type: 'oversized',
    compatible_construction_methods: ['drop_shoulder', 'dolman']
  }
];

/**
 * Get construction methods compatible with a specific garment type
 */
export function getCompatibleConstructionMethods(garmentType: string): ConstructionMethodOption[] {
  return CONSTRUCTION_METHODS.filter(method => 
    method.compatible_garment_types?.includes(garmentType)
  );
}

/**
 * Get body shapes compatible with a specific construction method
 */
export function getCompatibleBodyShapes(constructionMethod: ConstructionMethod): BodyShapeOption[] {
  return BODY_SHAPES.filter(shape => 
    shape.compatible_construction_methods?.includes(constructionMethod)
  );
}

/**
 * Get all construction methods
 */
export function getAllConstructionMethods(): ConstructionMethodOption[] {
  return CONSTRUCTION_METHODS;
}

/**
 * Get all body shapes
 */
export function getAllBodyShapes(): BodyShapeOption[] {
  return BODY_SHAPES;
}

/**
 * Validate if a construction method and body shape combination is compatible
 */
export function isCompatibleCombination(
  constructionMethod: ConstructionMethod, 
  bodyShape: BodyShape
): boolean {
  const shape = BODY_SHAPES.find(s => s.key === bodyShape);
  return shape?.compatible_construction_methods?.includes(constructionMethod) ?? false;
}

/**
 * Get construction method option by key
 */
export function getConstructionMethodOption(key: ConstructionMethod): ConstructionMethodOption | undefined {
  return CONSTRUCTION_METHODS.find(method => method.key === key);
}

/**
 * Get body shape option by key
 */
export function getBodyShapeOption(key: BodyShape): BodyShapeOption | undefined {
  return BODY_SHAPES.find(shape => shape.key === key);
} 