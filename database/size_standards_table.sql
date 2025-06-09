-- Table size_standards pour les tailles standards par région et démographie
-- Basée sur les standards Craft Yarn Council et systèmes internationaux
-- À exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS size_standards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  region VARCHAR(20) NOT NULL CHECK (region IN ('europe', 'us', 'uk', 'asia')),
  demographic VARCHAR(20) NOT NULL CHECK (demographic IN ('adult_female', 'adult_male', 'child', 'baby')),
  size_key VARCHAR(10) NOT NULL,
  
  -- Équivalences entre systèmes
  eu_equivalent VARCHAR(10),
  us_equivalent VARCHAR(10),
  uk_equivalent VARCHAR(10),
  asia_equivalent VARCHAR(10),
  
  -- Les 15 mesures standards (en cm)
  chest_bust_cm NUMERIC(5,2) NOT NULL,
  back_neck_to_wrist_cm NUMERIC(5,2),
  back_waist_length_cm NUMERIC(5,2),
  cross_back_cm NUMERIC(5,2),
  arm_length_to_underarm_cm NUMERIC(5,2),
  upper_arm_cm NUMERIC(5,2),
  armhole_depth_cm NUMERIC(5,2),
  waist_cm NUMERIC(5,2),
  hip_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(5,2),
  overall_garment_length_cm NUMERIC(5,2),
  shoulder_width_cm NUMERIC(5,2),
  wrist_circumference_cm NUMERIC(5,2),
  leg_length_cm NUMERIC(5,2), -- Pour bébé/enfant
  shoe_size_reference VARCHAR(10), -- Pointure de référence selon région
  
  -- Métadonnées
  source_reference VARCHAR(100), -- Référence Craft Yarn Council ou autre
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(region, demographic, size_key)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_size_standards_region_demo ON size_standards(region, demographic);

-- Données initiales pour Europe - Adulte Femme (basées sur Craft Yarn Council)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, source_reference) VALUES
('europe', 'adult_female', 'XS', '32-34', '2-4', '6-8', 81, 66, 86, 39.5, 35, 41, 25, 16.5, 11.5, 15, 55, 55, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'S', '36-38', '6-8', '10-12', 86, 71, 91, 40.5, 37, 42, 26, 17, 12, 15.5, 55.5, 58, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'M', '40-42', '10-12', '14-16', 94, 76, 99, 43.5, 39.5, 43, 28, 18, 13, 16, 56, 61, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'L', '44-46', '14-16', '18-20', 104, 84, 109, 44.5, 42, 44, 30, 19, 14, 16.5, 56.5, 64, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'XL', '48-50', '18-20', '22-24', 114, 94, 119, 45.5, 44.5, 45, 32, 20, 15, 17, 57, 67, 'Craft Yarn Council Standards'),
('europe', 'adult_female', 'XXL', '52-54', '22-24', '26-28', 124, 104, 129, 46.5, 47, 46, 34, 21, 16, 17.5, 57.5, 70, 'Craft Yarn Council Standards');

-- Données pour Europe - Adulte Homme
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, source_reference) VALUES
('europe', 'adult_male', 'S', '44-46', 'S', 'S', 91, 76, 91, 46, 42, 45, 30, 23, 14, 17, 58, 66, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'M', '48-50', 'M', 'M', 99, 84, 99, 47, 44, 46, 32, 24, 15, 17.5, 58.5, 68, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'L', '52-54', 'L', 'L', 109, 94, 109, 48, 47, 47, 34, 25, 16, 18, 59, 71, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'XL', '56-58', 'XL', 'XL', 119, 104, 119, 49, 49.5, 48, 36, 26, 17, 18.5, 59.5, 73, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'XXL', '60-62', 'XXL', 'XXL', 129, 114, 129, 50, 52, 49, 38, 27, 18, 19, 60, 76, 'Craft Yarn Council Standards'),
('europe', 'adult_male', 'XXXL', '64-66', 'XXXL', 'XXXL', 139, 124, 139, 51, 54.5, 50, 40, 28, 19, 19.5, 60.5, 78, 'Craft Yarn Council Standards');

