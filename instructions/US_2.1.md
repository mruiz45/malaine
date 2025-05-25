
**Phase 2: First "Pattern Definition Helper" Tools & Supporting Calculations**

This phase introduces the first interactive tools aimed at assisting the user in the pattern definition process, as envisioned in the PDF, particularly section 6.3 ("Outils d'aide à la création"). These tools will provide immediate value by helping solve common knitting/crochet problems or by simplifying estimations.

**User Story 2.1**

1.  **Title:** Implement "Reverse Gauge Calculator" Tool
2.  **Goal:** As a user who has an existing pattern with a specific gauge, or who has swatched and achieved a different gauge than desired, I want to use a Reverse Gauge Calculator to understand how my current gauge will affect the final dimensions of a project or how to adjust stitch/row counts to achieve desired dimensions with my actual gauge.
3.  **Description:** This tool helps users work with gauge discrepancies. It can be used in two main scenarios:
    * Scenario A: User has a target dimension (e.g., $40 \text{ cm}$ wide) and their own gauge. The tool calculates the required stitches.
    * Scenario B: User has a pattern stitch count (e.g., cast on $100$ stitches) and their own gauge. The tool calculates the resulting dimension.
    * Scenario C: (Advanced) User has pattern gauge and their gauge, and pattern stitch count. Tool shows resulting dimension with their gauge AND how many stitches they'd need to get the original pattern dimension.
    This corresponds to the "Calculateur d’Échantillon Inversé" mentioned in PDF section 6.3.3.
4.  **Functional Requirements:**
    * FR1: User can input their actual gauge (stitches and rows per $10 \text{ cm}$ or $4 \text{ in}$ – leveraging US 1.1 component).
    * FR2: **Scenario A:** User can input a desired finished dimension (width or height, in cm or inches) and the tool will calculate the number of stitches or rows needed with their gauge.
    * FR3: **Scenario B:** User can input a number of stitches or rows (e.g., from an existing pattern) and the tool will calculate the finished dimension using their gauge.
    * FR4: **Scenario C:** User can input:
        * Original pattern's gauge (stitches/rows per unit).
        * Original pattern's stitch/row count for a section.
        * Their actual gauge (stitches/rows per unit).
        The tool will then output:
        * The finished dimension if they follow the pattern's stitch/row count with their actual gauge.
        * The adjusted stitch/row count needed to achieve the original pattern's intended dimension using their actual gauge.
    * FR5: The tool must handle unit consistency (cm/inches) and provide clear output labels.
5.  **Technical Implementation Guidance:**
    * **Data Models:** No new persistent data models are necessarily created by this specific tool, as it's a calculator. It uses `gauge_profiles` (US 1.1) as input. Results are displayed to the user.
    * **API Endpoints (Conceptual):**
        * A backend endpoint might be useful for the calculation logic if it's complex or to keep business logic server-side.
        * `POST /api/tools/reverse_gauge_calculator`
            * Payload for Scenario A: `{ "user_gauge": { "stitches": 22, "rows": 30, "unit_dimension": 10, "unit": "cm" }, "target_dimension": 40, "dimension_unit": "cm", "calculate_for": "stitches" }`
            * Payload for Scenario B: `{ "user_gauge": { ... }, "stitch_or_row_count": 100, "calculate_for": "dimension_width" }`
            * Payload for Scenario C: `{ "pattern_gauge": { ... }, "pattern_stitch_row_count": 100, "user_gauge": { ... }, "calculate_for_component": "width" }`
    * **Logic/Processing:**
        * **Core calculations:**
            * Stitches per unit (e.g., per cm): `stitches_per_unit = gauge_stitches / gauge_unit_dimension` (e.g., $22 \text{ sts} / 10 \text{ cm} = 2.2 \text{ sts/cm}$)
            * Rows per unit: `rows_per_unit = gauge_rows / gauge_unit_dimension`
        * Scenario A: `required_stitches = target_dimension_cm * stitches_per_cm`
        * Scenario B: `resulting_dimension_cm = pattern_stitch_count / stitches_per_cm`
        * Scenario C:
            * `pattern_stitches_per_unit = pattern_gauge_stitches / pattern_gauge_unit_dimension`
            * `original_dimension = pattern_stitch_count / pattern_stitches_per_unit`
            * `dimension_with_user_gauge = pattern_stitch_count / user_stitches_per_unit`
            * `adjusted_stitches_for_original_dimension = original_dimension * user_stitches_per_unit`
        * Ensure all inputs are converted to a consistent unit (e.g., cm) before calculation if mixed units are allowed in input.
    * **UI Considerations (High-Level):**
        * A dedicated UI section for this tool.
        * Clear input fields for user's gauge (potentially reusing the gauge input component from US 1.1).
        * Input fields for pattern gauge, stitch/row counts, or target dimensions, based on the scenario (A, B, or C) the user wants to calculate.
        * Radio buttons or tabs to select the calculation scenario.
        * Clearly displayed results with units.
    * **Integration Points:**
        * Uses gauge data model/input component (US 1.1).
        * Part of the "Pattern Definition Session" (US 1.6) UI, accessible as a helper tool.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given a user gauge of $22 \text{ sts} / 10 \text{ cm}$ and a target width of $50 \text{ cm}$ (Scenario A), the tool correctly calculates $110$ stitches.
    * AC2: Given a user gauge of $22 \text{ sts} / 10 \text{ cm}$ and a pattern stitch count of $88$ stitches (Scenario B), the tool correctly calculates a width of $40 \text{ cm}$.
    * AC3: (Scenario C) Given pattern gauge $20 \text{ sts} / 10 \text{ cm}$, pattern cast-on $100 \text{ sts}$ (expects $50 \text{ cm}$ width), and user gauge $22 \text{ sts} / 10 \text{ cm}$:
        * Tool correctly calculates resulting width with user gauge as approx. $45.45 \text{ cm}$.
        * Tool correctly calculates adjusted stitches needed with user gauge to achieve $50 \text{ cm}$ as $110$ stitches.
    * AC4: The UI is intuitive and clearly distinguishes between input fields and results. Unit handling is correct.
7.  **Assumptions/Pre-conditions:**
    * US 1.1 (Gauge Definition) is implemented and available for inputting user's gauge.
    * The UI framework allows for creating new tool sections/views.
8.  **Impacted System Components (Illustrative):**
    * New UI: `ReverseGaugeCalculatorTool.vue` (or similar component name).
    * New Backend (optional, if logic is server-side): `ToolsController.java` (or similar), `ReverseGaugeService.java`.
    * Uses existing `GaugeInputForm` component.

