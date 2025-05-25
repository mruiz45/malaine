**User Story 7.1.1 (Follow-up to 7.1)**

1.  **Title:** Implement Calculation Logic and Basic Instructions for a Simple Beanie/Hat
2.  **Goal:** As a pattern calculation engine, after a user defines parameters for a simple beanie/hat (head circumference, height, gauge, basic brim/crown), I need to calculate the necessary stitch/row counts and generate basic knitting/crochet instructions for it.
3.  **Description:** This story extends US 6.2 (Core Calculation Logic) and US 6.3 (Basic Instructions) to handle a simple beanie. This involves calculations for working in the round (typically), brim, body, and a very basic tapered crown (e.g., decreasing evenly over a few rounds). This addresses PDF sections 3.2.1 ("Bonnets et Chapeaux"), 4.1, 4.2, 5.1, 5.2.
4.  **Functional Requirements:**
    * FR1: Accept input derived from a "Beanie/Hat" `pattern_definition_session` (including gauge, finished head circumference with ease applied, hat height, brim details, craft type).
    * FR2: Calculate cast-on stitches for the brim, considering negative ease typical for hats and working in the round. Adjust for stitch pattern repeats if applicable.
    * FR3: Calculate rows/rounds for the brim based on its defined depth.
    * FR4: Calculate rows/rounds for the main body of the hat up to where crown shaping begins.
    * FR5: Implement a simple, generic algorithm for crown decreases (e.g., "divide stitches into 6-8 sections, decrease 1 st per section every other round until X stitches remain").
    * FR6: Generate textual instructions for:
        * Casting on (or initial chain for crochet) for working in the round.
        * Working the brim.
        * Working the body.
        * Working the crown decreases.
        * Finishing (e.g., "Cut yarn, draw through remaining stitches and pull tight").
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: Standardized calculation engine input (US 6.1), tailored for a beanie definition from US 7.1.
        * Output: Augment the calculation engine's response structure (from US 6.2, 6.3) to include sections for brim, body, crown, each with their calculated values and instructions.
    * **API Endpoints (Conceptual):**
        * Part of the existing `POST /api/pattern_calculator/calculate_pattern`.
    * **Logic/Processing:**
        * `Target Brim Circumference = desired_finished_head_circumference - typical_hat_negative_ease_percentage_or_value`.
        * `Brim Cast-on Stitches = Target Brim Circumference * stitches_per_unit_of_length` (adjusted for stitch repeats and working in round).
        * Brim rows/rounds calculation.
        * Body rows/rounds calculation (considering total height minus brim height minus approximate crown height).
        * Crown decrease logic:
            * Determine number of decrease points (e.g., 6, 8).
            * `stitches_per_section = body_stitches / num_decrease_points`.
            * Plan decrease rounds (e.g., Rnd 1: *(k_stitches_per_section-2, k2tog)* rep. Rnd 2: Knit. Repeat Rnds 1-2 until few stitches remain). This is a simplification; more sophisticated decreases exist.
        * Instruction generation for each part.
    * **UI Considerations (High-Level):**
        * Results displayed in the eventual pattern viewer.
    * **Integration Points:**
        * Extends calculation logic in `CorePatternCalculationEngine.java`.
        * Extends instruction generation in `InstructionGeneratorService.java`.
        * Uses parameters defined in US 7.1.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given gauge, target head circumference (e.g., $56 \text{ cm}$), desired height ($20 \text{ cm}$), brim depth ($5 \text{ cm}$), and a simple tapered crown choice (for knitting). The system calculates reasonable stitch/round counts for brim, body, and crown.
    * AC2: Basic textual instructions are generated for all parts of the beanie, including cast-on for in-the-round, brim, body, a generic even decrease for crown, and finishing.
    * AC3: Calculations correctly account for working in the round.
7.  **Assumptions/Pre-conditions:**
    * US 7.1 is implemented. US 6.1, 6.2, 6.3 are implemented.
    * `craft_type` is known.
    * A simple, standard algorithm for crown decreases is defined.
8.  **Impacted System Components (Illustrative):**
    * Modified Backend: `CorePatternCalculationEngine.java`, `InstructionGeneratorService.java`.
    * New calculation modules specific to hats if logic becomes complex (e.g., `BeanieCalculator.java`).

**User Story 7.1.2 (Follow-up to 7.1)**

1.  **Title:** Implement Calculation Logic and Basic Instructions for a Simple Scarf/Cowl
2.  **Goal:** As a pattern calculation engine, after a user defines parameters for a simple scarf or cowl (dimensions, gauge, flat vs. round), I need to calculate the necessary stitch/row counts and generate basic knitting/crochet instructions.
3.  **Description:** This story extends US 6.2 and US 6.3 for scarves/cowls. For a flat scarf, it's similar to the rectangular piece but with specific context. For a cowl, it involves working in the round. This addresses PDF sections 3.2.2 ("Écharpes et Châles"), 4.1, 5.1, 5.2.
4.  **Functional Requirements:**
    * FR1: Accept input derived from a "Scarf/Cowl" `pattern_definition_session` (gauge, finished dimensions, craft type, flat/round).
    * FR2: For a flat scarf: Calculate cast-on stitches for width and total rows for length (similar to US 6.2).
    * FR3: For a cowl worked in the round: Calculate cast-on stitches for circumference and total rounds for height.
    * FR4: Generate textual instructions for:
        * Casting on (flat or for working in the round).
        * Working the body of the scarf/cowl.
        * Binding off (or equivalent finishing).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: Standardized calculation engine input (US 6.1), tailored for scarf/cowl definition from US 7.1.
        * Output: Similar structure to US 6.3, with calculated values and instructions.
    * **API Endpoints (Conceptual):**
        * Part of `POST /api/pattern_calculator/calculate_pattern`.
    * **Logic/Processing:**
        * Scarf: Essentially uses the rectangular piece logic from US 6.2.
        * Cowl: `Cast-on Stitches = Target Circumference * stitches_per_unit_of_length`. `Total Rounds = Target Height * rows_per_unit_of_length`.
        * Instruction generation for cast-on (flat vs. round), body, bind-off.
    * **UI Considerations (High-Level):**
        * Results displayed in the eventual pattern viewer.
    * **Integration Points:**
        * Extends/uses `CorePatternCalculationEngine.java` and `InstructionGeneratorService.java`.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given gauge, target scarf width ($20 \text{ cm}$), length ($150 \text{ cm}$). Correct cast-on stitches and total rows are calculated, and flat knitting instructions are generated.
    * AC2: Given gauge, target cowl circumference ($60 \text{ cm}$), height ($30 \text{ cm}$). Correct cast-on stitches and total rounds are calculated, and in-the-round knitting instructions are generated.
7.  **Assumptions/Pre-conditions:**
    * US 7.1 is implemented. US 6.1, 6.2, 6.3 are implemented.
    * `craft_type` is known.
8.  **Impacted System Components (Illustrative):**
    * Modified Backend: `CorePatternCalculationEngine.java`, `InstructionGeneratorService.java`.
    * New calculation modules if needed (e.g., `CowlCalculator.java`).

