/**
 * StitchPatternSelector Component
 * Main component for selecting stitch patterns
 * Implements US_1.5 requirements for stitch pattern selection and definition
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type { StitchPattern } from '@/types/stitchPattern';
import { useBasicStitchPatterns, useStitchPatternSelection, useStitchPatternSearch } from '@/hooks/useStitchPatterns';
import StitchPatternCard from './StitchPatternCard';

interface StitchPatternSelectorProps {
  /** Currently selected pattern */
  selectedPattern?: StitchPattern | null;
  /** Callback when a pattern is selected */
  onPatternSelect: (pattern: StitchPattern | null) => void;
  /** Whether to show only basic patterns */
  basicOnly?: boolean;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for selecting stitch patterns with search and filtering
 */
export default function StitchPatternSelector({
  selectedPattern = null,
  onPatternSelect,
  basicOnly = true,
  disabled = false,
  className = ''
}: StitchPatternSelectorProps) {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);

  // Fetch basic stitch patterns
  const { patterns: basicPatterns, isLoading, error } = useBasicStitchPatterns();

  // Search functionality
  const {
    searchTerm,
    results: searchResults,
    isSearching,
    searchError,
    updateSearchTerm,
    clearSearch
  } = useStitchPatternSearch('', basicOnly);

  // Selection state management
  const { selection, selectPattern } = useStitchPatternSelection(selectedPattern);

  // Determine which patterns to display
  const displayPatterns = showSearch && searchTerm.trim() 
    ? searchResults 
    : basicPatterns;

  const handlePatternSelect = useCallback((pattern: StitchPattern) => {
    selectPattern(pattern);
    onPatternSelect(pattern);
  }, [selectPattern, onPatternSelect]);

  const handleClearSelection = useCallback(() => {
    selectPattern(null);
    onPatternSelect(null);
  }, [selectPattern, onPatternSelect]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      clearSearch();
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading stitch patterns</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {t('stitchPattern.selectPattern', 'Select Stitch Pattern')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('stitchPattern.gaugeReminder', 'Remember to measure your gauge in the selected stitch pattern')}
          </p>
        </div>
        
        {/* Search Toggle */}
        <button
          type="button"
          onClick={toggleSearch}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={disabled}
        >
          <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
          {showSearch ? t('common.hideSearch', 'Hide Search') : t('common.search', 'Search')}
        </button>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => updateSearchTerm(e.target.value)}
              placeholder={t('stitchPattern.searchPlaceholder', 'Search stitch patterns...')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={disabled}
            />
          </div>
          
          {isSearching && (
            <p className="text-sm text-gray-500">
              {t('common.searching', 'Searching...')}
            </p>
          )}
          
          {searchError && (
            <p className="text-sm text-red-600">
              {searchError}
            </p>
          )}
        </div>
      )}

      {/* Current Selection */}
      {selectedPattern && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                {t('stitchPattern.currentSelection', 'Current Selection')}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {selectedPattern.stitch_name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled={disabled}
            >
              {t('common.clear', 'Clear')}
            </button>
          </div>
        </div>
      )}

      {/* Pattern Grid */}
      {displayPatterns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPatterns.map((pattern) => (
            <StitchPatternCard
              key={pattern.id}
              pattern={pattern}
              isSelected={selectedPattern?.id === pattern.id}
              onSelect={handlePatternSelect}
              clickable={!disabled}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {showSearch && searchTerm.trim()
              ? t('stitchPattern.noSearchResults', 'No stitch patterns found matching your search')
              : t('stitchPattern.noPatterns', 'No stitch patterns available')
            }
          </p>
        </div>
      )}

      {/* Pattern Count */}
      {displayPatterns.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {t('stitchPattern.patternCount', {
            count: displayPatterns.length,
            defaultValue: `${displayPatterns.length} pattern${displayPatterns.length !== 1 ? 's' : ''} available`
          })}
        </div>
      )}
    </div>
  );
} 