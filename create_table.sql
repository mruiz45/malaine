-- Simple script to create measurement_sets table
CREATE TABLE IF NOT EXISTS measurement_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    set_name VARCHAR(255) NOT NULL,
    measurement_unit VARCHAR(10) NOT NULL CHECK (measurement_unit IN ('cm', 'inch')),
    chest_circumference DECIMAL(6,2),
    waist_circumference DECIMAL(6,2),
    hip_circumference DECIMAL(6,2),
    shoulder_width DECIMAL(6,2),
    arm_length DECIMAL(6,2),
    inseam_length DECIMAL(6,2),
    torso_length DECIMAL(6,2),
    head_circumference DECIMAL(6,2),
    neck_circumference DECIMAL(6,2),
    wrist_circumference DECIMAL(6,2),
    ankle_circumference DECIMAL(6,2),
    foot_length DECIMAL(6,2),
    custom_measurements JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE measurement_sets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own measurement sets" ON measurement_sets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurement sets" ON measurement_sets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurement sets" ON measurement_sets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurement sets" ON measurement_sets
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_measurement_sets_user_id ON measurement_sets(user_id);
CREATE INDEX idx_measurement_sets_created_at ON measurement_sets(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_measurement_sets_updated_at 
    BEFORE UPDATE ON measurement_sets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 