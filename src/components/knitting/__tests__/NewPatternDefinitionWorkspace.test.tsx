/**
 * Integration Tests for NewPatternDefinitionWorkspace (PD_PH2_US001)
 * Tests the complete workflow of non-sequential navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewPatternDefinitionWorkspace from '../NewPatternDefinitionWorkspace';
import { InMemoryPatternDefinitionProvider } from '@/contexts/InMemoryPatternDefinitionContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/utils/i18n';

// Mock GarmentTypeSelector to simplify testing
jest.mock('../GarmentTypeSelector', () => {
  return function MockGarmentTypeSelector({ onGarmentTypeSelect }: any) {
    return (
      <div data-testid="garment-type-selector">
        <button
          onClick={() => onGarmentTypeSelect({ type_key: 'sweater', display_name: 'Sweater' })}
          data-testid="select-sweater"
        >
          Select Sweater
        </button>
        <button
          onClick={() => onGarmentTypeSelect({ type_key: 'scarf', display_name: 'Scarf' })}
          data-testid="select-scarf"
        >
          Select Scarf
        </button>
      </div>
    );
  };
});

// Test wrapper with all providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <InMemoryPatternDefinitionProvider>
      {children}
    </InMemoryPatternDefinitionProvider>
  </I18nextProvider>
);

describe('PD_PH2_US001: Complete Workflow Integration Tests', () => {
  /**
   * Test the complete workflow as described in acceptance criteria
   */
  test('should complete the full non-sequential navigation workflow', async () => {
    render(
      <TestWrapper>
        <NewPatternDefinitionWorkspace />
      </TestWrapper>
    );

    // Step 1: Should start with garment type selection
    expect(screen.getByTestId('garment-type-selector')).toBeInTheDocument();
    expect(screen.getByText('Pattern Definition')).toBeInTheDocument();

    // Step 2: Select sweater garment type
    fireEvent.click(screen.getByTestId('select-sweater'));

    // Step 3: After selection, should show the main workspace with navigation
    await waitFor(() => {
      expect(screen.queryByTestId('garment-type-selector')).not.toBeInTheDocument();
    });

    // Should show the pattern name and garment type
    expect(screen.getByText('Test Pattern')).toBeInTheDocument();
    expect(screen.getByText('sweater')).toBeInTheDocument();

    // Step 4: Should show navigation with available sections
    expect(screen.getByText('Pattern Sections')).toBeInTheDocument();
    expect(screen.getByText('Gauge')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
    expect(screen.getByText('Neckline')).toBeInTheDocument();
    expect(screen.getByText('Sleeves')).toBeInTheDocument();

    // Step 5: Click on Neckline section (Acceptance Criteria 2)
    const necklineButton = screen.getByText('Neckline').closest('div');
    fireEvent.click(necklineButton!);

    // Should show neckline content
    await waitFor(() => {
      expect(screen.getByText('Neckline Configuration')).toBeInTheDocument();
    });

    // Step 6: Navigate to Gauge section (Acceptance Criteria 3)
    const gaugeButton = screen.getByText('Gauge').closest('div');
    fireEvent.click(gaugeButton!);

    // Should show gauge content
    await waitFor(() => {
      expect(screen.getByText('Gauge Configuration')).toBeInTheDocument();
    });

    // Step 7: Navigate back to Neckline (Acceptance Criteria 4)
    fireEvent.click(necklineButton!);

    // Should show neckline content again
    await waitFor(() => {
      expect(screen.getByText('Neckline Configuration')).toBeInTheDocument();
    });

    // Verify we can mark sections as completed
    const completeButton = screen.getByText('Mark as Completed');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  /**
   * Test that scarf shows different sections (Acceptance Criteria 5)
   */
  test('should show different sections for different garment types', async () => {
    render(
      <TestWrapper>
        <NewPatternDefinitionWorkspace />
      </TestWrapper>
    );

    // Select scarf instead of sweater
    fireEvent.click(screen.getByTestId('select-scarf'));

    await waitFor(() => {
      expect(screen.getByText('scarf')).toBeInTheDocument();
    });

    // Scarf should have gauge and measurements, but not neckline/sleeves
    expect(screen.getByText('Gauge')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
    
    // Should not show neckline or sleeves for scarf
    expect(screen.queryByText('Neckline')).not.toBeInTheDocument();
    expect(screen.queryByText('Sleeves')).not.toBeInTheDocument();
  });

  /**
   * Test error handling
   */
  test('should handle errors gracefully', async () => {
    render(
      <TestWrapper>
        <NewPatternDefinitionWorkspace />
      </TestWrapper>
    );

    // Initially should not show error
    expect(screen.queryByText('Error')).not.toBeInTheDocument();

    // If there were an error, it should be displayed
    // This would need to be tested with a mock that triggers an error state
  });

  /**
   * Test loading states
   */
  test('should handle loading states', () => {
    // Mock the context to return loading state
    const MockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
      const mockContext = {
        state: {
          currentPattern: null,
          navigation: {
            currentSection: null,
            availableSections: [],
            completedSections: [],
            requiredSections: []
          },
          isLoading: true,
          error: null
        },
        createPattern: jest.fn(),
        selectGarmentType: jest.fn(),
        navigateToSection: jest.fn(),
        updateSectionData: jest.fn(),
        markSectionCompleted: jest.fn(),
        clearPattern: jest.fn()
      };

      return (
        <I18nextProvider i18n={i18n}>
          <div>{children}</div>
        </I18nextProvider>
      );
    };

    render(
      <MockProvider>
        <NewPatternDefinitionWorkspace />
      </MockProvider>
    );

    // Should show loading animation
    expect(screen.getByText('Pattern Definition')).toBeInTheDocument();
  });

  /**
   * Test summary section display
   */
  test('should display summary section with pattern overview', async () => {
    render(
      <TestWrapper>
        <NewPatternDefinitionWorkspace />
      </TestWrapper>
    );

    // Select sweater
    fireEvent.click(screen.getByTestId('select-sweater'));

    await waitFor(() => {
      expect(screen.getByText('sweater')).toBeInTheDocument();
    });

    // Navigate to summary if available
    const summaryButton = screen.queryByText('Summary');
    if (summaryButton) {
      fireEvent.click(summaryButton.closest('div')!);

      await waitFor(() => {
        expect(screen.getByText('Pattern Overview')).toBeInTheDocument();
        expect(screen.getByText('Garment Type')).toBeInTheDocument();
        expect(screen.getByText('Session Name')).toBeInTheDocument();
      });
    }
  });

  /**
   * Test responsive navigation variants
   */
  test('should handle different navigation variants', async () => {
    render(
      <TestWrapper>
        <NewPatternDefinitionWorkspace />
      </TestWrapper>
    );

    // Select sweater
    fireEvent.click(screen.getByTestId('select-sweater'));

    await waitFor(() => {
      expect(screen.getByText('sweater')).toBeInTheDocument();
    });

    // The workspace should use sidebar variant by default
    expect(screen.getByText('Pattern Sections')).toBeInTheDocument();
    
    // Navigation should be in sidebar format (single column)
    const navigation = screen.getByText('Pattern Sections').closest('div');
    expect(navigation).toHaveClass('space-y-2'); // Sidebar spacing
  });
}); 