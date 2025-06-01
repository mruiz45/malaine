/**
 * Showcase Pattern Card Component (US_10.3)
 * Individual pattern card for the showcase gallery
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { 
  ClockIcon, 
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { ShowcasedPatternSummary } from '@/types/showcase';

interface ShowcasePatternCardProps {
  /** Pattern summary data */
  pattern: ShowcasedPatternSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Individual pattern card component for showcase gallery
 */
export default function ShowcasePatternCard({
  pattern,
  className = ''
}: ShowcasePatternCardProps) {
  const { t } = useTranslation();

  /**
   * Gets the difficulty level display color
   */
  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Translates the difficulty level using the existing translations
   */
  const translateDifficultyLevel = (level?: string) => {
    if (!level) return '';
    
    const levelKey = level.toLowerCase();
    return t(`stitchPattern.difficulty.${levelKey}`, level);
  };

  /**
   * Translates the category using the showcase translations
   */
  const translateCategory = (category?: string) => {
    if (!category) return '';
    
    const categoryKey = category.toLowerCase();
    return t(`showcase.categories.${categoryKey}`, category);
  };

  /**
   * Formats the creation date
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  const cardClasses = `group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`;

  return (
    <Link href={`/showcase/${pattern.id}`} className={cardClasses}>
      {/* Pattern Image */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 overflow-hidden">
        {pattern.thumbnail_image_url ? (
          <img
            src={pattern.thumbnail_image_url}
            alt={pattern.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          // Placeholder when no image is available
          <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <EyeIcon className="h-12 w-12 text-blue-300 mx-auto mb-2" />
              <p className="text-sm text-blue-400 font-medium">
                {t('showcase.noImage', 'Preview Available')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pattern Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {pattern.title}
        </h3>

        {/* Description */}
        {pattern.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {pattern.description}
          </p>
        )}

        {/* Tags and Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Category */}
          {pattern.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {translateCategory(pattern.category)}
            </span>
          )}

          {/* Difficulty */}
          {pattern.difficulty_level && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(pattern.difficulty_level)}`}>
              <StarIcon className="h-3 w-3 mr-1" />
              {translateDifficultyLevel(pattern.difficulty_level)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>
              {t('showcase.addedOn', 'Added')} {formatDate(pattern.created_at)}
            </span>
          </div>

          <div className="group-hover:text-blue-600 transition-colors font-medium">
            {t('showcase.viewPattern', 'View Pattern')} →
          </div>
        </div>
      </div>
    </Link>
  );
} 