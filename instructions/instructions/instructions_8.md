Okay, let's proceed to Phase 8. This phase is about enriching the pattern definition capabilities by introducing a comprehensive stitch library and the mechanisms to integrate more complex stitch patterns into the garment designs. This will add significant depth and creative flexibility for the user.

---

**Phase 8: Stitch Library and Advanced Pattern Elements**

This phase focuses on building a browsable library of stitch patterns beyond the basics already introduced, and then developing the tools and calculation logic to properly integrate these more complex patterns into garment pieces. This directly addresses PDF Section 6.2 ("Bibliothèque de Points") and Section 4.3 ("Répartition des Mailles pour Motifs").

**User Story 8.1**

1.  **Title:** Develop "Stitch Library" with Categorization, Search, and Detailed Views
2.  **Goal:** As a user, I want access to a browsable and searchable library of diverse stitch patterns (e.g., cables, lace, textured stitches), complete with visual swatches, properties, and row-by-row instructions, so I can discover and select interesting stitch patterns for my projects.
3.  **Description:** This story expands significantly on US 1.5 (Basic Stitch Pattern Selection) and US 3.3 (Basic Stitch Pattern Effects Preview) by creating a full-fledged stitch library. Users will be able to explore various categories of stitches, see detailed information, and select them for potential use in their pattern definition. This is a core feature mentioned in PDF Section 6.2.
4.  **Functional Requirements:**
    * FR1: Create a new database table (or expand `stitch_patterns` from US 1.5) to store a wide variety of stitch patterns. Each entry should include:
        * Name (e.g., "3x3 Left Cross Cable," "Horseshoe Lace," "Moss Stitch").
        * Category (e.g., "Cables," "Lace," "Ribbing," "Textured," "Colorwork").
        * Stitch repeat width (number of stitches) and height (number of rows).
        * Written row-by-row instructions for the stitch pattern repeat.
        * (Optional but highly recommended) Chart symbols for knitting/crochet if a charting tool is envisioned later (PDF 5.3).
        * A clear swatch image.
        * Properties (similar to US 3.3, e.g., reversibility, texture, relative yarn consumption, common uses, difficulty level).
        * Craft type (knitting/crochet).
    * FR2: Implement a UI view for the Stitch Library that allows users to:
        * Browse by category.
        * Search by name or keywords (e.g., "cable," "leaf," "beginner").
        * Filter by properties (e.g., "reversible," "lace," "textured").
    * FR3: Implement a detailed view for each stitch pattern, displaying all its information (name, image, instructions, chart if available, properties).
    * FR4: Users should be able to "select" or "favorite" a stitch pattern from the library to potentially use it in their current `pattern_definition_session`.
    * FR5: The library should be pre-populated with a reasonable number of diverse stitch patterns (e.g., 20-30 initially, with a plan for ongoing additions). An admin interface for adding/editing stitches would be beneficial long-term but is not part of this US.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Significantly enhance or replace the `stitch_patterns` table from US 1.5:
            ```sql
            CREATE TABLE IF NOT EXISTS stitch_patterns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                stitch_name VARCHAR(255) NOT NULL,
                craft_type VARCHAR(10) NOT NULL CHECK (craft_type IN ('knitting', 'crochet')),
                category VARCHAR(100), -- e.g., 'Cables', 'Lace', 'Textured', 'Ribbing', 'Colorwork'
                description TEXT,
                stitch_repeat_width INT NOT NULL,
                stitch_repeat_height INT NOT NULL,
                instructions_written JSONB, -- e.g., {"knit_side_up": true, "rows": [{"row_num": 1, "instruction": "Knit all stitches."}]} or structured for crochet
                -- chart_symbols JSONB, -- For future charting tool: array of arrays representing the chart grid
                swatch_image_url TEXT,
                properties JSONB, -- { "reversibility": "No", "texture": "High", "difficulty": "Intermediate", "yarn_consumption": "High", "notes": "..." }
                search_keywords TEXT[], -- For easier searching
                is_basic BOOLEAN DEFAULT FALSE, -- To differentiate from US 1.5 basic stitches if needed
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (stitch_name, craft_type)
            );
            ```
    * **API Endpoints (Conceptual):**
        * `GET /api/stitch_patterns` (with query parameters for search, filtering by category, craft_type, keywords, properties).
        * `GET /api/stitch_patterns/{id}` (to get details of a specific stitch pattern).
    * **Logic/Processing:**
        * Backend logic for searching and filtering stitch patterns based on query parameters.
        * If `instructions_written` are stored as structured JSON, a backend utility might be needed to format them into human-readable text for display.
    * **UI Considerations (High-Level):**
        * A dedicated "Stitch Library" section in the application.
        * Grid or list view for Browse stitches, with thumbnail swatches.
        * Prominent search bar and filter options.
        * Clear and well-organized detail page for each stitch.
        * "Select for Project" or "Add to Favorites" button on the detail page.
    * **Integration Points:**
        * The selected stitch from this library will be used by US 8.2 (Stitch Pattern Integration Tool) and US 8.3 (Calculation Logic).
        * Replaces/Extends the basic stitch selection from US 1.5.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: The Stitch Library UI allows Browse by categories (e.g., "Cables," "Lace") and searching by name.
    * AC2: Clicking on a stitch pattern displays its detailed view with name, swatch image, written instructions, repeat information, and properties.
    * AC3: The library is pre-populated with at least 20 diverse stitch patterns (for both knitting and crochet if applicable).
    * AC4: User can select a stitch pattern, and this selection is somehow noted (e.g., passed to the pattern definition context or added to a temporary "selected stitches" list).
