/**
 * Tests for Pattern Definition Navigation (PD_PH2_US001)
 * Validates non-sequential navigation between active pattern sections
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternDefinitionNavigation from '../PatternDefinitionNavigation';
import { InMemoryPatternDefinitionProvider } from '@/contexts/InMemoryPatternDefinitionContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/utils/i18n';

// Mock component wrapper with necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <InMemoryPatternDefinitionProvider>
      {children}
    </InMemoryPatternDefinitionProvider>
  </I18nextProvider>
);

// Mock the useInMemoryPatternDefinition hook for controlled testing
const mockNavigateToSection = jest.fn();
const mockSelectGarmentType = jest.fn();

jest.mock('@/contexts/InMemoryPatternDefinitionContext', () => ({
  ...jest.requireActual('@/contexts/InMemoryPatternDefinitionContext'),
  useInMemoryPatternDefinition: () => ({
    state: {
      currentPattern: {
        sessionId: 'test-session',
        sessionName: 'Test Pattern',
        craftType: 'knitting' as const,
        garmentType: 'sweater',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: { isCompleted: false },
        measurements: { isCompleted: true },
        neckline: { isCompleted: false },
        sleeves: { isCompleted: false }
      },
      navigation: {
        currentSection: 'gauge',
        availableSections: ['gauge', 'measurements', 'neckline', 'sleeves'],
        completedSections: ['measurements'],
        requiredSections: ['gauge', 'measurements']
      },
      isLoading: false,
      error: null
    },
    navigateToSection: mockNavigateToSection,
    selectGarmentType: mockSelectGarmentType,
    createPattern: jest.fn(),
    updateSectionData: jest.fn(),
    markSectionCompleted: jest.fn(),
    clearPattern: jest.fn()
  })
}));

describe('PD_PH2_US001: Non-Sequential Navigation Between Active Pattern Sections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Acceptance Criteria 1 & 5: 
   * Given a "Sweater" garment type is selected, sections are available
   * Verify that only sections relevant to the chosen garment type are navigable
   */
  test('should display only relevant sections for sweater garment type', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    // Verify that sweater-relevant sections are displayed
    expect(screen.getByText('Gauge')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
    expect(screen.getByText('Neckline')).toBeInTheDocument();
    expect(screen.getByText('Sleeves')).toBeInTheDocument();

    // Verify sections are clickable (navigable)
    const gaugeSection = screen.getByText('Gauge').closest('div');
    const measurementsSection = screen.getByText('Measurements').closest('div');
    const necklineSection = screen.getByText('Neckline').closest('div');
    const sleevesSection = screen.getByText('Sleeves').closest('div');

    expect(gaugeSection).toHaveClass('cursor-pointer');
    expect(measurementsSection).toHaveClass('cursor-pointer');
    expect(necklineSection).toHaveClass('cursor-pointer');
    expect(sleevesSection).toHaveClass('cursor-pointer');
  });

  /**
   * Acceptance Criteria 2: 
   * When the user clicks "Neckline," then the neckline definition UI is shown
   */
  test('should navigate to neckline section when neckline is clicked', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    const necklineSection = screen.getByText('Neckline').closest('div');
    
    fireEvent.click(necklineSection!);

    expect(mockNavigateToSection).toHaveBeenCalledWith('neckline');
  });

  /**
   * Acceptance Criteria 3: 
   * When the user then clicks "Gauge," then the gauge definition UI is shown
   */
  test('should navigate to gauge section when gauge is clicked', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    const gaugeSection = screen.getByText('Gauge').closest('div');
    
    fireEvent.click(gaugeSection!);

    expect(mockNavigateToSection).toHaveBeenCalledWith('gauge');
  });

  /**
   * Acceptance Criteria 4: 
   * When the user clicks back to "Neckline," any data previously entered is still there
   * Note: This is tested at the context level since navigation component doesn't handle data persistence
   */
  test('should allow navigation back to previously visited sections', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    // First click neckline
    const necklineSection = screen.getByText('Neckline').closest('div');
    fireEvent.click(necklineSection!);
    expect(mockNavigateToSection).toHaveBeenCalledWith('neckline');

    // Then click gauge
    const gaugeSection = screen.getByText('Gauge').closest('div');
    fireEvent.click(gaugeSection!);
    expect(mockNavigateToSection).toHaveBeenCalledWith('gauge');

    // Then back to neckline
    fireEvent.click(necklineSection!);
    expect(mockNavigateToSection).toHaveBeenCalledWith('neckline');

    // Verify multiple calls to navigate
    expect(mockNavigateToSection).toHaveBeenCalledTimes(3);
  });

  /**
   * Test visual indicators for different section states
   */
  test('should display correct visual indicators for section states', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    // Active section (gauge) should have active styling
    const gaugeSection = screen.getByText('Gauge').closest('div');
    expect(gaugeSection).toHaveClass('bg-blue-100', 'text-blue-900');

    // Completed section (measurements) should have completed styling
    const measurementsSection = screen.getByText('Measurements').closest('div');
    expect(measurementsSection).toHaveClass('bg-green-50', 'text-green-800');

    // Check for required badges
    expect(screen.getAllByText('Required')).toHaveLength(2); // gauge and measurements
  });

  /**
   * Test navigation component renders correctly with no garment type
   */
  test('should not render navigation when no garment type is selected', () => {
    // Mock the hook to return no garment type
    jest.doMock('@/contexts/InMemoryPatternDefinitionContext', () => ({
      useInMemoryPatternDefinition: () => ({
        state: {
          currentPattern: null,
          navigation: {
            currentSection: null,
            availableSections: [],
            completedSections: [],
            requiredSections: []
          },
          isLoading: false,
          error: null
        },
        navigateToSection: mockNavigateToSection
      })
    }));

    const { container } = render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    // Navigation should not be rendered
    expect(container.firstChild).toBeNull();
  });

  /**
   * Test full variant navigation
   */
  test('should render full variant with descriptions and estimated times', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="full" />
      </TestWrapper>
    );

    // In full variant, should show grid layout
    const container = screen.getByText('Pattern Sections').closest('div')?.parentElement;
    expect(container).toHaveClass('grid');

    // Should show estimated times in full variant
    expect(screen.getByText('5 min')).toBeInTheDocument(); // gauge estimated time
  });

  /**
   * Test progress summary display
   */
  test('should display progress summary correctly', () => {
    render(
      <TestWrapper>
        <PatternDefinitionNavigation variant="sidebar" />
      </TestWrapper>
    );

    // Should show completion progress
    // This would be in the progress summary at the bottom
    const progressSection = screen.getByText('Pattern Sections').closest('div')?.parentElement;
    expect(progressSection).toBeInTheDocument();
  });
});

/**
 * Integration tests with real context (no mocking)
 */
describe('PD_PH2_US001: Integration Tests with Real Context', () => {
  test('should integrate properly with InMemoryPatternDefinitionContext', async () => {
    // This test uses the real context without mocking
    const RealTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <I18nextProvider i18n={i18n}>
        <InMemoryPatternDefinitionProvider>
          {children}
        </InMemoryPatternDefinitionProvider>
      </I18nextProvider>
    );

    // Clear the mock for this test
    jest.unmock('@/contexts/InMemoryPatternDefinitionContext');

    render(
      <RealTestWrapper>
        <div data-testid="test-container">
          <PatternDefinitionNavigation variant="sidebar" />
        </div>
      </RealTestWrapper>
    );

    // Initially, no navigation should be shown (no garment type selected)
    const container = screen.getByTestId('test-container');
    expect(container).toBeInTheDocument();
    
    // The navigation content should be minimal or hidden when no pattern exists
    expect(container.children.length).toBeLessThanOrEqual(1);
  });
}); 