**User Story 6.2**

1.  **Title:** Develop/Refine Core Calculation Logic for a Basic Garment Piece (e.g., Rectangular Body Panel)
2.  **Goal:** As a pattern calculation engine, given the standardized input (from US 6.1), I need to calculate the fundamental stitch and row counts for a simple, rectangular garment piece (like the body panel of a basic drop-shoulder sweater), so that this piece can be constructed to the required dimensions using the specified gauge.
3.  **Description:** This is the first "active" part of the calculation engine. It takes the processed input (target dimensions for a component, gauge) and performs the core calculations as described in PDF Section 4.1 ("Calcul du Nombre de Mailles et de Rangs"). We start with the simplest shape: a rectangle.
4.  **Functional Requirements:**
    * FR1: The calculation logic must accept the standardized input data from US 6.1, specifically focusing on a single rectangular component's target finished width and length, and the project's gauge.
    * FR2: Calculate the required number of cast-on/initial stitches to achieve the target width.
        * `stitches = target_width_cm * (gauge_stitches / 10_cm)`
    * FR3: Calculate the total number of rows required to achieve the target length.
        * `rows = target_length_cm * (gauge_rows / 10_cm)`
    * FR4: Calculations must round to the nearest whole stitch/row appropriately (or apply specific rounding rules, e.g., always round up for stitches if stitch patterns require pairs). Consider stitch pattern repeats if the main stitch (from US 1.5) has a horizontal repeat greater than 1 stitch. The cast-on should be a multiple of this repeat.
    * FR5: The output for this piece should be a data structure containing these calculated values (e.g., `cast_on_stitches`, `total_rows`).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: The JSON structure defined in US 6.1 (specifically a component part of it).
        * Output (for this piece, as part of the overall calculation engine response):
            ```json
            {
              "componentKey": "front_body_panel",
              "calculations": {
                "targetWidthUsed_cm": 50,
                "targetLengthUsed_cm": 60,
                "castOnStitches": 110, // Example: 50cm * (22sts/10cm)
                "totalRows": 180,     // Example: 60cm * (30rows/10cm)
                "actualCalculatedWidth_cm": 50, // May differ slightly from target due to rounding for stitch repeats
                "actualCalculatedLength_cm": 60
              },
              "errors": [],
              "warnings": ["Cast-on stitches adjusted to 110 to fit 2-stitch rib repeat, if applicable."]
            }
            ```
    * **API Endpoints (Conceptual):**
        * This logic is part of the `POST /api/pattern_calculator/calculate_pattern` implementation. The response from this endpoint would be an array of such calculation results, one for each component.
    * **Logic/Processing:**
        * Core arithmetic as specified in FR2, FR3.
        * Implement rounding rules. For stitch repeats:
            * `stitches_raw = target_width_cm * (gauge_stitches / 10_cm)`
            * `stitch_repeat = main_stitch_pattern.horizontalRepeat` (default to 1 if not specified)
            * `num_repeats = round(stitches_raw / stitch_repeat)`
            * `final_cast_on_stitches = num_repeats * stitch_repeat` (or `ceil` then multiply, then check if too far from target).
            * Recalculate `actualCalculatedWidth_cm` based on `final_cast_on_stitches`.
        * Handle unit conversions if input units can vary but calculations prefer a standard unit.
    * **UI Considerations (High-Level):**
        * Results will eventually be used to generate instructions (US 6.3) or visualizations.
    * **Integration Points:**
        * Consumes the output of US 6.1 (Pattern Calculation Input Builder Service).
        * Its output will be consumed by US 6.3 (Instruction Generator).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given gauge: 22 sts/30 rows per 10cm, target component width: 50cm, target component length: 60cm, stitch repeat: 1. The engine correctly calculates approx. 110 cast-on stitches and 180 total rows.
    * AC2: Given gauge: 20 sts/28 rows per 10cm, target component width: 42cm, stitch repeat: 4 (e.g., a 2x2 rib). The engine calculates a cast-on stitch count that is a multiple of 4 and closest to the target width (e.g., $42\text{cm} \times (20\text{sts}/10\text{cm}) = 84 \text{ sts}$. $84$ is a multiple of $4$, so $84 \text{ sts}$). If target was $41\text{cm}$ ($82 \text{ sts}$), it might adjust to $80$ or $84 \text{ sts}$ and note the slight width change.
    * AC3: The output data structure contains all required fields (`cast_on_stitches`, `total_rows`, `actualCalculatedWidth_cm`, etc.).
    * AC4: Edge cases (e.g., zero width/length) are handled gracefully (e.g., error or zero stitches/rows).
7.  **Assumptions/Pre-conditions:**
    * US 6.1 is implemented, and the calculation engine receives data in the defined format.
    * The initial focus is on a simple rectangular piece without shaping (increases/decreases).
8.  **Impacted System Components (Illustrative):**
    * New/Modified Backend: `CorePatternCalculationEngine.java` (or a specific module like `RectangularPieceCalculator.java`).
    * This component will be a core part of the backend logic.

