/**
 * Pattern Assembly 2D Visualization API Route (US_12.9)
 * Generates assembly visualization data with edge metadata and connections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { 
  GarmentAssemblyData, 
  AssemblyDataGenerationResponse,
  AssemblyComponent,
  ComponentEdge,
  AssemblyConnection 
} from '@/types/assembly-visualization';
import { SchematicDiagram } from '@/types/schematics';

/**
 * GET /api/pattern-assembly/[sessionId]
 * Retrieves or generates 2D assembly visualization data for a pattern session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase: supabaseServer } = sessionResult;

    // Parse query parameters
    const url = new URL(request.url);
    const includeEdges = url.searchParams.get('include_edges') !== 'false';
    const autoLayout = url.searchParams.get('auto_layout') !== 'false';

    // Fetch pattern session data
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from('pattern_definition_sessions')
      .select(`
        id,
        garment_type_key,
        craft_type,
        target_size_label,
        created_at,
        garment_types!inner(
          type_key,
          display_name,
          construction_method
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Generate assembly visualization data
    const assemblyData = await generateAssemblyVisualizationData(
      supabaseServer,
      sessionData,
      { include_edges: includeEdges, auto_layout: autoLayout }
    );

    const response: AssemblyDataGenerationResponse = {
      success: true,
      data: assemblyData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in pattern assembly API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Generates assembly visualization data for a pattern session
 */
async function generateAssemblyVisualizationData(
  supabaseServer: any,
  sessionData: any,
  options: { include_edges?: boolean; auto_layout?: boolean }
): Promise<GarmentAssemblyData> {
  
  // Fetch component calculation results
  const { data: calculations, error: calcError } = await supabaseServer
    .from('pattern_calculation_results')
    .select(`
      id,
      component_key,
      component_display_name,
      cast_on_stitches,
      total_rows,
      target_width_cm,
      target_length_cm,
      actual_width_cm,
      actual_length_cm
    `)
    .eq('session_id', sessionData.id);

  if (calcError) {
    throw new Error(`Failed to fetch calculations: ${calcError.message}`);
  }

  if (!calculations || calculations.length === 0) {
    throw new Error('No calculation results found for session');
  }

  // Generate components with schematics and assembly metadata
  const components: AssemblyComponent[] = [];
  const connections: AssemblyConnection[] = [];

  for (const calc of calculations) {
    // Generate schematic for this component
    const schematic = await generateComponentSchematic(calc);
    
    // Generate edge metadata if requested
    const edges = options.include_edges 
      ? await generateComponentEdges(calc, sessionData.garment_types.construction_method)
      : [];

    // Determine layout position
    const layout = options.auto_layout 
      ? generateAutoLayout(calc.component_key, components.length)
      : generateDefaultLayout(calc.component_key);

    const component: AssemblyComponent = {
      component_key: calc.component_key,
      component_name: calc.component_display_name,
      schematic,
      edges,
      layout,
      dimensions: {
        width: calc.actual_width_cm || calc.target_width_cm || 50,
        height: calc.actual_length_cm || calc.target_length_cm || 60
      }
    };

    components.push(component);
  }

  // Generate assembly connections if edges are included
  if (options.include_edges) {
    const assemblyConnections = generateAssemblyConnections(
      components, 
      sessionData.garment_types.construction_method
    );
    connections.push(...assemblyConnections);
  }

  return {
    session_id: sessionData.id,
    garment_type: sessionData.garment_types.display_name,
    components,
    connections,
    default_layout: {
      canvas_width: 1000,
      canvas_height: 800,
      auto_arrange: options.auto_layout || false
    },
    generated_at: new Date().toISOString()
  };
}

/**
 * Generates a basic schematic for a component
 * This is a simplified implementation - in practice would use US_9.3 schematic generation
 */
