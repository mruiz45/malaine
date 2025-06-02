import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { PatternOutline, PatternFoundations, GarmentOverview, ComponentBreakdown } from '@/types/patternDefinition';

/**
 * GET /api/pattern-definition-sessions/[id]/outline
 * Generate a structured outline/summary for a pattern definition session
 * Updated: Fixed params await and gauge_profiles column issues
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { id } = await params;

    // First, fetch the pattern definition session with basic joins
    // We'll handle the garment_types join separately in case the column doesn't exist
    const { data: session, error: sessionError } = await supabase
      .from('pattern_definition_sessions')
      .select(`
        *,
        gauge_profiles:selected_gauge_profile_id(profile_name),
        measurement_sets:selected_measurement_set_id(*),
        yarn_profiles:selected_yarn_profile_id(*),
        stitch_patterns:selected_stitch_pattern_id(*)
      `)
      .eq('id', id)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching pattern definition session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    // Try to fetch garment type information if the column exists
    let garmentType = null;
    try {
      // Check if the session has a selected_garment_type_id field
      if (session && 'selected_garment_type_id' in session && session.selected_garment_type_id) {
        const { data: garmentTypeData, error: garmentTypeError } = await supabase
          .from('garment_types')
          .select('display_name, description, metadata')
          .eq('id', session.selected_garment_type_id)
          .single();
        
        if (!garmentTypeError) {
          garmentType = garmentTypeData;
        }
      }
    } catch (error) {
      console.warn('Could not fetch garment type (this is normal if selected_garment_type_id column does not exist yet):', error);
    }

    // Fetch pattern definition components for this session
    const { data: components, error: componentsError } = await supabase
      .from('pattern_definition_components')
      .select(`
        *,
        garment_component_templates:component_template_id(component_key, display_name, description)
      `)
      .eq('pattern_definition_session_id', id)
      .order('sort_order');

    if (componentsError) {
      console.error('Error fetching pattern definition components:', componentsError);
      // Continue without components rather than failing completely
    }

    // Generate the pattern outline
    const outline = await generatePatternOutline(session, components || [], garmentType);

    return NextResponse.json({
      success: true,
      data: outline
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/pattern-definition-sessions/[id]/outline:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate pattern outline from session data
 */
async function generatePatternOutline(session: any, components: any[], garmentType: any = null): Promise<PatternOutline> {
  // Build foundations section
  const foundations: PatternFoundations = {};
  
  // Gauge information
  if (session.gauge_stitch_count && session.gauge_row_count) {
    foundations.gauge = {
      stitch_count: session.gauge_stitch_count,
      row_count: session.gauge_row_count,
      unit: session.gauge_unit || 'cm',
      profile_name: session.gauge_profiles?.profile_name
    };
  }

  // Measurement set information
  if (session.selected_measurement_set_id) {
    foundations.measurements = {
      set_name: session.measurement_sets?.name || session.measurement_sets?.set_name || session.measurement_sets?.title || 'Unknown Set',
      key_measurements: ['bust', 'waist', 'hip'] // Simplified for now
    };
  }

  // Ease information
  if (session.ease_type) {
    foundations.ease = {
      type: session.ease_type,
      value_bust: session.ease_value_bust,
      unit: session.ease_unit
    };
  }

  // Yarn information
  if (session.selected_yarn_profile_id) {
    foundations.yarn = {
      name: session.yarn_profiles?.name || session.yarn_profiles?.yarn_name || session.yarn_profiles?.brand || 'Unknown Yarn',
      weight: session.yarn_profiles?.weight || session.yarn_profiles?.yarn_weight,
      fiber: session.yarn_profiles?.fiber_content || session.yarn_profiles?.fiber
    };
  }

  // Stitch pattern information
  if (session.selected_stitch_pattern_id) {
    foundations.stitch_pattern = {
      name: session.stitch_patterns?.name || session.stitch_patterns?.pattern_name || session.stitch_patterns?.title || 'Unknown Pattern',
      repeat_info: session.stitch_patterns?.repeat_info
    };
  }

  // Build garment overview
  const garment_overview: GarmentOverview = {};
  try {
    if (session && 'selected_garment_type_id' in session && session.selected_garment_type_id && garmentType) {
      garment_overview.type = {
        name: garmentType.display_name || 'Unknown',
        description: garmentType.description,
        difficulty: garmentType.metadata?.difficulty_level
      };
      
      // Extract construction method from parameter snapshot if available
      if (session.parameter_snapshot?.sweater_structure?.construction_method) {
        garment_overview.construction_method = session.parameter_snapshot.sweater_structure.construction_method;
      }
    }
  } catch (error) {
    console.warn('Could not build garment overview:', error);
  }

  // Build component breakdown
  const component_breakdown: ComponentBreakdown[] = components.map(comp => {
    const breakdown: ComponentBreakdown = {
      label: comp.component_label || comp.garment_component_templates?.display_name || 'Unnamed Component',
      type: comp.garment_component_templates?.component_key || 'unknown',
      notes: comp.notes
    };

    // Extract style and parameters from selected_attributes
    if (comp.selected_attributes) {
      if (comp.selected_attributes.style) {
        breakdown.style = comp.selected_attributes.style;
      }
      breakdown.parameters = comp.selected_attributes;
    }

    return breakdown;
  });

  // Extract additional information from parameter snapshot
  let color_scheme;
  let morphology_notes;

  if (session.parameter_snapshot) {
    // Color scheme information (if US 5.1 was implemented)
    if (session.parameter_snapshot.color_scheme) {
      color_scheme = {
        name: session.parameter_snapshot.color_scheme.name,
        color_count: session.parameter_snapshot.color_scheme.colors?.length || 0,
        distribution: session.parameter_snapshot.color_scheme.distribution
      };
    }

    // Morphology notes (if morphology advisor was used)
    if (session.parameter_snapshot.morphology_advice) {
      morphology_notes = {
        characteristics: session.parameter_snapshot.morphology_advice.characteristics || [],
        advice_summary: session.parameter_snapshot.morphology_advice.summary
      };
    }
  }

  // Calculate completion status
  const total_sections = 5; // foundations, garment_overview, components, color_scheme, morphology_notes
  let completed_sections = 0;
  const missing_sections: string[] = [];

  if (Object.keys(foundations).length > 0) completed_sections++;
  else missing_sections.push('foundations');

  if (Object.keys(garment_overview).length > 0) completed_sections++;
  else missing_sections.push('garment_overview');

  if (component_breakdown.length > 0) completed_sections++;
  else missing_sections.push('components');

  if (color_scheme) completed_sections++;
  if (morphology_notes) completed_sections++;

  // Build the complete outline
  const outline: PatternOutline = {
    session_info: {
      id: session.id,
      name: session.session_name,
      status: session.status,
      last_updated: session.updated_at
    },
    foundations,
    garment_overview,
    components: component_breakdown,
    generated_at: new Date().toISOString(),
    completion_status: {
      total_sections,
      completed_sections,
      missing_sections
    }
  };

  // Add optional sections if they exist
  if (color_scheme) {
    outline.color_scheme = color_scheme;
  }

  if (morphology_notes) {
    outline.morphology_notes = morphology_notes;
  }

  return outline;
} 