-- Migration pour US_004: Support des vêtements bébé avec contraintes de sécurité

-- Ajout des colonnes pour les contraintes de sécurité bébé
ALTER TABLE garment_part_configurations 
ADD COLUMN IF NOT EXISTS safety_constraints JSONB DEFAULT '[]';

ALTER TABLE garment_part_configurations 
ADD COLUMN IF NOT EXISTS age_restrictions JSONB DEFAULT '{"min_age_months": 0, "max_age_months": 24}';

-- Extension des contraintes d'activation pour sécurité bébé
ALTER TABLE garment_part_dependencies 
DROP CONSTRAINT IF EXISTS garment_part_dependencies_activation_condition_check;

ALTER TABLE garment_part_dependencies 
ADD CONSTRAINT garment_part_dependencies_activation_condition_check 
CHECK (activation_condition IN ('optional_selected', 'always', 'conditional', 'safety_required'));

-- Index pour optimiser les requêtes par section
CREATE INDEX IF NOT EXISTS idx_garment_types_section ON garment_types(section) WHERE section = 'baby';

-- Données initiales pour Brassière Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('brassiere', 'dos', true, 1, '["coutures_plates", "tissus_doux"]'),
('brassiere', 'devant', true, 2, '["coutures_plates", "tissus_doux"]'),
('brassiere', 'emmanchures', true, 3, '["bordures_larges", "sans_elastiques_serres"]'),
('brassiere', 'bordures_encolure', true, 4, '["finition_douce", "sans_boutons"]'),
('brassiere', 'manches_courtes', false, 5, '["coutures_plates", "ouverture_large"]'),
('brassiere', 'bordures_finition', false, 6, '["sans_elements_detachables"]'),
('brassiere', 'motifs_simples', false, 7, '["sans_relief", "couleurs_non_toxiques"]');

-- Données initiales pour Combinaison Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('combinaison_bebe', 'corps_principal', true, 1, '["coutures_plates", "tissus_respirants"]'),
('combinaison_bebe', 'jambes', true, 2, '["ouverture_facile", "pressions_qualite"]'),
('combinaison_bebe', 'emmanchures', true, 3, '["bordures_larges", "confortables"]'),
('combinaison_bebe', 'entrejambe', true, 4, '["pressions_securisees", "acces_facile"]'),
('combinaison_bebe', 'manches', false, 5, '["coutures_plates", "mobilite_preservee"]'),
('combinaison_bebe', 'pressions_epaules', false, 6, '["pressions_qualite", "ouverture_large"]'),
('combinaison_bebe', 'bordures_jambes', false, 7, '["elastiques_doux"]'),
('combinaison_bebe', 'motifs_poitrine', false, 8, '["sans_relief_dur"]');

-- Données initiales pour Chaussons Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('chaussons_bebe', 'semelle', true, 1, '["souple", "antiderapante", "respirante"]'),
('chaussons_bebe', 'dessus_pied', true, 2, '["ajustement_doux", "sans_pression"]'),
('chaussons_bebe', 'cheville', true, 3, '["maintien_sans_serrer", "elastique_doux"]'),
('chaussons_bebe', 'sangles_douces', false, 4, '["sans_boucles_dures", "velcro_qualite"]'),
('chaussons_bebe', 'motifs_dessus', false, 5, '["sans_elements_detachables"]'),
('chaussons_bebe', 'bordures_chevilles', false, 6, '["finition_douce"]'),
('chaussons_bebe', 'semelle_antiderapante', false, 7, '["materiau_non_toxique"]');

-- Données initiales pour Couverture Bébé
INSERT INTO garment_part_configurations (garment_type_key, part_key, is_obligatory, display_order, safety_constraints) VALUES
('couverture_bebe', 'corps_central', true, 1, '["taille_securisee", "tissus_respirants"]'),
('couverture_bebe', 'bordures_perimetriques', true, 2, '["finition_douce", "sans_fils_laches"]'),
('couverture_bebe', 'motifs_centraux', false, 3, '["sans_elements_detachables"]'),
('couverture_bebe', 'franges_douces', false, 4, '["longueur_securisee", "bien_fixees"]'),
('couverture_bebe', 'coins_renforces', false, 5, '["coutures_solides"]'),
('couverture_bebe', 'doublure_polaire', false, 6, '["hypoallergenique", "respirante"]');

-- Dépendances pour Brassière Bébé avec contraintes de sécurité
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key, activation_condition) VALUES
('brassiere', 'manches_courtes', 'bordures_finition', 'safety_required'),
('brassiere', 'manches_courtes', 'emmanchures', 'always');

-- Dépendances pour Combinaison Bébé avec contraintes de sécurité
INSERT INTO garment_part_dependencies (garment_type_key, parent_part_key, dependent_part_key, activation_condition) VALUES
('combinaison_bebe', 'manches', 'emmanchures', 'always'),
('combinaison_bebe', 'pressions_epaules', 'bordures_finition', 'safety_required');
