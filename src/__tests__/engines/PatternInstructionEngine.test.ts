/**
 * Pattern Instruction Engine Tests (PD_PH6_US003)
 * Tests for the pattern instruction generation engine
 */

import { PatternInstructionEngine } from '@/engines/instruction/PatternInstructionEngine';
import { 
  PatternInstructionGenerationInput,
  PatternInstructionGenerationResult 
} from '@/types/pattern-instruction-generation';
import { CalculatedPatternDetails, CalculatedPieceDetails } from '@/types/core-pattern-calculation';

describe('PatternInstructionEngine', () => {
  let engine: PatternInstructionEngine;

  beforeEach(() => {
    engine = new PatternInstructionEngine();
  });

  describe('generateInstructions', () => {
    it('should generate instructions for a simple sweater front panel', async () => {
      // Arrange
      const mockPieceDetails: CalculatedPieceDetails = {
        pieceKey: 'front_body',
        displayName: 'Front Body',
        castOnStitches: 120,
        lengthInRows: 150,
        finalStitchCount: 120,
        finishedDimensions: {
          width_cm: 50,
          length_cm: 60
        },
        shaping: [],
        constructionNotes: ['Work in Stockinette Stitch throughout']
      };

      const mockCalculatedDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: 'test-session-123',
          garmentType: 'sweater',
          craftType: 'knitting',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          front_body: mockPieceDetails
        }
      };

      const input: PatternInstructionGenerationInput = {
        calculatedPatternDetails: mockCalculatedDetails,
        options: {
          includeStitchCounts: true,
          includeRowNumbers: true,
          useStandardAbbreviations: true,
          language: 'en',
          detailLevel: 'standard'
        }
      };

      // Act
      const result = await engine.generateInstructions(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.instructionsByPiece).toBeDefined();
      expect(result.instructionsByPiece!['front_body']).toBeDefined();
      
      const frontBodyInstructions = result.instructionsByPiece!['front_body'];
      expect(frontBodyInstructions.pieceKey).toBe('front_body');
      expect(frontBodyInstructions.displayName).toBe('Front Body');
      expect(frontBodyInstructions.instructionSteps).toHaveLength(3); // Cast on, plain rows, bind off
      expect(frontBodyInstructions.markdownInstructions).toContain('## Front Body');
      expect(frontBodyInstructions.markdownInstructions).toContain('CO 120 sts');
      expect(frontBodyInstructions.constructionSummary.castOnStitches).toBe(120);
      expect(frontBodyInstructions.constructionSummary.totalRows).toBe(150);
    });

    it('should generate instructions for crochet pieces', async () => {
      // Arrange
      const mockPieceDetails: CalculatedPieceDetails = {
        pieceKey: 'scarf',
        displayName: 'Scarf',
        castOnStitches: 80,
        lengthInRows: 200,
        finalStitchCount: 80,
        finishedDimensions: {
          width_cm: 20,
          length_cm: 180
        },
        shaping: []
      };

      const mockCalculatedDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: 'test-session-456',
          garmentType: 'scarf',
          craftType: 'crochet',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          scarf: mockPieceDetails
        }
      };

      const input: PatternInstructionGenerationInput = {
        calculatedPatternDetails: mockCalculatedDetails,
        options: {
          useStandardAbbreviations: true,
          language: 'en'
        }
      };

      // Act
      const result = await engine.generateInstructions(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.instructionsByPiece).toBeDefined();
      expect(result.instructionsByPiece!['scarf']).toBeDefined();
      
      const scarfInstructions = result.instructionsByPiece!['scarf'];
      expect(scarfInstructions.markdownInstructions).toContain('ch');
      expect(scarfInstructions.markdownInstructions).toContain('sc');
    });

    it('should include abbreviations glossary when requested', async () => {
      // Arrange
      const mockCalculatedDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: 'test-session-789',
          garmentType: 'sweater',
          craftType: 'knitting',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          test_piece: {
            pieceKey: 'test_piece',
            displayName: 'Test Piece',
            castOnStitches: 50,
            lengthInRows: 50,
            finalStitchCount: 50,
            finishedDimensions: { width_cm: 25, length_cm: 25 },
            shaping: []
          }
        }
      };

      const input: PatternInstructionGenerationInput = {
        calculatedPatternDetails: mockCalculatedDetails,
        options: {
          useStandardAbbreviations: true
        }
      };

      // Act
      const result = await engine.generateInstructions(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.abbreviationsGlossary).toBeDefined();
      expect(result.abbreviationsGlossary!.abbreviations).toBeDefined();
      expect(result.abbreviationsGlossary!.abbreviations['k']).toBeDefined();
      expect(result.abbreviationsGlossary!.abbreviations['k'].fullTerm).toBe('knit');
    });

    it('should handle validation errors gracefully', async () => {
      // Arrange
      const invalidInput: PatternInstructionGenerationInput = {
        calculatedPatternDetails: {
          patternInfo: {
            sessionId: '',
            garmentType: '',
            craftType: 'invalid' as any,
            calculatedAt: '',
            schemaVersion: ''
          },
          pieces: {}
        }
      };

      // Act
      const result = await engine.generateInstructions(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should generate pattern introduction', async () => {
      // Arrange
      const mockCalculatedDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: 'test-session-intro',
          garmentType: 'hat',
          craftType: 'knitting',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          hat_body: {
            pieceKey: 'hat_body',
            displayName: 'Hat Body',
            castOnStitches: 96,
            lengthInRows: 40,
            finalStitchCount: 8,
            finishedDimensions: { width_cm: 24, length_cm: 20 },
            shaping: []
          }
        }
      };

      const input: PatternInstructionGenerationInput = {
        calculatedPatternDetails: mockCalculatedDetails
      };

      // Act
      const result = await engine.generateInstructions(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.patternIntroduction).toBeDefined();
      expect(result.patternIntroduction).toContain('hat Knitting Pattern');
      expect(result.patternIntroduction).toContain('Hat Body');
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.piecesProcessed).toContain('hat_body');
    });

    it('should respect detail level options', async () => {
      // Arrange
      const mockCalculatedDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: 'test-detail-level',
          garmentType: 'sweater',
          craftType: 'knitting',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          test_piece: {
            pieceKey: 'test_piece',
            displayName: 'Test Piece',
            castOnStitches: 100,
            lengthInRows: 100,
            finalStitchCount: 100,
            finishedDimensions: { width_cm: 40, length_cm: 40 },
            shaping: []
          }
        }
      };

      // Test minimal detail level
      const minimalInput: PatternInstructionGenerationInput = {
        calculatedPatternDetails: mockCalculatedDetails,
        options: {
          detailLevel: 'minimal',
          includeRowNumbers: false,
          includeStitchCounts: false
        }
      };

      // Act
      const minimalResult = await engine.generateInstructions(minimalInput);

      // Assert
      expect(minimalResult.success).toBe(true);
      const instructions = minimalResult.instructionsByPiece!['test_piece'];
      
      // For minimal detail with many rows, should group instructions
      expect(instructions.instructionSteps.length).toBeLessThan(50); // Should be grouped, not row-by-row
    });
  });
});

// Helper function to create valid test data
export function createTestCalculatedPatternDetails(
  overrides?: Partial<CalculatedPatternDetails>
): CalculatedPatternDetails {
  const defaultPiece: CalculatedPieceDetails = {
    pieceKey: 'test_piece',
    displayName: 'Test Piece',
    castOnStitches: 100,
    lengthInRows: 50,
    finalStitchCount: 100,
    finishedDimensions: {
      width_cm: 40,
      length_cm: 20
    },
    shaping: []
  };

  const defaults: CalculatedPatternDetails = {
    patternInfo: {
      sessionId: 'test-session',
      garmentType: 'test-garment',
      craftType: 'knitting',
      calculatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0'
    },
    pieces: {
      test_piece: defaultPiece
    }
  };

  return {
    ...defaults,
    ...overrides,
    patternInfo: {
      ...defaults.patternInfo,
      ...overrides?.patternInfo
    },
    pieces: {
      ...defaults.pieces,
      ...overrides?.pieces
    }
  };
} 