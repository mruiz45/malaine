
**Phase 7: Expanding Garment Types and Advanced Features (Shaping)**

This phase broadens the application's utility by incorporating common accessories as new garment types and by tackling the fundamental mathematics of shaping, which is essential for creating more complex and fitted garments. This directly addresses PDF sections 3.2 ("Accessoires") and 4.2 ("Gestion des Augmentations et Diminutions").

**User Story 7.1**

1.  **Title:** Add "Accessory" Garment Types and Basic Definition Tools
2.  **Goal:** As a user, I want to be able to select common accessory types like "Beanie/Hat" and "Scarf/Cowl" from the Garment Type Selector, and be presented with relevant definition tools for these items, so I can create patterns for simpler projects.
3.  **Description:** This story expands the `garment_types` (US 4.1) and the `GarmentTypeSelector` tool (US 4.2) to include accessories. It also involves creating specific definition sub-tools or views tailored for these simpler items. This covers parts of PDF Section 3.2.
4.  **Functional Requirements:**
    * FR1: Add "Beanie/Hat" and "Scarf/Cowl" as selectable options in the `garment_types` table and consequently in the UI (US 4.2).
    * FR2: When "Beanie/Hat" is selected:
        * Allow user to input desired finished head circumference (can leverage measurement sets from US 1.2 or direct input).
        * Allow user to input desired finished hat height (e.g., crown to brim).
        * Allow selection of basic crown shaping style (e.g., "Classic Tapered Crown," "Slouchy," "Flat Top" - initially could be limited).
        * Allow selection of brim style (e.g., "No Brim," "Folded Ribbed Brim," "Rolled Edge").
    * FR3: When "Scarf/Cowl" is selected:
        * Allow user to input desired finished width and length for a scarf.
        * For a cowl, allow input for finished circumference and height.
        * Allow selection if it's a flat scarf or a cowl worked in the round (this affects instructions).
    * FR4: These choices should be stored within the `pattern_definition_session` structure, linked to the selected accessory garment type.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Add new entries to `garment_types` table (US 4.1) for 'beanie_hat', 'scarf', 'cowl'.
        * Define relevant `garment_component_templates` (US 4.1) if needed (e.g., 'hat_body', 'hat_crown', 'hat_brim', 'scarf_body').
        * The `configurable_attributes` for these new garment types and their components in `garment_types` or `garment_component_templates` tables will define the options (e.g., crown styles, brim styles).
        * User choices stored in `selected_attributes` of `pattern_definition_components` (US 4.1) within the active `pattern_definition_session` (US 1.6).
        * Example for `pattern_definition_components` for a Beanie:
            * Component 1 (hat_body): `{"target_circumference_cm": 56, "body_height_cm": 15, "work_style": "in_the_round"}`
            * Component 2 (hat_brim): `{"style": "folded_ribbed_1x1", "depth_cm": 5}`
            * Component 3 (hat_crown): `{"style": "classic_tapered"}`
    * **API Endpoints (Conceptual):**
        * Existing endpoints for fetching `garment_types` and updating `pattern_definition_sessions` will be used.
    * **Logic/Processing:**
        * Frontend logic to display specific input fields and selectors when an accessory type is chosen.
    * **UI Considerations (High-Level):**
        * When "Beanie/Hat" or "Scarf/Cowl" is selected in `GarmentTypeSelector.vue` (US 4.2), the main workspace (US 1.6) should present a simplified set of definition tools relevant only to that accessory.
        * For instance, "Sleeve Style Selector" (US 4.5) would not be shown.
    * **Integration Points:**
        * Extends US 4.1 (Garment Type Models) and US 4.2 (Garment Type Selector).
        * The defined parameters will feed into specialized calculation logic developed in US 7.1.1 and US 7.1.2.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: "Beanie/Hat" and "Scarf/Cowl" appear as options in the Garment Type Selector.
    * AC2: Selecting "Beanie/Hat" presents input fields for head circumference, hat height, and selectors for basic crown/brim style.
    * AC3: Selecting "Scarf" presents input fields for width and length.
    * AC4: The chosen parameters for an accessory are correctly saved within the current `pattern_definition_session`.
7.  **Assumptions/Pre-conditions:**
    * US 4.1 and US 4.2 are implemented.
    * Basic options for crown styles, brim styles, etc., have been defined for configuration.
8.  **Impacted System Components (Illustrative):**
    * Modified DB data: `garment_types` table.
    * New/Modified UI components: `BeanieDefinitionForm.vue`, `ScarfDefinitionForm.vue` (or a generic `AccessoryDefinitionForm.vue` that adapts).
    * Modified UI: `PatternDefinitionWorkspace.vue` to conditionally show these forms.
    * Modified Backend: `PatternDefinitionSessionService` to handle these new attributes.

