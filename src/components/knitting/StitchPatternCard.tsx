/**
 * StitchPatternCard Component
 * Displays a single stitch pattern with its details
 * Part of US_1.5 implementation for stitch pattern selection
 * Enhanced with US_3.3 preview functionality
 * Extended with US_8.1 library features (category, difficulty, compact mode)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { StitchPattern } from '@/types/stitchPattern';
import { 
  getStitchPatternDisplayInfo, 
  getDifficultyDisplayInfo 
} from '@/services/stitchPatternService';
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
  /** Whether to show category information (US_8.1) */
  showCategory?: boolean;
  /** Whether to show difficulty level (US_8.1) */
  showDifficulty?: boolean;
  /** Whether to show craft type (US_8.1) */
  showCraftType?: boolean;
  /** Whether to use compact layout for list views (US_8.1) */
  compact?: boolean;
  /** Whether to navigate to detail page on click (US_8.1) */
  navigateOnClick?: boolean;
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
  showCategory = false,
  showDifficulty = false,
  showCraftType = false,
  compact = false,
  navigateOnClick = false,
  className = ''
}: StitchPatternCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const displayInfo = getStitchPatternDisplayInfo(pattern);
  const difficultyInfo = pattern.difficulty_level 
    ? getDifficultyDisplayInfo(pattern.difficulty_level) 
    : null;

  const handleClick = () => {
    if (!clickable) return;
    
    if (navigateOnClick) {
      router.push(`/stitch-patterns/${pattern.id}`);
    } else if (onSelect) {
      onSelect(pattern);
    }
  };

  const baseClasses = `
    border rounded-lg transition-all duration-200
    ${clickable ? 'cursor-pointer hover:shadow-md' : ''}
    ${isSelected 
      ? 'border-blue-500 bg-blue-50 shadow-md' 
      : 'border-gray-200 bg-white hover:border-gray-300'
    }
    ${compact ? 'p-3' : 'p-4'}
    ${className}
  `.trim();

  // Compact layout for list views
  if (compact) {
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
        <div className="flex items-center space-x-4">
          {/* Pattern Image */}
          {pattern.swatch_image_url && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={pattern.swatch_image_url} 
                alt={pattern.stitch_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Pattern Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'} truncate`}>
                  {displayInfo.name}
                </h3>
                
                {/* Metadata row */}
                <div className="flex items-center space-x-3 mt-1">
                  {showCraftType && (
                    <span className="text-xs text-gray-500 capitalize">
                      {t(`stitchPattern.craftType.${displayInfo.craftType}`, displayInfo.craftType)}
                    </span>
                  )}
                  {showCategory && pattern.category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {t(`stitchCategory.${pattern.category.toLowerCase()}`, pattern.category)}
                    </span>
                  )}
                  {showDifficulty && difficultyInfo && pattern.difficulty_level && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      difficultyInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                      difficultyInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      difficultyInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      difficultyInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                      difficultyInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {t(`stitchPattern.difficulty.${pattern.difficulty_level}`, pattern.difficulty_level)}
                    </span>
                  )}
                </div>

                {pattern.description && (
                  <p className={`text-sm mt-1 truncate ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {pattern.description}
                  </p>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className="flex-shrink-0 ml-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard card layout
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
      {/* Pattern Name and Badges */}
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-medium flex-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {displayInfo.name}
        </h3>
        <div className="flex flex-wrap gap-1 ml-2">
          {displayInfo.isBasic && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {t('stitchPattern.basic', 'Basic')}
            </span>
          )}
          {showCraftType && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
              {t(`stitchPattern.craftType.${displayInfo.craftType}`, displayInfo.craftType)}
            </span>
          )}
        </div>
      </div>

      {/* Category and Difficulty */}
      {(showCategory || showDifficulty) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {showCategory && pattern.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t(`stitchCategory.${pattern.category.toLowerCase()}`, pattern.category)}
            </span>
          )}
          {showDifficulty && difficultyInfo && pattern.difficulty_level && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              difficultyInfo.color === 'green' ? 'bg-green-100 text-green-800' :
              difficultyInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              difficultyInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              difficultyInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              difficultyInfo.color === 'red' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {t(`stitchPattern.difficulty.${pattern.difficulty_level}`, pattern.difficulty_level)}
            </span>
          )}
        </div>
      )}

      {/* Pattern Description */}
      {pattern.description && (
        <p className={`text-sm mb-3 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
          {pattern.description}
        </p>
      )}

      {/* Repeat Information */}
      {displayInfo.hasRepeatData && (
        <div className={`text-sm mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          <span className="font-medium">{t('stitchPattern.repeat', 'Repeat')}:</span> {displayInfo.repeatInfo}
        </div>
      )}

      {/* Common Uses (US_8.1) */}
      {pattern.common_uses && pattern.common_uses.length > 0 && (
        <div className={`text-sm mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
          <span className="font-medium">{t('stitchPattern.uses', 'Uses')}:</span> {pattern.common_uses.slice(0, 3).join(', ')}
          {pattern.common_uses.length > 3 && '...'}
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
          <span className="text-sm font-medium">{t('common.selected', 'Selected')}</span>
        </div>
      )}
    </div>
  );
} 