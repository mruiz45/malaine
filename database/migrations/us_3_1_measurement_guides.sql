-- US 3.1: Body Measurement Guide Tool
-- Migration to add measurement guides and individual measurement notes

-- Add measurement_details JSONB field to measurement_sets table
-- This will store individual notes for each measurement
-- Example structure: {"chest_circumference": {"note": "Taken over light t-shirt"}, "waist_circumference": {"note": "At natural waistline"}}
ALTER TABLE measurement_sets
ADD COLUMN IF NOT EXISTS measurement_details JSONB;

-- Create measurement_guides_content table for storing guide content
CREATE TABLE IF NOT EXISTS measurement_guides_content (
    id SERIAL PRIMARY KEY,
    measurement_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'chest_circumference', 'arm_length'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT, -- Path to static image asset
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on measurement_guides_content (read-only for all authenticated users)
ALTER TABLE measurement_guides_content ENABLE ROW LEVEL SECURITY;

-- Create policy for reading guides (all authenticated users can read)
CREATE POLICY "Authenticated users can view measurement guides" ON measurement_guides_content
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_measurement_guides_measurement_key ON measurement_guides_content(measurement_key);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_measurement_guides_updated_at 
    BEFORE UPDATE ON measurement_guides_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial guide content for all standard measurements
INSERT INTO measurement_guides_content (measurement_key, title, description, image_url) VALUES
('chest_circumference', 'Chest/Bust Circumference', 'Measure around the fullest part of your chest/bust, keeping the tape parallel to the floor. For women, measure over a well-fitting bra. Keep the tape snug but not tight.', '/images/measurement-guides/chest_circumference.svg'),
('waist_circumference', 'Waist Circumference', 'Measure around your natural waistline, which is typically the narrowest part of your torso, usually just above your belly button. Keep the tape parallel to the floor.', '/images/measurement-guides/waist_circumference.svg'),
('hip_circumference', 'Hip Circumference', 'Measure around the fullest part of your hips, typically 7-9 inches below your natural waistline. Keep the tape parallel to the floor and ensure it goes around your buttocks.', '/images/measurement-guides/hip_circumference.svg'),
('shoulder_width', 'Shoulder Width', 'Measure from the edge of one shoulder to the edge of the other shoulder across your back. The measurement should go from the bony point of one shoulder to the bony point of the other.', '/images/measurement-guides/shoulder_width.svg'),
('arm_length', 'Arm Length', 'Measure from the shoulder point down to the wrist bone. Keep your arm slightly bent and relaxed at your side. The measurement should follow the natural curve of your arm.', '/images/measurement-guides/arm_length.svg'),
('inseam_length', 'Inseam Length', 'Measure from the crotch seam down to the ankle bone along the inside of your leg. This measurement is best taken while wearing well-fitting pants.', '/images/measurement-guides/inseam_length.svg'),
('torso_length', 'Torso Length', 'Measure from the base of your neck (where it meets your shoulders) down to your natural waistline. Keep the tape straight down your back.', '/images/measurement-guides/torso_length.svg'),
('head_circumference', 'Head Circumference', 'Measure around the largest part of your head, typically just above your eyebrows and ears. The tape should sit comfortably around your head.', '/images/measurement-guides/head_circumference.svg'),
('neck_circumference', 'Neck Circumference', 'Measure around the base of your neck where a crew neck collar would sit. Keep one finger between the tape and your neck for comfort.', '/images/measurement-guides/neck_circumference.svg'),
('wrist_circumference', 'Wrist Circumference', 'Measure around your wrist bone, just below the wrist joint. This is where a bracelet would typically sit.', '/images/measurement-guides/wrist_circumference.svg'),
('ankle_circumference', 'Ankle Circumference', 'Measure around your ankle bone, just above the ankle joint. This is useful for fitted socks or leg warmers.', '/images/measurement-guides/ankle_circumference.svg'),
('foot_length', 'Foot Length', 'Measure from the back of your heel to the tip of your longest toe. Stand on a piece of paper and mark both points for accuracy.', '/images/measurement-guides/foot_length.svg')
ON CONFLICT (measurement_key) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE measurement_guides_content IS 'Content for measurement guides - User Story 3.1';
COMMENT ON COLUMN measurement_guides_content.measurement_key IS 'Unique key identifying the measurement type';
COMMENT ON COLUMN measurement_guides_content.title IS 'Display title for the measurement guide';
COMMENT ON COLUMN measurement_guides_content.description IS 'Detailed instructions for taking the measurement';
COMMENT ON COLUMN measurement_guides_content.image_url IS 'Path to diagram/illustration for the measurement';
COMMENT ON COLUMN measurement_sets.measurement_details IS 'Individual notes for each measurement stored as JSON - User Story 3.1'; 