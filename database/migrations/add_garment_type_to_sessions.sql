-- Add garment type selection to pattern definition sessions (US_4.2)
ALTER TABLE pattern_definition_sessions
ADD COLUMN IF NOT EXISTS selected_garment_type_id UUID REFERENCES garment_types(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pattern_definition_sessions_garment_type_id 
ON pattern_definition_sessions(selected_garment_type_id); 