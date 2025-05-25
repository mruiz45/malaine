/**
 * Yarn Profile Types for Malaine Project
 * Corresponds to US_1.4 - Yarn and Material Details Input and Management
 */

/**
 * Fiber content entry for yarn composition
 */
export interface FiberContent {
  fiber: string;
  percentage: number;
}

/**
 * Standard yarn weight categories based on Craft Yarn Council standards
 */
export type YarnWeightCategory = 
  | 'Lace' 
  | 'Fingering' 
  | 'DK' 
  | 'Worsted' 
  | 'Bulky' 
  | 'Super Bulky' 
  | 'Jumbo';

/**
 * Complete yarn profile as stored in database
 */
export interface YarnProfile {
  id: string;
  user_id: string;
  yarn_name: string;
  brand_name?: string;
  fiber_content?: FiberContent[];
  yarn_weight_category?: YarnWeightCategory;
  skein_yardage?: number;
  skein_meterage?: number;
  skein_weight_grams?: number;
  color_name?: string;
  color_hex_code?: string;
  dye_lot?: string;
  purchase_link?: string;
  ravelry_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new yarn profile
 */
export interface CreateYarnProfile {
  yarn_name: string;
  brand_name?: string;
  fiber_content?: FiberContent[];
  yarn_weight_category?: YarnWeightCategory;
  skein_yardage?: number;
  skein_meterage?: number;
  skein_weight_grams?: number;
  color_name?: string;
  color_hex_code?: string;
  dye_lot?: string;
  purchase_link?: string;
  ravelry_id?: string;
  notes?: string;
}

/**
 * Data for updating an existing yarn profile
 */
export interface UpdateYarnProfile {
  yarn_name?: string;
  brand_name?: string;
  fiber_content?: FiberContent[];
  yarn_weight_category?: YarnWeightCategory;
  skein_yardage?: number;
  skein_meterage?: number;
  skein_weight_grams?: number;
  color_name?: string;
  color_hex_code?: string;
  dye_lot?: string;
  purchase_link?: string;
  ravelry_id?: string;
  notes?: string;
}

/**
 * API response for single yarn profile operations
 */
export interface YarnProfileResponse {
  success: boolean;
  data?: YarnProfile;
  error?: string;
}

/**
 * API response for multiple yarn profiles operations
 */
export interface YarnProfilesResponse {
  success: boolean;
  data?: YarnProfile[];
  error?: string;
}

/**
 * Common fiber types for yarn
 */
export const COMMON_FIBER_TYPES = [
  'Wool',
  'Cotton',
  'Acrylic',
  'Alpaca',
  'Silk',
  'Linen',
  'Bamboo',
  'Cashmere',
  'Mohair',
  'Nylon',
  'Polyester',
  'Merino',
  'Angora'
] as const;

/**
 * Yarn weight categories with their typical characteristics
 */
export const YARN_WEIGHT_CATEGORIES = [
  {
    category: 'Lace' as YarnWeightCategory,
    weight: '0',
    description: 'Lace weight',
    typical_gauge: '33-40 sts'
  },
  {
    category: 'Fingering' as YarnWeightCategory,
    weight: '1',
    description: 'Sock, fingering, baby',
    typical_gauge: '27-32 sts'
  },
  {
    category: 'DK' as YarnWeightCategory,
    weight: '3',
    description: 'DK, light worsted',
    typical_gauge: '21-24 sts'
  },
  {
    category: 'Worsted' as YarnWeightCategory,
    weight: '4',
    description: 'Worsted, afghan, aran',
    typical_gauge: '16-20 sts'
  },
  {
    category: 'Bulky' as YarnWeightCategory,
    weight: '5',
    description: 'Chunky, craft, rug',
    typical_gauge: '12-15 sts'
  },
  {
    category: 'Super Bulky' as YarnWeightCategory,
    weight: '6',
    description: 'Super chunky, super bulky',
    typical_gauge: '7-11 sts'
  },
  {
    category: 'Jumbo' as YarnWeightCategory,
    weight: '7',
    description: 'Jumbo, roving',
    typical_gauge: '6 sts or fewer'
  }
] as const; 