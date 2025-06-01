/**
 * Triangular Shawl Instruction Generator Tests (US_12.6)
 * Tests for the triangular shawl instruction generation engine
 */

import {
  generateTriangularShawlInstructions,
  generateTopDownCenterOutInstructions,
  generateSideToSideInstructions,
  generateBottomUpInstructions
} from '@/utils/triangular-shawl-instruction-generator';
import type {
  TriangularShawlInstructionContext,
  TriangularShawlInstructionResult
} from '@/utils/triangular-shawl-instruction-generator';
import {
  TriangularShawlCalculations,
  TriangularShawlConstructionMethod
} from '@/types/triangular-shawl';
import { InstructionGenerationConfig } from '@/types/instruction-generation';

describe('TriangularShawlInstructionGenerator', () => {
  // Common test configuration
  const defaultConfig: InstructionGenerationConfig = {
    includeStitchCounts: true,
    includeRowNumbers: true,
    useSpecificTechniques: true,
    language: 'en',
    verbosity: 'standard'
  };

  const frenchConfig: InstructionGenerationConfig = {
    ...defaultConfig,
    language: 'fr'
  };

  // Sample triangular shawl calculations for testing
  const topDownCalculations: TriangularShawlCalculations = {
    construction_method: 'top_down_center_out',
    inputs: {
      target_wingspan_cm: 150,
      target_depth_cm: 75,
      gauge_stitches_per_10cm: 20,
      gauge_rows_per_10cm: 28,
      border_stitches_each_side: 0,
      work_style: 'flat'
    },
    setup: {
      cast_on_stitches: 3,
      setup_notes: 'Cast on 3 stitches. Place markers for center spine if desired.'
    },
    shaping_schedule: {
      phase_1_increases: {
        description: 'Increase 4 stitches every 2nd row (1 at each end, 2 at center spine)',
        total_shaping_rows: 105,
        stitches_per_event: 4,
        total_rows_in_phase: 210,
        shaping_frequency: 2
      }
    },
    final_stitch_count: 423,
    total_rows_knit: 210,
    calculated_dimensions: {
      actual_wingspan_cm: 148.0,
      actual_depth_cm: 75.0
    }
  };

  const sideToSideCalculations: TriangularShawlCalculations = {
    construction_method: 'side_to_side',
    inputs: {
      target_wingspan_cm: 150,
      target_depth_cm: 75,
      gauge_stitches_per_10cm: 20,
      gauge_rows_per_10cm: 28,
      border_stitches_each_side: 0,
      work_style: 'flat'
    },
    setup: {
      cast_on_stitches: 4,
      setup_notes: 'Cast on 4 stitches at one point of the triangle.'
    },
    shaping_schedule: {
      phase_1_increases: {
        description: 'Increase 1 stitch on one edge every 2nd row until maximum depth',
        total_shaping_rows: 146,
        stitches_per_event: 1,
        total_rows_in_phase: 292,
        shaping_frequency: 2
      },
      phase_2_decreases: {
        description: 'Decrease 1 stitch on same edge every 2nd row to form second half',
        total_shaping_rows: 146,
        stitches_per_event: 1,
        total_rows_in_phase: 292,
        shaping_frequency: 2
      }
    },
    final_stitch_count: 4,
    total_rows_knit: 584,
    calculated_dimensions: {
      actual_wingspan_cm: 150.0,
      actual_depth_cm: 75.0
    }
  };

  const bottomUpCalculations: TriangularShawlCalculations = {
    construction_method: 'bottom_up',
    inputs: {
      target_wingspan_cm: 150,
      target_depth_cm: 75,
      gauge_stitches_per_10cm: 20,
      gauge_rows_per_10cm: 28,
      border_stitches_each_side: 0,
      work_style: 'flat'
    },
    setup: {
      cast_on_stitches: 300,
      setup_notes: 'Cast on 300 stitches for full wingspan.'
    },
    shaping_schedule: {
      phase_2_decreases: {
        description: 'Decrease 1 stitch at each end every 2nd row until 3 stitches remain',
        total_shaping_rows: 149,
        stitches_per_event: 2,
        total_rows_in_phase: 298,
        shaping_frequency: 2
      }
    },
    final_stitch_count: 3,
    total_rows_knit: 298,
    calculated_dimensions: {
      actual_wingspan_cm: 150.0,
      actual_depth_cm: 75.4
    }
  };

  describe('generateTriangularShawlInstructions', () => {
    it('should generate instructions based on construction method', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.summary?.constructionMethod).toBe('top_down_center_out');
    });

    it('should handle unsupported construction methods', () => {
      const invalidCalculations = {
        ...topDownCalculations,
        construction_method: 'invalid_method' as TriangularShawlConstructionMethod
      };

      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: invalidCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported construction method');
    });
  });

  describe('generateTopDownCenterOutInstructions (FR2)', () => {
    it('should generate correct instructions for knitting with markers', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTopDownCenterOutInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;
      
      // Check cast-on instruction (AC1)
      expect(instructions[0].text).toContain('Cast on 3 stitches');
      expect(instructions[0].type).toBe('cast_on');
      
      // Check setup row with marker placement (AC1)
      expect(instructions[1].text).toContain('Setup Row');
      expect(instructions[1].text).toContain('place marker');
      expect(instructions[1].text).toContain('center stitch');
      
      // Check increase row instruction contains 4 increases (AC1)
      const increaseInstruction = instructions.find(i => i.text.includes('M1R') && i.text.includes('M1L'));
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('M1R');
      expect(increaseInstruction!.text).toContain('M1L');
      
      // Check bind-off instruction
      const bindOffInstruction = instructions[instructions.length - 1];
      expect(bindOffInstruction.text).toContain('Bind off');
      expect(bindOffInstruction.type).toBe('cast_off');
    });

    it('should generate French instructions correctly', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Châle Triangulaire',
        config: frenchConfig
      };

      const result = generateTopDownCenterOutInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;
      
      // Check French terminology
      expect(instructions[0].text).toContain('Monter');
      expect(instructions[1].text).toContain('Rang de mise en place');
      
      const increaseInstruction = instructions.find(i => i.text.includes('Augmentation'));
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('Tricoter');
    });

    it('should generate crochet instructions correctly', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'crochet',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTopDownCenterOutInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;
      
      // Check crochet terminology
      expect(instructions[0].text).toContain('Chain');
      expect(instructions[0].text).toContain('Single crochet');
      
      const increaseInstruction = instructions.find(i => i.text.includes('2 sc in next st'));
      expect(increaseInstruction).toBeDefined();
    });
  });

  describe('generateSideToSideInstructions (FR3)', () => {
    it('should generate correct phase structure for side-to-side', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: sideToSideCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateSideToSideInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;
      
      // Check cast-on instruction
      expect(instructions[0].text).toContain('Cast on 4 stitches');
      
      // Check increase phase instructions (AC2)
      const increaseInstruction = instructions.find(i => i.text.includes('KFB'));
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('first stitch');
      
      // Check transition instruction (AC2)
      const transitionInstruction = instructions.find(i => i.text.includes('Transition'));
      expect(transitionInstruction).toBeDefined();
      expect(transitionInstruction!.text).toContain('maximum depth');
      
      // Check decrease phase instructions (AC2)
      const decreaseInstruction = instructions.find(i => i.text.includes('SSK'));
      expect(decreaseInstruction).toBeDefined();
    });
  });

  describe('generateBottomUpInstructions (FR4)', () => {
    it('should generate correct instructions for bottom-up construction', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: bottomUpCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateBottomUpInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;
      
      // Check large cast-on for wingspan (AC3)
      expect(instructions[0].text).toContain('Cast on 300 stitches');
      
      // Check decrease instructions with 2 decreases per row (AC3)
      const decreaseInstruction = instructions.find(i => i.text.includes('SSK') && i.text.includes('K2tog'));
      expect(decreaseInstruction).toBeDefined();
      expect(decreaseInstruction!.text).toContain('last 3 stitches');
      
      // Check repeat instruction mentions final stitch count
      const repeatInstruction = instructions.find(i => i.text.includes('until 3 stitches remain'));
      expect(repeatInstruction).toBeDefined();
    });
  });

  describe('Instruction quality and terminology (AC4)', () => {
    it('should use appropriate knitting terminology', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(true);
      
      const instructionText = result.instructions!.map(i => i.text).join(' ');
      
      // Check for proper knitting techniques
      expect(instructionText).toMatch(/\b(M1L|M1R|KFB|K2tog|SSK)\b/);
      expect(instructionText).toMatch(/\b(Cast on|Bind off|knit|purl)\b/);
      expect(instructionText).not.toMatch(/\b(chain|single crochet|fasten off)\b/i);
    });

    it('should use appropriate crochet terminology', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'crochet',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(true);
      
      const instructionText = result.instructions!.map(i => i.text).join(' ');
      
      // Check for proper crochet techniques
      expect(instructionText).toMatch(/\b(Chain|Single crochet|sc|Fasten off)\b/);
      expect(instructionText).toMatch(/\b(2 sc in next st|skip)\b/);
      expect(instructionText).not.toMatch(/\b(Cast on|Bind off|knit|purl|M1L|M1R)\b/i);
    });

    it('should include stitch counts when configured', () => {
      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: topDownCalculations,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: { ...defaultConfig, includeStitchCounts: true }
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(true);
      
      // Check that stitch counts are included
      const hasStitchCountInfo = result.instructions!.some(instruction => 
        instruction.text.includes('4 augmentations') || 
        instruction.text.includes('stitches') ||
        instruction.stitchCount !== undefined
      );
      expect(hasStitchCountInfo).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle missing increase phase gracefully', () => {
      const calculationsWithoutIncrease = {
        ...topDownCalculations,
        shaping_schedule: {}
      };

      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: calculationsWithoutIncrease,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTopDownCenterOutInstructions(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);
    });

    it('should include warnings from calculations', () => {
      const calculationsWithWarnings = {
        ...topDownCalculations,
        warnings: ['Test warning message']
      };

      const context: TriangularShawlInstructionContext = {
        craftType: 'knitting',
        triangularShawlCalculations: calculationsWithWarnings,
        componentKey: 'triangular_shawl',
        componentDisplayName: 'Triangular Shawl',
        config: defaultConfig
      };

      const result = generateTriangularShawlInstructions(context);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Test warning message');
    });
  });
}); 