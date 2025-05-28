'use client';

import React from 'react';
import { ColorSource, ColorSchemeTemplate, TemplateSection } from '@/types/colorScheme';

/**
 * Props for template components
 */
interface TemplateProps {
  /** Colors assigned to sections */
  colorAssignments: Record<string, ColorSource>;
  /** Width of the SVG */
  width?: number;
  /** Height of the SVG */
  height?: number;
  /** Callback when a section is clicked */
  onSectionClick?: (sectionId: string) => void;
}

/**
 * Stripes Template Component
 * Renders alternating stripes pattern
 */
export function StripesTemplate({ 
  colorAssignments, 
  width = 300, 
  height = 200, 
  onSectionClick 
}: TemplateProps) {
  const stripeCount = 8;
  const stripeWidth = width / stripeCount;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="border border-gray-200 rounded">
      {Array.from({ length: stripeCount }, (_, index) => {
        const sectionId = `stripe_${index}`;
        const colorIndex = index % 2;
        const colorKey = `color_${colorIndex}`;
        const color = colorAssignments[colorKey]?.color_hex_code || '#E5E7EB';
        
        return (
          <rect
            key={sectionId}
            x={index * stripeWidth}
            y={0}
            width={stripeWidth}
            height={height}
            fill={color}
            stroke="#D1D5DB"
            strokeWidth="0.5"
            className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
            onClick={() => onSectionClick?.(colorKey)}
          />
        );
      })}
    </svg>
  );
}

/**
 * Color Blocks Template Component
 * Renders color blocks pattern
 */
export function ColorBlocksTemplate({ 
  colorAssignments, 
  width = 300, 
  height = 200, 
  onSectionClick 
}: TemplateProps) {
  const blockCount = 3;
  const blockWidth = width / blockCount;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="border border-gray-200 rounded">
      {Array.from({ length: blockCount }, (_, index) => {
        const sectionId = `block_${index}`;
        const color = colorAssignments[sectionId]?.color_hex_code || '#E5E7EB';
        
        return (
          <rect
            key={sectionId}
            x={index * blockWidth}
            y={0}
            width={blockWidth}
            height={height}
            fill={color}
            stroke="#D1D5DB"
            strokeWidth="1"
            className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
            onClick={() => onSectionClick?.(sectionId)}
          />
        );
      })}
    </svg>
  );
}

/**
 * Garment Outline Template Component
 * Renders a simple sweater outline
 */
export function GarmentOutlineTemplate({ 
  colorAssignments, 
  width = 300, 
  height = 350, 
  onSectionClick 
}: TemplateProps) {
  const bodyColor = colorAssignments['body']?.color_hex_code || '#E5E7EB';
  const sleevesColor = colorAssignments['sleeves']?.color_hex_code || '#D1D5DB';
  const necklineColor = colorAssignments['neckline']?.color_hex_code || '#9CA3AF';
  const hemColor = colorAssignments['hem']?.color_hex_code || '#6B7280';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="border border-gray-200 rounded">
      {/* Left Sleeve */}
      <path
        d="M 50 80 L 20 100 L 25 180 L 80 160 L 80 120 Z"
        fill={sleevesColor}
        stroke="#374151"
        strokeWidth="1"
        className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onSectionClick?.('sleeves')}
      />
      
      {/* Right Sleeve */}
      <path
        d="M 250 80 L 280 100 L 275 180 L 220 160 L 220 120 Z"
        fill={sleevesColor}
        stroke="#374151"
        strokeWidth="1"
        className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onSectionClick?.('sleeves')}
      />
      
      {/* Body */}
      <rect
        x="80"
        y="80"
        width="140"
        height="200"
        fill={bodyColor}
        stroke="#374151"
        strokeWidth="1"
        className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onSectionClick?.('body')}
      />
      
      {/* Neckline */}
      <path
        d="M 120 80 Q 150 60 180 80 L 180 100 L 120 100 Z"
        fill={necklineColor}
        stroke="#374151"
        strokeWidth="1"
        className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onSectionClick?.('neckline')}
      />
      
      {/* Hem */}
      <rect
        x="80"
        y="260"
        width="140"
        height="20"
        fill={hemColor}
        stroke="#374151"
        strokeWidth="1"
        className={onSectionClick ? 'cursor-pointer hover:opacity-80' : ''}
        onClick={() => onSectionClick?.('hem')}
      />
      
      {/* Labels for sections (optional, for development) */}
      {process.env.NODE_ENV === 'development' && (
        <>
          <text x="150" y="180" textAnchor="middle" fontSize="12" fill="#374151">Body</text>
          <text x="50" y="140" textAnchor="middle" fontSize="10" fill="#374151">Sleeve</text>
          <text x="250" y="140" textAnchor="middle" fontSize="10" fill="#374151">Sleeve</text>
          <text x="150" y="95" textAnchor="middle" fontSize="10" fill="#374151">Neckline</text>
          <text x="150" y="275" textAnchor="middle" fontSize="10" fill="#374151">Hem</text>
        </>
      )}
    </svg>
  );
}

