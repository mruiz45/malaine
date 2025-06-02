import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type {
  StitchIntegrationRequest,
  StitchIntegrationAnalysis,
  IntegrationOption,
  StitchPatternForIntegration
} from '@/types/stitch-integration';

/**
 * POST /api/tools/stitch-pattern-integrator/analyze
 * Analyse l'intégration d'un motif de mailles dans un composant de vêtement
 * US_8.2 - Stitch Pattern Integration Advisor
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification
    const sessionResult = await getSupabaseSessionAppRouter(req);
    if (!sessionResult) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Parsing du body de la requête
    let requestBody: StitchIntegrationRequest;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      componentId,
      targetStitchCount,
      selectedStitchPatternId,
      desiredEdgeStitches
    } = requestBody;

    // Validation des paramètres
    if (!componentId || !selectedStitchPatternId || 
        targetStitchCount <= 0 || desiredEdgeStitches < 0) {
      return NextResponse.json(
        { error: 'Invalid parameters: componentId, selectedStitchPatternId required, targetStitchCount must be > 0, desiredEdgeStitches must be >= 0' },
        { status: 400 }
      );
    }

    // Récupération des données du motif de mailles
    // Essaie d'abord les patterns de l'utilisateur, puis les patterns de base
    let { data: stitchPattern, error: stitchPatternError } = await supabase
      .from('stitch_patterns')
      .select('id, name, stitch_repeat_width, row_repeat_height')
      .eq('id', selectedStitchPatternId)
      .eq('user_id', user.id)
      .single();

    // Si pas trouvé dans les patterns de l'utilisateur, chercher dans les patterns de base
    if (stitchPatternError || !stitchPattern) {
      const { data: basicPattern, error: basicPatternError } = await supabase
        .from('stitch_patterns')
        .select('id, name, stitch_repeat_width, row_repeat_height')
        .eq('id', selectedStitchPatternId)
        .is('user_id', null) // Patterns de base n'ont pas de user_id
        .single();

      if (basicPatternError || !basicPattern) {
        return NextResponse.json(
          { error: 'Stitch pattern not found or access denied' },
          { status: 404 }
        );
      }

      stitchPattern = basicPattern;
    }

    const stitchPatternData: StitchPatternForIntegration = stitchPattern;

    // Calculs d'intégration selon les spécifications US_8.2
    const analysis = calculateStitchIntegration(
      targetStitchCount,
      stitchPatternData.stitch_repeat_width,
      desiredEdgeStitches,
      stitchPatternData.name
    );

    return NextResponse.json(analysis, { status: 200 });

  } catch (error) {
    console.error('Error in stitch pattern integration analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error during analysis' },
      { status: 500 }
    );
  }
}

/**
 * Calcule l'intégration d'un motif de mailles selon l'algorithme US_8.2
 */
function calculateStitchIntegration(
  targetStitchCount: number,
  stitchRepeatWidth: number,
  desiredEdgeStitches: number,
  stitchPatternName: string
): StitchIntegrationAnalysis {
  // Algorithme principal selon spécifications US_8.2
  const availableWidthForPattern = targetStitchCount - (2 * desiredEdgeStitches);
  const numFullRepeats = Math.floor(availableWidthForPattern / stitchRepeatWidth);
  const stitchesUsedByRepeats = numFullRepeats * stitchRepeatWidth;
  const remainingStitches = availableWidthForPattern - stitchesUsedByRepeats;

  // Génération des options d'intégration
  const options: IntegrationOption[] = [];

  // Option 1: Centrer le motif avec stockinette sur les côtés
  if (numFullRepeats > 0) {
    const stockinetteEachSide = Math.floor(remainingStitches / 2);
    const extraStitch = remainingStitches % 2;
    
    options.push({
      type: 'center_with_stockinette',
      description: `Use ${numFullRepeats} repeats of "${stitchPatternName}", with ${stockinetteEachSide}${extraStitch > 0 ? '-' + (stockinetteEachSide + 1) : ''} stitches of stockinette on each side (plus ${desiredEdgeStitches} edge stitches)`,
      totalStitches: targetStitchCount,
      edgeStitchesEachSide: desiredEdgeStitches,
      stockinetteStitchesEachSide: stockinetteEachSide,
      centeringOffsetStitches: extraStitch
    });
  }

  // Option 2: Ajuster pour des répétitions complètes
  if (remainingStitches > 0) {
    const adjustedStitchCount = (numFullRepeats + 1) * stitchRepeatWidth + (2 * desiredEdgeStitches);
    options.push({
      type: 'adjust_for_full_repeats',
      description: `Adjust to ${adjustedStitchCount} total stitches for ${numFullRepeats + 1} complete repeats of "${stitchPatternName}" (plus ${desiredEdgeStitches} edge stitches each side)`,
      totalStitches: adjustedStitchCount,
      edgeStitchesEachSide: desiredEdgeStitches,
      centeringOffsetStitches: 0
    });
  }

  // Si aucune répétition ne rentre, proposer d'augmenter le nombre de mailles
  if (numFullRepeats === 0) {
    const minRequiredStitches = stitchRepeatWidth + (2 * desiredEdgeStitches);
    options.push({
      type: 'adjust_for_full_repeats',
      description: `Pattern too wide for current stitch count. Increase to at least ${minRequiredStitches} stitches for 1 complete repeat of "${stitchPatternName}"`,
      totalStitches: minRequiredStitches,
      edgeStitchesEachSide: desiredEdgeStitches,
      centeringOffsetStitches: 0
    });
  }

  const suggestedAdjustedStitchCount = options.length > 1 ? 
    options[1].totalStitches : targetStitchCount;

  return {
    fullRepeats: numFullRepeats,
    remainingStitches,
    suggestedAdjustedStitchCount,
    options,
    availableWidthForPattern,
    stitchesUsedByRepeats
  };
} 