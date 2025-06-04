/**
 * Tests for InMemoryPatternDefinitionContext (PD_PH2_US001)
 * Validates data persistence during non-sequential navigation
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { InMemoryPatternDefinitionProvider, useInMemoryPatternDefinition } from '../InMemoryPatternDefinitionContext';

// Test wrapper
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <InMemoryPatternDefinitionProvider>{children}</InMemoryPatternDefinitionProvider>
);

describe('PD_PH2_US001: Data Persistence During Navigation', () => {
  /**
   * Test Acceptance Criteria 4: Data persistence when navigating back to sections
   */
  test('should persist section data when navigating between sections', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Create a pattern
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    // Select sweater garment type
    act(() => {
      result.current.selectGarmentType('sweater');
    });

    // Navigate to gauge section and add data
    act(() => {
      result.current.navigateToSection('gauge');
    });

    const gaugeData = {
      stitchesPerInch: 5.5,
      rowsPerInch: 7.0,
      needleSize: '4mm',
      isCompleted: false
    };

    act(() => {
      result.current.updateSectionData('gauge', gaugeData);
    });

    // Verify gauge data is stored
    expect(result.current.state.currentPattern?.gauge).toEqual(
      expect.objectContaining(gaugeData)
    );

    // Navigate to neckline section and add data
    act(() => {
      result.current.navigateToSection('neckline');
    });

    const necklineData = {
      style: 'crew',
      depth: '2 inches',
      shaping: 'gradual',
      isCompleted: false
    };

    act(() => {
      result.current.updateSectionData('neckline', necklineData);
    });

    // Verify neckline data is stored
    expect(result.current.state.currentPattern?.neckline).toEqual(
      expect.objectContaining(necklineData)
    );

    // Navigate back to gauge section
    act(() => {
      result.current.navigateToSection('gauge');
    });

    // Verify gauge data is still there
    expect(result.current.state.currentPattern?.gauge).toEqual(
      expect.objectContaining(gaugeData)
    );
    expect(result.current.state.navigation.currentSection).toBe('gauge');

    // Navigate back to neckline
    act(() => {
      result.current.navigateToSection('neckline');
    });

    // Verify neckline data is still there
    expect(result.current.state.currentPattern?.neckline).toEqual(
      expect.objectContaining(necklineData)
    );
    expect(result.current.state.navigation.currentSection).toBe('neckline');
  });

  /**
   * Test that only relevant sections are available for different garment types
   */
  test('should show only relevant sections for selected garment type', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Create pattern
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    // Select sweater - should have many sections
    act(() => {
      result.current.selectGarmentType('sweater');
    });

    const sweaterSections = result.current.state.navigation.availableSections;
    expect(sweaterSections).toContain('gauge');
    expect(sweaterSections).toContain('measurements');
    expect(sweaterSections).toContain('neckline');
    expect(sweaterSections).toContain('sleeves');
    expect(sweaterSections).toContain('bodyStructure');

    // Select scarf - should have fewer sections
    act(() => {
      result.current.selectGarmentType('scarf');
    });

    const scarfSections = result.current.state.navigation.availableSections;
    expect(scarfSections).toContain('gauge');
    expect(scarfSections).toContain('measurements');
    expect(scarfSections).not.toContain('neckline'); // Scarfs don't have necklines
    expect(scarfSections).not.toContain('sleeves'); // Scarfs don't have sleeves
  });

  /**
   * Test navigation validation - prevent navigation to unavailable sections
   */
  test('should prevent navigation to sections not available for garment type', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Create pattern and select scarf
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    act(() => {
      result.current.selectGarmentType('scarf');
    });

    // Try to navigate to neckline (not available for scarf)
    act(() => {
      result.current.navigateToSection('neckline');
    });

    // Should have error and not change section
    expect(result.current.state.error).toContain('not available for current garment type');
    expect(result.current.state.navigation.currentSection).not.toBe('neckline');
  });

  /**
   * Test completion tracking across sections
   */
  test('should track completion status across section navigation', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Setup pattern
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    act(() => {
      result.current.selectGarmentType('sweater');
    });

    // Complete gauge section
    act(() => {
      result.current.navigateToSection('gauge');
    });

    act(() => {
      result.current.updateSectionData('gauge', { stitchesPerInch: 5.5 });
    });

    act(() => {
      result.current.markSectionCompleted('gauge');
    });

    // Navigate to measurements
    act(() => {
      result.current.navigateToSection('measurements');
    });

    // Complete measurements section
    act(() => {
      result.current.updateSectionData('measurements', { chest: 40 });
    });

    act(() => {
      result.current.markSectionCompleted('measurements');
    });

    // Verify both sections are marked as completed
    expect(result.current.state.navigation.completedSections).toContain('gauge');
    expect(result.current.state.navigation.completedSections).toContain('measurements');

    // Navigate back to gauge - should still be completed
    act(() => {
      result.current.navigateToSection('gauge');
    });

    expect(result.current.state.navigation.completedSections).toContain('gauge');
    expect(result.current.state.currentPattern?.gauge?.isCompleted).toBe(true);
  });

  /**
   * Test default section navigation
   */
  test('should navigate to default section when garment type is selected', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Create pattern
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    // Select sweater garment type
    act(() => {
      result.current.selectGarmentType('sweater');
    });

    // Should automatically navigate to default section (usually 'gauge')
    expect(result.current.state.navigation.currentSection).toBe('gauge');
  });

  /**
   * Test section data update and timestamp tracking
   */
  test('should update timestamps when section data changes', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Setup
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    act(() => {
      result.current.selectGarmentType('sweater');
    });

    const initialTimestamp = result.current.state.currentPattern?.updatedAt;

    // Wait a bit and update data
    setTimeout(() => {
      act(() => {
        result.current.updateSectionData('gauge', { stitchesPerInch: 5.5 });
      });

      const updatedTimestamp = result.current.state.currentPattern?.updatedAt;
      expect(updatedTimestamp).not.toEqual(initialTimestamp);
      expect(updatedTimestamp?.getTime()).toBeGreaterThan(initialTimestamp?.getTime() || 0);
    }, 10);
  });

  /**
   * Test error handling during navigation
   */
  test('should handle errors gracefully during navigation', () => {
    const { result } = renderHook(() => useInMemoryPatternDefinition(), { wrapper });

    // Try to navigate without a pattern
    act(() => {
      result.current.navigateToSection('gauge');
    });

    expect(result.current.state.error).toBeTruthy();

    // Create pattern but don't select garment type
    act(() => {
      result.current.createPattern('Test Pattern', 'knitting');
    });

    act(() => {
      result.current.navigateToSection('gauge');
    });

    expect(result.current.state.error).toBeTruthy();
  });
}); 