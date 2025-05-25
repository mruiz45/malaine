-- Script SQL à exécuter manuellement dans l'interface Supabase
-- pour créer la table stitch_patterns et les données de base

-- 1. Créer la table stitch_patterns
CREATE TABLE IF NOT EXISTS stitch_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stitch_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    stitch_repeat_width INT, -- Number of stitches in one horizontal repeat
    stitch_repeat_height INT, -- Number of rows in one vertical repeat
    is_basic BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la fonction de trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Créer le trigger
CREATE TRIGGER update_stitch_patterns_updated_at 
    BEFORE UPDATE ON stitch_patterns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Insérer les motifs de base
INSERT INTO stitch_patterns (stitch_name, description, stitch_repeat_width, stitch_repeat_height, is_basic) VALUES
('Stockinette Stitch', 'Classic smooth stitch pattern with knit on right side, purl on wrong side', 1, 2, true),
('Garter Stitch', 'Textured stitch pattern created by knitting every row', 1, 2, true),
('Rib 1x1', 'Elastic ribbing pattern alternating knit and purl stitches', 2, 1, true),
('Rib 2x2', 'Elastic ribbing pattern with two knit, two purl stitches', 4, 1, true),
('Seed Stitch', 'Textured pattern alternating knit and purl in checkerboard fashion', 2, 2, true),
('Moss Stitch', 'Similar to seed stitch but with different row arrangement', 2, 4, true),
('Single Crochet', 'Basic crochet stitch creating a dense, flat fabric', 1, 1, true),
('Double Crochet', 'Taller crochet stitch creating an open, flexible fabric', 1, 1, true)
ON CONFLICT (stitch_name) DO NOTHING;

-- 5. Activer RLS (Row Level Security)
ALTER TABLE stitch_patterns ENABLE ROW LEVEL SECURITY;

-- 6. Créer les politiques de sécurité
CREATE POLICY "Allow read access to basic stitch patterns" ON stitch_patterns
    FOR SELECT USING (is_basic = true);

CREATE POLICY "Allow authenticated users to read all stitch patterns" ON stitch_patterns
    FOR SELECT USING (auth.role() = 'authenticated');

-- 7. Vérifier que tout fonctionne
SELECT COUNT(*) as total_patterns FROM stitch_patterns;
SELECT * FROM stitch_patterns ORDER BY stitch_name; 