/**
 * Assembly Info Tooltip Component (US_12.9)
 * Displays detailed information about assembly connections in a tooltip
 */

'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AssemblyConnection } from '@/types/assembly-visualization';

interface AssemblyInfoTooltipProps {
  /** Connection ID to display info for */
  connectionId: string;
  /** All connections to find the specific one */
  connections: AssemblyConnection[];
  /** Position to display tooltip */
  position: { x: number; y: number };
  /** Close handler */
  onClose: () => void;
}

/**
 * Tooltip component for displaying assembly connection details
 */
export default function AssemblyInfoTooltip({
  connectionId,
  connections,
  position,
  onClose
}: AssemblyInfoTooltipProps) {
  const { t } = useTranslation();

  // Find the connection
  const connection = useMemo(() => 
    connections.find(c => c.connection_id === connectionId),
    [connections, connectionId]
  );

  if (!connection) {
    return null;
  }

  // Format connection type for display
  const formattedConnectionType = connection.connection_type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Calculate tooltip position (avoid going off screen)
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: Math.min(position.x + 10, window.innerWidth - 300),
    top: Math.max(position.y - 10, 10),
    zIndex: 1000
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs"
      style={tooltipStyle}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">
          {t('assemblyTooltip.title', 'Assembly Connection')}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 ml-2"
          title={t('assemblyTooltip.close', 'Close')}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Connection Type */}
      <div className="mb-3">
        <div className="flex items-center space-x-2 mb-1">
          <div
            className="w-4 h-1 flex-shrink-0"
            style={{
              backgroundColor: connection.visual_style?.color || '#6B7280',
              borderStyle: connection.visual_style?.line_style || 'solid'
            }}
          />
          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">
            {formattedConnectionType}
          </span>
        </div>
      </div>

      {/* Connection Details */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium text-gray-700">
            {t('assemblyTooltip.from', 'From:')}
          </span>
          <span className="ml-1 text-gray-600">
            {connection.from_component}
          </span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">
            {t('assemblyTooltip.to', 'To:')}
          </span>
          <span className="ml-1 text-gray-600">
            {connection.to_component}
          </span>
        </div>
        
        <div>
          <span className="font-medium text-gray-700">
            {t('assemblyTooltip.edges', 'Edges:')}
          </span>
          <span className="ml-1 text-gray-600">
            {connection.from_edge} → {connection.to_edge}
          </span>
        </div>
      </div>

      {/* Instructions */}
      {connection.instructions && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs font-medium text-gray-700 block mb-1">
            {t('assemblyTooltip.instructions', 'Instructions:')}
          </span>
          <p className="text-xs text-gray-600 leading-relaxed">
            {connection.instructions}
          </p>
        </div>
      )}

      {/* Connection Type Specific Information */}
      {connection.connection_type === 'seam' && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
          <span className="text-blue-700">
            {t('assemblyTooltip.seamInfo', 'Sew pieces together with a seam')}
          </span>
        </div>
      )}

      {connection.connection_type === 'pickup' && (
        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
          <span className="text-green-700">
            {t('assemblyTooltip.pickupInfo', 'Pick up stitches from one piece to the other')}
          </span>
        </div>
      )}

      {connection.connection_type === 'graft' && (
        <div className="mt-2 p-2 bg-purple-50 rounded text-xs">
          <span className="text-purple-700">
            {t('assemblyTooltip.graftInfo', 'Graft pieces together for seamless join')}
          </span>
        </div>
      )}

      {connection.connection_type === 'join' && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
          <span className="text-yellow-700">
            {t('assemblyTooltip.joinInfo', 'Join pieces with slip stitch or similar technique')}
          </span>
        </div>
      )}
    </div>
  );
} 