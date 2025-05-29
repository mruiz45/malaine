/**
 * Schematic Display Component (US_9.3)
 * Component for displaying SVG schematic diagrams of garment components
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowDownTrayIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { SchematicDiagram } from '@/types/schematics';
import { schematicService } from '@/services/schematicService';

interface SchematicDisplayProps {
  /** The schematic diagram to display */
  schematic: SchematicDiagram;
  /** Whether to show in compact mode (smaller) */
  compact?: boolean;
  /** Whether to show download button */
  showDownload?: boolean;
  /** Whether to show zoom controls */
  showZoomControls?: boolean;
  /** Maximum width for the display */
  maxWidth?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether in print mode */
  printMode?: boolean;
}

/**
 * Component for displaying schematic diagrams
 */
export default function SchematicDisplay({
  schematic,
  compact = false,
  showDownload = true,
  showZoomControls = true,
  maxWidth = '400px',
  className = '',
  printMode = false
}: SchematicDisplayProps) {
  const { t } = useTranslation();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showLightbox, setShowLightbox] = useState(false);

  /**
   * Handles downloading the schematic
   */
  const handleDownload = () => {
    try {
      schematicService.downloadSchematic(schematic);
    } catch (error) {
      console.error('Error downloading schematic:', error);
      // Could add toast notification here
    }
  };

  /**
   * Handles zoom in
   */
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  /**
   * Handles zoom out
   */
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  /**
   * Resets zoom to default
   */
  const resetZoom = () => {
    setZoomLevel(1);
  };

  /**
   * Opens schematic in lightbox for detailed view
   */
  const openLightbox = () => {
    if (!printMode) {
      setShowLightbox(true);
    }
  };

  /**
   * Closes the lightbox
   */
  const closeLightbox = () => {
    setShowLightbox(false);
    resetZoom();
  };

  const baseClasses = `
    schematic-display border border-gray-200 rounded-lg bg-white overflow-hidden
    ${compact ? 'p-3' : 'p-4'}
    ${className}
  `;

  const contentClasses = `
    schematic-content text-center
    ${!printMode && !compact ? 'cursor-pointer hover:bg-gray-50' : ''}
  `;

  return (
    <>
      <div className={baseClasses} style={{ maxWidth }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {t('patternViewer.schematic', 'Schematic')}: {schematic.componentName}
          </h4>
          
          {/* Controls - Hidden in print mode */}
          {!printMode && (
            <div className="flex items-center space-x-2">
              {showZoomControls && !compact && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title={t('patternViewer.zoomOut', 'Zoom out')}
                    disabled={zoomLevel <= 0.5}
                  >
                    <MagnifyingGlassMinusIcon className="h-4 w-4" />
                  </button>
                  
                  <span className="text-xs text-gray-500 min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <button
                    onClick={handleZoomIn}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    title={t('patternViewer.zoomIn', 'Zoom in')}
                    disabled={zoomLevel >= 3}
                  >
                    <MagnifyingGlassPlusIcon className="h-4 w-4" />
                  </button>
                </>
              )}
              
              {showDownload && (
                <button
                  onClick={handleDownload}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title={t('patternViewer.downloadSchematic', 'Download schematic')}
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* SVG Content */}
        <div className={contentClasses} onClick={openLightbox}>
          <div 
            className="inline-block"
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              transition: 'transform 0.2s ease'
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: schematic.svgContent }}
              className="schematic-svg"
            />
          </div>
        </div>

        {/* Click to enlarge hint */}
        {!printMode && !compact && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            {t('patternViewer.clickToEnlarge', 'Click to enlarge')}
          </p>
        )}

        {/* Metadata */}
        {!compact && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>{t('patternViewer.shape', 'Shape')}: {schematic.shape}</span>
              <span>{t('patternViewer.generated', 'Generated')}: {new Date(schematic.generatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {showLightbox && !printMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-full w-full h-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {schematic.componentName} - {t('patternViewer.schematic', 'Schematic')}
              </h3>
              
              <div className="flex items-center space-x-4">
                {/* Zoom Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    disabled={zoomLevel <= 0.5}
                  >
                    <MagnifyingGlassMinusIcon className="h-5 w-5" />
                  </button>
                  
                  <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                    disabled={zoomLevel >= 3}
                  >
                    <MagnifyingGlassPlusIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={resetZoom}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  >
                    {t('patternViewer.resetZoom', 'Reset')}
                  </button>
                </div>
                
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </button>
                
                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8">
              <div 
                className="inline-block bg-white p-4 rounded-lg shadow-lg"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: schematic.svgContent }}
                  className="schematic-svg-lightbox"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 