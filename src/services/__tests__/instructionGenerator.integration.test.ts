/**
 * Integration test for Hammer Sleeve Instruction Generation (US_12.4)
 * This test verifies the complete integration between the service and utility
 */

import { InstructionGeneratorService } from '../instructionGeneratorService';
import { HammerSleeveCalculations } from '../../types/hammer-sleeve-construction';
import { InstructionGenerationContext, InstructionGenerationConfig } from '../../types/instruction-generation';

describe('Hammer Sleeve Instruction Generation Integration (US_12.4)', () => {
  let instructionService: InstructionGeneratorService;

  // Mock hammer sleeve calculations (from example usage)
  const mockHammerSleeveCalculations: HammerSleeveCalculations = {
    hammer_sleeve_shaping: {
      sleeve_cap_extension: {
        width_stitches: 20,
        length_rows: 10,
        shaping_to_neck_details: []
      },
      sleeve_cap_vertical_part: {
        width_stitches: 60,
        height_rows: 40,
        shaping_from_arm_details: []
      }
    },
    body_panel_hammer_armhole_shaping: {
      shoulder_strap_width_stitches: 25,
      armhole_cutout_width_stitches: 60,
      armhole_depth_rows: 40,
      bind_off_for_cutout_stitches: 60,
      body_width_at_chest_stitches: 170
    },
    calculation_metadata: {
      actual_shoulder_width_cm: 45.0,
      actual_upper_arm_width_cm: 30.0,
      actual_armhole_depth_cm: 20.0
    }
  };

  // Test context
  const context: InstructionGenerationContext = {
    craftType: 'knitting',
    componentKey: 'hammer_sleeve_sweater',
    componentDisplayName: 'Pull à Manches Marteau',
    startingStitchCount: 60,
    finalStitchCount: 20,
    hammerSleeveCalculations: mockHammerSleeveCalculations
  };

  beforeEach(() => {
    instructionService = new InstructionGeneratorService();
  });

  describe('French Instructions Generation', () => {
    const frenchConfig: InstructionGenerationConfig = {
      includeStitchCounts: true,
      includeRowNumbers: true,
      useSpecificTechniques: true,
      language: 'fr',
      verbosity: 'standard'
    };

    it('should generate complete French hammer sleeve instructions', () => {
      const result = instructionService.generateHammerSleeveInstructions(
        mockHammerSleeveCalculations,
        context,
        frenchConfig
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.summary).toBeDefined();

      if (result.instructions) {
        // Verify sleeve instructions
        expect(result.instructions.sleeve).toBeDefined();
        expect(result.instructions.sleeve.length).toBeGreaterThan(0);
        
        // Verify front body instructions
        expect(result.instructions.front_body).toBeDefined();
        expect(result.instructions.front_body.length).toBeGreaterThan(0);
        
        // Verify assembly instructions
        expect(result.instructions.assembly).toBeDefined();
        expect(result.instructions.assembly.length).toBeGreaterThan(0);

        // Check that instructions are in French
        const firstSleeveInstruction = result.instructions.sleeve[0];
        expect(firstSleeveInstruction.text).toMatch(/mailles|rang|tricoter/i);
        
        console.log('✅ French instructions generated successfully!');
        console.log(`📊 Summary: ${result.summary?.totalInstructions} instructions, ${result.summary?.totalRows} rows`);
        
        console.log('\n🧥 Sleeve Instructions (French):');
        result.instructions.sleeve.slice(0, 3).forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });

        console.log('\n👕 Front Body Instructions (French):');
        result.instructions.front_body.slice(0, 3).forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });

        console.log('\n🔗 Assembly Instructions (French):');
        result.instructions.assembly.forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });
      }
    });
  });

  describe('English Instructions Generation', () => {
    const englishConfig: InstructionGenerationConfig = {
      includeStitchCounts: true,
      includeRowNumbers: true,
      useSpecificTechniques: true,
      language: 'en',
      verbosity: 'standard'
    };

    it('should generate complete English hammer sleeve instructions', () => {
      const result = instructionService.generateHammerSleeveInstructions(
        mockHammerSleeveCalculations,
        context,
        englishConfig
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.summary).toBeDefined();

      if (result.instructions) {
        // Verify sleeve instructions
        expect(result.instructions.sleeve).toBeDefined();
        expect(result.instructions.sleeve.length).toBeGreaterThan(0);
        
        // Verify front body instructions
        expect(result.instructions.front_body).toBeDefined();
        expect(result.instructions.front_body.length).toBeGreaterThan(0);
        
        // Verify assembly instructions
        expect(result.instructions.assembly).toBeDefined();
        expect(result.instructions.assembly.length).toBeGreaterThan(0);

        // Check that instructions are in English
        const firstSleeveInstruction = result.instructions.sleeve[0];
        expect(firstSleeveInstruction.text).toMatch(/stitches|row|knit/i);
        
        console.log('✅ English instructions generated successfully!');
        console.log(`📊 Summary: ${result.summary?.totalInstructions} instructions, ${result.summary?.totalRows} rows`);
        
        console.log('\n🧥 Sleeve Instructions (English):');
        result.instructions.sleeve.slice(0, 3).forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });

        console.log('\n👕 Front Body Instructions (English):');
        result.instructions.front_body.slice(0, 3).forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });

        console.log('\n🔗 Assembly Instructions (English):');
        result.instructions.assembly.forEach(instruction => {
          console.log(`  ${instruction.step}. ${instruction.text}`);
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing hammer sleeve calculations gracefully', () => {
      const invalidContext = { ...context, hammerSleeveCalculations: undefined };
      const config: InstructionGenerationConfig = {
        includeStitchCounts: true,
        includeRowNumbers: true,
        useSpecificTechniques: true,
        language: 'fr',
        verbosity: 'standard'
      };

      const result = instructionService.generateHammerSleeveInstructions(
        undefined as any,
        invalidContext,
        config
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 