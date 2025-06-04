-- Migration for PD_PH2_US004: Standard Size Charts
-- Creates tables for storing standard size charts and their measurements

-- Create standard_size_charts table
CREATE TABLE IF NOT EXISTS standard_size_charts (
    size_chart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chart_name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "EU Women General"
    region VARCHAR(50) NOT NULL, -- "EU", "US", "UK", "JP", "INTL"
    age_category VARCHAR(50) NOT NULL, -- "Adult", "Child", "Baby", "Teen"
    target_group VARCHAR(50) NOT NULL, -- "Women", "Men", "Unisex"
    garment_types TEXT[], -- Array of applicable garment types: ["sweater", "cardigan", "vest"]
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_region CHECK (region IN ('EU', 'US', 'UK', 'JP', 'INTL')),
    CONSTRAINT valid_age_category CHECK (age_category IN ('Adult', 'Child', 'Baby', 'Teen')),
    CONSTRAINT valid_target_group CHECK (target_group IN ('Women', 'Men', 'Unisex'))
);

-- Create standard_sizes table
CREATE TABLE IF NOT EXISTS standard_sizes (
    standard_size_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    size_chart_id UUID REFERENCES standard_size_charts(size_chart_id) ON DELETE CASCADE,
    size_name VARCHAR(50) NOT NULL, -- "S", "M", "L", "38", "40", "10", etc.
    size_label VARCHAR(100), -- Optional display label: "Medium (38-40)", "Large", etc.
    sort_order INT NOT NULL DEFAULT 0, -- For displaying sizes in correct order
    
    -- Core measurements in centimeters (matching MeasurementsData structure)
    chest_circumference_cm NUMERIC(6,2),
    body_length_cm NUMERIC(6,2),
    sleeve_length_cm NUMERIC(6,2),
    shoulder_width_cm NUMERIC(6,2),
    armhole_depth_cm NUMERIC(6,2),
    
    -- Hat specific measurements
    head_circumference_cm NUMERIC(6,2),
    hat_height_cm NUMERIC(6,2),
    
    -- Scarf specific measurements  
    scarf_length_cm NUMERIC(6,2),
    scarf_width_cm NUMERIC(6,2),
    
    -- Common measurements
    length_cm NUMERIC(6,2),
    width_cm NUMERIC(6,2),
    
    -- Additional measurements as JSON for extensibility
    additional_measurements JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (size_chart_id, size_name)
);

-- Create indexes for performance
CREATE INDEX idx_standard_size_charts_region ON standard_size_charts(region);
CREATE INDEX idx_standard_size_charts_age_category ON standard_size_charts(age_category);
CREATE INDEX idx_standard_size_charts_target_group ON standard_size_charts(target_group);
CREATE INDEX idx_standard_size_charts_garment_types ON standard_size_charts USING GIN(garment_types);

CREATE INDEX idx_standard_sizes_chart_id ON standard_sizes(size_chart_id);
CREATE INDEX idx_standard_sizes_sort_order ON standard_sizes(sort_order);

-- Create trigger for updated_at on both tables
CREATE TRIGGER update_standard_size_charts_updated_at 
    BEFORE UPDATE ON standard_size_charts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_standard_sizes_updated_at 
    BEFORE UPDATE ON standard_sizes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing and validation

-- EU Women Adult sizes for sweaters/cardigans
INSERT INTO standard_size_charts (chart_name, region, age_category, target_group, garment_types, description) VALUES
('EU Women General', 'EU', 'Adult', 'Women', '["sweater", "cardigan", "vest"]', 'Standard European women sizes for knitwear'),
('EU Men General', 'EU', 'Adult', 'Men', '["sweater", "cardigan", "vest"]', 'Standard European men sizes for knitwear'),
('US Women General', 'US', 'Adult', 'Women', '["sweater", "cardigan", "vest"]', 'Standard US women sizes for knitwear'),
('US Men General', 'US', 'Adult', 'Men', '["sweater", "cardigan", "vest"]', 'Standard US men sizes for knitwear'),
('Universal Hat Sizes', 'INTL', 'Adult', 'Unisex', '["hat"]', 'International adult hat sizes'),
('Universal Scarf Sizes', 'INTL', 'Adult', 'Unisex', '["scarf"]', 'Standard scarf dimensions');

-- Get chart IDs for inserting sizes
DO $$
DECLARE
    eu_women_chart_id UUID;
    eu_men_chart_id UUID;
    us_women_chart_id UUID;
    us_men_chart_id UUID;
    hat_chart_id UUID;
    scarf_chart_id UUID;
