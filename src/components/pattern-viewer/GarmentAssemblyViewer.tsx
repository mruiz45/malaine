/**
 * Garment Assembly Viewer Component (US_12.9)
 * Main component for displaying 2D garment assembly visualization with interactive features
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CursorArrowRaysIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  ViewfinderCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { GarmentAssemblyViewerProps } from '@/types/assembly-visualization';
import { useAssemblyVisualization } from '@/hooks/useAssemblyVisualization';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AssemblyPieceDisplay from './AssemblyPieceDisplay';
import AssemblyConnectionIndicator from './AssemblyConnectionIndicator';
import AssemblyInfoTooltip from './AssemblyInfoTooltip';

/**
 * Main Garment Assembly Viewer Component (FR2, FR3)
 */
export default function GarmentAssemblyViewer({
  session_id,
  print_mode = false,
  config,
  on_component_select,
  on_connection_click,
  className = ''
}: GarmentAssemblyViewerProps) {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Tooltip state
  const [tooltipData, setTooltipData] = useState<{
    connectionId: string;
    position: { x: number; y: number };
  } | null>(null);

  // Assembly visualization state and controls
  const {
    assemblyData,
    isLoading,
    error,
    state,
    selectComponent,
    highlightConnection,
    updateComponentPosition,
    toggleDragMode,
    setZoomLevel,
    resetView,
    autoArrangeComponents,
    validationResult
  } = useAssemblyVisualization(session_id, {
    includeEdges: true,
    autoLayout: true,
    enableDragDrop: !print_mode,
    config,
    onComponentSelect: on_component_select,
    onConnectionClick: on_connection_click
  });

  /**
   * Handles component click (FR5)
   */
  const handleComponentClick = useCallback((componentKey: string) => {
    selectComponent(componentKey === state.selected_component ? undefined : componentKey);
  }, [selectComponent, state.selected_component]);

  /**
   * Handles component drag (FR6)
   */
  const handleComponentDrag = useCallback((componentKey: string, newPosition: { x: number; y: number }) => {
    if (state.drag_mode_enabled && !print_mode) {
      updateComponentPosition(componentKey, newPosition);
    }
  }, [updateComponentPosition, state.drag_mode_enabled, print_mode]);

  /**
   * Handles connection click with tooltip (FR5)
   */
  const handleConnectionClick = useCallback((connectionId: string, event: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipData({
        connectionId,
        position: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top
        }
      });
    }
    highlightConnection(connectionId);
    on_connection_click?.(connectionId);
  }, [highlightConnection, on_connection_click]);

  /**
   * Closes tooltip
   */
  const handleCloseTooltip = useCallback(() => {
    setTooltipData(null);
    highlightConnection(undefined);
  }, [highlightConnection]);

  /**
   * Handles zoom wheel
   */
  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(state.zoom_level + delta);
    }
  }, [setZoomLevel, state.zoom_level]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {t('assemblyViewer.loading', 'Loading assembly visualization...')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              {t('assemblyViewer.error.title', 'Assembly Visualization Error')}
            </h3>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-red-600 hover:text-red-500 underline"
            >
              {t('assemblyViewer.error.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!assemblyData || assemblyData.components.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('assemblyViewer.noData.title', 'No Assembly Data Available')}
        </h3>
        <p className="text-gray-600">
          {t('assemblyViewer.noData.description', 'Assembly visualization data is not available for this pattern session.')}
        </p>
      </div>
    );
  }

  // Validation warnings
  if (!validationResult.isValid) {
    console.warn('Assembly data validation failed:', validationResult.errors);
  }

  const canvasWidth = assemblyData.default_layout.canvas_width;
  const canvasHeight = assemblyData.default_layout.canvas_height;
  const viewBoxWidth = canvasWidth * state.zoom_level;
  const viewBoxHeight = canvasHeight * state.zoom_level;
  const viewBoxX = -state.pan_offset.x;
  const viewBoxY = -state.pan_offset.y;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar - Hidden in print mode */}
      {!print_mode && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {t('assemblyViewer.title', '2D Assembly View')}
              <span className="ml-2 text-sm text-gray-500">
                ({assemblyData.components.length} {t('assemblyViewer.components', 'components')})
              </span>
            </h3>
            
            <div className="flex items-center space-x-2">
              {/* Drag Mode Toggle */}
              <button
                onClick={toggleDragMode}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border ${
                  state.drag_mode_enabled
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title={t('assemblyViewer.dragMode', 'Toggle Drag Mode')}
              >
                <CursorArrowRaysIcon className="h-4 w-4 mr-1" />
                {t('assemblyViewer.drag', 'Drag')}
              </button>

              {/* Auto Arrange */}
              <button
                onClick={autoArrangeComponents}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                title={t('assemblyViewer.autoArrange', 'Auto Arrange Components')}
              >
                <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
                {t('assemblyViewer.arrange', 'Arrange')}
              </button>

              {/* Reset View */}
              <button
                onClick={resetView}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                title={t('assemblyViewer.resetView', 'Reset View')}
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                {t('assemblyViewer.reset', 'Reset')}
              </button>

              {/* Zoom Level */}
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <ViewfinderCircleIcon className="h-4 w-4" />
                <span>{Math.round(state.zoom_level * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Assembly Canvas */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: print_mode ? 'auto' : '600px' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
          className="block"
          onWheel={handleWheel}
          style={{ cursor: state.drag_mode_enabled ? 'move' : 'default' }}
        >
          {/* Background */}
          <rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={config?.canvas?.background_color || '#F9FAFB'}
            stroke="#E5E7EB"
            strokeWidth="1"
          />

          {/* Grid (optional) */}
          {config?.layout?.snap_to_grid && (
            <defs>
              <pattern
                id="assembly-grid"
                width={config.layout.grid_size || 20}
                height={config.layout.grid_size || 20}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${config.layout.grid_size || 20} 0 L 0 0 0 ${config.layout.grid_size || 20}`}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="0.5"
                />
              </pattern>
              <rect x="0" y="0" width={canvasWidth} height={canvasHeight} fill="url(#assembly-grid)" />
            </defs>
          )}

          {/* Assembly Connections (FR4) */}
          {assemblyData.connections.map((connection) => (
            <AssemblyConnectionIndicator
              key={connection.connection_id}
              connection={connection}
              components={assemblyData.components}
              isHighlighted={state.highlighted_connection === connection.connection_id}
              onClick={(event) => handleConnectionClick(connection.connection_id, event)}
              config={config}
            />
          ))}

          {/* Component Pieces (FR3) */}
          {assemblyData.components.map((component) => (
            <AssemblyPieceDisplay
              key={component.component_key}
              component={component}
              isSelected={state.selected_component === component.component_key}
              isDragMode={state.drag_mode_enabled}
              onClick={() => handleComponentClick(component.component_key)}
              onDrag={(newPosition) => handleComponentDrag(component.component_key, newPosition)}
              config={config}
            />
          ))}
        </svg>

        {/* Tooltip (FR5) */}
        {tooltipData && (
          <AssemblyInfoTooltip
            connectionId={tooltipData.connectionId}
            connections={assemblyData.connections}
            position={tooltipData.position}
            onClose={handleCloseTooltip}
          />
        )}
      </div>

      {/* Legend/Info Panel - Hidden in print mode */}
      {!print_mode && assemblyData.connections.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {t('assemblyViewer.legend', 'Assembly Connections')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {assemblyData.connections.slice(0, 6).map((connection) => (
              <div key={connection.connection_id} className="flex items-center space-x-2">
                <div
                  className="w-3 h-0.5 flex-shrink-0"
                  style={{
                    backgroundColor: connection.visual_style?.color || '#6B7280',
                    borderStyle: connection.visual_style?.line_style || 'solid'
                  }}
                />
                <span className="text-gray-700 truncate">
                  {connection.instructions}
                </span>
              </div>
            ))}
          </div>
          {assemblyData.connections.length > 6 && (
            <p className="text-xs text-gray-500 mt-2">
              {t('assemblyViewer.moreConnections', '+ {{count}} more connections', { 
                count: assemblyData.connections.length - 6 
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 