async function generateComponentSchematic(calculation: any): Promise<SchematicDiagram> {
  const width = calculation.actual_width_cm || calculation.target_width_cm || 50;
  const height = calculation.actual_length_cm || calculation.target_length_cm || 60;
  
  // Generate simple rectangular SVG schematic
  const svgContent = `
    <svg viewBox="0 0 ${width + 20} ${height + 20}" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="${width}" height="${height}" 
            fill="none" stroke="#374151" stroke-width="2"/>
      <text x="${width/2 + 10}" y="${height + 15}" 
            text-anchor="middle" font-size="12" fill="#374151">
        ${calculation.component_display_name}
      </text>
      <text x="5" y="${height/2 + 10}" 
            text-anchor="middle" font-size="10" fill="#6B7280" 
            transform="rotate(-90, 5, ${height/2 + 10})">
        ${height} cm
      </text>
      <text x="${width/2 + 10}" y="8" 
            text-anchor="middle" font-size="10" fill="#6B7280">
        ${width} cm
      </text>
    </svg>
  `;

  return {
    id: `schematic_${calculation.component_key}_${Date.now()}`,
    componentName: calculation.component_display_name,
    shape: 'rectangle',
    svgContent: svgContent.trim(),
    viewBox: {
      width: width + 20,
      height: height + 20
    },
    generatedAt: new Date().toISOString()
  };
}

/**
 * Generates edge metadata for a component based on garment construction
 */
async function generateComponentEdges(
  calculation: any, 
  constructionMethod: string
): Promise<ComponentEdge[]> {
  const edges: ComponentEdge[] = [];
  const componentKey = calculation.component_key;
  const width = calculation.actual_width_cm || calculation.target_width_cm || 50;
  const height = calculation.actual_length_cm || calculation.target_length_cm || 60;

  // Generate basic edges based on component type and construction method
  if (componentKey.includes('back') || componentKey.includes('front')) {
    // Body panel edges
    edges.push(
      {
        edge_id: `${componentKey}_shoulder_left`,
        edge_type: 'shoulder',
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: width * 0.3, // Approximate shoulder width
        connection_points: [{ x: width * 0.2, y: 0 }, { x: width * 0.5, y: 0 }]
      },
      {
        edge_id: `${componentKey}_shoulder_right`,
        edge_type: 'shoulder', 
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: width * 0.3,
        connection_points: [{ x: width * 0.5, y: 0 }, { x: width * 0.8, y: 0 }]
      },
      {
        edge_id: `${componentKey}_side_left`,
        edge_type: 'side_seam',
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: height,
        connection_points: [{ x: 0, y: 0 }, { x: 0, y: height }]
      },
      {
        edge_id: `${componentKey}_side_right`,
        edge_type: 'side_seam',
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: height,
        connection_points: [{ x: width, y: 0 }, { x: width, y: height }]
      }
    );

    // Add armholes for set-in sleeves
    if (constructionMethod === 'set_in_sleeve') {
      edges.push(
        {
          edge_id: `${componentKey}_armhole_left`,
          edge_type: 'armhole',
          connects_to_component_key: '',
          connects_to_edge_id: '',
          length_cm: 25, // Typical armhole circumference
          connection_points: [{ x: width * 0.1, y: height * 0.2 }, { x: width * 0.2, y: 0 }]
        },
        {
          edge_id: `${componentKey}_armhole_right`, 
          edge_type: 'armhole',
          connects_to_component_key: '',
          connects_to_edge_id: '',
          length_cm: 25,
          connection_points: [{ x: width * 0.8, y: 0 }, { x: width * 0.9, y: height * 0.2 }]
        }
      );
    }
  }

  if (componentKey.includes('sleeve')) {
    // Sleeve edges
    edges.push(
      {
        edge_id: `${componentKey}_cap`,
        edge_type: 'sleeve_cap',
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: 35, // Typical sleeve cap circumference
        connection_points: [{ x: 0, y: 0 }, { x: width/2, y: -10 }, { x: width, y: 0 }]
      },
      {
        edge_id: `${componentKey}_underarm`,
        edge_type: 'side_seam',
        connects_to_component_key: '',
        connects_to_edge_id: '',
        length_cm: height,
        connection_points: [{ x: 0, y: 0 }, { x: 0, y: height }]
      }
    );
  }

  return edges;
}

/**
 * Generates automatic layout positioning for a component
 */
