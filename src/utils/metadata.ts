import { Metadata } from 'next';

/**
 * Utility functions for generating translated metadata
 * Used to support internationalization for page metadata
 */

interface TranslatedMetadata {
  title: string;
  description: string;
  keywords?: string;
}

/**
 * Generate metadata for the main app layout
 */
export function generateAppMetadata(): Metadata {
  // For now, we'll use English as default since metadata is generated server-side
  // In the future, this could be enhanced to support dynamic language detection
  return {
    title: "Malaine - Knitting/Crochet Assistant",
    description: "Your smart assistant for knitting and crochet projects",
  };
}

/**
 * Generate metadata for the stitch pattern library page
 */
export function generateLibraryMetadata(): Metadata {
  return {
    title: "Stitch Pattern Library | Malaine",
    description: "Browse and explore our comprehensive collection of knitting and crochet stitch patterns. Find the perfect pattern for your project.",
    keywords: ["stitch patterns", "knitting", "crochet", "library", "patterns", "techniques"]
  };
}

/**
 * Generate metadata for individual stitch pattern pages
 */
export function generateLibraryPatternMetadata(): Metadata {
  return {
    title: "Stitch Pattern | Malaine",
    description: "Detailed stitch pattern instructions and information.",
  };
}

/**
 * Generate metadata with custom title and description
 */
export function generateCustomMetadata(title: string, description: string, keywords?: string[]): Metadata {
  return {
    title,
    description,
    ...(keywords && { keywords })
  };
}

/**
 * Generates translated metadata for the showcase page
 */
export function generateShowcaseMetadata(): Metadata {
  // Default to English metadata since this is server-side
  return {
    title: 'Pattern Gallery | Malaine',
    description: 'Discover inspiring knitting and crochet patterns. Browse our curated collection of example patterns to see what\'s possible with Malaine.',
    keywords: ['knitting patterns', 'crochet patterns', 'pattern gallery', 'knitting examples', 'crochet examples'],
    openGraph: {
      title: 'Pattern Gallery | Malaine', 
      description: 'Discover inspiring knitting and crochet patterns. Browse our curated collection of example patterns.',
      type: 'website',
    },
  };
} 