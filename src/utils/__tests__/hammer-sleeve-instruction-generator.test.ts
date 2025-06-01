/**
 * Tests for Hammer Sleeve Instruction Generator (US_12.4)
 */

import {
  generateHammerSleeveInstructions,
  HammerSleeveInstructionContext,
  HammerSleeveInstructionResult
} from '../hammer-sleeve-instruction-generator';
import {
  HammerSleeveCalculations,
  HammerSleeveShaping,
  BodyPanelHammerArmholeShaping
} from '@/types/hammer-sleeve-construction';
import { InstructionGenerationConfig } from '@/types/instruction-generation';
import { ShapingSchedule } from '@/types/shaping';

describe('Hammer Sleeve Instruction Generator', () => {
  // Mock hammer sleeve calculations
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

  const baseConfig: InstructionGenerationConfig = {
    includeStitchCounts: true,
    includeRowNumbers: true,
    useSpecificTechniques: false,
    language: 'en',
    verbosity: 'standard'
  };

  const baseContext: HammerSleeveInstructionContext = {
    craftType: 'knitting',
    hammerSleeveCalculations: mockHammerSleeveCalculations,
    componentKey: 'hammer_sleeve_test',
    componentDisplayName: 'Test Hammer Sleeve',
    config: baseConfig
  };

  describe('generateHammerSleeveInstructions', () => {
    it('should generate complete hammer sleeve instructions successfully', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.sleeve).toBeDefined();
      expect(result.instructions!.front_body).toBeDefined();
      expect(result.instructions!.back_body).toBeDefined();
      expect(result.instructions!.assembly).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should generate sleeve instructions with proper structure', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const sleeveInstructions = result.instructions!.sleeve;
      expect(sleeveInstructions.length).toBeGreaterThan(0);
      
      // Should have cast-on instruction
      expect(sleeveInstructions[0].type).toBe('cast_on');
      expect(sleeveInstructions[0].text).toContain('Cast on 60 stitches');
      
      // Should have vertical part instruction
      const verticalInstruction = sleeveInstructions.find(i => i.type === 'hammer_sleeve_vertical');
      expect(verticalInstruction).toBeDefined();
      expect(verticalInstruction!.text).toContain('40 rows');
      expect(verticalInstruction!.text).toContain('vertical part of sleeve cap');
      
      // Should have extension instruction
      const extensionInstruction = sleeveInstructions.find(i => i.type === 'hammer_sleeve_extension');
      expect(extensionInstruction).toBeDefined();
      expect(extensionInstruction!.text).toContain('20 stitches');
      expect(extensionInstruction!.text).toContain('shoulder extension');
    });

    it('should generate body panel instructions with armhole cutout', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const frontBodyInstructions = result.instructions!.front_body;
      expect(frontBodyInstructions.length).toBeGreaterThan(0);
      
      // Should have cast-on instruction
      expect(frontBodyInstructions[0].type).toBe('cast_on');
      expect(frontBodyInstructions[0].text).toContain('Front: Cast on 170 stitches');
      
      // Should have armhole cutout instruction (FR3 key requirement)
      const cutoutInstruction = frontBodyInstructions.find(i => i.type === 'body_armhole_cutout');
      expect(cutoutInstruction).toBeDefined();
      expect(cutoutInstruction!.text).toContain('25 stitches (left shoulder strap)');
      expect(cutoutInstruction!.text).toContain('bind off 60 stitches (armhole cutout)');
      expect(cutoutInstruction!.text).toContain('25 stitches (right shoulder strap)');
      
      // Should have shoulder strap instructions
      const strapInstructions = frontBodyInstructions.filter(i => i.type === 'shoulder_strap_work');
      expect(strapInstructions.length).toBe(2); // left and right straps
    });

    it('should generate assembly instructions', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const assemblyInstructions = result.instructions!.assembly;
      expect(assemblyInstructions.length).toBeGreaterThan(0);
      
      // Should have join instruction
      const joinInstruction = assemblyInstructions.find(i => i.text.includes('Join sleeve extensions'));
      expect(joinInstruction).toBeDefined();
      
      // Should have seam instructions
      const seamInstruction = assemblyInstructions.find(i => i.text.includes('side seams'));
      expect(seamInstruction).toBeDefined();
      
      // Should have finishing instruction
      const finishingInstruction = assemblyInstructions.find(i => i.text.includes('Weave in all ends'));
      expect(finishingInstruction).toBeDefined();
    });

    it('should include correct stitch counts when enabled', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.stitchCount).toBe(60);
      expect(castOnInstruction.text).toContain('(60 sts)');
    });

    it('should generate instructions without stitch counts when disabled', () => {
      const configWithoutCounts = { ...baseConfig, includeStitchCounts: false };
      const contextWithoutCounts = { ...baseContext, config: configWithoutCounts };
      
      const result = generateHammerSleeveInstructions(contextWithoutCounts);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.stitchCount).toBeUndefined();
      expect(castOnInstruction.text).not.toContain('(60 sts)');
    });
  });

  describe('French language support', () => {
    const frenchConfig: InstructionGenerationConfig = {
      ...baseConfig,
      language: 'fr'
    };

    const frenchContext: HammerSleeveInstructionContext = {
      ...baseContext,
      config: frenchConfig
    };

    it('should generate French instructions for knitting', () => {
      const result = generateHammerSleeveInstructions(frenchContext);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.text).toContain('Monter 60 mailles');
      
      const verticalInstruction = sleeveInstructions.find(i => i.type === 'hammer_sleeve_vertical');
      expect(verticalInstruction!.text).toContain('Tricoter droit en Point Jersey');
      expect(verticalInstruction!.text).toContain('partie verticale de la tête de manche');
    });

    it('should generate French instructions for body panels', () => {
      const result = generateHammerSleeveInstructions(frenchContext);

      const frontBodyInstructions = result.instructions!.front_body;
      const cutoutInstruction = frontBodyInstructions.find(i => i.type === 'body_armhole_cutout');
      
      expect(cutoutInstruction!.text).toContain('bretelle d\'épaule gauche');
      expect(cutoutInstruction!.text).toContain('découpe emmanchure');
      expect(cutoutInstruction!.text).toContain('bretelle d\'épaule droite');
      expect(cutoutInstruction!.text).toContain('rabattre 60 mailles');
    });

    it('should generate French assembly instructions', () => {
      const result = generateHammerSleeveInstructions(frenchContext);

      const assemblyInstructions = result.instructions!.assembly;
      
      const joinInstruction = assemblyInstructions.find(i => i.text.includes('Joindre les extensions'));
      expect(joinInstruction).toBeDefined();
      expect(joinInstruction!.text).toContain('bretelles d\'épaule du corps');
      
      const seamInstruction = assemblyInstructions.find(i => i.text.includes('Coudre les coutures'));
      expect(seamInstruction).toBeDefined();
      
      const finishingInstruction = assemblyInstructions.find(i => i.text.includes('Rentrer tous les fils'));
      expect(finishingInstruction).toBeDefined();
    });
  });

  describe('Crochet support', () => {
    const crochetContext: HammerSleeveInstructionContext = {
      ...baseContext,
      craftType: 'crochet'
    };

    it('should generate crochet-specific instructions', () => {
      const result = generateHammerSleeveInstructions(crochetContext);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.text).toContain('Chain 61');
      expect(castOnInstruction.text).toContain('Single crochet in 2nd chain');
      
      const verticalInstruction = sleeveInstructions.find(i => i.type === 'hammer_sleeve_vertical');
      expect(verticalInstruction!.text).toContain('Single Crochet');
    });

    it('should generate French crochet instructions', () => {
      const frenchCrochetContext: HammerSleeveInstructionContext = {
        ...crochetContext,
        config: { ...baseConfig, language: 'fr' }
      };
      
      const result = generateHammerSleeveInstructions(frenchCrochetContext);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.text).toContain('Faire 61 mailles en l\'air');
      expect(castOnInstruction.text).toContain('Bride simple dans la 2e maille en l\'air');
      
      const verticalInstruction = sleeveInstructions.find(i => i.type === 'hammer_sleeve_vertical');
      expect(verticalInstruction!.text).toContain('Bride Simple');
    });
  });

  describe('Tapered sleeve integration (US_7.2/7.3)', () => {
    const mockShapingSchedule: ShapingSchedule = {
      shapingEvents: [
        {
          type: 'increase',
          totalStitchesToChange: 20,
          stitchesPerEvent: 2,
          numShapingEvents: 10,
          instructionsTextSimple: 'Increase 2 stitches every 4 rows 10 times',
          detailedBreakdown: [
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' },
            { actionRowOffset: 4, instruction: 'Increase row' }
          ]
        }
      ],
      hasShaping: true,
      totalShapingRows: 40
    };

    const contextWithShaping: HammerSleeveInstructionContext = {
      ...baseContext,
      sleeveShapingSchedule: mockShapingSchedule
    };

    it('should integrate tapered sleeve shaping instructions', () => {
      const result = generateHammerSleeveInstructions(contextWithShaping);

      const sleeveInstructions = result.instructions!.sleeve;
      
      // Should have shaping instructions
      const shapingInstructions = sleeveInstructions.filter(i => i.type === 'shaping_row');
      expect(shapingInstructions.length).toBeGreaterThan(0);
      
      // Should have increase instructions
      const increaseInstruction = shapingInstructions.find(i => i.text.includes('Increase Row'));
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('M1L');
      expect(increaseInstruction!.text).toContain('M1R');
    });

    it('should generate proper French tapered sleeve instructions', () => {
      const frenchContextWithShaping: HammerSleeveInstructionContext = {
        ...contextWithShaping,
        config: { ...baseConfig, language: 'fr' }
      };
      
      const result = generateHammerSleeveInstructions(frenchContextWithShaping);

      const sleeveInstructions = result.instructions!.sleeve;
      const shapingInstructions = sleeveInstructions.filter(i => i.type === 'shaping_row');
      
      const increaseInstruction = shapingInstructions.find(i => i.text.includes('augmentation'));
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('1 aug interc à gauche');
      expect(increaseInstruction!.text).toContain('1 aug interc à droite');
    });
  });

  describe('Metadata validation', () => {
    it('should include proper hammer sleeve metadata', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const sleeveInstructions = result.instructions!.sleeve;
      const castOnInstruction = sleeveInstructions[0];
      
      expect(castOnInstruction.metadata?.hammer_sleeve).toBeDefined();
      expect(castOnInstruction.metadata!.hammer_sleeve!.step_type).toBe('main_sleeve_cast_on');
      expect(castOnInstruction.metadata!.hammer_sleeve!.component).toBe('sleeve_main');
      expect(castOnInstruction.metadata!.hammer_sleeve!.component_width_stitches).toBe(60);
    });

    it('should include proper component metadata for body panels', () => {
      const result = generateHammerSleeveInstructions(baseContext);

      const frontBodyInstructions = result.instructions!.front_body;
      const cutoutInstruction = frontBodyInstructions.find(i => i.type === 'body_armhole_cutout');
      
      expect(cutoutInstruction!.metadata?.hammer_sleeve).toBeDefined();
      expect(cutoutInstruction!.metadata!.hammer_sleeve!.step_type).toBe('body_cutout_bind_off');
      expect(cutoutInstruction!.metadata!.hammer_sleeve!.component).toBe('body_front');
      expect(cutoutInstruction!.metadata!.hammer_sleeve!.bind_off_stitches).toBe(60);
    });
  });

  describe('Error handling', () => {
    it('should handle missing calculations gracefully', () => {
      const invalidContext = {
        ...baseContext,
        hammerSleeveCalculations: null as any
      };

      const result = generateHammerSleeveInstructions(invalidContext);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should provide meaningful error messages', () => {
      const invalidContext = {
        ...baseContext,
        hammerSleeveCalculations: {} as HammerSleeveCalculations
      };

      const result = generateHammerSleeveInstructions(invalidContext);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to generate hammer sleeve instructions');
    });
  });
}); 