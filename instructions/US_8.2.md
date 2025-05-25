**User Story 8.2**

1.  **Title:** Implement "Stitch Pattern Integration Advisor" Tool
2.  **Goal:** As a user who has selected a complex stitch pattern from the library, I want a tool to help me understand how this pattern (with its specific stitch and row repeats) will fit into a defined garment section (e.g., a sweater body panel), and how it might impact the required cast-on stitches or overall dimensions, so I can plan its integration effectively.
3.  **Description:** This tool acts as a bridge between selecting a beautiful stitch pattern (US 8.1) and actually using it. It visualizes or explains how the pattern's repeats will map onto a given width/height and helps adjust stitch counts for seamless integration. This relates to PDF section 4.3 ("Répartition des Mailles pour Motifs").
4.  **Functional Requirements:**
    * FR1: User can select a garment component from their current pattern definition (e.g., "Front Body," "Sleeve"). The tool knows the target width/stitch count for this component from earlier definitions/calculations (US 6.2).
    * FR2: User can select a stitch pattern from the Stitch Library (US 8.1) to apply to this component.
    * FR3: The tool will calculate and display:
        * How many full repeats of the selected stitch pattern fit into the component's target width/stitch count.
        * Any remaining stitches and how they might be handled (e.g., "You have 5 extra stitches. Consider adding X stitches to accommodate another full repeat, or centering the pattern and using Y stitches of stockinette on each side.").
        * The adjusted cast-on stitch count if the user decides to modify it to fit full repeats.
    * FR4: (Optional Visual Aid) Display a simple visual representation (e.g., a bar divided into segments) showing the stitch repeats across the width, highlighting full and partial repeats.
    * FR5: The tool should also consider any edge stitches required by the pattern or desired by the user (e.g., a selvedge stitch on each side not part of the main repeat).
    * FR6: Allow the user to confirm the stitch pattern choice and any adjusted stitch counts for that component, updating the `pattern_definition_session`.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Reads data from the selected `stitch_patterns` entry (US 8.1, specifically `stitch_repeat_width`).
        * Reads target dimensions/stitch counts for a garment component from the `pattern_definition_session` (derived from previous calculations like in US 6.2).
        * The `pattern_definition_components` table (US 4.1) needs to be able to store which `stitch_pattern_id` is applied to it, and any specific integration details (e.g., `adjusted_cast_on_stitches`, `edge_stitch_count`).
            ```sql
            -- In pattern_definition_components, selected_attributes JSONB could store:
            -- {
            --   "stitch_pattern_id": "uuid-of-selected-stitch",
            --   "applied_stitch_pattern_name": "3x3 Left Cross Cable",
            --   "adjusted_component_stitch_count": 112, // If user chose to adjust from original estimate
            --   "edge_stitches_each_side": 2,
            --   "centering_offset_stitches": 0
            -- }
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/tools/stitch_pattern_integrator/analyze`
            * Payload: `{ "component_id_in_session": "...", "target_stitch_count": 100, "selected_stitch_pattern_id": "..." , "desired_edge_stitches": 2}`
            * Response: `{ "full_repeats": X, "remaining_stitches": Y, "suggested_adjusted_stitch_count": Z, "options": [...] }`
        * `PUT /api/pattern_definition_sessions/{session_id}/components/{component_id}` to save the integration choices.
    * **Logic/Processing:**
        * `available_width_for_pattern = target_stitch_count - (2 * desired_edge_stitches)`
        * `num_full_repeats = floor(available_width_for_pattern / stitch_repeat_width)`
        * `stitches_used_by_repeats = num_full_repeats * stitch_repeat_width`
        * `remaining_stitches = available_width_for_pattern - stitches_used_by_repeats`
        * Provide suggestions:
            * Option 1: Center `num_full_repeats` and divide `remaining_stitches` into two side panels (e.g., stockinette).
            * Option 2: Calculate stitches needed for `num_full_repeats + 1` and suggest adjusting cast-on.
    * **UI Considerations (High-Level):**
        * A modal or dedicated tool section.
        * Selectors for garment component and stitch pattern.
        * Clear display of calculations and suggestions.
        * Visual aid for repeat visualization.
        * Buttons to "Apply this configuration" to the selected garment component.
    * **Integration Points:**
        * Uses Stitch Library (US 8.1) and current pattern definition data (especially calculated component stitch counts from US 6.2 if available, or target widths).
        * Updates the definition of specific garment components in the `pattern_definition_session`.
        * Its output is crucial for US 8.3 (Calculation Logic for specific stitch patterns).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User selects a body panel (target 100 sts) and a cable pattern (10 st repeat) with 2 edge sts each side. Tool correctly calculates: available for pattern = 96 sts; 9 full repeats (90 sts); 6 remaining sts.
    * AC2: Tool suggests options like "Use 9 repeats, with 3 sts of stockinette on each side of the cabled panel (inside edges)" or "Adjust to 104 total stitches (100 for 10 repeats + 4 edge) for full repeats."
    * AC3: User can choose an option, and the relevant component in the `pattern_definition_session` is updated with the chosen stitch pattern ID and any adjusted stitch counts/integration details.
    * AC4: (If visual aid implemented) The visualization accurately reflects the repeats and remaining stitches.
7.  **Assumptions/Pre-conditions:**
    * US 8.1 (Stitch Library) is implemented.
    * The system has a way to determine the target stitch count or width for a selected garment component (e.g., from initial rectangular calculations in US 6.2 or user-defined target width).
8.  **Impacted System Components (Illustrative):**
    * New UI component: `StitchIntegrationAdvisor.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue`.
    * New Backend: `StitchPatternIntegratorService.java`, potentially new API endpoints.
    * Modified `PatternDefinitionSessionService` to update components.

