-- Create measurement_sets table for User Story 1.2
-- User Measurements (Mensurations) Input and Management

-- Create the table
CREATE TABLE IF NOT EXISTS measurement_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    set_name VARCHAR(255) NOT NULL,
    measurement_unit VARCHAR(10) NOT NULL CHECK (measurement_unit IN ('cm', 'inch')),
    
    -- Standard body measurements (in decimal format for precision)
    chest_circumference DECIMAL(6,2),
    waist_circumference DECIMAL(6,2),
    hip_circumference DECIMAL(6,2),
    shoulder_width DECIMAL(6,2),
    arm_length DECIMAL(6,2),
    inseam_length DECIMAL(6,2),
    torso_length DECIMAL(6,2),
    head_circumference DECIMAL(6,2),
    
    -- Additional common measurements for knitting/crochet
    neck_circumference DECIMAL(6,2),
    wrist_circumference DECIMAL(6,2),
    ankle_circumference DECIMAL(6,2),
    foot_length DECIMAL(6,2),
    
    -- Extensibility for custom measurements
    custom_measurements JSONB,
    
    -- Optional notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE measurement_sets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own measurement sets" ON measurement_sets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurement sets" ON measurement_sets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurement sets" ON measurement_sets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurement sets" ON measurement_sets
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_measurement_sets_user_id ON measurement_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_measurement_sets_created_at ON measurement_sets(created_at DESC);

-- Create unique constraint for set names per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_measurement_sets_user_set_name ON measurement_sets(user_id, set_name);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_measurement_sets_updated_at 
    BEFORE UPDATE ON measurement_sets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE measurement_sets IS 'User body measurements for pattern sizing - User Story 1.2';
COMMENT ON COLUMN measurement_sets.user_id IS 'Reference to the user who owns this measurement set';
COMMENT ON COLUMN measurement_sets.set_name IS 'User-defined name for this measurement set';
COMMENT ON COLUMN measurement_sets.measurement_unit IS 'Unit of measurement: cm or inch';
COMMENT ON COLUMN measurement_sets.custom_measurements IS 'Additional measurements stored as JSON key-value pairs';
COMMENT ON COLUMN measurement_sets.notes IS 'Optional notes about the measurements'; 