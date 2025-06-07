/**
 * Interdependency Resolver (PD_PH6_US002)
 * Resolves interdependencies between pattern pieces and calculations
 */

import {
  CalculationContext,
  InterdependencyResolutionResult
} from '@/types/core-pattern-calculation';

/**
 * Resolves interdependencies between different pattern calculators
 * Handles cases like raglan sleeves requiring body recalculation
 */
export class InterdependencyResolver {

  /**
   * Resolve interdependencies in the calculation context
   */
  async resolve(
    context: CalculationContext, 
    currentPieces: Record<string, any>
  ): Promise<InterdependencyResolutionResult> {
    try {
      const actions: string[] = [];
      const warnings: string[] = [];
      let resolvedContext = { ...context };

      // Check for raglan construction interdependencies
      const raglanResolution = this.resolveRaglanInterdependencies(resolvedContext, currentPieces);
      if (raglanResolution.actions.length > 0) {
        resolvedContext = raglanResolution.context;
        actions.push(...raglanResolution.actions);
        warnings.push(...raglanResolution.warnings);
      }

      // Check for armhole interdependencies
      const armholeResolution = this.resolveArmholeInterdependencies(resolvedContext, currentPieces);
      if (armholeResolution.actions.length > 0) {
        resolvedContext = armholeResolution.context;
        actions.push(...armholeResolution.actions);
        warnings.push(...armholeResolution.warnings);
      }

      // Check for neckline interdependencies
      const necklineResolution = this.resolveNecklineInterdependencies(resolvedContext, currentPieces);
      if (necklineResolution.actions.length > 0) {
        resolvedContext = necklineResolution.context;
        actions.push(...necklineResolution.actions);
        warnings.push(...necklineResolution.warnings);
      }

      return {
        success: true,
        resolvedContext,
        actions,
        warnings
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Interdependency resolution error';
      return {
        success: false,
        resolvedContext: context,
        actions: [],
        errors: [errorMessage]
      };
    }
  }

  /**
   * Resolve raglan construction interdependencies
   * Raglan sleeves require coordination between body and sleeve calculations
   */
  private resolveRaglanInterdependencies(
    context: CalculationContext,
    pieces: Record<string, any>
  ): { context: CalculationContext; actions: string[]; warnings: string[] } {
    const actions: string[] = [];
    const warnings: string[] = [];
    let updatedContext = { ...context };

    // Check if this is a raglan construction
    const constructionMethod = context.patternState.bodyStructure?.constructionMethod;
    if (constructionMethod?.toLowerCase().includes('raglan')) {
      
      // Check if we have both body and sleeve pieces
      const hasBodyPieces = pieces.frontBody || pieces.backBody;
      const hasSleevePieces = pieces.leftSleeve || pieces.rightSleeve;

      if (hasBodyPieces && hasSleevePieces) {
        // Coordinate raglan line lengths
        const bodyArmholeDepth = this.extractArmholeDepth(pieces.frontBody || pieces.backBody);
        const sleeveCapHeight = this.extractSleeveCapHeight(pieces.leftSleeve || pieces.rightSleeve);

        if (bodyArmholeDepth && sleeveCapHeight) {
          const difference = Math.abs(bodyArmholeDepth - sleeveCapHeight);
          if (difference > 1) { // More than 1cm difference
            // Mark for recalculation
            updatedContext.interdependencies.raglanRequiresAdjustment = true;
            updatedContext.interdependencies.targetRaglanLength = (bodyArmholeDepth + sleeveCapHeight) / 2;
            
            actions.push('Raglan line length coordination required');
            warnings.push(`Raglan line mismatch detected: ${difference.toFixed(1)}cm difference`);
          }
        }
      }

      // Check for armhole recalculation flag
      if (context.patternState.bodyStructure?.parameters?.armholeRequiresRecalculation) {
        updatedContext.interdependencies.armholeRecalculationRequired = true;
        actions.push('Armhole recalculation triggered for raglan construction');
      }
    }

    return { context: updatedContext, actions, warnings };
  }

  /**
   * Resolve armhole interdependencies
   * Armholes must be compatible with sleeve cap measurements
   */
  private resolveArmholeInterdependencies(
    context: CalculationContext,
    pieces: Record<string, any>
  ): { context: CalculationContext; actions: string[]; warnings: string[] } {
    const actions: string[] = [];
    const warnings: string[] = [];
    let updatedContext = { ...context };

    // Check if we have both body and sleeve pieces
    const bodyPiece = pieces.frontBody || pieces.backBody;
    const sleevePiece = pieces.leftSleeve || pieces.rightSleeve;

    if (bodyPiece && sleevePiece) {
      // Extract armhole and sleeve cap measurements
      const armholeWidth = this.extractArmholeWidth(bodyPiece);
      const sleeveCapWidth = this.extractSleeveCapWidth(sleevePiece);

      if (armholeWidth && sleeveCapWidth) {
        const difference = Math.abs(armholeWidth - sleeveCapWidth);
        const tolerance = 2; // 2cm tolerance

        if (difference > tolerance) {
          // Mark for adjustment
          updatedContext.interdependencies.armholeWidthAdjustment = true;
          updatedContext.interdependencies.targetArmholeWidth = (armholeWidth + sleeveCapWidth) / 2;
          
          actions.push('Armhole width adjustment required for sleeve compatibility');
          warnings.push(`Armhole/sleeve cap mismatch: ${difference.toFixed(1)}cm difference`);
        }
      }
    }

    return { context: updatedContext, actions, warnings };
  }

  /**
   * Resolve neckline interdependencies
   * Neckline shaping must coordinate with body piece calculations
   */
  private resolveNecklineInterdependencies(
    context: CalculationContext,
    pieces: Record<string, any>
  ): { context: CalculationContext; actions: string[]; warnings: string[] } {
    const actions: string[] = [];
    const warnings: string[] = [];
    let updatedContext = { ...context };

    // Check if we have both body and neckline pieces
    const bodyPiece = pieces.frontBody || pieces.backBody;
    const necklinePiece = pieces.necklineShaping;

    if (bodyPiece && necklinePiece) {
      // Extract shoulder width from body
      const bodyShoulderWidth = this.extractShoulderWidth(bodyPiece);
      const necklineWidth = necklinePiece.finishedDimensions?.width_cm;

      if (bodyShoulderWidth && necklineWidth) {
        // Check if neckline is appropriate for shoulder width
        const ratio = necklineWidth / bodyShoulderWidth;
        if (ratio > 0.7) { // Neckline is more than 70% of shoulder width
          warnings.push('Neckline may be too wide for shoulder width');
          updatedContext.interdependencies.necklineWidthWarning = true;
        }
      }
    }

    return { context: updatedContext, actions, warnings };
  }

  /**
   * Extract armhole depth from body piece
   */
  private extractArmholeDepth(bodyPiece: any): number | null {
    if (!bodyPiece?.shaping) return null;
    
    const armholeShaping = bodyPiece.shaping.find((s: any) => s.type === 'armhole');
    if (armholeShaping) {
      const rows = armholeShaping.endRow - armholeShaping.startRow;
      // Convert rows to cm (assuming average gauge)
      return rows * 0.35; // Approximate conversion
    }
    
    return null;
  }

  /**
   * Extract sleeve cap height from sleeve piece
   */
  private extractSleeveCapHeight(sleevePiece: any): number | null {
    if (!sleevePiece?.shaping) return null;
    
    const capShaping = sleevePiece.shaping.find((s: any) => s.type === 'sleeveCap');
    if (capShaping) {
      const rows = capShaping.endRow - capShaping.startRow;
      // Convert rows to cm (assuming average gauge)
      return rows * 0.35; // Approximate conversion
    }
    
    return null;
  }

  /**
   * Extract armhole width from body piece
   */
  private extractArmholeWidth(bodyPiece: any): number | null {
    if (!bodyPiece?.shaping) return null;
    
    const armholeShaping = bodyPiece.shaping.find((s: any) => s.type === 'armhole');
    if (armholeShaping) {
      // Estimate width from stitch count change
      const stitchReduction = Math.abs(armholeShaping.stitchCountChange);
      // Convert to cm (assuming average gauge)
      return stitchReduction * 0.25; // Approximate conversion
    }
    
    return bodyPiece.finishedDimensions?.width_cm || null;
  }

  /**
   * Extract sleeve cap width from sleeve piece
   */
  private extractSleeveCapWidth(sleevePiece: any): number | null {
    return sleevePiece.finishedDimensions?.width_cm || null;
  }

  /**
   * Extract shoulder width from body piece
   */
  private extractShoulderWidth(bodyPiece: any): number | null {
    // For basic calculation, use final stitch count as approximation
    if (bodyPiece.finalStitchCount) {
      // Convert stitches to cm (assuming average gauge)
      return bodyPiece.finalStitchCount * 0.25; // Approximate conversion
    }
    
    return bodyPiece.finishedDimensions?.width_cm || null;
  }
} 