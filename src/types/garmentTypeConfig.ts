/**
 * Types for Garment Type Configuration (PD_PH1_US001)
 * Defines the mapping between garment types and their relevant pattern definition sections
 */

/**
 * Available pattern definition sections/modules
 */
export type PatternDefinitionSection = 
  | 'gauge'
  | 'measurements'
  | 'ease'
  | 'yarn'
  | 'stitchPattern'
  | 'bodyStructure'
  | 'neckline'
  | 'sleeves'
  | 'accessoryDefinition'
  | 'summary';

/**
 * Configuration for a garment type defining which sections are relevant
 */
export interface GarmentTypeConfig {
  /** The garment type key from the database */
  garmentTypeKey: string;
  /** Display name for the garment type */
  displayName: string;
  /** List of relevant pattern definition sections for this garment type */
  relevantSections: PatternDefinitionSection[];
  /** Sections that are required (must be completed) for this garment type */
  requiredSections: PatternDefinitionSection[];
  /** Default section to show first after garment type selection */
  defaultSection: PatternDefinitionSection;
}

/**
 * Complete mapping configuration for all garment types
 */
export interface GarmentTypeSectionMapping {
  [garmentTypeKey: string]: GarmentTypeConfig;
}

/**
 * Section metadata for display purposes
 */
export interface SectionMetadata {
  /** Section key */
  key: PatternDefinitionSection;
  /** Display name */
  displayName: string;
  /** Description of what this section defines */
  description: string;
  /** Icon name (using Heroicons) */
  icon: string;
  /** Estimated time to complete this section */
  estimatedTime?: string;
} 