/**
 * Types pour l'export PDF des patrons - US_9.2 + US_11.6 + US_12.8
 * Préparé pour l'intégration future des diagrammes schématiques (US_9.3) et des diagrammes de tricot (US_11.6)
 * Inclut le support des styles personnalisés (US_12.8)
 */

import type { DiagramStyleOptions } from './stitchChartStyles';

export interface PdfExportOptions {
  /** Inclure l'en-tête avec le titre du patron */
  includeHeader?: boolean;
  /** Inclure les numéros de page */
  includePageNumbers?: boolean;
  /** Inclure les diagrammes schématiques (US_9.3 future) */
  includeSchematics?: boolean;
  /** Inclure les diagrammes de tricot/crochet (US_11.6) */
  includeStitchCharts?: boolean;
  /** Options de style pour les diagrammes (US_12.8) */
  stitchChartStyles?: DiagramStyleOptions;
  /** Format de page (défaut: A4) */
  pageFormat?: 'A4' | 'Letter';
  /** Orientation (défaut: portrait) */
  orientation?: 'portrait' | 'landscape';
  /** Marges personnalisées en mm */
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export interface PdfExportRequest {
  /** Données du patron à exporter */
  patternData: any; // Sera typé avec les types de US_9.1 une fois disponibles
  /** Options d'export */
  exportOptions?: PdfExportOptions;
  /** Données des diagrammes schématiques (US_9.3 future) */
  schematicsData?: SchematicsData[];
}

export interface PdfExportResponse {
  /** Statut de l'export */
  success: boolean;
  /** Message en cas d'erreur */
  error?: string;
  /** URL de téléchargement du PDF */
  downloadUrl?: string;
  /** Taille du fichier généré en bytes */
  fileSize?: number;
}

export interface PdfGenerationResult {
  /** Buffer du PDF généré */
  buffer: Buffer;
  /** Métadonnées du PDF */
  metadata: {
    pageCount: number;
    fileSize: number;
    generatedAt: Date;
    patternTitle: string;
  };
}

/**
 * Structure des données schématiques (US_9.3 future)
 */
export interface SchematicsData {
  /** Identifiant unique du schéma */
  id: string;
  /** Type de schéma */
  type: 'garment' | 'construction' | 'detail';
  /** Données du schéma */
  data: any; // Sera défini dans US_9.3
}

export interface PdfTemplateData {
  /** Données du patron */
  pattern: any; // Sera typé avec PatternData de US_9.1
  /** Options d'export */
  options: PdfExportOptions;
  /** Diagrammes schématiques optionnels */
  schematics?: SchematicsData[];
  /** Métadonnées pour l'en-tête/pied de page */
  metadata: {
    title: string;
    generatedAt: string;
    pageNumbers: boolean;
  };
} 