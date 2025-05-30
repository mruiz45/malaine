/**
 * Individual Stitch Pattern Detail Page
 * Displays detailed view of a specific stitch pattern with instructions (US_8.1)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import StitchInstructionsView from '@/components/knitting/StitchInstructionsView';
import StitchPreviewDisplay from '@/components/knitting/StitchPreviewDisplay';
import { getStitchPattern, formatDifficultyLevel } from '@/services/stitchPatternService';
import type { StitchPattern } from '@/types/stitchPattern';

export default function StitchPatternDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [pattern, setPattern] = useState<StitchPattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  const patternId = params?.id as string;

  useEffect(() => {
    const loadPattern = async () => {
      if (!patternId) {
        setError(t('stitchLibrary.detail.noPatternId', 'No pattern ID provided'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const patternData = await getStitchPattern(patternId);
        if (patternData) {
          setPattern(patternData);
          // TODO: Check if pattern is favorited by user
          // setIsFavorited(await checkIfFavorited(patternId));
        } else {
          setError(t('stitchLibrary.detail.patternNotFound', 'Pattern not found'));
        }
      } catch (err) {
        console.error(t('stitchLibrary.detail.errorLoading', 'Error loading pattern:'), err);
        setError(t('stitchLibrary.detail.failedToLoad', 'Failed to load pattern'));
      } finally {
        setLoading(false);
      }
    };

    loadPattern();
  }, [patternId, t]);

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = async () => {
    // TODO: Implement favorite functionality
    setIsFavorited(!isFavorited);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !pattern) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('stitchPattern.notFound', 'Pattern Not Found')}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || t('stitchPattern.notFoundDescription', 'The requested stitch pattern could not be found.')}
            </p>
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              {t('common.backToLibrary', 'Back to Library')}
            </button>

            <button
              onClick={handleToggleFavorite}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isFavorited ? (
                <HeartSolidIcon className="h-4 w-4 mr-2 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 mr-2" />
              )}
              {isFavorited ? t('common.favorited', 'Favorited') : t('common.addToFavorites', 'Add to Favorites')}
            </button>
          </div>

          {/* Pattern Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pattern Info */}
              <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {pattern.stitch_name}
                </h1>
                
                {pattern.description && (
                  <p className="text-lg text-gray-600 mb-6">
                    {pattern.description}
                  </p>
                )}

                {/* Pattern Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {t('stitchPattern.craftType', 'Craft Type')}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 capitalize">
                      {pattern.craft_type}
                    </div>
                  </div>

                  {pattern.category && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {t('stitchPattern.category', 'Category')}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 capitalize">
                        {pattern.category}
                      </div>
                    </div>
                  )}

                  {pattern.difficulty_level && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {t('stitchPattern.difficulty', 'Difficulty')}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatDifficultyLevel(pattern.difficulty_level)}
                      </div>
                    </div>
                  )}

                  {pattern.stitch_repeat_width && pattern.stitch_repeat_height && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {t('stitchPattern.repeat', 'Repeat')}
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {pattern.stitch_repeat_width} × {pattern.stitch_repeat_height}
                      </div>
                    </div>
                  )}
                </div>

                {/* Common Uses */}
                {pattern.common_uses && pattern.common_uses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('stitchPattern.commonUses', 'Common Uses')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pattern.common_uses.map((use, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {pattern.search_keywords && pattern.search_keywords.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {t('stitchPattern.keywords', 'Keywords')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pattern.search_keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pattern Preview */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <StitchPreviewDisplay 
                    pattern={pattern}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <StitchInstructionsView 
            pattern={pattern}
            expanded={true}
            className="mb-6"
          />

          {/* Additional Information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-amber-900 mb-3">
              {t('stitchPattern.importantNotes', 'Important Notes')}
            </h3>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• {t('stitchPattern.gaugeNote', 'Always create a gauge swatch before starting your project')}</li>
              <li>• {t('stitchPattern.tensionNote', 'Your tension may affect the appearance of the pattern')}</li>
              <li>• {t('stitchPattern.yarnNote', 'Different yarn weights will produce different results')}</li>
              <li>• {t('stitchPattern.practiceNote', 'Practice the pattern on a small swatch first if you\'re unfamiliar with it')}</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 