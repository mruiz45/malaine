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
