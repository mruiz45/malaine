-- Create ease_preferences table for User Story 1.3
-- Ease (Aisance) Preference Input and Management

-- Create the table
CREATE TABLE IF NOT EXISTS ease_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_name VARCHAR(255) NOT NULL,
    ease_type VARCHAR(20) NOT NULL DEFAULT 'absolute' CHECK (ease_type IN ('absolute', 'percentage')),
    
    -- Ease values for different body parts (in decimal format for precision)
    bust_ease DECIMAL(6,2),
    waist_ease DECIMAL(6,2),
    hip_ease DECIMAL(6,2),
    sleeve_ease DECIMAL(6,2),
    
    -- Measurement unit (relevant for 'absolute' ease type)
    measurement_unit VARCHAR(10) CHECK (measurement_unit IN ('cm', 'inch')),
    
    -- Optional notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ease_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own ease preferences" ON ease_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ease preferences" ON ease_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ease preferences" ON ease_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ease preferences" ON ease_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ease_preferences_user_id ON ease_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ease_preferences_created_at ON ease_preferences(created_at DESC);

-- Create unique constraint for preference names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_ease_preferences_user_preference_name ON ease_preferences(user_id, preference_name);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_ease_preferences_updated_at 
    BEFORE UPDATE ON ease_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE ease_preferences IS 'User ease preferences for garment fitting - User Story 1.3';
COMMENT ON COLUMN ease_preferences.user_id IS 'Reference to the user who owns this ease preference';
COMMENT ON COLUMN ease_preferences.preference_name IS 'User-defined name for this ease preference';
COMMENT ON COLUMN ease_preferences.ease_type IS 'Type of ease: absolute (cm/inch) or percentage';
COMMENT ON COLUMN ease_preferences.bust_ease IS 'Ease value for bust/chest area';
COMMENT ON COLUMN ease_preferences.waist_ease IS 'Ease value for waist area';
COMMENT ON COLUMN ease_preferences.hip_ease IS 'Ease value for hip area';
COMMENT ON COLUMN ease_preferences.sleeve_ease IS 'Ease value for sleeve area';
COMMENT ON COLUMN ease_preferences.measurement_unit IS 'Unit for absolute ease values: cm or inch';
COMMENT ON COLUMN ease_preferences.notes IS 'Optional notes about the ease preference'; 