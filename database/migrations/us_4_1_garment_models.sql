-- Migration US_4.1: Define Data Models for Basic Garment Types and Their Core Components
-- Creates tables for garment types, component templates, and pattern definition components

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for garment types (e.g., sweater, cardigan, scarf, hat)
CREATE TABLE IF NOT EXISTS garment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'sweater_pullover', 'cardigan', 'beanie', 'scarf'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    -- JSONB to store allowed construction methods or other type-specific metadata
    -- Example: {"construction_methods": ["drop_shoulder", "set_in_sleeve", "raglan"]}
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table for garment component templates (defines available component types)
CREATE TABLE IF NOT EXISTS garment_component_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    component_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'body_panel', 'sleeve', 'neckband', 'cuff', 'brim'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    -- JSONB to store typical attributes or configurable options for this component type
    -- e.g., {"length_options": ["short", "standard", "long"], "shaping_options": ["straight", "tapered"]}
    configurable_attributes JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table linking components to specific user's pattern definition sessions
CREATE TABLE IF NOT EXISTS pattern_definition_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_definition_session_id UUID NOT NULL REFERENCES pattern_definition_sessions(id) ON DELETE CASCADE,
    component_template_id UUID NOT NULL REFERENCES garment_component_templates(id),
    component_label VARCHAR(100), -- e.g., "Front Bodice", "Left Sleeve" if user can have multiple of one type
    -- User-selected attributes for this specific instance of the component
    -- e.g., {"length": "long", "shaping": "tapered", "cuff_style": "ribbed_1x1"}
    selected_attributes JSONB DEFAULT '{}',
    -- Optional overrides for measurements or ease values specific to this component
    measurement_overrides JSONB DEFAULT '{}',
    ease_overrides JSONB DEFAULT '{}',
    notes TEXT,
    sort_order INT DEFAULT 0, -- For ordering components in UI or instructions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table to define which component templates are applicable for each garment type
CREATE TABLE IF NOT EXISTS garment_type_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    component_template_id UUID NOT NULL REFERENCES garment_component_templates(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false, -- Whether this component is mandatory for this garment type
    default_quantity INT DEFAULT 1, -- How many of this component are typically needed (e.g., 2 sleeves)
    sort_order INT DEFAULT 0, -- Display order for this component in the garment type
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(garment_type_id, component_template_id)
);

-- Add RLS policies for garment_types (public read, admin write)
ALTER TABLE garment_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view garment types" ON garment_types FOR SELECT USING (true);

-- Add RLS policies for garment_component_templates (public read, admin write)
ALTER TABLE garment_component_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view component templates" ON garment_component_templates FOR SELECT USING (true);

-- Add RLS policies for garment_type_components (public read, admin write)
ALTER TABLE garment_type_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view garment type components" ON garment_type_components FOR SELECT USING (true);

-- Add RLS policies for pattern_definition_components (user-specific)
ALTER TABLE pattern_definition_components ENABLE ROW LEVEL SECURITY;

-- Users can only see components for their own pattern definition sessions
CREATE POLICY "Users can view own pattern definition components" ON pattern_definition_components
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pattern_definition_sessions pds 
            WHERE pds.id = pattern_definition_session_id 
            AND pds.user_id = auth.uid()
        )
    );

-- Users can insert components for their own sessions
CREATE POLICY "Users can insert own pattern definition components" ON pattern_definition_components
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pattern_definition_sessions pds 
            WHERE pds.id = pattern_definition_session_id 
            AND pds.user_id = auth.uid()
        )
    );

-- Users can update components for their own sessions
CREATE POLICY "Users can update own pattern definition components" ON pattern_definition_components
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pattern_definition_sessions pds 
            WHERE pds.id = pattern_definition_session_id 
            AND pds.user_id = auth.uid()
        )
    );

-- Users can delete components for their own sessions
CREATE POLICY "Users can delete own pattern definition components" ON pattern_definition_components
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM pattern_definition_sessions pds 
            WHERE pds.id = pattern_definition_session_id 
            AND pds.user_id = auth.uid()
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_garment_types_type_key ON garment_types(type_key);
CREATE INDEX IF NOT EXISTS idx_garment_component_templates_component_key ON garment_component_templates(component_key);
CREATE INDEX IF NOT EXISTS idx_pattern_definition_components_session_id ON pattern_definition_components(pattern_definition_session_id);
CREATE INDEX IF NOT EXISTS idx_pattern_definition_components_template_id ON pattern_definition_components(component_template_id);
CREATE INDEX IF NOT EXISTS idx_garment_type_components_garment_type_id ON garment_type_components(garment_type_id);
CREATE INDEX IF NOT EXISTS idx_garment_type_components_component_template_id ON garment_type_components(component_template_id);

-- Insert initial garment types
INSERT INTO garment_types (type_key, display_name, description, metadata) VALUES
('sweater_pullover', 'Pull-over Sweater', 'A basic pullover sweater with drop shoulder construction', 
 '{"construction_methods": ["drop_shoulder", "set_in_sleeve"], "difficulty_level": "beginner", "typical_components": ["body", "sleeves", "neckband"]}'),
