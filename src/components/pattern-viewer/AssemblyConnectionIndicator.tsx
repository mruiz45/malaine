/**
 * Assembly Connection Indicator Component (US_12.9)
 * Displays connection lines and indicators between garment components
 */

'use client';

import React, { useMemo } from 'react';
import { 
  AssemblyConnection, 
  AssemblyComponent, 
  AssemblyVisualizationConfig 
} from '@/types/assembly-visualization';
import { assemblyVisualizationService } from '@/services/assemblyVisualizationService';

interface AssemblyConnectionIndicatorProps {
  /** Connection to display */
  connection: AssemblyConnection;
  /** All components for position calculation */
  components: AssemblyComponent[];
  /** Whether this connection is highlighted */
  isHighlighted: boolean;
  /** Click handler */
  onClick: (event: React.MouseEvent) => void;
  /** Visualization configuration */
  config?: Partial<AssemblyVisualizationConfig>;
}

/**
 * Component for displaying assembly connections between pieces
 */
export default function AssemblyConnectionIndicator({
  connection,
  components,
  isHighlighted,
  onClick,
  config
}: AssemblyConnectionIndicatorProps) {
  
  // Find source and target components
  const fromComponent = useMemo(() => 
    components.find(c => c.component_key === connection.from_component),
    [components, connection.from_component]
  );
  
  const toComponent = useMemo(() => 
    components.find(c => c.component_key === connection.to_component),
    [components, connection.to_component]
  );

  // Calculate connection path
  const pathData = useMemo(() => {
    if (!fromComponent || !toComponent) return '';
    return assemblyVisualizationService.calculateConnectionPath(
      connection,
      fromComponent,
      toComponent
    );
  }, [connection, fromComponent, toComponent]);

  // Get visual styling
  const style = useMemo(() => 
    assemblyVisualizationService.getConnectionStyle(connection),
    [connection]
  );

  // Enhanced styling for highlighting
  const finalStyle = useMemo(() => ({
    ...style,
    stroke: isHighlighted 
      ? config?.connection_style?.highlight_color || '#F59E0B'
      : style.stroke,
    strokeWidth: isHighlighted 
      ? (config?.connection_style?.line_width || 2) + 1
      : style.strokeWidth,
    opacity: isHighlighted ? 1 : 0.8,
    filter: isHighlighted ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' : undefined
  }), [style, isHighlighted, config]);

  // Calculate midpoint for connection label/arrow
  const midpoint = useMemo(() => {
    if (!fromComponent || !toComponent) return null;
    
    const fromPos = fromComponent.layout.position;
    const toPos = toComponent.layout.position;
    
    return {
      x: (fromPos.x + toPos.x) / 2,
      y: (fromPos.y + toPos.y) / 2
    };
  }, [fromComponent, toComponent]);

  // Don't render if components not found or no path
  if (!fromComponent || !toComponent || !pathData) {
    return null;
  }

  const arrowSize = config?.connection_style?.arrow_size || 8;

  return (
    <g className="assembly-connection">
      {/* Connection path */}
      <path
        d={pathData}
        className="connection-line"
        onClick={onClick}
        style={{
          ...finalStyle,
          cursor: 'pointer'
        }}
      />
      
      {/* Connection arrow (at midpoint) */}
      {midpoint && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
          <polygon
            points={`0,0 ${arrowSize},${arrowSize/2} ${arrowSize},-${arrowSize/2}`}
            fill={finalStyle.stroke}
            opacity={finalStyle.opacity}
            className="connection-arrow"
          />
        </g>
      )}
      
      {/* Connection type indicator (small circle at midpoint) */}
      {midpoint && (
        <circle
          cx={midpoint.x}
          cy={midpoint.y}
          r={isHighlighted ? 6 : 4}
          fill={finalStyle.stroke}
          opacity={0.9}
          className="connection-indicator"
          onClick={onClick}
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {/* Connection label (visible when highlighted) */}
      {isHighlighted && midpoint && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y - 15})`}>
          <rect
            x={-50}
            y={-10}
            width={100}
            height={20}
            fill="rgba(0, 0, 0, 0.8)"
            rx="4"
            opacity={0.9}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            fontWeight="500"
          >
            {connection.connection_type.replace('_', ' ')}
          </text>
        </g>
      )}
      
      {/* Visual connection type indicators */}
      {connection.connection_type === 'seam' && midpoint && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
          {/* Zigzag pattern for seams */}
          <path
            d="M-8,-2 L-4,2 L0,-2 L4,2 L8,-2"
            stroke={finalStyle.stroke}
            strokeWidth="1"
            fill="none"
            opacity={0.6}
          />
        </g>
      )}
      
      {connection.connection_type === 'pickup' && midpoint && (
        <g transform={`translate(${midpoint.x}, ${midpoint.y})`}>
          {/* Curved arrows for pickup */}
          <path
            d="M-6,0 Q0,-6 6,0 Q0,6 -6,0"
            stroke={finalStyle.stroke}
            strokeWidth="1"
            fill="none"
            opacity={0.6}
          />
        </g>
      )}
    </g>
  );
} 