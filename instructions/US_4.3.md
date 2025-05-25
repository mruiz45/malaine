**User Story 4.3**

1.  **Title:** Implement "Sweater Construction Method & Shape Selector" Tool
2.  **Goal:** As a user defining a sweater, after selecting "Sweater" as the garment type, I want to choose a basic construction method (e.g., Drop Shoulder, Set-in Sleeve, Raglan) and a basic body shape (e.g., Straight, A-line, Fitted) so I can define the fundamental silhouette of my sweater.
3.  **Description:** This tool allows the user to specify key structural choices for a sweater, building upon the garment type selection. This focuses on PDF sections 3.1.1 ("Formes de Base") and 3.1.3 ("Manches" - as construction method heavily influences sleeve type). This tool will be conditionally displayed if "Sweater" (or similar garment like "Cardigan") is chosen in US 4.2.
4.  **Functional Requirements:**
    * FR1: This tool is displayed only if the selected garment type (US 4.2) is compatible (e.g., 'Sweater', 'Cardigan').
    * FR2: User can select a construction method from a predefined list (e.g., "Drop Shoulder," "Set-in Sleeve," "Raglan," "Dolman"). The available list might depend on the `garment_type`.
    * FR3: User can select a body shape from a predefined list (e.g., "Straight," "A-line," "Fitted/Shaped Waist," "Oversized Boxy").
    * FR4: Each option should ideally have a simple illustrative icon/diagram and a brief description of its characteristics.
    * FR5: The selected construction method and body shape are saved as attributes of the relevant garment component(s) (e.g., 'Body', 'Sleeves') within the `pattern_definition_session`.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Construction methods and shapes can be defined as part of the `configurable_attributes` in `garment_component_templates` (US 4.1) or in the `garment_types` table (e.g., `allowed_construction_methods`, `allowed_body_shapes`).
        * The user's choices are stored in the `selected_attributes` JSONB field of the `pattern_definition_components` table for the relevant component (e.g., the main body component of the sweater).
        * Example `selected_attributes` for a body component: `{"construction_method": "drop_shoulder", "body_shape": "straight"}`.
    * **API Endpoints (Conceptual):**
        * No new specific endpoints for this tool. Options are fetched via `GET /api/garment_types/{type_key}` or `GET /api/garment_component_templates/{template_key}` which would return the allowed options in `configurable_attributes`.
        * Choices are saved via `PUT /api/pattern_definition_sessions/{session_id}` by updating the `pattern_definition_components`.
    * **Logic/Processing:**
        * Frontend dynamically displays options based on the selected garment type.
        * On selection, updates the appropriate component's `selected_attributes` in the session state and notifies the backend.
    * **UI Considerations (High-Level):**
        * Clear selectors (e.g., radio buttons, cards) for construction method and body shape.
        * Visual aids (icons/diagrams) are highly recommended.
        * Tool appears in sequence after Garment Type selection, or in a dedicated "Sweater Structure" section.
    * **Integration Points:**
        * Depends on US 4.1 (Data Models) for available options and US 4.2 (Garment Type Selector) for context.
        * Choices made here will influence options in US 4.4 (Neckline) and US 4.5 (Sleeves), and heavily impact pattern calculations.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: If "Sweater" is selected, the tool for construction method and body shape is displayed.
    * AC2: The user can select "Drop Shoulder" as construction and "Straight" as body shape.
    * AC3: These selections are correctly saved to the `pattern_definition_components` associated with the current session.
    * AC4: Illustrative icons/diagrams and descriptions are present for each option.
    * AC5: If a garment type like "Scarf" is selected, this specific tool for sweater construction/shape is not displayed.
7.  **Assumptions/Pre-conditions:**
    * US 4.1 and US 4.2 are implemented.
    * A predefined list of construction methods and body shapes, along with their descriptions/icons, is available (linked to garment types or component templates).
8.  **Impacted System Components (Illustrative):**
    * New UI component: `SweaterStructureSelector.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue` (to conditionally display this tool).
    * Backend logic within `PatternDefinitionSessionService` to handle updating component attributes.