/**
 * Template definitions with their sections
 */
export const COLOR_SCHEME_TEMPLATES: ColorSchemeTemplate[] = [
  {
    type: 'stripes',
    name: 'Simple Stripes',
    description: 'Alternating stripe pattern with 2 colors',
    sections: [
      {
        id: 'color_0',
        name: 'Color 1',
        svg_element: 'stripe_even',
        default_color: '#E5E7EB'
      },
      {
        id: 'color_1',
        name: 'Color 2',
        svg_element: 'stripe_odd',
        default_color: '#D1D5DB'
      }
    ],
    viewBox: { width: 300, height: 200 }
  },
  {
    type: 'blocks',
    name: 'Color Blocks',
    description: 'Three color blocks side by side',
    sections: [
      {
        id: 'block_0',
        name: 'Block 1',
        svg_element: 'block_0',
        default_color: '#E5E7EB'
      },
      {
        id: 'block_1',
        name: 'Block 2',
        svg_element: 'block_1',
        default_color: '#D1D5DB'
      },
      {
        id: 'block_2',
        name: 'Block 3',
        svg_element: 'block_2',
        default_color: '#9CA3AF'
      }
    ],
    viewBox: { width: 300, height: 200 }
  },
  {
    type: 'garment_outline',
    name: 'Sweater Outline',
    description: 'Simple sweater shape with different areas',
    sections: [
      {
        id: 'body',
        name: 'Body',
        svg_element: 'garment_body',
        default_color: '#E5E7EB'
      },
      {
        id: 'sleeves',
        name: 'Sleeves',
        svg_element: 'garment_sleeves',
        default_color: '#D1D5DB'
      },
      {
        id: 'neckline',
        name: 'Neckline',
        svg_element: 'garment_neckline',
        default_color: '#9CA3AF'
      },
      {
        id: 'hem',
        name: 'Hem',
        svg_element: 'garment_hem',
        default_color: '#6B7280'
      }
    ],
    viewBox: { width: 300, height: 350 }
  }
];

/**
 * Template Renderer Component
 * Renders the appropriate template based on type
 */
interface TemplateRendererProps extends TemplateProps {
  templateType: 'stripes' | 'blocks' | 'garment_outline';
}

export function TemplateRenderer({ 
  templateType, 
  colorAssignments, 
  width, 
  height, 
  onSectionClick 
}: TemplateRendererProps) {
  switch (templateType) {
    case 'stripes':
      return (
        <StripesTemplate
          colorAssignments={colorAssignments}
          width={width}
          height={height}
          onSectionClick={onSectionClick}
        />
      );
    case 'blocks':
      return (
        <ColorBlocksTemplate
          colorAssignments={colorAssignments}
          width={width}
          height={height}
          onSectionClick={onSectionClick}
        />
      );
    case 'garment_outline':
      return (
        <GarmentOutlineTemplate
          colorAssignments={colorAssignments}
          width={width}
          height={height}
          onSectionClick={onSectionClick}
        />
      );
    default:
      return (
        <div className="w-full h-48 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <span className="text-gray-500">Template not found</span>
        </div>
      );
  }
} 