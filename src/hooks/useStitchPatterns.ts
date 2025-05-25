/**
 * Custom hook for managing stitch patterns
 * Implements US_1.5 requirements for stitch pattern selection and definition
 */

import { useState, useEffect, useCallback } from 'react';
import type { StitchPattern, StitchPatternFilters, StitchPatternSelection } from '@/types/stitchPattern';
import { getStitchPatterns, getBasicStitchPatterns, getStitchPattern, searchStitchPatterns } from '@/services/stitchPatternService';

/**
 * Hook for fetching and managing stitch patterns
 * @param filters - Optional filters to apply
 * @returns Object with patterns, loading state, error, and refetch function
 */
export function useStitchPatterns(filters?: StitchPatternFilters) {
  const [patterns, setPatterns] = useState<StitchPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getStitchPatterns(filters);
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stitch patterns');
      setPatterns([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  return {
    patterns,
    isLoading,
    error,
    refetch: fetchPatterns
  };
}

/**
 * Hook for fetching basic stitch patterns only
 * @returns Object with basic patterns, loading state, error, and refetch function
 */
export function useBasicStitchPatterns() {
  const [patterns, setPatterns] = useState<StitchPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBasicPatterns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBasicStitchPatterns();
      setPatterns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch basic stitch patterns');
      setPatterns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBasicPatterns();
  }, [fetchBasicPatterns]);

  return {
    patterns,
    isLoading,
    error,
    refetch: fetchBasicPatterns
  };
}

/**
 * Hook for fetching a single stitch pattern by ID
 * @param id - The stitch pattern ID
 * @returns Object with pattern, loading state, error, and refetch function
 */
export function useStitchPattern(id: string | null) {
  const [pattern, setPattern] = useState<StitchPattern | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPattern = useCallback(async () => {
    if (!id) {
      setPattern(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getStitchPattern(id);
      setPattern(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stitch pattern');
      setPattern(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPattern();
  }, [fetchPattern]);

  return {
    pattern,
    isLoading,
    error,
    refetch: fetchPattern
  };
}

/**
 * Hook for managing stitch pattern selection state
 * @param initialPattern - Optional initial pattern selection
 * @returns Object with selection state and selection functions
 */
export function useStitchPatternSelection(initialPattern?: StitchPattern | null) {
  const [selection, setSelection] = useState<StitchPatternSelection>({
    pattern: initialPattern || null,
    isLoading: false,
    error: undefined
  });

  const selectPattern = useCallback((pattern: StitchPattern | null) => {
    setSelection(prev => ({
      ...prev,
      pattern,
      error: undefined
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({
      pattern: null,
      isLoading: false,
      error: undefined
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setSelection(prev => ({
      ...prev,
      isLoading
    }));
  }, []);

  const setError = useCallback((error: string | undefined) => {
    setSelection(prev => ({
      ...prev,
      error
    }));
  }, []);

  return {
    selection,
    selectPattern,
    clearSelection,
    setLoading,
    setError
  };
}

/**
 * Hook for searching stitch patterns
 * @param initialSearchTerm - Optional initial search term
 * @param basicOnly - Whether to search only basic patterns
 * @returns Object with search state and search function
 */
export function useStitchPatternSearch(initialSearchTerm: string = '', basicOnly: boolean = true) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<StitchPattern[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      const data = await searchStitchPatterns(term, basicOnly);
      setResults(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [basicOnly]);

  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    search(term);
  }, [search]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setSearchError(null);
  }, []);

  return {
    searchTerm,
    results,
    isSearching,
    searchError,
    updateSearchTerm,
    clearSearch,
    search
  };
} 