('scarf', 'Scarf', 'A simple rectangular scarf', 
 '{"construction_methods": ["flat_knitting"], "difficulty_level": "beginner", "typical_components": ["main_panel"]}'),
('cardigan', 'Cardigan', 'An open-front cardigan sweater', 
 '{"construction_methods": ["drop_shoulder", "set_in_sleeve"], "difficulty_level": "intermediate", "typical_components": ["body", "sleeves", "button_band", "neckband"]}'),
('beanie', 'Beanie Hat', 'A simple fitted hat', 
 '{"construction_methods": ["circular_knitting"], "difficulty_level": "beginner", "typical_components": ["crown", "brim"]}')
ON CONFLICT (type_key) DO NOTHING;

-- Insert initial component templates
INSERT INTO garment_component_templates (component_key, display_name, description, configurable_attributes) VALUES
('body_panel', 'Body Panel', 'Main body section of a garment', 
 '{"length_options": ["cropped", "standard", "tunic"], "shaping_options": ["straight", "fitted", "a_line"], "construction": ["flat", "seamless"]}'),
('sleeve', 'Sleeve', 'Arm covering component', 
 '{"length_options": ["sleeveless", "cap", "short", "three_quarter", "long"], "style_options": ["straight", "tapered", "bell"], "cuff_options": ["none", "ribbed", "folded"]}'),
('neckband', 'Neckband', 'Neck finishing component', 
 '{"style_options": ["crew", "v_neck", "scoop", "boat"], "construction": ["ribbed", "rolled", "bound_off"], "depth_options": ["shallow", "standard", "deep"]}'),
('bottom_ribbing', 'Bottom Ribbing', 'Lower edge finishing', 
 '{"style_options": ["1x1_rib", "2x2_rib", "seed_stitch"], "length_options": ["short", "standard", "long"]}'),
('button_band', 'Button Band', 'Front opening band for cardigans', 
 '{"style_options": ["separate", "picked_up"], "width_options": ["narrow", "standard", "wide"], "button_spacing": ["close", "standard", "wide"]}'),
('main_panel', 'Main Panel', 'Primary fabric section for simple items', 
 '{"construction": ["flat", "circular"], "edge_finish": ["plain", "ribbed", "fringe"]}'),
('crown', 'Crown', 'Top section of a hat', 
 '{"shaping": ["decrease_rounds", "short_rows"], "style": ["fitted", "slouchy"]}'),
('brim', 'Brim', 'Lower edge of a hat', 
 '{"style_options": ["ribbed", "rolled", "folded"], "length_options": ["short", "standard", "long"]}')
ON CONFLICT (component_key) DO NOTHING;

-- Link components to garment types
INSERT INTO garment_type_components (garment_type_id, component_template_id, is_required, default_quantity, sort_order) 
SELECT 
    gt.id,
    gct.id,
    CASE 
        WHEN gt.type_key = 'sweater_pullover' AND gct.component_key IN ('body_panel', 'sleeve', 'neckband') THEN true
        WHEN gt.type_key = 'scarf' AND gct.component_key = 'main_panel' THEN true
        WHEN gt.type_key = 'cardigan' AND gct.component_key IN ('body_panel', 'sleeve', 'neckband', 'button_band') THEN true
        WHEN gt.type_key = 'beanie' AND gct.component_key IN ('crown', 'brim') THEN true
        ELSE false
    END as is_required,
    CASE 
        WHEN gct.component_key = 'sleeve' THEN 2
        WHEN gct.component_key = 'button_band' THEN 2
        ELSE 1
    END as default_quantity,
    CASE 
        WHEN gct.component_key = 'body_panel' THEN 1
        WHEN gct.component_key = 'sleeve' THEN 2
        WHEN gct.component_key = 'neckband' THEN 3
        WHEN gct.component_key = 'bottom_ribbing' THEN 4
        WHEN gct.component_key = 'button_band' THEN 5
        WHEN gct.component_key = 'main_panel' THEN 1
        WHEN gct.component_key = 'crown' THEN 1
        WHEN gct.component_key = 'brim' THEN 2
        ELSE 99
    END as sort_order
FROM garment_types gt
CROSS JOIN garment_component_templates gct
WHERE 
    (gt.type_key = 'sweater_pullover' AND gct.component_key IN ('body_panel', 'sleeve', 'neckband', 'bottom_ribbing')) OR
    (gt.type_key = 'scarf' AND gct.component_key IN ('main_panel')) OR
    (gt.type_key = 'cardigan' AND gct.component_key IN ('body_panel', 'sleeve', 'neckband', 'bottom_ribbing', 'button_band')) OR
    (gt.type_key = 'beanie' AND gct.component_key IN ('crown', 'brim'))
ON CONFLICT (garment_type_id, component_template_id) DO NOTHING; 