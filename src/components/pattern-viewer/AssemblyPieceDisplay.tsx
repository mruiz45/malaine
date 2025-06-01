/**
 * Assembly Piece Display Component (US_12.9)
 * Displays an individual garment component in the assembly view
 */

'use client';

import React, { useState, useCallback } from 'react';
import { AssemblyComponent, AssemblyVisualizationConfig } from '@/types/assembly-visualization';

interface AssemblyPieceDisplayProps {
  /** Component to display */
  component: AssemblyComponent;
  /** Whether this component is selected */
  isSelected: boolean;
  /** Whether drag mode is enabled */
  isDragMode: boolean;
  /** Click handler */
  onClick: () => void;
  /** Drag handler */
  onDrag: (newPosition: { x: number; y: number }) => void;
  /** Visualization configuration */
  config?: Partial<AssemblyVisualizationConfig>;
}

/**
 * Component for displaying an assembly piece with SVG schematic
 */
export default function AssemblyPieceDisplay({
  component,
  isSelected,
  isDragMode,
  onClick,
  onDrag,
  config
}: AssemblyPieceDisplayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (isDragMode) {
      event.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: event.clientX - component.layout.position.x,
        y: event.clientY - component.layout.position.y
      });
    }
  }, [isDragMode, component.layout.position]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging && dragStart && isDragMode) {
      const newPosition = {
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      };
      onDrag(newPosition);
    }
  }, [isDragging, dragStart, isDragMode, onDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!isDragging) {
      event.stopPropagation();
      onClick();
    }
  }, [isDragging, onClick]);

  // Style based on state and configuration
  const strokeColor = isSelected 
    ? config?.component_style?.selected_stroke_color || '#3B82F6'
    : config?.component_style?.default_stroke_color || '#374151';
  
  const strokeWidth = config?.component_style?.stroke_width || 2;

  return (
    <g
      transform={`translate(${component.layout.position.x}, ${component.layout.position.y})`}
      style={{ 
        cursor: isDragMode ? 'move' : 'pointer',
        filter: isSelected ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' : undefined
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Component Schematic SVG */}
      <g
        dangerouslySetInnerHTML={{ __html: component.schematic.svgContent }}
      />
      
      {/* Selection highlight */}
      {isSelected && (
        <rect
          x={-5}
          y={-5}
          width={component.dimensions.width + 10}
          height={component.dimensions.height + 10}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray="5,5"
          rx="4"
        />
      )}
      
      {/* Component label */}
      <text
        x={component.dimensions.width / 2}
        y={component.dimensions.height + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#374151"
        fontWeight={isSelected ? 'bold' : 'normal'}
      >
        {component.component_name}
      </text>
      
      {/* Edge indicators (when selected) */}
      {isSelected && component.edges.map((edge) => (
        <g key={edge.edge_id}>
          {edge.connection_points.map((point, index) => (
            <circle
              key={`${edge.edge_id}-${index}`}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="1"
              opacity="0.8"
            />
          ))}
        </g>
      ))}
    </g>
  );
} 