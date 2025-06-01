/**
 * StitchFilterPanel Component
 * Filter panel for the stitch pattern library (US_8.1)
 * Provides filtering by craft type, category, difficulty, and other criteria
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { 
  StitchPatternFilters, 
  CraftType, 
  StitchPatternCategory, 
  DifficultyLevel 
} from '@/types/stitchPattern';
import { getDifficultyDisplayInfo } from '@/services/stitchPatternService';

interface StitchFilterPanelProps {
  /** Current filter values */
  filters: StitchPatternFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<StitchPatternFilters>) => void;
  /** Additional CSS classes */
  className?: string;
}

const CRAFT_TYPES: CraftType[] = ['knitting', 'crochet'];

const CATEGORIES: StitchPatternCategory[] = [
  'Basic',
  'Cables', 
  'Lace',
  'Textured',
  'Ribbing',
  'Colorwork',
  'Motifs'
];

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'beginner',
  'easy', 
  'intermediate',
  'advanced',
  'expert'
];

/**
 * Filter panel component for stitch pattern browsing
 */
export default function StitchFilterPanel({
  filters,
  onFiltersChange,
  className = ''
}: StitchFilterPanelProps) {
  const { t } = useTranslation();

  const handleCraftTypeChange = (craftType: CraftType | 'all') => {
    onFiltersChange({
      craftType: craftType === 'all' ? undefined : craftType
    });
  };

  const handleCategoryChange = (category: StitchPatternCategory | 'all') => {
    onFiltersChange({
      category: category === 'all' ? undefined : category
    });
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel | 'all') => {
    onFiltersChange({
      difficultyLevel: difficulty === 'all' ? undefined : difficulty
    });
  };

  const handleBasicOnlyChange = (basicOnly: boolean) => {
    onFiltersChange({ basicOnly });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {t('stitchLibrary.filters', 'Filters')}
        </h3>
        <button
          onClick={() => onFiltersChange({
            craftType: undefined,
            category: undefined,
            difficultyLevel: undefined,
            basicOnly: false
          })}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          {t('common.clearFilters', 'Clear Filters')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Craft Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchLibrary.craftType', 'Craft Type')}
          </label>
          <select
            value={filters.craftType || 'all'}
            onChange={(e) => handleCraftTypeChange(e.target.value as CraftType | 'all')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="all">{t('common.all', 'All')}</option>
            {CRAFT_TYPES.map(craftType => (
              <option key={craftType} value={craftType}>
                {t(`stitchPattern.craftType.${craftType}`, craftType.charAt(0).toUpperCase() + craftType.slice(1))}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchLibrary.category', 'Category')}
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value as StitchPatternCategory | 'all')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="all">{t('common.all', 'All')}</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {t(`stitchCategory.${category.toLowerCase()}`, category)}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchLibrary.difficulty', 'Difficulty')}
          </label>
          <select
            value={filters.difficultyLevel || 'all'}
            onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel | 'all')}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
          >
            <option value="all">{t('common.all', 'All')}</option>
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level} value={level}>
                {t(`stitchPattern.difficulty.${level}`, level)}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Only Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchLibrary.patternType', 'Pattern Type')}
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.basicOnly || false}
                onChange={(e) => handleBasicOnlyChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t('stitchLibrary.basicOnly', 'Basic patterns only')}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {(filters.craftType || filters.category || filters.difficultyLevel || filters.basicOnly) && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t('stitchLibrary.activeFilters', 'Active Filters')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.craftType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t(`stitchPattern.craftType.${filters.craftType}`, filters.craftType)}
                <button
                  onClick={() => handleCraftTypeChange('all')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t(`stitchCategory.${filters.category.toLowerCase()}`, filters.category)}
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:text-green-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
            {filters.difficultyLevel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {t(`stitchPattern.difficulty.${filters.difficultyLevel}`, filters.difficultyLevel)}
                <button
                  onClick={() => handleDifficultyChange('all')}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:text-yellow-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
            {filters.basicOnly && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {t('stitchLibrary.basicOnly', 'Basic Only')}
                <button
                  onClick={() => handleBasicOnlyChange(false)}
                  className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:text-purple-600 focus:outline-none"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 