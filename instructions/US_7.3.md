**User Story 7.3**

1.  **Title:** Generate Textual Instructions for a Garment Piece with Simple Linear Shaping
2.  **Goal:** As a user, after the system calculates a simple linear shaping schedule for a garment piece (e.g., tapered sleeve), I want to see clear textual instructions on how and when to work the increases or decreases.
3.  **Description:** This builds on US 6.3 (Basic Instructions) and US 7.2 (Shaping Calculations) to generate instructions that include the "how-to" for the calculated shaping.
4.  **Functional Requirements:**
    * FR1: Input: Calculated data for a piece (from US 6.2) AND its shaping schedule (from US 7.2).
    * FR2: Generate instructions that interleave shaping rows with plain rows according to the schedule.
    * FR3: Provide clear instructions for the shaping rows themselves (e.g., "Decrease Row: K1, k2tog, knit to last 3 sts, ssk, k1." or for crochet "Decrease Row: Sc1, sc2tog, sc across to last 3 sts, sc2tog, sc1.").
        * Initially, can use generic "Decrease 1 stitch at each end" or "Increase 1 stitch at each end." Specific stitch types for dec/inc (k2tog, ssk, M1L, M1R) can be a later enhancement or a user preference.
    * FR4: Instructions should clearly state how many times a shaping sequence is repeated.
    * FR5: Ensure row/round counts in the instructions are accurate and easy to follow.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: Calculation output from US 6.2 augmented with `shaping_schedule` from US 7.2.
        * Output: The `instructions` array (from US 6.3) for a component will now include these more detailed shaping instructions.
            ```json
            // Example instruction for a shaping row within the "instructions" array
            {"step": 5, "row_number_in_section": 6, "type": "shaping_row", "text": "Row 6 (RS - Decrease Row): K1, k2tog, knit to last 3 sts, ssk, k1. (58 sts)"},
            {"step": 6, "type": "plain_segment", "text": "Continue in Stockinette Stitch, work 5 rows plain."}
            ```
    * **API Endpoints (Conceptual):**
        * Part of the response from `POST /api/pattern_calculator/calculate_pattern`.
    * **Logic/Processing:**
        * Iterate through the `detailed_breakdown` or the summarized instruction from the `shaping_schedule` (US 7.2).
        * Construct text for plain row segments.
        * Construct text for shaping rows, specifying the type of shaping.
        * Maintain a running stitch count if possible to include in instructions "(X sts remain)".
        * Differentiate knitting/crochet terminology.
    * **UI Considerations (High-Level):**
        * Displayed in the eventual pattern viewer.
    * **Integration Points:**
        * Consumes output from US 7.2.
        * Extends `InstructionGeneratorService.java`.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: For a sleeve decreasing from 60 to 40 sts over 60 rows (decrease 2 sts every 6th row, 10 times), the instructions include: "Work 5 rows plain. Row 6 (Decrease Row): Decrease 1 st at each end. (58 sts). Work 5 rows plain. Row 12 (Decrease Row): Decrease 1 st at each end. (56 sts)..." (or similar, based on shaping schedule details).
    * AC2: The instructions are clear about when to work plain rows and when to work shaping rows.
    * AC3: Running stitch counts after shaping rows are correctly stated (if implemented).
7.  **Assumptions/Pre-conditions:**
    * US 7.2 is implemented and provides an accurate and detailed shaping schedule.
    * `craft_type` is known.
    * Standard phrasing for basic increase/decrease actions is defined (e.g., "Decrease 1 st at each end").
8.  **Impacted System Components (Illustrative):**
    * Modified Backend: `InstructionGeneratorService.java` (significant enhancements to handle shaping).

