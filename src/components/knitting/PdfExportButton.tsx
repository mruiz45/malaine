/**
 * Composant bouton d'export PDF - US_9.2
 * Gère l'export des patrons en format PDF avec feedback utilisateur
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { PdfExportRequest, PdfExportOptions } from '@/types/pdf';

interface PdfExportButtonProps {
  /** Données du patron à exporter */
  patternData: any; // Sera typé avec PatternData de US_9.1
  /** Options d'export personnalisées */
  exportOptions?: Partial<PdfExportOptions>;
  /** Classe CSS additionnelle */
  className?: string;
  /** Variante du bouton */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Taille du bouton */
  size?: 'sm' | 'md' | 'lg';
  /** Callback appelé avant l'export */
  onExportStart?: () => void;
  /** Callback appelé après succès d'export */
  onExportSuccess?: (fileSize: number) => void;
  /** Callback appelé en cas d'erreur */
  onExportError?: (error: string) => void;
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

export default function PdfExportButton({
  patternData,
  exportOptions = {},
  className = '',
  variant = 'primary',
  size = 'md',
  onExportStart,
  onExportSuccess,
  onExportError,
}: PdfExportButtonProps) {
  const { t } = useTranslation();
  const [exportState, setExportState] = useState<ExportState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Déclenche l'export PDF
   */
  const handleExportPdf = async () => {
    try {
      setExportState('loading');
      setErrorMessage('');
      onExportStart?.();

      // Préparation de la requête d'export
      const exportRequest: PdfExportRequest = {
        patternData,
        exportOptions: {
          includeHeader: true,
          includePageNumbers: true,
          includeSchematics: false,
          pageFormat: 'A4',
          orientation: 'portrait',
          ...exportOptions,
        },
      };

      // Validation côté client
      if (!patternData || !patternData.title) {
        throw new Error('Données du patron incomplètes');
      }

      // Appel à l'API d'export
      const response = await fetch('/api/patterns/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });

      if (!response.ok) {
        // Gestion des erreurs HTTP
        if (response.status === 401) {
          throw new Error('Authentification requise');
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Données invalides');
        } else {
          throw new Error(`Erreur serveur (${response.status})`);
        }
      }

      // Récupération du fichier PDF
      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        throw new Error('Le fichier reçu n\'est pas un PDF valide');
      }

      // Métadonnées du fichier depuis les headers
      const patternTitle = response.headers.get('X-Pattern-Title') || patternData.title || 'Patron';
      const fileSize = parseInt(response.headers.get('Content-Length') || '0');

      // Déclenchement du téléchargement
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${sanitizeFilename(patternTitle)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setExportState('success');
      onExportSuccess?.(fileSize);

      // Reset automatique après 3 secondes
      setTimeout(() => {
        setExportState('idle');
      }, 3000);

    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      setErrorMessage(errorMsg);
      setExportState('error');
      onExportError?.(errorMsg);

      // Reset automatique après 5 secondes
      setTimeout(() => {
        setExportState('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  /**
   * Nettoie le nom de fichier pour éviter les caractères problématiques
   */
  const sanitizeFilename = (filename: string): string => {
    return filename
      .replace(/[^a-z0-9\s\-_.]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);
  };

  /**
   * Classes CSS pour les différentes variantes
   */
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    };

    const stateClasses = {
      loading: 'cursor-wait',
      success: 'bg-green-600 hover:bg-green-600',
      error: 'bg-red-600 hover:bg-red-600',
    };

    return `
      ${baseClasses}
      ${sizeClasses[size]}
      ${exportState === 'idle' ? variantClasses[variant] : ''}
      ${exportState !== 'idle' ? stateClasses[exportState] || '' : ''}
      ${className}
    `.trim();
  };

  /**
   * Contenu du bouton selon l'état
   */
  const getButtonContent = () => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

    switch (exportState) {
      case 'loading':
        return (
          <>
            <svg className={`animate-spin -ml-1 mr-2 ${iconSize}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('common.generating', 'Génération...')}
          </>
        );
      case 'success':
        return (
          <>
            <svg className={`mr-2 ${iconSize}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('common.downloaded', 'Téléchargé!')}
          </>
        );
      case 'error':
        return (
          <>
            <svg className={`mr-2 ${iconSize}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('common.error', 'Erreur')}
          </>
        );
      default:
        return (
          <>
            <DocumentArrowDownIcon className={`mr-2 ${iconSize}`} />
            {t('pattern.downloadPdf', 'Télécharger PDF')}
          </>
        );
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleExportPdf}
        disabled={exportState === 'loading'}
        className={getButtonClasses()}
        title={exportState === 'error' ? errorMessage : t('pattern.downloadPdfTooltip', 'Télécharger le patron en format PDF')}
      >
        {getButtonContent()}
      </button>

      {/* Message d'erreur */}
      {exportState === 'error' && errorMessage && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg z-10 max-w-xs">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Hook personnalisé pour l'export PDF avec gestion d'état partagée
 */
export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportError, setLastExportError] = useState<string | null>(null);

  const exportToPdf = async (patternData: any, options?: Partial<PdfExportOptions>) => {
    setIsExporting(true);
    setLastExportError(null);

    try {
      const exportRequest: PdfExportRequest = {
        patternData,
        exportOptions: {
          includeHeader: true,
          includePageNumbers: true,
          includeSchematics: false,
          pageFormat: 'A4',
          orientation: 'portrait',
          ...options,
        },
      };

      const response = await fetch('/api/patterns/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const patternTitle = response.headers.get('X-Pattern-Title') || patternData.title || 'Patron';
      
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${patternTitle.replace(/[^a-z0-9\s\-_.]/gi, '').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      setLastExportError(errorMsg);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToPdf,
    isExporting,
    lastExportError,
    clearError: () => setLastExportError(null),
  };
} 