7.  **Assumptions/Pre-conditions:**
    * A collection of stitch patterns (images, instructions, properties) is ready for pre-population. This requires significant content creation or curation.
    * The basic UI framework supports creating new browsable/searchable sections.
8.  **Impacted System Components (Illustrative):**
    * New DB table (or heavily modified): `stitch_patterns`.
    * New UI components: `StitchLibraryBrowser.vue`, `StitchDetailView.vue`, `StitchFilterPanel.vue`.
    * New Backend: `StitchPatternController` (enhanced), `StitchPatternService` (enhanced).

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

**User Story 8.3**

1.  **Title:** Implement Calculation Logic & Instructions for Garment Pieces with Integrated Stitch Patterns
2.  **Goal:** As a pattern calculation engine, after a user has chosen a specific stitch pattern (e.g., a basic cable or simple lace) for a garment piece and defined its integration (US 8.2), I need to calculate the piece accurately considering the chosen stitch pattern's repeats and generate instructions that include the row-by-row details of that stitch pattern.
3.  **Description:** This story extends the calculation (US 6.2) and instruction generation (US 6.3, US 7.3) logic to correctly incorporate the chosen complex stitch pattern. It means the engine must now understand how to output row-by-row instructions from the selected stitch pattern, potentially interleaving them with shaping or other structural elements.
4.  **Functional Requirements:**
    * FR1: The calculation engine must use the `adjusted_component_stitch_count` (from US 8.2) if the user opted to change it to fit stitch repeats.
    * FR2: The engine must verify that the final stitch count for the component is compatible with the selected stitch pattern's repeats and any edge/panel stitches defined in US 8.2.
    * FR3: The instruction generator must fetch the row-by-row written instructions for the selected stitch pattern (from `stitch_patterns` table, US 8.1).
    * FR4: Generate integrated instructions for the component:
        * Cast-on (using the adjusted stitch count).
        * Any edge stitches or plain panel stitches at the sides.
        * The repeating stitch pattern instructions for the main panel.
        * Interleave shaping instructions (from US 7.2, 7.3) correctly with the stitch pattern rows. This is the most complex part – ensuring shaping doesn't break the stitch pattern, or providing guidance if it might.
            * Simplification for this US: Assume shaping occurs in plain edge stitches if possible, or that simple shaping (dec/inc 1 st at each end) can be incorporated into the first/last stitch of a pattern row without disrupting it too much for *some* patterns. For highly complex patterns, this might require specific per-pattern shaping logic (future enhancement).
    * FR5: The system should track the current row of the stitch pattern repeat as it generates overall garment piece rows.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: Standardized calculation input (US 6.1) now including the `stitch_pattern_id` for the component, `adjusted_component_stitch_count`, `edge_stitches_each_side`, `centering_offset_stitches` from US 8.2.
        * Fetches stitch pattern details (written instructions, repeats) from `stitch_patterns` table (US 8.1).
    * **API Endpoints (Conceptual):**
        * Part of the existing `POST /api/pattern_calculator/calculate_pattern`.
    * **Logic/Processing:**
        * Update `CorePatternCalculationEngine` to use adjusted stitch counts.
        * Enhance `InstructionGeneratorService`:
            * When generating rows for a component with a specific stitch pattern:
                * Retrieve the stitch pattern's row instructions (e.g., an array of strings).
                * Initialize a `current_stitch_pattern_row_index` (0 to `stitch_repeat_height - 1`).
                * For each garment row to generate:
                    * Construct the instruction: `[Edge Stitches] + [Stitch Pattern Row at current_stitch_pattern_row_index] + [Edge Stitches]`.
                    * If it's a shaping row (from US 7.3), incorporate the shaping action text. This is tricky. A simpler start: shaping instructions might be generic like "Shape as established on this row" and the user refers to the stitch pattern for the exact stitches. Better: If shaping is "dec 1 st each end," the instruction might be "Dec 1 st, work Row X of [Pattern Name] to last st, Dec 1 st."
                    * Increment `current_stitch_pattern_row_index`, modulo `stitch_repeat_height`.
    * **UI Considerations (High-Level):**
        * Results (detailed instructions) displayed in the eventual pattern viewer.
    * **Integration Points:**
        * Consumes data set up by US 8.2.
        * Uses stitch definitions from US 8.1.
        * Extends calculation logic in `CorePatternCalculationEngine.java`.
        * Significantly extends `InstructionGeneratorService.java`.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: For a panel with a 4-row repeating textured stitch pattern, and edge stitches, the generated instructions correctly list the edge stitches and then cycle through the 4 rows of the main pattern for the body of the panel.
    * AC2: If the panel also has shaping (e.g., decrease 1 st each end every 6th row), the shaping instruction is incorporated into the relevant pattern rows (e.g., "Row 6 (Decrease Row): Dec 1 st, work Row 2 of [Pattern Name] as established to last st, Dec 1 st.").
    * AC3: The stitch count used for cast-on matches any adjustments made in US 8.2.
7.  **Assumptions/Pre-conditions:**
    * US 8.1 and US 8.2 are implemented.
    * Shaping logic (US 7.2, 7.3) exists.
    * For this initial implementation, the system might assume that shaping (like dec 1 st at each end) can be generically applied without detailed knowledge of *how* that decrease interacts with every possible complex stitch. More advanced "shaping within pattern" is a future, highly complex feature.
    * Selected stitch patterns have clear, machine-parsable or directly usable row-by-row written instructions.
8.  **Impacted System Components (Illustrative):**
    * Modified Backend: `CorePatternCalculationEngine.java`, `InstructionGeneratorService.java` (major enhancements).

---

This completes Phase 8. The application now has a richer set of stitch patterns users can choose from and the initial logic to integrate them into their garment pieces, including generating more complex row-by-row instructions. The challenge of perfectly integrating shaping with arbitrary complex stitch patterns is significant and will likely require ongoing refinement and potentially more structured stitch definitions. Phase 9 will focus on generating a more complete pattern output.