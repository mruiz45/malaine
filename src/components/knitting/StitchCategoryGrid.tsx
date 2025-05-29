/**
 * StitchCategoryGrid Component
 * Displays stitch pattern categories in a grid for library browsing (US_8.1)
 * Shows category counts, difficulty levels, and sample patterns
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { 
  StitchPatternCategorySummary, 
  StitchPatternCategory,
  CraftType 
} from '@/types/stitchPattern';
import { getDifficultyDisplayInfo } from '@/services/stitchPatternService';

interface StitchCategoryGridProps {
  /** Categories to display */
  categories: StitchPatternCategorySummary[];
  /** Callback when a category is selected */
  onCategorySelect: (category: StitchPatternCategory) => void;
  /** Currently selected craft type filter */
  selectedCraftType?: CraftType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Category card component
 */
interface CategoryCardProps {
  category: StitchPatternCategorySummary;
  onSelect: (category: StitchPatternCategory) => void;
}

function CategoryCard({ category, onSelect }: CategoryCardProps) {
  const { t } = useTranslation();

  const getCategoryIcon = (categoryName: StitchPatternCategory): string => {
    switch (categoryName) {
      case 'Basic':
        return '🧶';
      case 'Cables':
        return '🔗';
      case 'Lace':
        return '🕸️';
      case 'Textured':
        return '🏔️';
      case 'Ribbing':
        return '〰️';
      case 'Colorwork':
        return '🌈';
      case 'Motifs':
        return '❄️';
      default:
        return '🧶';
    }
  };

  const getCategoryColor = (categoryName: StitchPatternCategory): string => {
    switch (categoryName) {
      case 'Basic':
        return 'from-green-400 to-green-600';
      case 'Cables':
        return 'from-blue-400 to-blue-600';
      case 'Lace':
        return 'from-purple-400 to-purple-600';
      case 'Textured':
        return 'from-orange-400 to-orange-600';
      case 'Ribbing':
        return 'from-indigo-400 to-indigo-600';
      case 'Colorwork':
        return 'from-pink-400 to-pink-600';
      case 'Motifs':
        return 'from-teal-400 to-teal-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div
      onClick={() => onSelect(category.category)}
      className="group cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 hover:border-gray-300"
    >
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${getCategoryColor(category.category)} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-hidden="true">
              {getCategoryIcon(category.category)}
            </span>
            <div>
              <h3 className="text-lg font-semibold">
                {t(`stitchCategory.${category.category.toLowerCase()}`, category.category)}
              </h3>
              <p className="text-sm opacity-90">
                {category.count} {category.count === 1 ? 'pattern' : 'patterns'}
              </p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Difficulty levels */}
        {category.difficulty_levels.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('stitchLibrary.difficultyLevels', 'Difficulty Levels')}
            </h4>
            <div className="flex flex-wrap gap-1">
              {category.difficulty_levels.map(level => {
                const difficultyInfo = getDifficultyDisplayInfo(level);
                return (
                  <span
                    key={level}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      difficultyInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                      difficultyInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      difficultyInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      difficultyInfo.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                      difficultyInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {difficultyInfo.level}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Sample patterns */}
        {category.sample_patterns && category.sample_patterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('stitchLibrary.samplePatterns', 'Sample Patterns')}
            </h4>
            <div className="space-y-2">
              {category.sample_patterns.slice(0, 3).map(pattern => (
                <div key={pattern.id} className="flex items-center space-x-3">
                  {pattern.swatch_image_url && (
                    <div className="flex-shrink-0 w-8 h-8 rounded overflow-hidden bg-gray-100">
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pattern.stitch_name}
                    </p>
                    {pattern.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {pattern.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {category.count > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                {t('stitchLibrary.andMore', '+ {{count}} more patterns', { count: category.count - 3 })}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Grid component for displaying stitch pattern categories
 */
export default function StitchCategoryGrid({
  categories,
  onCategorySelect,
  selectedCraftType,
  className = ''
}: StitchCategoryGridProps) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('stitchLibrary.noCategories', 'No categories found')}
        </h3>
        <p className="text-gray-600">
          {selectedCraftType 
            ? t('stitchLibrary.noCategoriesForCraft', 'No categories found for {{craftType}}', { craftType: selectedCraftType })
            : t('stitchLibrary.noCategoriesGeneral', 'No stitch pattern categories available')
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {selectedCraftType 
            ? t('stitchLibrary.categoriesForCraft', '{{craftType}} Categories', { 
                craftType: selectedCraftType.charAt(0).toUpperCase() + selectedCraftType.slice(1)
              })
            : t('stitchLibrary.allCategories', 'All Categories')
          }
        </h2>
        <p className="text-gray-600">
          {t('stitchLibrary.selectCategory', 'Select a category to explore patterns')}
        </p>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <CategoryCard
            key={category.category}
            category={category}
            onSelect={onCategorySelect}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-gray-500">
        {t('stitchLibrary.categoriesSummary', 'Showing {{count}} categories with patterns', { 
          count: categories.length 
        })}
      </div>
    </div>
  );
} 