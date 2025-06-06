import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type {
  ComponentStitchPatternIntegration,
  UpdateComponentResponse
} from '@/types/stitch-integration';

/**
 * PUT /api/pattern-definition-sessions/[id]/components/[componentId]
 * Met à jour un composant avec les détails d'intégration de motif de mailles
 * US_8.2 - Stitch Pattern Integration Advisor
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
): Promise<NextResponse> {
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
    const { id: sessionId, componentId } = await params;

    // Validation des paramètres de route
    if (!sessionId || !componentId) {
      return NextResponse.json(
        { error: 'Session ID and Component ID are required' },
        { status: 400 }
      );
    }

    // Parsing du body de la requête
    let integrationData: ComponentStitchPatternIntegration;
    try {
      const body = await req.json();
      integrationData = body.integration;
      
      if (!integrationData) {
        return NextResponse.json(
          { error: 'Integration data is required' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validation des données d'intégration
    const requiredFields = [
      'stitch_pattern_id',
      'applied_stitch_pattern_name',
      'adjusted_component_stitch_count',
      'edge_stitches_each_side',
      'centering_offset_stitches',
      'integration_type',
      'full_repeats_count'
    ];

    for (const field of requiredFields) {
      if (integrationData[field as keyof ComponentStitchPatternIntegration] === undefined || 
          integrationData[field as keyof ComponentStitchPatternIntegration] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Vérification que la session appartient à l'utilisateur
    const { data: session, error: sessionError } = await supabase
      .from('pattern_definition_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Pattern definition session not found or access denied' },
        { status: 404 }
      );
    }

    // Récupération du composant existant
    const { data: existingComponent, error: componentError } = await supabase
      .from('pattern_definition_components')
      .select('*')
      .eq('id', componentId)
      .eq('session_id', sessionId)
      .single();

    if (componentError || !existingComponent) {
      return NextResponse.json(
        { error: 'Component not found in this session' },
        { status: 404 }
      );
    }

    // Préparation des attributs sélectionnés mis à jour
    const currentAttributes = existingComponent.selected_attributes || {};
    const updatedAttributes = {
      ...currentAttributes,
      stitch_pattern_integration: integrationData
    };

    // Mise à jour du composant
    const { data: updatedComponent, error: updateError } = await supabase
      .from('pattern_definition_components')
      .update({
        selected_attributes: updatedAttributes,
        updated_at: new Date().toISOString()
      })
      .eq('id', componentId)
      .eq('session_id', sessionId)
      .select('id, name, selected_attributes')
      .single();

    if (updateError) {
      console.error('Error updating component with stitch pattern integration:', updateError);
      return NextResponse.json(
        { error: 'Failed to update component' },
        { status: 500 }
      );
    }

    // Préparation de la réponse
    const response: UpdateComponentResponse = {
      success: true,
      message: 'Component updated successfully with stitch pattern integration',
      updatedComponent: {
        id: updatedComponent.id,
        name: updatedComponent.name,
        target_stitch_count: integrationData.adjusted_component_stitch_count,
        selected_attributes: updatedComponent.selected_attributes?.stitch_pattern_integration
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error in component stitch pattern integration update:', error);
    return NextResponse.json(
      { error: 'Internal server error during update' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pattern-definition-sessions/[id]/components/[componentId]
 * Récupère les détails d'un composant spécifique
 * Utile pour l'interface utilisateur pour afficher l'état actuel
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; componentId: string }> }
): Promise<NextResponse> {
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
    const { id: sessionId, componentId } = await params;

    // Validation des paramètres de route
    if (!sessionId || !componentId) {
      return NextResponse.json(
        { error: 'Session ID and Component ID are required' },
        { status: 400 }
      );
    }

    // Vérification que la session appartient à l'utilisateur
    const { data: session, error: sessionError } = await supabase
      .from('pattern_definition_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Pattern definition session not found or access denied' },
        { status: 404 }
      );
    }

    // Récupération du composant
    const { data: component, error: componentError } = await supabase
      .from('pattern_definition_components')
      .select('*')
      .eq('id', componentId)
      .eq('session_id', sessionId)
      .single();

    if (componentError || !component) {
      return NextResponse.json(
        { error: 'Component not found in this session' },
        { status: 404 }
      );
    }

    // Préparation de la réponse
    const response = {
      success: true,
      component: {
        id: component.id,
        name: component.name,
        component_type: component.component_type,
        selected_attributes: component.selected_attributes,
        stitch_pattern_integration: component.selected_attributes?.stitch_pattern_integration || null
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 