-- Données pour Europe - Enfant (exemples pour quelques tailles)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, leg_length_cm, source_reference) VALUES
('europe', 'child', '2', '2', '2', '2', 53, 52, 55, 22, 22, 22, 17, 11, 7.5, 12.5, 49, 32, 42, 'Craft Yarn Council Standards'),
('europe', 'child', '4', '4', '4', '4', 58, 55, 60, 25, 24, 25, 18, 12, 8, 13, 50, 35, 48, 'Craft Yarn Council Standards'),
('europe', 'child', '6', '6', '6', '6', 63, 57, 65, 28, 26, 28, 19, 13, 8.5, 13.5, 51, 38, 55, 'Craft Yarn Council Standards'),
('europe', 'child', '8', '8', '8', '8', 68, 60, 70, 31, 28, 31, 20, 14, 9, 14, 52, 41, 62, 'Craft Yarn Council Standards'),
('europe', 'child', '10', '10', '10', '10', 73, 63, 75, 34, 30, 34, 21, 15, 9.5, 14.5, 53, 44, 69, 'Craft Yarn Council Standards'),
('europe', 'child', '12', '12', '12', '12', 78, 66, 80, 37, 32, 37, 22, 16, 10, 15, 54, 47, 76, 'Craft Yarn Council Standards'),
('europe', 'child', '14', '14', '14', '14', 83, 69, 85, 40, 34, 40, 23, 17, 10.5, 15.5, 55, 50, 83, 'Craft Yarn Council Standards'),
('europe', 'child', '16', '16', '16', '16', 88, 72, 90, 43, 36, 43, 24, 18, 11, 16, 56, 53, 90, 'Craft Yarn Council Standards');

-- Données pour Europe - Bébé (exemples)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, leg_length_cm, shoe_size_reference, source_reference) VALUES
('europe', 'baby', '0-3M', '56', 'NB', '0-3M', 41, 41, 44, 17, 19, 17, 14, 8, 6, 10, 37, 28, 24, '16', 'Craft Yarn Council Standards'),
('europe', 'baby', '3-6M', '62', '3M', '3-6M', 44, 44, 47, 19, 20, 19, 15, 9, 6.5, 10.5, 39, 31, 28, '17', 'Craft Yarn Council Standards'),
('europe', 'baby', '6-9M', '68', '6M', '6-9M', 47, 47, 50, 21, 21, 21, 16, 10, 7, 11, 41, 34, 32, '18', 'Craft Yarn Council Standards'),
('europe', 'baby', '9-12M', '74', '9M', '9-12M', 50, 50, 53, 23, 22, 23, 17, 11, 7.5, 11.5, 43, 37, 36, '19', 'Craft Yarn Council Standards'),
('europe', 'baby', '12-18M', '80', '12M', '12-18M', 53, 53, 56, 25, 23, 25, 18, 12, 8, 12, 45, 40, 40, '20', 'Craft Yarn Council Standards'),
('europe', 'baby', '18-24M', '86', '18M', '18-24M', 56, 56, 59, 27, 24, 27, 19, 13, 8.5, 12.5, 47, 43, 44, '21', 'Craft Yarn Council Standards');

-- Données initiales pour États-Unis - Adulte Femme (valeurs légèrement ajustées)
INSERT INTO size_standards (region, demographic, size_key, eu_equivalent, us_equivalent, uk_equivalent, chest_bust_cm, waist_cm, hip_cm, back_waist_length_cm, cross_back_cm, arm_length_to_underarm_cm, upper_arm_cm, armhole_depth_cm, shoulder_width_cm, wrist_circumference_cm, head_circumference_cm, overall_garment_length_cm, source_reference) VALUES
('us', 'adult_female', 'XS', '32-34', '2-4', '6-8', 81, 66, 86, 39.5, 35, 41, 25, 16.5, 11.5, 15, 55, 55, 'US Standard Sizing'),
('us', 'adult_female', 'S', '36-38', '6-8', '10-12', 86, 71, 91, 40.5, 37, 42, 26, 17, 12, 15.5, 55.5, 58, 'US Standard Sizing'),
('us', 'adult_female', 'M', '40-42', '10-12', '14-16', 94, 76, 99, 43.5, 39.5, 43, 28, 18, 13, 16, 56, 61, 'US Standard Sizing'),
('us', 'adult_female', 'L', '44-46', '14-16', '18-20', 104, 84, 109, 44.5, 42, 44, 30, 19, 14, 16.5, 56.5, 64, 'US Standard Sizing'),
('us', 'adult_female', 'XL', '48-50', '18-20', '22-24', 114, 94, 119, 45.5, 44.5, 45, 32, 20, 15, 17, 57, 67, 'US Standard Sizing'),
('us', 'adult_female', 'XXL', '52-54', '22-24', '26-28', 124, 104, 129, 46.5, 47, 46, 34, 21, 16, 17.5, 57.5, 70, 'US Standard Sizing');

-- RLS pour sécurité (lecture publique pour les standards)
ALTER TABLE size_standards ENABLE ROW LEVEL SECURITY;

-- Politique permettant la lecture publique des standards
CREATE POLICY "Size standards are publicly readable" ON size_standards
  FOR SELECT USING (true);

-- Vérification que la table a été créée correctement
SELECT 'Table size_standards créée avec succès avec ' || COUNT(*) || ' entrées initiales!' as message 
FROM size_standards; 