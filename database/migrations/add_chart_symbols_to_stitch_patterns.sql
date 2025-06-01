-- Migration: Add chart_symbols to stitch_patterns table (US_11.5)
-- Adds JSONB column to store chart symbols definitions

ALTER TABLE stitch_patterns 
ADD COLUMN IF NOT EXISTS chart_symbols JSONB;

-- Add index for chart_symbols queries
CREATE INDEX IF NOT EXISTS idx_stitch_patterns_chart_symbols 
ON stitch_patterns USING gin(chart_symbols);

-- Add comment for documentation
COMMENT ON COLUMN stitch_patterns.chart_symbols IS 'JSONB structure containing chart symbols definition with grid, legend, and reading directions for stitch chart generation (US_11.5)';

-- Update example: Add chart symbols to a basic ribbing pattern
UPDATE stitch_patterns 
SET chart_symbols = '{
  "width": 4,
  "height": 2,
  "grid": [
    [{"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "p"}, {"symbol_key": "p"}],
    [{"symbol_key": "p"}, {"symbol_key": "p"}, {"symbol_key": "k"}, {"symbol_key": "k"}]
  ],
  "legend": [
    {"symbol_key": "k", "definition": "Knit on RS, purl on WS", "graphic_ref": "/assets/symbols/knit.svg"},
    {"symbol_key": "p", "definition": "Purl on RS, knit on WS", "graphic_ref": "/assets/symbols/purl.svg"}
  ],
  "reading_direction_rs": "right_to_left",
  "reading_direction_ws": "left_to_right",
  "default_craft_type": "knitting"
}'::jsonb
WHERE stitch_name = '2x2 Ribbing' AND craft_type = 'knitting';

-- Example: Add chart symbols for a simple cable pattern
UPDATE stitch_patterns 
SET chart_symbols = '{
  "width": 8,
  "height": 4,
  "grid": [
    [{"symbol_key": "p"}, {"symbol_key": "p"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "p"}, {"symbol_key": "p"}],
    [{"symbol_key": "p"}, {"symbol_key": "p"}, {"symbol_key": "c4f"}, {"symbol_key": "c4f"}, {"symbol_key": "c4f"}, {"symbol_key": "c4f"}, {"symbol_key": "p"}, {"symbol_key": "p"}],
    [{"symbol_key": "p"}, {"symbol_key": "p"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "p"}, {"symbol_key": "p"}],
    [{"symbol_key": "p"}, {"symbol_key": "p"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "k"}, {"symbol_key": "p"}, {"symbol_key": "p"}]
  ],
  "legend": [
    {"symbol_key": "k", "definition": "Knit on RS, purl on WS", "graphic_ref": "/assets/symbols/knit.svg"},
    {"symbol_key": "p", "definition": "Purl on RS, knit on WS", "graphic_ref": "/assets/symbols/purl.svg"},
    {"symbol_key": "c4f", "definition": "Cable 4 front", "graphic_ref": "/assets/symbols/c4f.svg"}
  ],
  "reading_direction_rs": "right_to_left",
  "reading_direction_ws": "left_to_right",
  "default_craft_type": "knitting"
}'::jsonb
WHERE stitch_name ILIKE '%cable%' AND craft_type = 'knitting'; 