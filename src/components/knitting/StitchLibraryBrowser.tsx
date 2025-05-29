/**
 * StitchLibraryBrowser Component
 * Main interface for browsing the stitch pattern library (US_8.1)
 * Provides category browsing, search, and filtering capabilities
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import type { 
  StitchPattern, 
  StitchPatternFilters, 
  StitchPatternCategorySummary,
  CraftType,
  StitchPatternCategory,
  DifficultyLevel,
  StitchLibraryBrowseOptions
} from '@/types/stitchPattern';
import { 
  getStitchPatterns,
  getStitchPatternCategories,
  searchStitchPatterns 
} from '@/services/stitchPatternService';
import StitchPatternCard from './StitchPatternCard';
import StitchFilterPanel from './StitchFilterPanel';
import StitchCategoryGrid from './StitchCategoryGrid';

interface StitchLibraryBrowserProps {
  /** Currently selected pattern */
  selectedPattern?: StitchPattern | null;
  /** Callback when a pattern is selected */
  onPatternSelect?: (pattern: StitchPattern) => void;
  /** Initial craft type filter */
  initialCraftType?: CraftType;
  /** Whether to show basic patterns only */
  basicOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type ViewMode = 'categories' | 'patterns';
type DisplayMode = 'grid' | 'list';

/**
 * Main component for browsing the stitch pattern library
 */
export default function StitchLibraryBrowser({
  selectedPattern = null,
  onPatternSelect,
  initialCraftType,
  basicOnly = false,
  className = ''
}: StitchLibraryBrowserProps) {
  const { t } = useTranslation();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Data state
  const [patterns, setPatterns] = useState<StitchPattern[]>([]);
  const [categories, setCategories] = useState<StitchPatternCategorySummary[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<StitchPattern[]>([]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StitchPatternFilters>({
    basicOnly,
    craftType: initialCraftType,
    limit: 50
  });

  // Browse options
  const [browseOptions, setBrowseOptions] = useState<StitchLibraryBrowseOptions>({
    viewMode: displayMode,
    sortBy: 'category',
    sortDirection: 'asc',
    itemsPerPage: 20,
    page: 1
  });

  /**
   * Load categories with counts
   */
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);

    try {
      const categoriesData = await getStitchPatternCategories(filters.craftType);
      setCategories(categoriesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setCategoriesError(errorMessage);
      console.error('Error loading categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [filters.craftType]);

  /**
   * Load patterns with current filters
   */
  const loadPatterns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let patternsData: StitchPattern[];
      
      if (searchTerm.trim()) {
        patternsData = await searchStitchPatterns(searchTerm.trim(), filters);
      } else {
        patternsData = await getStitchPatterns(filters);
      }

      setPatterns(patternsData);
      setFilteredPatterns(patternsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patterns';
      setError(errorMessage);
      console.error('Error loading patterns:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchTerm]);

  /**
   * Handle category selection
   */
  const handleCategorySelect = useCallback((category: StitchPatternCategory) => {
    setFilters(prev => ({ ...prev, category }));
    setViewMode('patterns');
  }, []);

  /**
   * Handle filter changes
   */
  const handleFiltersChange = useCallback((newFilters: Partial<StitchPatternFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Handle search
   */
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      setViewMode('patterns');
    }
  }, []);

  /**
   * Clear all filters and search
   */
  const handleClearAll = useCallback(() => {
    setSearchTerm('');
    setFilters({
      basicOnly,
      craftType: initialCraftType,
      limit: 50
    });
    setViewMode('categories');
  }, [basicOnly, initialCraftType]);

  /**
   * Handle pattern selection
   */
  const handlePatternSelect = useCallback((pattern: StitchPattern) => {
    onPatternSelect?.(pattern);
  }, [onPatternSelect]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (viewMode === 'patterns') {
      loadPatterns();
    }
  }, [loadPatterns, viewMode]);

  // Navigation breadcrumb
  const renderBreadcrumb = () => (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <button
            onClick={() => setViewMode('categories')}
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            {t('stitchLibrary.categories', 'Categories')}
          </button>
        </li>
        {filters.category && (
          <>
            <span className="text-gray-400">/</span>
            <li>
              <span className="text-sm font-medium text-gray-500">
                {filters.category}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );

  // Main search bar
  const renderSearchBar = () => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={t('stitchLibrary.searchPlaceholder', 'Search stitch patterns, techniques, or keywords...')}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  // View controls
  const renderViewControls = () => (
    <div className="flex items-center space-x-2">
      {/* Display mode toggle */}
      {viewMode === 'patterns' && (
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setDisplayMode('grid')}
            className={`p-2 rounded ${displayMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            title={t('common.gridView', 'Grid View')}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDisplayMode('list')}
            className={`p-2 rounded ${displayMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            title={t('common.listView', 'List View')}
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md transition-colors ${
          showFilters 
            ? 'text-blue-700 bg-blue-50 border-blue-300' 
            : 'text-gray-700 bg-white hover:bg-gray-50'
        }`}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
        {t('common.filters', 'Filters')}
      </button>

      {/* Clear all */}
      {(searchTerm || filters.category || filters.difficultyLevel) && (
        <button
          onClick={handleClearAll}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          {t('common.clearAll', 'Clear All')}
        </button>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('stitchLibrary.title', 'Stitch Pattern Library')}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {t('stitchLibrary.subtitle', 'Discover and explore stitch patterns for your projects')}
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        {viewMode === 'patterns' && renderBreadcrumb()}

        {/* Search and controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            {renderSearchBar()}
          </div>
          <div className="flex-shrink-0">
            {renderViewControls()}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <StitchFilterPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
        />
      )}

      {/* Main content */}
      <div className="min-h-96">
        {viewMode === 'categories' ? (
          // Categories view
          <div>
            {isLoadingCategories ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">{t('common.loading', 'Loading...')}</p>
              </div>
            ) : categoriesError ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('error.categoriesLoadFailed', 'Failed to load categories')}
                  </h3>
                  <p className="text-gray-600 mb-4">{categoriesError}</p>
                  <button
                    onClick={loadCategories}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('common.retry', 'Try Again')}
                  </button>
                </div>
              </div>
            ) : (
              <StitchCategoryGrid
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCraftType={filters.craftType}
              />
            )}
          </div>
        ) : (
          // Patterns view
          <div>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">{t('common.loading', 'Loading patterns...')}</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('error.patternsLoadFailed', 'Failed to load patterns')}
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={loadPatterns}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {t('common.retry', 'Try Again')}
                  </button>
                </div>
              </div>
            ) : filteredPatterns.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('stitchLibrary.noPatterns', 'No patterns found')}
                </h3>
                <p className="text-gray-600">
                  {t('stitchLibrary.noPatternsSuggestion', 'Try adjusting your search or filters')}
                </p>
              </div>
            ) : (
              <div className={
                displayMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }>
                {filteredPatterns.map((pattern) => (
                  <StitchPatternCard
                    key={pattern.id}
                    pattern={pattern}
                    isSelected={selectedPattern?.id === pattern.id}
                    onSelect={handlePatternSelect}
                    clickable={true}
                    showCategory={true}
                    showDifficulty={true}
                    compact={displayMode === 'list'}
                    navigateOnClick={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 