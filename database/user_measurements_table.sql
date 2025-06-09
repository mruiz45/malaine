-- Table user_measurements pour la saisie des mensurations corporelles
-- À exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS user_measurements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  project_id uuid REFERENCES projects(id), -- optionnel, pour lier à un projet spécifique
  
  -- Les 15 mesures principales (en cm comme référence)
  chest_bust_cm numeric(5,2), -- Tour de Poitrine
  back_neck_to_wrist_cm numeric(5,2), -- Longueur Dos du Col au Poignet  
  back_waist_length_cm numeric(5,2), -- Longueur Taille Dos
  cross_back_cm numeric(5,2), -- Carrure Dos
  arm_length_to_underarm_cm numeric(5,2), -- Longueur de Manche
  upper_arm_cm numeric(5,2), -- Tour de Bras
  armhole_depth_cm numeric(5,2), -- Profondeur d'Emmanchure
  waist_cm numeric(5,2), -- Tour de Taille
  hip_cm numeric(5,2), -- Tour de Hanches
  head_circumference_cm numeric(5,2), -- Tour de Tête
  overall_garment_length_cm numeric(5,2), -- Hauteur Totale du Pull
  shoulder_width_cm numeric(5,2), -- Largeur d'Épaule
  wrist_circumference_cm numeric(5,2), -- Tour de Poignet
  leg_length_cm numeric(5,2), -- Longueur de Jambe (bébé/layette)
  shoe_size varchar(10), -- Pointure (string car différents systèmes)
  
  -- Métadonnées
  preferred_unit varchar(10) DEFAULT 'cm' CHECK (preferred_unit IN ('cm', 'inches')),
  demographic_category varchar(20) CHECK (demographic_category IN ('baby', 'child', 'adult')),
  gender_category varchar(20) CHECK (gender_category IN ('male', 'female', 'neutral')),
  garment_type varchar(50), -- Type de vêtement pour mesures conditionnelles
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_measurements_project_id ON user_measurements(project_id);

-- RLS pour sécurité
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;

-- Politique permettant aux utilisateurs de gérer leurs propres mesures
CREATE POLICY "Users can manage their own measurements" ON user_measurements
  FOR ALL USING (auth.uid() = user_id);

-- Vérification que la table a été créée correctement
SELECT 'Table user_measurements créée avec succès!' as message; 