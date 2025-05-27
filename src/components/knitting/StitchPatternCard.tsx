/**
 * StitchPatternCard Component
 * Displays a single stitch pattern with its details
 * Part of US_1.5 implementation for stitch pattern selection
 * Enhanced with US_3.3 preview functionality
 */

'use client';

import React from 'react';
import type { StitchPattern } from '@/types/stitchPattern';
import { getStitchPatternDisplayInfo } from '@/services/stitchPatternService';
import StitchPreviewDisplay from './StitchPreviewDisplay';

interface StitchPatternCardProps {
  /** The stitch pattern to display */
  pattern: StitchPattern;
  /** Whether this pattern is currently selected */
  isSelected?: boolean;
  /** Callback when the pattern is clicked/selected */
  onSelect?: (pattern: StitchPattern) => void;
  /** Whether the card should be clickable */
  clickable?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component for displaying stitch pattern information
 */
export default function StitchPatternCard({
  pattern,
  isSelected = false,
  onSelect,
  clickable = true,
  className = ''
}: StitchPatternCardProps) {
  const displayInfo = getStitchPatternDisplayInfo(pattern);

  const handleClick = () => {
    if (clickable && onSelect) {
      onSelect(pattern);
    }
  };

  const baseClasses = `
    border rounded-lg p-4 transition-all duration-200
    ${clickable ? 'cursor-pointer hover:shadow-md' : ''}
    ${isSelected 
      ? 'border-blue-500 bg-blue-50 shadow-md' 
      : 'border-gray-200 bg-white hover:border-gray-300'
    }
    ${className}
  `.trim();

  return (
    <div 
      className={baseClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Pattern Name */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {displayInfo.name}
        </h3>
        {displayInfo.isBasic && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Basic
          </span>
        )}
      </div>

      {/* Pattern Description */}
      {pattern.description && (
        <p className={`text-sm mb-3 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
          {pattern.description}
        </p>
      )}

      {/* Repeat Information */}
      {displayInfo.hasRepeatData && (
        <div className={`text-sm mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          <span className="font-medium">Repeat:</span> {displayInfo.repeatInfo}
        </div>
      )}

      {/* Stitch Preview (US_3.3) */}
      <StitchPreviewDisplay 
        pattern={pattern} 
        compact={true}
        className="mb-3"
      />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center text-blue-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Selected</span>
        </div>
      )}
    </div>
  );
} 