BEGIN
    -- Get chart IDs
    SELECT size_chart_id INTO eu_women_chart_id FROM standard_size_charts WHERE chart_name = 'EU Women General';
    SELECT size_chart_id INTO eu_men_chart_id FROM standard_size_charts WHERE chart_name = 'EU Men General';
    SELECT size_chart_id INTO us_women_chart_id FROM standard_size_charts WHERE chart_name = 'US Women General';
    SELECT size_chart_id INTO us_men_chart_id FROM standard_size_charts WHERE chart_name = 'US Men General';
    SELECT size_chart_id INTO hat_chart_id FROM standard_size_charts WHERE chart_name = 'Universal Hat Sizes';
    SELECT size_chart_id INTO scarf_chart_id FROM standard_size_charts WHERE chart_name = 'Universal Scarf Sizes';

    -- EU Women sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, chest_circumference_cm, body_length_cm, sleeve_length_cm, shoulder_width_cm, armhole_depth_cm) VALUES
    (eu_women_chart_id, '34', 'XS (34)', 1, 82, 58, 56, 36, 18),
    (eu_women_chart_id, '36', 'S (36)', 2, 86, 59, 57, 37, 19),
    (eu_women_chart_id, '38', 'M (38)', 3, 90, 60, 58, 38, 20),
    (eu_women_chart_id, '40', 'L (40)', 4, 94, 61, 59, 39, 21),
    (eu_women_chart_id, '42', 'XL (42)', 5, 98, 62, 60, 40, 22),
    (eu_women_chart_id, '44', 'XXL (44)', 6, 102, 63, 61, 41, 23);

    -- EU Men sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, chest_circumference_cm, body_length_cm, sleeve_length_cm, shoulder_width_cm, armhole_depth_cm) VALUES
    (eu_men_chart_id, '46', 'S (46)', 1, 92, 65, 62, 42, 22),
    (eu_men_chart_id, '48', 'M (48)', 2, 96, 66, 63, 43, 23),
    (eu_men_chart_id, '50', 'L (50)', 3, 100, 67, 64, 44, 24),
    (eu_men_chart_id, '52', 'XL (52)', 4, 104, 68, 65, 45, 25),
    (eu_men_chart_id, '54', 'XXL (54)', 5, 108, 69, 66, 46, 26);

    -- US Women sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, chest_circumference_cm, body_length_cm, sleeve_length_cm, shoulder_width_cm, armhole_depth_cm) VALUES
    (us_women_chart_id, 'XS', 'Extra Small', 1, 81, 58, 56, 36, 18),
    (us_women_chart_id, 'S', 'Small', 2, 86, 59, 57, 37, 19),
    (us_women_chart_id, 'M', 'Medium', 3, 91, 60, 58, 38, 20),
    (us_women_chart_id, 'L', 'Large', 4, 96, 61, 59, 39, 21),
    (us_women_chart_id, 'XL', 'Extra Large', 5, 101, 62, 60, 40, 22);

    -- US Men sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, chest_circumference_cm, body_length_cm, sleeve_length_cm, shoulder_width_cm, armhole_depth_cm) VALUES
    (us_men_chart_id, 'S', 'Small', 1, 91, 65, 62, 42, 22),
    (us_men_chart_id, 'M', 'Medium', 2, 97, 66, 63, 43, 23),
    (us_men_chart_id, 'L', 'Large', 3, 102, 67, 64, 44, 24),
    (us_men_chart_id, 'XL', 'Extra Large', 4, 107, 68, 65, 45, 25),
    (us_men_chart_id, 'XXL', 'XX Large', 5, 112, 69, 66, 46, 26);

    -- Hat sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, head_circumference_cm, hat_height_cm) VALUES
    (hat_chart_id, 'S', 'Small', 1, 54, 18),
    (hat_chart_id, 'M', 'Medium', 2, 56, 19),
    (hat_chart_id, 'L', 'Large', 3, 58, 20),
    (hat_chart_id, 'XL', 'Extra Large', 4, 60, 21);

    -- Scarf sizes
    INSERT INTO standard_sizes (size_chart_id, size_name, size_label, sort_order, scarf_length_cm, scarf_width_cm) VALUES
    (scarf_chart_id, 'Narrow', 'Narrow Scarf', 1, 150, 15),
    (scarf_chart_id, 'Standard', 'Standard Scarf', 2, 160, 20),
    (scarf_chart_id, 'Wide', 'Wide Scarf', 3, 170, 25),
    (scarf_chart_id, 'Extra Wide', 'Extra Wide Scarf', 4, 180, 30);

END $$; 