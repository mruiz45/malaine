/**
 * Showcase Browser Component (US_10.3)
 * Main gallery component for browsing showcased patterns
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { showcaseService } from '@/services/showcaseService';
import { 
  ShowcaseState, 
  ShowcaseFilters, 
  ShowcasedPatternSummary,
  PatternCategory,
  DifficultyLevel
} from '@/types/showcase';
import ShowcasePatternCard from './ShowcasePatternCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ShowcaseBrowserProps {
  /** Initial filters to apply */
  initialFilters?: ShowcaseFilters;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main showcase browser component
 */
export default function ShowcaseBrowser({
  initialFilters = {},
  className = ''
}: ShowcaseBrowserProps) {
  const { t } = useTranslation();

  // Component state
  const [state, setState] = useState<ShowcaseState>({
    patterns: [],
    isLoading: true,
    error: null,
    filters: initialFilters,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    },
    hasMore: false
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);

  /**
   * Loads patterns from the API
   */
  const loadPatterns = useCallback(async (
    filters: ShowcaseFilters,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));

      const result = await showcaseService.getPatterns({
        filters,
        pagination: {
          page,
          limit: state.pagination.limit
        }
      });

      setState(prev => ({
        ...prev,
        patterns: append ? [...prev.patterns, ...result.patterns] : result.patterns,
        pagination: {
          ...result.pagination
        },
        hasMore: result.pagination.page < result.pagination.totalPages,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading patterns:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load patterns'
      }));
    }
  }, [state.pagination.limit]);

  /**
   * Loads available filter options
   */
  const loadFilterOptions = useCallback(async () => {
    try {
      const [categories, difficulties] = await Promise.all([
        showcaseService.getAvailableCategories(),
        showcaseService.getAvailableDifficultyLevels()
      ]);

      setAvailableCategories(categories);
      setAvailableDifficulties(difficulties);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, []);

  // Load patterns on mount and when filters change
  useEffect(() => {
    loadPatterns(state.filters, 1, false);
  }, [state.filters, loadPatterns]);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  /**
   * Handles filter changes
   */
  const handleFilterChange = (newFilters: Partial<ShowcaseFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 }
    }));
  };

  /**
   * Handles search input
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchTerm.trim() || undefined });
  };

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setState(prev => ({
      ...prev,
      filters: {},
      pagination: { ...prev.pagination, page: 1 }
    }));
  };

  /**
   * Loads next page
   */
  const loadNextPage = () => {
    if (state.hasMore && !state.isLoading) {
      loadPatterns(state.filters, state.pagination.page + 1, true);
    }
  };

  /**
   * Handles pagination
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= state.pagination.totalPages && !state.isLoading) {
      setState(prev => ({
        ...prev,
        pagination: { ...prev.pagination, page }
      }));
      loadPatterns(state.filters, page, false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Translates the difficulty level using the existing translations
   */
  const translateDifficultyLevel = (level: string) => {
    const levelKey = level.toLowerCase();
    return t(`stitchPattern.difficulty.${levelKey}`, level);
  };

  /**
   * Translates the category using the showcase translations
   */
  const translateCategory = (category: string) => {
    const categoryKey = category.toLowerCase();
    return t(`showcase.categories.${categoryKey}`, category);
  };

  const hasActiveFilters = state.filters.category || state.filters.difficulty_level || state.filters.search;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('showcase.title', 'Pattern Gallery')}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {t('showcase.subtitle', 'Discover inspiring knitting and crochet patterns')}
              </p>
            </div>

            {/* Search and Filter Toggle */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 sm:flex-none">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('showcase.search', 'Search patterns...')}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                  />
                </div>
              </form>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                {t('showcase.filters', 'Filters')}
                {hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('showcase.category', 'Category')}
                  </label>
                  <select
                    value={state.filters.category || ''}
                    onChange={(e) => handleFilterChange({ 
                      category: e.target.value as PatternCategory || undefined 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('showcase.allCategories', 'All Categories')}</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {translateCategory(category)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('showcase.difficulty', 'Difficulty')}
                  </label>
                  <select
                    value={state.filters.difficulty_level || ''}
                    onChange={(e) => handleFilterChange({ 
                      difficulty_level: e.target.value as DifficultyLevel || undefined 
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{t('showcase.allDifficulties', 'All Difficulties')}</option>
                    {availableDifficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {translateDifficultyLevel(difficulty)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      {t('showcase.clearFilters', 'Clear Filters')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        {!state.isLoading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {t('showcase.resultsCount', {
                defaultValue: 'Showing {{count}} of {{total}} patterns',
                count: state.patterns.length,
                total: state.pagination.total
              })}
            </p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                {t('showcase.error', 'Error Loading Patterns')}
              </h3>
              <p className="text-red-600 mb-4">{state.error}</p>
              <button
                onClick={() => loadPatterns(state.filters, state.pagination.page, false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                {t('showcase.retry', 'Try Again')}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.isLoading && state.patterns.length === 0 && (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">
              {t('showcase.loading', 'Loading patterns...')}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!state.isLoading && !state.error && state.patterns.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('showcase.noPatterns', 'No Patterns Found')}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? t('showcase.noResultsFiltered', 'Try adjusting your filters or search terms')
                  : t('showcase.noResultsEmpty', 'No patterns have been added to the showcase yet')
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t('showcase.clearFilters', 'Clear Filters')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Patterns Grid */}
        {!state.error && state.patterns.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {state.patterns.map((pattern) => (
                <ShowcasePatternCard
                  key={pattern.id}
                  pattern={pattern}
                />
              ))}
            </div>

            {/* Load More Button */}
            {state.hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadNextPage}
                  disabled={state.isLoading}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t('showcase.loading', 'Loading...')}
                    </>
                  ) : (
                    t('showcase.loadMore', 'Load More Patterns')
                  )}
                </button>
              </div>
            )}

            {/* Pagination */}
            {state.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => goToPage(state.pagination.page - 1)}
                    disabled={state.pagination.page <= 1 || state.isLoading}
                    className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, state.pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === state.pagination.page;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        disabled={state.isLoading}
                        className={`px-3 py-2 border rounded-md text-sm font-medium disabled:cursor-not-allowed ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => goToPage(state.pagination.page + 1)}
                    disabled={state.pagination.page >= state.pagination.totalPages || state.isLoading}
                    className="p-2 border border-gray-300 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 