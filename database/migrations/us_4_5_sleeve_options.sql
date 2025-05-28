-- Migration US_4.5: Update Sleeve Component Template with Style, Length and Cuff Options
-- Updates the 'sleeve' component template with configurable attributes for sleeve customization

-- Update the sleeve component template with comprehensive configurable attributes
UPDATE garment_component_templates 
SET configurable_attributes = '{
  "styles_by_construction": {
    "drop_shoulder": [
      {"key": "straight", "name": "Straight", "description": "Classic straight sleeve with no tapering"},
      {"key": "tapered", "name": "Tapered", "description": "Gradually narrows from shoulder to wrist"}
    ],
    "set_in_sleeve": [
      {"key": "straight", "name": "Straight", "description": "Classic straight sleeve with shaped cap"},
      {"key": "tapered", "name": "Tapered", "description": "Fitted sleeve that narrows toward the wrist"},
      {"key": "puff_cap", "name": "Puff Cap", "description": "Gathered cap creates volume at the shoulder"},
      {"key": "fitted", "name": "Fitted", "description": "Close-fitting sleeve with precise shaping"}
    ],
    "raglan": [
      {"key": "straight", "name": "Straight", "description": "Straight raglan sleeve with diagonal seam"},
      {"key": "tapered", "name": "Tapered", "description": "Tapered raglan sleeve for a fitted look"},
      {"key": "bell", "name": "Bell Sleeve", "description": "Flares out at the wrist for dramatic effect"}
    ],
    "dolman": [
      {"key": "straight", "name": "Straight", "description": "Wide, flowing sleeve integrated with body"},
      {"key": "bell", "name": "Bell Sleeve", "description": "Dramatic flare from elbow to wrist"}
    ]
  },
  "lengths": [
    {"key": "cap", "name": "Cap Sleeve", "description": "Very short sleeve covering just the shoulder", "typical_length_cm": 8},
    {"key": "short", "name": "Short Sleeve", "description": "Ends above the elbow", "typical_length_cm": 20},
    {"key": "elbow", "name": "Elbow Length", "description": "Reaches to the elbow", "typical_length_cm": 30},
    {"key": "three_quarter", "name": "Three-Quarter Length", "description": "Ends between elbow and wrist", "typical_length_cm": 40},
    {"key": "long", "name": "Long Sleeve", "description": "Full-length sleeve to the wrist", "typical_length_cm": 55},
    {"key": "custom", "name": "Custom Length", "description": "Specify exact length measurement", "requires_input": true, "input_param": "custom_length_cm"}
  ],
  "cuff_styles": [
    {"key": "none", "name": "No Cuff", "description": "Plain edge finish with no additional cuff"},
    {"key": "ribbed_1x1", "name": "1x1 Ribbed Cuff", "description": "Single rib pattern for stretch and fit", "params": ["cuff_depth_cm"], "default_values": {"cuff_depth_cm": 5}},
    {"key": "ribbed_2x2", "name": "2x2 Ribbed Cuff", "description": "Double rib pattern for more texture", "params": ["cuff_depth_cm"], "default_values": {"cuff_depth_cm": 6}},
    {"key": "folded", "name": "Folded Cuff", "description": "Turned-up cuff for a classic look", "params": ["cuff_depth_cm", "fold_depth_cm"], "default_values": {"cuff_depth_cm": 8, "fold_depth_cm": 3}},
    {"key": "bell_flare", "name": "Bell Flare", "description": "Flared opening without ribbing", "params": ["flare_width_cm"], "default_values": {"flare_width_cm": 10}},
    {"key": "fitted_band", "name": "Fitted Band", "description": "Narrow fitted band at wrist", "params": ["band_width_cm"], "default_values": {"band_width_cm": 3}}
  ],
  "compatibility_notes": {
    "construction_dependencies": "Available sleeve styles depend on the construction method chosen for the garment body",
    "length_considerations": "Custom lengths should account for ease and intended fit",
    "cuff_compatibility": "Some cuff styles work better with certain sleeve styles and lengths"
  }
}'
WHERE component_key = 'sleeve';

-- Verify the update was successful
SELECT component_key, display_name, configurable_attributes 
FROM garment_component_templates 
WHERE component_key = 'sleeve'; 