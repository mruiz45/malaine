-- Create pattern_definition_sessions table for US_1.6
CREATE TABLE IF NOT EXISTS pattern_definition_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    selected_gauge_profile_id UUID REFERENCES gauge_profiles(id),
    selected_measurement_set_id UUID REFERENCES measurement_sets(id),
    -- Ease values might be stored directly or reference an ease_preference_id
    ease_type VARCHAR(20),
    ease_value_bust DECIMAL(5,2),
    ease_unit VARCHAR(10),
    -- Add other ease values as needed
    selected_yarn_profile_id UUID REFERENCES yarn_profiles(id),
    selected_stitch_pattern_id UUID REFERENCES stitch_patterns(id),
    status VARCHAR(50) DEFAULT 'draft', -- e.g., draft, ready_for_calculation
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Store actual values as well, in case referenced profiles are edited/deleted later
    -- This makes the session self-contained once values are "locked in" for a definition
    gauge_stitch_count DECIMAL(5,2),
    gauge_row_count DECIMAL(5,2),
    gauge_unit VARCHAR(10),
    -- etc. for measurements, yarn details... or use JSONB to store a snapshot
    parameter_snapshot JSONB
);

-- Add RLS policies
ALTER TABLE pattern_definition_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own pattern definition sessions" ON pattern_definition_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own pattern definition sessions" ON pattern_definition_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own pattern definition sessions" ON pattern_definition_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own pattern definition sessions" ON pattern_definition_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pattern_definition_sessions_user_id ON pattern_definition_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_definition_sessions_status ON pattern_definition_sessions(status); 