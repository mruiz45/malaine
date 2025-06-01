**User Story 4.4**

1.  **Title:** Implement "Neckline Style Selector" Tool
2.  **Goal:** As a user defining a garment with a neckline (e.g., a sweater), I want to choose a neckline style (e.g., Round, V-neck, Boat Neck, Square Neck) and specify its basic parameters (e.g., depth for a V-neck) so I can customize this key feature of my garment.
3.  **Description:** This tool allows users to select and customize the neckline for appropriate garments. This relates to PDF section 3.1.2 ("Encolures"). This tool's availability and options will depend on the selected garment type and possibly construction method.
4.  **Functional Requirements:**
    * FR1: This tool is displayed if the selected garment type (US 4.2) typically has a defined neckline (e.g., 'Sweater', 'Cardigan', some 'Tops').
    * FR2: User can select a neckline style from a predefined list (e.g., "Round Neck," "V-Neck," "Boat Neck," "Square Neck," "Turtleneck").
    * FR3: For certain neckline styles (e.g., "V-Neck," "Round Neck"), the user can input basic parameters (e.g., "Neckline Depth," "Neckline Width"). Default values should be provided.
    * FR4: Each option should ideally have a simple illustrative icon/diagram.
    * FR5: The selected neckline style and its parameters are saved as attributes of the 'Neckline' or relevant body component(s) within the `pattern_definition_session`.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Neckline styles and their configurable parameters (like depth, width) can be defined in `garment_component_templates` (for a "neckline_finish" component or as attributes of a "body_panel" component).
        * Example `configurable_attributes` for a "neckline_finish" component template:
            ```json
            {
              "styles": [
                {"key": "round", "name": "Round Neck", "params": ["depth", "width"]},
                {"key": "v_neck", "name": "V-Neck", "params": ["depth", "angle_or_width_at_shoulder"]},
                {"key": "boat_neck", "name": "Boat Neck", "params": ["width"]},
                // ...
              ]
            }
            ```
        * User's choices stored in `selected_attributes` of the relevant `pattern_definition_components` entry.
            * Example: `{"style": "v_neck", "depth_cm": 15, "width_at_shoulder_cm": 10}`.
    * **API Endpoints (Conceptual):**
        * Options fetched via existing `garment_type` or `component_template` GET endpoints.
        * Choices saved via `PUT /api/pattern_definition_sessions/{session_id}`.
    * **Logic/Processing:**
        * Frontend displays neckline options relevant to the garment and selected construction.
        * Conditional input fields for parameters based on selected neckline style.
        * Validation for parameter values (e.g., depth should be positive).
    * **UI Considerations (High-Level):**
        * Visual selectors for neckline style.
        * Interactive sliders or input fields for parameters.
        * Preview of the neckline shape (even if very schematic) would be highly beneficial (could be a future enhancement or part of US 5.3's pattern outline).
    * **Integration Points:**
        * Depends on US 4.1, 4.2, and potentially 4.3.
        * Choices here are critical for calculating stitches/rows for neck shaping.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: If "Sweater" is selected, the neckline style selector is available.
    * AC2: User can select "V-Neck" and input a depth of $12 \text{ cm}$.
    * AC3: The selected style ("v_neck") and depth ($12 \text{ cm}$) are correctly saved to the appropriate component's attributes in the `pattern_definition_session`.
    * AC4: Illustrative icons/diagrams are present for each neckline style.
    * AC5: If an incompatible garment type (e.g., "Scarf") is chosen, the neckline selector is not available or is appropriately disabled.
7.  **Assumptions/Pre-conditions:**
    * US 4.1, 4.2 are implemented.
    * Predefined list of neckline styles, their parameters, and associated icons are available.
    * Logic for which necklines are compatible with which garment types/construction methods is defined.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `NecklineSelector.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue`.
    * Backend logic within `PatternDefinitionSessionService` and component templates.