function generateAutoLayout(componentKey: string, componentIndex: number): {
  position: { x: number; y: number };
  rotation: number;
  is_flipped: boolean;
} {
  const spacingX = 200; // Space between components horizontally
  const spacingY = 180; // Space between rows
  const componentsPerRow = 3; // Max components per row

  // Calculate grid position
  const row = Math.floor(componentIndex / componentsPerRow);
  const col = componentIndex % componentsPerRow;

  // Special positioning logic for typical garment components
  let x = 50 + (col * spacingX);
  let y = 50 + (row * spacingY);

  // Optimize layout for common garment construction
  if (componentKey.includes('back')) {
    x = 100; // Back panel on left
    y = 150;
  } else if (componentKey.includes('front')) {
    x = 350; // Front panel next to back
    y = 150;
  } else if (componentKey.includes('sleeve_left') || componentKey.includes('sleeve') && componentIndex === 0) {
    x = 50; // Left sleeve above back
    y = 50;
  } else if (componentKey.includes('sleeve_right') || (componentKey.includes('sleeve') && componentIndex === 1)) {
    x = 350; // Right sleeve above front
    y = 50;
  } else if (componentKey.includes('collar') || componentKey.includes('neckband')) {
    x = 225; // Center collar between front and back
    y = 50;
  }

  return {
    position: { x, y },
    rotation: 0,
    is_flipped: false
  };
}

/**
 * Generates default layout positioning for a component
 */
function generateDefaultLayout(componentKey: string): {
  position: { x: number; y: number };
  rotation: number;
  is_flipped: boolean;
} {
  // Simple default positioning
  const baseX = 100;
  const baseY = 100;
  const offset = Math.random() * 50; // Small random offset to avoid overlap

  return {
    position: { 
      x: baseX + offset, 
      y: baseY + offset 
    },
    rotation: 0,
    is_flipped: false
  };
}

/**
 * Generates assembly connections between components
 */
function generateAssemblyConnections(
  components: AssemblyComponent[], 
  constructionMethod: string
): AssemblyConnection[] {
  const connections: AssemblyConnection[] = [];

  // Find components
  const backPanel = components.find(c => c.component_key.includes('back'));
  const frontPanel = components.find(c => c.component_key.includes('front'));
  const sleeves = components.filter(c => c.component_key.includes('sleeve'));

  // Generate basic connections based on construction method
  if (backPanel && frontPanel) {
    // Shoulder seams
    connections.push({
      connection_id: 'shoulder_seam_left',
      from_component: backPanel.component_key,
      from_edge: `${backPanel.component_key}_shoulder_left`,
      to_component: frontPanel.component_key,
      to_edge: `${frontPanel.component_key}_shoulder_left`,
      connection_type: 'seam',
      instructions: 'Sew shoulder seams together',
      visual_style: {
        color: '#3B82F6',
        line_style: 'solid',
        width: 2
      }
    });

    // Side seams
    connections.push({
      connection_id: 'side_seam_left',
      from_component: backPanel.component_key,
      from_edge: `${backPanel.component_key}_side_left`,
      to_component: frontPanel.component_key,
      to_edge: `${frontPanel.component_key}_side_left`,
      connection_type: 'seam',
      instructions: 'Sew left side seam',
      visual_style: {
        color: '#10B981',
        line_style: 'solid',
        width: 2
      }
    });
  }

  // Add sleeve connections for set-in sleeves
  if (constructionMethod === 'set_in_sleeve' && sleeves.length > 0) {
    sleeves.forEach((sleeve, index) => {
      const side = index === 0 ? 'left' : 'right';
      if (backPanel && frontPanel) {
        connections.push({
          connection_id: `sleeve_${side}_armhole`,
          from_component: sleeve.component_key,
          from_edge: `${sleeve.component_key}_cap`,
          to_component: backPanel.component_key,
          to_edge: `${backPanel.component_key}_armhole_${side}`,
          connection_type: 'seam',
          instructions: `Sew sleeve to ${side} armhole`,
          visual_style: {
            color: '#F59E0B',
            line_style: 'dashed',
            width: 2
          }
        });
      }
    });
  }

  return connections;
}