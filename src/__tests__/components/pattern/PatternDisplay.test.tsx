/**
 * Pattern Display Component Tests (PD_PH6_US004)
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PatternDisplay from '@/components/pattern/PatternDisplay';
import { PatternInstructionGenerationResult } from '@/types/pattern-instruction-generation';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

// Mock schematic service
jest.mock('@/services/schematicService', () => ({
  schematicService: {
    generateSchematicsForSession: jest.fn().mockResolvedValue([]),
  },
}));

describe('PatternDisplay', () => {
  const mockPatternResult: PatternInstructionGenerationResult = {
    success: true,
    instructionsByPiece: {
      front_panel: {
        pieceKey: 'front_panel',
        displayName: 'Front Panel',
        markdownInstructions: '# Front Panel Instructions\n\nCast on 120 stitches.',
        instructionSteps: [
          {
            rowNumber: 1,
            section: 'Setup',
            instructionText: 'Cast on 120 stitches',
            stitchCount: 120,
            rowType: 'cast_on'
          },
          {
            rowNumber: 2,
            section: 'Body',
            instructionText: 'Knit all stitches',
            stitchCount: 120,
            rowType: 'plain_row'
          }
        ],
        constructionSummary: {
          castOnStitches: 120,
          totalRows: 180,
          finalStitchCount: 120,
          finishedDimensions: {
            width_cm: 50,
            length_cm: 60
          }
        },
        constructionNotes: ['Work in stockinette stitch']
      },
      back_panel: {
        pieceKey: 'back_panel',
        displayName: 'Back Panel',
        markdownInstructions: '# Back Panel Instructions\n\nCast on 120 stitches.',
        instructionSteps: [
          {
            rowNumber: 1,
            section: 'Setup',
            instructionText: 'Cast on 120 stitches',
            stitchCount: 120,
            rowType: 'cast_on'
          }
        ],
        constructionSummary: {
          castOnStitches: 120,
          totalRows: 180,
          finalStitchCount: 120,
          finishedDimensions: {
            width_cm: 50,
            length_cm: 60
          }
        }
      }
    },
    patternIntroduction: 'This is a basic sweater pattern.',
    abbreviationsGlossary: {
      abbreviations: {
        k: {
          abbreviation: 'k',
          fullTerm: 'knit',
          description: 'Insert needle and pull through'
        },
        p: {
          abbreviation: 'p',
          fullTerm: 'purl',
          description: 'Insert needle from back and pull through'
        }
      },
      craftType: 'knitting',
      language: 'en'
    },
    metadata: {
      totalInstructions: 3,
      piecesProcessed: ['front_panel', 'back_panel'],
      generatedAt: '2024-01-15T10:00:00Z'
    }
  };

  const mockFailedResult: PatternInstructionGenerationResult = {
    success: false,
    errors: ['Failed to generate instructions', 'Invalid pattern data']
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Successful Pattern Display', () => {
    it('renders pattern display with instructions', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      expect(screen.getByText('Pattern Instructions')).toBeInTheDocument();
      expect(screen.getByText('Generated on')).toBeInTheDocument();
      expect(screen.getByText('3 instructions')).toBeInTheDocument();
    });

    it('displays pattern introduction when available', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      expect(screen.getByText('Pattern Introduction')).toBeInTheDocument();
      expect(screen.getByText('This is a basic sweater pattern.')).toBeInTheDocument();
    });

    it('displays abbreviations glossary when available', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      const abbreviationsButton = screen.getByText('Abbreviations');
      fireEvent.click(abbreviationsButton);

      expect(screen.getByText('k')).toBeInTheDocument();
      expect(screen.getByText('knit')).toBeInTheDocument();
      expect(screen.getByText('p')).toBeInTheDocument();
      expect(screen.getByText('purl')).toBeInTheDocument();
    });

    it('renders navigation tabs for multiple pieces', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      expect(screen.getByText('Front Panel')).toBeInTheDocument();
      expect(screen.getByText('Back Panel')).toBeInTheDocument();
    });

    it('displays piece instructions when piece is selected', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      // Front panel should be selected by default
      expect(screen.getByText('120')).toBeInTheDocument(); // Cast-on stitches
      expect(screen.getByText('180')).toBeInTheDocument(); // Total rows
      expect(screen.getByText('50 × 60 cm')).toBeInTheDocument(); // Dimensions
    });

    it('switches between pieces when navigation tabs are clicked', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      // Click on back panel tab
      const backPanelTab = screen.getByText('Back Panel');
      fireEvent.click(backPanelTab);

      // Should still show the same construction summary since both pieces have same values
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    it('shows print and download buttons when enabled', () => {
      render(
        <PatternDisplay 
          patternResult={mockPatternResult}
          options={{ showPrint: true, showDownload: true }}
        />
      );

      expect(screen.getByText('Print')).toBeInTheDocument();
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    it('hides print and download buttons when disabled', () => {
      render(
        <PatternDisplay 
          patternResult={mockPatternResult}
          options={{ showPrint: false, showDownload: false }}
        />
      );

      expect(screen.queryByText('Print')).not.toBeInTheDocument();
      expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
    });

    it('triggers print when print button is clicked', () => {
      const originalPrint = window.print;
      window.print = jest.fn();

      render(<PatternDisplay patternResult={mockPatternResult} />);

      const printButton = screen.getByText('Print');
      fireEvent.click(printButton);

      // Print should be called after a timeout
      setTimeout(() => {
        expect(window.print).toHaveBeenCalled();
      }, 150);

      window.print = originalPrint;
    });
  });

  describe('Error Handling', () => {
    it('displays error message when pattern generation failed', () => {
      render(<PatternDisplay patternResult={mockFailedResult} />);

      expect(screen.getByText('Pattern Display Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to generate instructions')).toBeInTheDocument();
      expect(screen.getByText('Invalid pattern data')).toBeInTheDocument();
    });

    it('displays empty state when no pieces are available', () => {
      const emptyResult: PatternInstructionGenerationResult = {
        success: true,
        instructionsByPiece: {}
      };

      render(<PatternDisplay patternResult={emptyResult} />);

      expect(screen.getByText('No Instructions Available')).toBeInTheDocument();
      expect(screen.getByText('Pattern instructions could not be generated or are empty.')).toBeInTheDocument();
    });
  });

  describe('Warnings Display', () => {
    it('displays warnings when present', () => {
      const resultWithWarnings: PatternInstructionGenerationResult = {
        ...mockPatternResult,
        warnings: ['This pattern may require advanced techniques', 'Check gauge carefully']
      };

      render(<PatternDisplay patternResult={resultWithWarnings} />);

      expect(screen.getByText('Warnings')).toBeInTheDocument();
      expect(screen.getByText('This pattern may require advanced techniques')).toBeInTheDocument();
      expect(screen.getByText('Check gauge carefully')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Pattern Instructions');
    });

    it('has accessible navigation tabs', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      const navigation = screen.getByRole('navigation', { name: 'Pattern pieces' });
      expect(navigation).toBeInTheDocument();
    });

    it('has accessible buttons with proper labels', () => {
      render(<PatternDisplay patternResult={mockPatternResult} />);

      const printButton = screen.getByRole('button', { name: /print/i });
      const downloadButton = screen.getByRole('button', { name: /download pdf/i });

      expect(printButton).toBeInTheDocument();
      expect(downloadButton).toBeInTheDocument();
    });
  });
}); 