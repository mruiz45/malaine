/**
 * Tests for Armhole Instruction Generator Utilities (US_11.4)
 * Validates generation of textual instructions for complex armhole shaping
 */

import {
  generateArmholeBaseBindOffInstruction,
  generateArmholeBaseBindOffNextRowInstruction,
  generateArmholeShapingInstruction,
  generateRaglanShapingInstruction,
  generateArmholeRepeatInstructionText,
  generateSleeveCapIncreaseInstruction,
  generateSleeveCapDecreaseInstruction,
  calculateStitchesAfterArmholeAction,
  determineArmholeRowSide,
  generateArmholePlainRowInstruction,
  SleeveCapIncreaseAction
} from '../armhole-instruction-generator';
import { ArmholeShapingAction } from '@/types/armhole-shaping';
import { InstructionGenerationConfig } from '@/types/instruction-generation';

// Standard test configuration
const standardConfig: InstructionGenerationConfig = {
  includeStitchCounts: true,
  includeRowNumbers: true,
  useSpecificTechniques: false,
  language: 'en',
  verbosity: 'standard'
};

const frenchConfig: InstructionGenerationConfig = {
  ...standardConfig,
  language: 'fr'
};

const specificTechniquesConfig: InstructionGenerationConfig = {
  ...standardConfig,
  useSpecificTechniques: true
};

