/**
 * Garment Type Configuration (PD_PH1_US001)
 * Static configuration mapping garment types to their relevant pattern definition sections
 */

import { 
  GarmentTypeSectionMapping, 
  GarmentTypeConfig, 
  SectionMetadata,
  PatternDefinitionSection 
} from '@/types/garmentTypeConfig';

/**
 * Section metadata for display and navigation
 */
export const SECTION_METADATA: Record<PatternDefinitionSection, SectionMetadata> = {
  gauge: {
    key: 'gauge',
    displayName: 'Gauge',
    description: 'Define your knitting gauge (stitches and rows per inch/cm)',
    icon: 'ViewfinderCircleIcon',
    estimatedTime: '5 min'
  },
  measurements: {
    key: 'measurements',
    displayName: 'Measurements',
    description: 'Body measurements for fitting',
    icon: 'RectangleStackIcon',
    estimatedTime: '10 min'
  },
  ease: {
    key: 'ease',
    displayName: 'Ease',
    description: 'Define how loose or fitted the garment should be',
    icon: 'ArrowsPointingOutIcon',
    estimatedTime: '5 min'
  },
  yarn: {
    key: 'yarn',
    displayName: 'Yarn',
    description: 'Select yarn type and properties',
    icon: 'GlobeAmericasIcon',
    estimatedTime: '5 min'
  },
  stitchPattern: {
    key: 'stitchPattern',
    displayName: 'Stitch Pattern',
    description: 'Choose the main stitch pattern for your garment',
    icon: 'SwatchIcon',
    estimatedTime: '10 min'
  },
  bodyStructure: {
    key: 'bodyStructure',
    displayName: 'Body Structure',
    description: 'Define how the garment body is constructed',
    icon: 'CubeIcon',
    estimatedTime: '15 min'
  },
  neckline: {
    key: 'neckline',
    displayName: 'Neckline',
    description: 'Choose neckline style and shaping',
    icon: 'EllipseHorizontalIcon',
    estimatedTime: '10 min'
  },
  sleeves: {
    key: 'sleeves',
    displayName: 'Sleeves',
    description: 'Define sleeve style, length, and construction',
    icon: 'ArrowUpRightIcon',
    estimatedTime: '15 min'
  },
  accessoryDefinition: {
    key: 'accessoryDefinition',
    displayName: 'Accessory Details',
    description: 'Define specific attributes for hats, scarves, and other accessories',
    icon: 'SparklesIcon',
    estimatedTime: '10 min'
  },
  summary: {
    key: 'summary',
    displayName: 'Summary',
    description: 'Review your pattern definition and generate calculations',
    icon: 'DocumentTextIcon',
    estimatedTime: '5 min'
  }
};

/**
 * Complete garment type to sections mapping configuration
 * Based on the garment types from the database
 */
export const GARMENT_TYPE_SECTION_MAPPING: GarmentTypeSectionMapping = {
  // Sweater Pullover - Full sweater construction
  sweater_pullover: {
    garmentTypeKey: 'sweater_pullover',
    displayName: 'Pull-over Sweater',
    relevantSections: [
      'gauge',
      'measurements', 
      'ease',
      'yarn',
      'stitchPattern',
      'bodyStructure',
      'neckline',
      'sleeves',
      'summary'
    ],
    requiredSections: [
      'gauge',
      'measurements',
      'ease',
      'yarn',
      'bodyStructure'
    ],
    defaultSection: 'gauge'
  },

  // Cardigan - Similar to sweater but with front opening
  cardigan: {
    garmentTypeKey: 'cardigan',
    displayName: 'Cardigan',
    relevantSections: [
      'gauge',
      'measurements',
      'ease', 
      'yarn',
      'stitchPattern',
      'bodyStructure',
      'neckline',
      'sleeves',
      'summary'
    ],
    requiredSections: [
      'gauge',
      'measurements',
      'ease',
      'yarn',
      'bodyStructure'
    ],
    defaultSection: 'gauge'
  },

  // Scarf - Simple rectangular accessory
  scarf: {
    garmentTypeKey: 'scarf',
    displayName: 'Scarf',
    relevantSections: [
      'gauge',
      'measurements',
      'yarn',
      'stitchPattern',
      'accessoryDefinition',
      'summary'
    ],
    requiredSections: [
      'gauge',
      'measurements',
      'yarn'
    ],
    defaultSection: 'gauge'
  },

  // Scarf/Cowl - Can be worn multiple ways
  scarf_cowl: {
    garmentTypeKey: 'scarf_cowl',
    displayName: 'Scarf/Cowl',
    relevantSections: [
      'gauge',
      'measurements',
      'yarn',
      'stitchPattern',
      'accessoryDefinition',
      'summary'
    ],
    requiredSections: [
      'gauge',
      'measurements',
      'yarn'
    ],
    defaultSection: 'gauge'
  },

  // Beanie - Head accessory
  beanie: {
    garmentTypeKey: 'beanie',
    displayName: 'Beanie Hat',
    relevantSections: [
      'gauge',
      'measurements',
      'ease',
      'yarn',
      'stitchPattern',
      'accessoryDefinition',
      'summary'
    ],
    requiredSections: [
      'gauge',
      'measurements',
      'yarn'
    ],
    defaultSection: 'gauge'
  }
};

/**
 * Get configuration for a specific garment type
 */
export function getGarmentTypeConfig(garmentTypeKey: string): GarmentTypeConfig | null {
  return GARMENT_TYPE_SECTION_MAPPING[garmentTypeKey] || null;
}

/**
 * Get all available garment type configurations
 */
export function getAllGarmentTypeConfigs(): GarmentTypeConfig[] {
  return Object.values(GARMENT_TYPE_SECTION_MAPPING);
}

/**
 * Check if a section is relevant for a specific garment type
 */
export function isSectionRelevant(
  garmentTypeKey: string, 
  section: PatternDefinitionSection
): boolean {
  const config = getGarmentTypeConfig(garmentTypeKey);
  return config ? config.relevantSections.includes(section) : false;
}

/**
 * Check if a section is required for a specific garment type
 */
export function isSectionRequired(
  garmentTypeKey: string, 
  section: PatternDefinitionSection
): boolean {
  const config = getGarmentTypeConfig(garmentTypeKey);
  return config ? config.requiredSections.includes(section) : false;
}

/**
 * Get the default section for a garment type
 */
export function getDefaultSection(garmentTypeKey: string): PatternDefinitionSection | null {
  const config = getGarmentTypeConfig(garmentTypeKey);
  return config ? config.defaultSection : null;
} 