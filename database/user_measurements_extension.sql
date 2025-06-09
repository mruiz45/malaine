-- Extension de la table user_measurements pour supporter les tailles standards
-- À exécuter dans l'éditeur SQL de Supabase après la création de size_standards

-- Ajout des colonnes pour le tracking des standards
ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS is_standard_size BOOLEAN DEFAULT false;

ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS standard_region VARCHAR(20);

ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS standard_demographic VARCHAR(20);

ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS standard_size VARCHAR(10);

ALTER TABLE user_measurements 
ADD COLUMN IF NOT EXISTS modified_measurements JSONB DEFAULT '[]';

-- Ajout de contraintes pour valider les colonnes standards
ALTER TABLE user_measurements 
ADD CONSTRAINT check_standard_region 
CHECK (standard_region IS NULL OR standard_region IN ('europe', 'us', 'uk', 'asia'));

ALTER TABLE user_measurements 
ADD CONSTRAINT check_standard_demographic 
CHECK (standard_demographic IS NULL OR standard_demographic IN ('adult_female', 'adult_male', 'child', 'baby'));

-- Index pour performance sur les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_user_measurements_standard_lookup 
ON user_measurements(standard_region, standard_demographic, standard_size) 
WHERE is_standard_size = true;

-- Vérification de l'extension
SELECT 'Extension user_measurements réussie !' as message; 