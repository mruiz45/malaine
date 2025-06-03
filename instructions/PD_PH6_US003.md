**User Story PD_PH6_US003: Generate Textual Knitting/Crochet Instructions**

* **Sequence Number:** PD_PH6_US003
* **Title:** Generate Textual Knitting/Crochet Instructions from Calculated Pattern Details
* **Description:** As a user, after my pattern is calculated, I want to receive clear, step-by-step textual instructions for knitting or crocheting each part of the garment.
* **Functional Requirements (What & How - User Perspective):**
    1.  Instructions should be presented piece by piece (e.g., "Front Body," "Back Body," "Left Sleeve").
    2.  Instructions should use standard knitting/crochet terminology and abbreviations. A glossary of abbreviations should be available (potentially an existing feature or a new one to link).
    3.  Instructions must be unambiguous and follow a logical construction order.
    4.  The language of instructions should be English (as per i18n requirement).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Instruction Generator Module:**
        * This module takes the `calculatedPatternDetails` JSON (from PD_PH6_US002) as input.
        * It iterates through each piece and its shaping details.
    2.  **Templating/Rules Engine:**
        * Use templates or a rules-based approach to convert structured shaping data into natural language instructions.
        * Example:
            * Data: `{ "type": "waistDecrease", "instructionText": "Dec 1 st each end every 6th row, 5 times." , "startRow": 30 ...}` (if instructionText is pre-generated in calculator)
            * Or Data: `{ "type": "decrease", "side": "eachEnd", "rateStitches": 1, "rateRows": 6, "repetitions": 5, "startRow": 30 }` -> "Starting on row 30, decrease 1 stitch at each end every 6th row, 5 times."
    3.  **Standard Abbreviations:** Maintain a mapping for standard abbreviations (e.g., K for Knit, P for Purl, st(s) for stitch(es), BO for Bind Off).
    4.  **Output Format:** The output can be a structured text (e.g., Markdown, plain text, or HTML) for display on a web page.
        ```markdown
        ## Front Body
        Cast on 120 stitches.
        Work in Stockinette stitch for 30 rows.
        **Waist Shaping:**
        Row 31 (RS): K1, K2tog, knit to last 3 sts, SSK, K1. (118 sts)
        Work 5 rows even.
        Repeat last 6 rows 4 more times. (110 sts)
        Continue even until piece measures X cm from cast-on edge, ending with a WS row. (Approx. Row 150)
        **Shape Armholes:**
        Next row (RS): BO 5 sts, knit to end. (105 sts)
        Next row (WS): BO 5 sts, purl to end. (100 sts)
        ...
        ```
    5.  **i18n for Instructions:** While core instructions are English, common terms/phrases ("Cast on", "Work in", "Repeat") should use i18n keys if further localization is ever planned. For now, ensure pure English output.
        * `patternInstructions.castOn`: "Cast on {stitchCount} stitches."
        * `patternInstructions.workInStitch`: "Work in {stitchName} for {rowCount} rows."
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a `calculatedPatternDetails` object for a sweater.
    2.  When the instruction generator processes it.
    3.  Then textual instructions are generated for each piece.
    4.  Verify instructions are clear, use standard terminology, and accurately reflect the shaping defined in `calculatedPatternDetails`.
    5.  Compare generated instructions against a manually written pattern for a similar simple garment to check for correctness and completeness.
    6.  Ensure row counts and stitch counts mentioned in instructions are consistent.