describe('Armhole Instruction Generator (US_11.4)', () => {

  describe('generateArmholeBaseBindOffInstruction', () => {
    it('should generate base bind-off instruction in English', () => {
      const result = generateArmholeBaseBindOffInstruction(3, 1, 'knitting', standardConfig);
      
      expect(result).toContain('Row 1 (RS) - Begin armhole shaping');
      expect(result).toContain('bind off 3 sts at beginning of row');
      expect(result).toContain('knit to last 3 sts');
      expect(result).toContain('bind off last 3 sts');
    });

    it('should generate base bind-off instruction in French', () => {
      const result = generateArmholeBaseBindOffInstruction(3, 1, 'knitting', frenchConfig);
      
      expect(result).toContain('Rang 1 (Endroit) - Commencer le façonnage des emmanchures');
      expect(result).toContain('rabattre 3 m au début du rang');
      expect(result).toContain('tricoter à l\'endroit jusqu\'à 3 m de la fin');
      expect(result).toContain('rabattre les 3 dernières m');
    });

    it('should handle single stitch correctly', () => {
      const result = generateArmholeBaseBindOffInstruction(1, 1, 'knitting', standardConfig);
      
      expect(result).toContain('bind off 1 st at beginning');
      expect(result).toContain('last 1 st');
    });

    it('should work for crochet', () => {
      const result = generateArmholeBaseBindOffInstruction(3, 1, 'crochet', standardConfig);
      
      expect(result).toContain('fasten off 3 sts');
      expect(result).toContain('single crochet to last');
    });
  });

  describe('generateArmholeShapingInstruction', () => {
    const decreaseAction: ArmholeShapingAction = {
      action: 'decrease',
      stitches: 1,
      side_of_fabric: 'RS',
      on_row_from_start_of_shaping: 3
    };

    it('should generate decrease instruction with generic techniques', () => {
      const result = generateArmholeShapingInstruction(
        decreaseAction,
        3,
        84,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Row 3 (RS - Decrease)');
      expect(result).toContain('decrease 1 st at each end');
      expect(result).toContain('(84 sts)');
    });

    it('should generate decrease instruction with specific techniques', () => {
      const result = generateArmholeShapingInstruction(
        decreaseAction,
        3,
        84,
        'knitting',
        specificTechniquesConfig
      );
      
      expect(result).toContain('k1, ssk, knit to last 3 sts, k2tog, k1');
      expect(result).toContain('(84 sts)');
    });

    it('should generate instruction in French', () => {
      const result = generateArmholeShapingInstruction(
        decreaseAction,
        3,
        84,
        'knitting',
        frenchConfig
      );
      
      expect(result).toContain('Rang 3 (Endroit - Diminution)');
      expect(result).toContain('diminuer 1 m de chaque côté');
      expect(result).toContain('(84 m)');
    });

    it('should handle bind-off actions', () => {
      const bindOffAction: ArmholeShapingAction = {
        action: 'bind_off',
        stitches: 2,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 5
      };

      const result = generateArmholeShapingInstruction(
        bindOffAction,
        5,
        80,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Row 5 (RS)');
      expect(result).toContain('bind off 2 sts at both ends');
      expect(result).toContain('(80 sts)');
    });
  });

  describe('generateRaglanShapingInstruction', () => {
    const raglanAction: ArmholeShapingAction = {
      action: 'decrease',
      stitches: 1,
      side_of_fabric: 'RS',
      on_row_from_start_of_shaping: 1
    };

    it('should generate raglan instruction with generic techniques', () => {
      const result = generateRaglanShapingInstruction(
        raglanAction,
        1,
        94,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Row 1 (RS - Raglan)');
      expect(result).toContain('decrease 1 st each side of raglan marker');
      expect(result).toContain('(94 sts)');
    });

    it('should generate raglan instruction with specific techniques', () => {
      const result = generateRaglanShapingInstruction(
        raglanAction,
        1,
        94,
        'knitting',
        specificTechniquesConfig
      );
      
      expect(result).toContain('knit to 2 sts before raglan marker, ssk');
      expect(result).toContain('slip marker, k2tog');
      expect(result).toContain('continue in pattern to next marker');
    });

    it('should generate raglan instruction in French', () => {
      const result = generateRaglanShapingInstruction(
        raglanAction,
        1,
        94,
        'knitting',
        frenchConfig
      );
      
      expect(result).toContain('Rang 1 (Endroit - Raglan)');
      expect(result).toContain('diminuer 1 m de chaque côté du marqueur raglan');
      expect(result).toContain('(94 m)');
    });
  });

  describe('generateArmholeRepeatInstructionText', () => {
    const repeatAction: ArmholeShapingAction = {
      action: 'decrease',
      stitches: 1,
      side_of_fabric: 'RS',
      on_row_from_start_of_shaping: 1,
      repeats: 5,
      every_x_rows: 2
    };

    it('should generate repeat instruction in English', () => {
      const result = generateArmholeRepeatInstructionText(
        repeatAction,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Repeat armhole decreases every 2 rows 4 more times');
    });

    it('should generate repeat instruction in French', () => {
      const result = generateArmholeRepeatInstructionText(
        repeatAction,
        'knitting',
        frenchConfig
      );
      
      expect(result).toContain('Répéter diminution aux emmanchures tous les 2 rangs encore 4 fois');
    });

    it('should return empty string for single occurrence', () => {
      const singleAction: ArmholeShapingAction = {
        ...repeatAction,
        repeats: 1
      };

      const result = generateArmholeRepeatInstructionText(
        singleAction,
        'knitting',
        standardConfig
      );
      
      expect(result).toBe('');
    });
  });

  describe('generateSleeveCapIncreaseInstruction', () => {
    const increaseAction: SleeveCapIncreaseAction = {
      action: 'increase',
      stitches: 1,
      side_of_fabric: 'RS',
      on_row_from_start_of_shaping: 1
    };

    it('should generate sleeve cap increase with generic techniques', () => {
      const result = generateSleeveCapIncreaseInstruction(
        increaseAction,
        1,
        42,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Row 1 (RS - sleeve cap Increase)');
      expect(result).toContain('increase 1 st at each end');
      expect(result).toContain('(42 sts)');
    });

    it('should generate sleeve cap increase with specific techniques', () => {
      const result = generateSleeveCapIncreaseInstruction(
        increaseAction,
        1,
        42,
        'knitting',
        specificTechniquesConfig
      );
      
      expect(result).toContain('k1, M1L, knit to last st, M1R, k1');
      expect(result).toContain('(42 sts)');
    });

    it('should generate instruction in French', () => {
      const result = generateSleeveCapIncreaseInstruction(
        increaseAction,
        1,
        42,
        'knitting',
        frenchConfig
      );
      
      expect(result).toContain('Rang 1 (Endroit - tête de manche Augmentation)');
      expect(result).toContain('augmenter 1 m de chaque côté');
      expect(result).toContain('(42 m)');
    });
  });

  describe('generateSleeveCapDecreaseInstruction', () => {
    const decreaseAction: ArmholeShapingAction = {
      action: 'decrease',
      stitches: 1,
      side_of_fabric: 'RS',
      on_row_from_start_of_shaping: 10
    };

    it('should generate sleeve cap decrease instruction', () => {
      const result = generateSleeveCapDecreaseInstruction(
        decreaseAction,
        10,
        38,
        'knitting',
        standardConfig
      );
      
      expect(result).toContain('Row 10 (RS - sleeve cap Decrease)');
      expect(result).toContain('decrease 1 st at each end');
      expect(result).toContain('(38 sts)');
    });

    it('should generate instruction with specific techniques', () => {
      const result = generateSleeveCapDecreaseInstruction(
        decreaseAction,
        10,
        38,
        'knitting',
        specificTechniquesConfig
      );
      
      expect(result).toContain('k1, ssk, knit to last 3 sts, k2tog, k1');
    });
  });

  describe('calculateStitchesAfterArmholeAction', () => {
    it('should calculate stitches after decrease action', () => {
      const decreaseAction: ArmholeShapingAction = {
        action: 'decrease',
        stitches: 1,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 1
      };

      const result = calculateStitchesAfterArmholeAction(100, decreaseAction);
      expect(result).toBe(98); // 100 - (1 * 2) = 98 (both sides)
    });

    it('should calculate stitches after bind-off action', () => {
      const bindOffAction: ArmholeShapingAction = {
        action: 'bind_off',
        stitches: 3,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 1
      };

      const result = calculateStitchesAfterArmholeAction(100, bindOffAction);
      expect(result).toBe(94); // 100 - (3 * 2) = 94 (both sides)
    });

    it('should calculate stitches after increase action (sleeve cap)', () => {
      const increaseAction: SleeveCapIncreaseAction = {
        action: 'increase',
        stitches: 1,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 1
      };

      const result = calculateStitchesAfterArmholeAction(40, increaseAction);
      expect(result).toBe(42); // 40 + (1 * 2) = 42 (both sides)
    });

    it('should handle repeated actions', () => {
      const repeatAction: ArmholeShapingAction = {
        action: 'decrease',
        stitches: 1,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 1,
        repeats: 3
      };

      const result = calculateStitchesAfterArmholeAction(100, repeatAction);
      expect(result).toBe(94); // 100 - (1 * 3 * 2) = 94
    });
  });

  describe('determineArmholeRowSide', () => {
    it('should determine odd rows as RS', () => {
      expect(determineArmholeRowSide(1)).toBe(true);
      expect(determineArmholeRowSide(3)).toBe(true);
      expect(determineArmholeRowSide(5)).toBe(true);
    });

    it('should determine even rows as WS', () => {
      expect(determineArmholeRowSide(2)).toBe(false);
      expect(determineArmholeRowSide(4)).toBe(false);
      expect(determineArmholeRowSide(6)).toBe(false);
    });
  });

  describe('generateArmholePlainRowInstruction', () => {
    it('should generate plain row instruction for RS', () => {
      const result = generateArmholePlainRowInstruction(3, 'knitting', standardConfig);
      
      expect(result).toContain('Row 3 (RS)');
      expect(result).toContain('knit knit to end');
    });

    it('should generate plain row instruction for WS', () => {
      const result = generateArmholePlainRowInstruction(4, 'knitting', standardConfig);
      
      expect(result).toContain('Row 4 (WS)');
      expect(result).toContain('purl knit to end');
    });

    it('should generate plain row instruction in French', () => {
      const result = generateArmholePlainRowInstruction(3, 'knitting', frenchConfig);
      
      expect(result).toContain('Rang 3 (Endroit)');
      expect(result).toContain('tricoter à l\'endroit tricoter jusqu\'à la fin');
    });

    it('should work for crochet', () => {
      const result = generateArmholePlainRowInstruction(3, 'crochet', standardConfig);
      
      expect(result).toContain('single crochet single crochet to end');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero stitches in bind-off', () => {
      const result = generateArmholeBaseBindOffInstruction(0, 1, 'knitting', standardConfig);
      
      expect(result).toContain('bind off 0 st');
    });

    it('should handle missing repeats in repeat instruction', () => {
      const actionWithoutRepeats: ArmholeShapingAction = {
        action: 'decrease',
        stitches: 1,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 1,
        every_x_rows: 2
      };

      const result = generateArmholeRepeatInstructionText(
        actionWithoutRepeats,
        'knitting',
        standardConfig
      );
      
      expect(result).toBe('');
    });

    it('should handle config without stitch counts', () => {
      const noStitchCountConfig: InstructionGenerationConfig = {
        ...standardConfig,
        includeStitchCounts: false
      };

      const decreaseAction: ArmholeShapingAction = {
        action: 'decrease',
        stitches: 1,
        side_of_fabric: 'RS',
        on_row_from_start_of_shaping: 3
      };

      const result = generateArmholeShapingInstruction(
        decreaseAction,
        3,
        84,
        'knitting',
        noStitchCountConfig
      );
      
      expect(result).not.toContain('(84 sts)');
      expect(result).toContain('decrease 1 st at each end');
    });
  });
}); 