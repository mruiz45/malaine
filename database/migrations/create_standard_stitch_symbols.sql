-- Migration: Create standard_stitch_symbols table (US_11.5)
-- Creates the table to store standard stitch symbols for chart generation

CREATE TABLE IF NOT EXISTS standard_stitch_symbols (
    symbol_key VARCHAR(20) PRIMARY KEY,
    craft_type VARCHAR(10) NOT NULL CHECK (craft_type IN ('knitting', 'crochet')),
    description TEXT NOT NULL,
    graphic_asset_url TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster filtering by craft_type
CREATE INDEX IF NOT EXISTS idx_standard_stitch_symbols_craft_type 
ON standard_stitch_symbols(craft_type);

-- Create index for text search
CREATE INDEX IF NOT EXISTS idx_standard_stitch_symbols_description 
ON standard_stitch_symbols USING gin(to_tsvector('english', description));

-- Add RLS policies
ALTER TABLE standard_stitch_symbols ENABLE ROW LEVEL SECURITY;

-- Public read access for standard symbols
CREATE POLICY "Public read access for standard_stitch_symbols" 
ON standard_stitch_symbols 
FOR SELECT 
USING (true);

-- Admin write access (for future admin interface)
CREATE POLICY "Admin write access for standard_stitch_symbols" 
ON standard_stitch_symbols 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Insert initial standard symbols for knitting
INSERT INTO standard_stitch_symbols (symbol_key, craft_type, description, graphic_asset_url, notes) VALUES
('k', 'knitting', 'Knit on RS, purl on WS', '/assets/symbols/knit.svg', 'Basic knit stitch'),
('p', 'knitting', 'Purl on RS, knit on WS', '/assets/symbols/purl.svg', 'Basic purl stitch'),
('yo', 'knitting', 'Yarn over', '/assets/symbols/yarn_over.svg', 'Creates an eyelet hole'),
('k2tog', 'knitting', 'Knit 2 together', '/assets/symbols/k2tog.svg', 'Right-leaning decrease'),
('ssk', 'knitting', 'Slip, slip, knit', '/assets/symbols/ssk.svg', 'Left-leaning decrease'),
('k3tog', 'knitting', 'Knit 3 together', '/assets/symbols/k3tog.svg', 'Double decrease'),
('sl1', 'knitting', 'Slip 1 stitch', '/assets/symbols/slip1.svg', 'Slip 1 stitch purlwise'),
('no_stitch', 'knitting', 'No stitch', '/assets/symbols/no_stitch.svg', 'Placeholder for lace shaping'),
('c4f', 'knitting', 'Cable 4 front', '/assets/symbols/c4f.svg', '4-stitch cable crossing front'),
('c4b', 'knitting', 'Cable 4 back', '/assets/symbols/c4b.svg', '4-stitch cable crossing back'),
('c6f', 'knitting', 'Cable 6 front', '/assets/symbols/c6f.svg', '6-stitch cable crossing front'),
('c6b', 'knitting', 'Cable 6 back', '/assets/symbols/c6b.svg', '6-stitch cable crossing back'),
('m1l', 'knitting', 'Make 1 left', '/assets/symbols/m1l.svg', 'Left-leaning increase'),
('m1r', 'knitting', 'Make 1 right', '/assets/symbols/m1r.svg', 'Right-leaning increase'),
('kfb', 'knitting', 'Knit front and back', '/assets/symbols/kfb.svg', 'Increase by knitting front and back'),
('cdd', 'knitting', 'Central double decrease', '/assets/symbols/cdd.svg', 'Centered double decrease')
ON CONFLICT (symbol_key) DO NOTHING;

-- Insert initial standard symbols for crochet
INSERT INTO standard_stitch_symbols (symbol_key, craft_type, description, graphic_asset_url, notes) VALUES
('ch', 'crochet', 'Chain', '/assets/symbols/crochet_chain.svg', 'Basic chain stitch'),
('sc', 'crochet', 'Single crochet', '/assets/symbols/single_crochet.svg', 'Basic single crochet'),
('hdc', 'crochet', 'Half double crochet', '/assets/symbols/half_double_crochet.svg', 'Half double crochet stitch'),
('dc', 'crochet', 'Double crochet', '/assets/symbols/double_crochet.svg', 'Double crochet stitch'),
('tr', 'crochet', 'Treble crochet', '/assets/symbols/treble_crochet.svg', 'Treble crochet stitch'),
('sl st', 'crochet', 'Slip stitch', '/assets/symbols/slip_stitch.svg', 'Slip stitch'),
('sc2tog', 'crochet', 'Single crochet 2 together', '/assets/symbols/sc2tog.svg', 'Decrease by crocheting 2 together'),
('dc2tog', 'crochet', 'Double crochet 2 together', '/assets/symbols/dc2tog.svg', 'Decrease by double crocheting 2 together'),
('inc', 'crochet', 'Increase', '/assets/symbols/crochet_increase.svg', 'Increase by working 2 stitches in same space'),
('dec', 'crochet', 'Decrease', '/assets/symbols/crochet_decrease.svg', 'General decrease'),
('dtr', 'crochet', 'Double treble crochet', '/assets/symbols/double_treble_crochet.svg', 'Double treble crochet stitch'),
('picot', 'crochet', 'Picot', '/assets/symbols/picot.svg', 'Decorative picot edge')
ON CONFLICT (symbol_key) DO NOTHING;

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
CREATE TRIGGER update_standard_stitch_symbols_updated_at 
    BEFORE UPDATE ON standard_stitch_symbols 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 