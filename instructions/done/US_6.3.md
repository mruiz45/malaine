**User Story 6.3**

1.  **Title:** Generate Basic Textual Instructions for a Calculated Rectangular Garment Piece
2.  **Goal:** As a user, after the system has calculated the stitches and rows for a simple rectangular garment piece, I want to see basic, human-readable textual instructions on how to knit/crochet this piece (e.g., "Cast on X stitches. Work in [Stitch Pattern] for Y rows."), so I can begin crafting.
3.  **Description:** This story takes the numerical output from US 6.2 and translates it into the simplest form of written instructions, as per PDF Sections 5.1 ("Format de Sortie du Patron") and 5.2 ("Instructions Écrites Claires et Structurées"). It focuses on clarity and correctness for a basic piece.
4.  **Functional Requirements:**
    * FR1: Input for this function will be the calculated data for a piece (from US 6.2: `cast_on_stitches`, `total_rows`) and the selected main stitch pattern name (from the input in US 6.1).
    * FR2: Generate a "Cast On" instruction: "Cast on [cast_on_stitches] stitches." (Adjust terminology for crochet: "Chain [X] stitches. Row 1: Work [Y] single crochet starting in 2nd chain from hook... resulting in [cast_on_stitches] stitches.").
    * FR3: Generate a "Work Body" instruction: "Work in [Stitch Pattern Name] for [total_rows] rows."
    * FR4: (Optional, if simple finishing is defined) Generate a "Bind Off" instruction: "Bind off all stitches." (Or crochet equivalent: "Fasten off.").
    * FR5: The output should be a structured list of instruction strings for that piece.
    * FR6: Terminology should be appropriate for knitting or crochet based on context (the PDF covers both; the system needs a way to know which craft the user is defining for, perhaps an early choice in the Pattern Definition Session US 1.6 or associated with the stitch pattern).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: The output from US 6.2 (calculations for a piece) and stitch pattern info.
        * Output (as part of the overall calculation engine response, augmenting US 6.2's output):
            ```json
            {
              // ... (from US 6.2 calculations) ...
              "instructions": [
                {"step": 1, "text": "Using your main needles and [Yarn Name], cast on 110 stitches."},
                {"step": 2, "text": "Work in Stockinette Stitch for 180 rows."},
                {"step": 3, "text": "Bind off all stitches loosely."}
              ]
            }
            ```
    * **API Endpoints (Conceptual):**
        * The `instructions` array would be part of the response from `POST /api/pattern_calculator/calculate_pattern`.
    * **Logic/Processing:**
        * Simple string templating based on calculated values and selected stitch pattern name.
        * Logic to differentiate knitting vs. crochet terminology. This implies the `pattern_definition_session` needs to hold a "craft_type" ('knitting' or 'crochet'). This should be added to US 1.6 or as a general setting.
        * If the stitch pattern (US 1.5) has more detailed setup rows (e.g., for a ribbing that starts differently), this instruction generator would need to be more sophisticated or the stitch pattern definition would need to include its "setup instruction lines." For this US, assume a simple "Work in [Pattern]" is sufficient after cast-on.
    * **UI Considerations (High-Level):**
        * The generated instructions will eventually be displayed in a "Pattern Viewer" UI (part of later phases, e.g., Phase 9). For now, the focus is on generating the data.
    * **Integration Points:**
        * Consumes the output of US 6.2.
        * Will be a key part of the data displayed to the user when they view their generated pattern.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given `cast_on_stitches = 110`, `total_rows = 180`, `stitch_pattern_name = "Stockinette Stitch"`, `craft_type = "knitting"`. The system generates instructions like: "1. Cast on 110 stitches.", "2. Work in Stockinette Stitch for 180 rows.", "3. Bind off all stitches."
    * AC2: Given `cast_on_stitches = 84` (for sc), `total_rows = 100`, `stitch_pattern_name = "Single Crochet"`, `craft_type = "crochet"`. The system generates appropriate crochet instructions (e.g., initial chain, turning chains, row instructions).
    * AC3: The output `instructions` array is correctly structured.
7.  **Assumptions/Pre-conditions:**
    * US 6.2 is implemented and provides accurate calculations.
    * A "craft_type" (knitting/crochet) is known for the pattern being defined. This should be added as a requirement to an earlier User Story if not already implicitly handled (e.g., US 1.6 for the session, or linked to stitch pattern selection in US 1.5). Let's assume it's added to US 1.6.
    * For this basic version, complex stitch pattern setup rows are not handled; the instruction is a generic "Work in [Pattern]".
8.  **Impacted System Components (Illustrative):**
    * New/Modified Backend: `InstructionGeneratorService.java` (or a method within `CorePatternCalculationEngine.java`).
    * The response structure from `CorePatternCalculationEngine` is augmented.

---

**Note on Craft Type (Knitting vs. Crochet):**
The need for `craft_type` has become apparent in US 6.3. I will retroactively suggest this be added to **User Story 1.6 (Basic UI for Pattern Definition Session)**. The `pattern_definition_sessions` table should include a `craft_type VARCHAR(10) NOT NULL CHECK (craft_type IN ('knitting', 'crochet'))` field, and the UI for starting a new definition session should allow the user to select this. This choice will then inform terminology, available stitch patterns, and potentially some calculation logic down the line.

