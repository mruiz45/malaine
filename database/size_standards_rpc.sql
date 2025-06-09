-- Fonctions RPC pour les API routes des standards de tailles
-- À exécuter dans l'éditeur SQL de Supabase après la création de size_standards

-- Fonction pour récupérer les régions et démographies disponibles
CREATE OR REPLACE FUNCTION get_size_standards_regions_demographics()
RETURNS TABLE(region text, demographic text) 
LANGUAGE sql
SECURITY definer
AS $$
  SELECT DISTINCT s.region, s.demographic 
  FROM size_standards s
  ORDER BY s.region, s.demographic;
$$;

-- Fonction pour récupérer les tailles selon région et démographie
CREATE OR REPLACE FUNCTION get_size_standards_by_region_demo(
  p_region text,
  p_demographic text
)
RETURNS TABLE(
  size_key text,
  eu_equivalent text,
  us_equivalent text,
  uk_equivalent text,
  asia_equivalent text,
  chest_bust_cm numeric,
  back_neck_to_wrist_cm numeric,
  back_waist_length_cm numeric,
  cross_back_cm numeric,
  arm_length_to_underarm_cm numeric,
  upper_arm_cm numeric,
  armhole_depth_cm numeric,
  waist_cm numeric,
  hip_cm numeric,
  head_circumference_cm numeric,
  overall_garment_length_cm numeric,
  shoulder_width_cm numeric,
  wrist_circumference_cm numeric,
  leg_length_cm numeric,
  shoe_size_reference text
) 
LANGUAGE sql
SECURITY definer
AS $$
  SELECT 
    s.size_key,
    s.eu_equivalent,
    s.us_equivalent,
    s.uk_equivalent,
    s.asia_equivalent,
    s.chest_bust_cm,
    s.back_neck_to_wrist_cm,
    s.back_waist_length_cm,
    s.cross_back_cm,
    s.arm_length_to_underarm_cm,
    s.upper_arm_cm,
    s.armhole_depth_cm,
    s.waist_cm,
    s.hip_cm,
    s.head_circumference_cm,
    s.overall_garment_length_cm,
    s.shoulder_width_cm,
    s.wrist_circumference_cm,
    s.leg_length_cm,
    s.shoe_size_reference
  FROM size_standards s
  WHERE s.region = p_region AND s.demographic = p_demographic
  ORDER BY 
    CASE s.size_key 
      WHEN 'XS' THEN 1
      WHEN 'S' THEN 2
      WHEN 'M' THEN 3
      WHEN 'L' THEN 4
      WHEN 'XL' THEN 5
      WHEN 'XXL' THEN 6
      WHEN 'XXXL' THEN 7
      ELSE 10 + CAST(s.size_key AS integer)
    END;
$$;

-- Fonction pour récupérer toutes les données pour le tableau complet
CREATE OR REPLACE FUNCTION get_all_size_standards()
RETURNS TABLE(
  region text,
  demographic text,
  size_key text,
  eu_equivalent text,
  us_equivalent text,
  uk_equivalent text,
  asia_equivalent text,
  chest_bust_cm numeric,
  back_neck_to_wrist_cm numeric,
  back_waist_length_cm numeric,
  cross_back_cm numeric,
  arm_length_to_underarm_cm numeric,
  upper_arm_cm numeric,
  armhole_depth_cm numeric,
  waist_cm numeric,
  hip_cm numeric,
  head_circumference_cm numeric,
  overall_garment_length_cm numeric,
  shoulder_width_cm numeric,
  wrist_circumference_cm numeric,
  leg_length_cm numeric,
  shoe_size_reference text
) 
LANGUAGE sql
SECURITY definer
AS $$
  SELECT 
    s.region,
    s.demographic,
    s.size_key,
    s.eu_equivalent,
    s.us_equivalent,
    s.uk_equivalent,
    s.asia_equivalent,
    s.chest_bust_cm,
    s.back_neck_to_wrist_cm,
    s.back_waist_length_cm,
    s.cross_back_cm,
    s.arm_length_to_underarm_cm,
    s.upper_arm_cm,
    s.armhole_depth_cm,
    s.waist_cm,
    s.hip_cm,
    s.head_circumference_cm,
    s.overall_garment_length_cm,
    s.shoulder_width_cm,
    s.wrist_circumference_cm,
    s.leg_length_cm,
    s.shoe_size_reference
  FROM size_standards s
  ORDER BY s.region, s.demographic, 
    CASE s.size_key 
      WHEN 'XS' THEN 1
      WHEN 'S' THEN 2
      WHEN 'M' THEN 3
      WHEN 'L' THEN 4
      WHEN 'XL' THEN 5
      WHEN 'XXL' THEN 6
      WHEN 'XXXL' THEN 7
      ELSE 10 + CAST(s.size_key AS integer)
    END;
$$;

-- Permissions pour les fonctions RPC
GRANT EXECUTE ON FUNCTION get_size_standards_regions_demographics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_size_standards_by_region_demo(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_size_standards() TO authenticated;

SELECT 'Fonctions RPC pour size_standards créées avec succès!' as message; 