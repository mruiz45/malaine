Okay, let's move on to Phase 7. Now that we have a basic framework for defining parameters, integrating with a calculation engine, and generating simple instructions for a rectangular piece, this phase will focus on expanding the range of supported items by adding accessories and introducing the crucial concept of shaping calculations (increases and decreases).

---

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

**User Story 7.2**

1.  **Title:** Implement Basic Shaping Calculations (Increases/Decreases) for a Garment Component
2.  **Goal:** As a pattern calculation engine, for a garment component that requires simple linear shaping (e.g., a tapered sleeve, an A-line body), I need to calculate the rate and placement of increases or decreases to transition between two different stitch counts over a specified length/number of rows.
3.  **Description:** This is a crucial step towards more complex garments, directly addressing PDF section 4.2 ("Gestion des Augmentations et Diminutions"). This story focuses on calculating evenly distributed increases/decreases for simple, linear shaping.
4.  **Functional Requirements:**
    * FR1: The calculation logic must accept:
        * Starting stitch count for the component section.
        * Target stitch count for the component section (can be more or less than starting).
        * Total number of rows over which the shaping should occur.
        * Number of stitches to increase/decrease at each shaping point (e.g., 1 stitch inc/dec at each end of a row = 2 stitches total per shaping row). Assume symmetrical shaping for now.
        * Gauge (rows per unit of length).
    * FR2: Calculate the total number of stitches to be increased or decreased: `total_shaping_stitches = abs(target_stitch_count - starting_stitch_count)`.
    * FR3: Calculate the number of shaping rows needed: `num_shaping_rows = total_shaping_stitches / stitches_changed_per_shaping_row`.
    * FR4: Calculate the interval between shaping rows: `shaping_interval_rows = floor(total_rows_for_shaping / num_shaping_rows)`.
    * FR5: Determine the number of "plain" rows and any remaining rows to distribute. The goal is to distribute the shaping as evenly as possible. (E.g., "Shape every X rows Y times, then every Z rows W times").
    * FR6: The output should be a data structure describing the shaping schedule (e.g., type of shaping, rate, number of repeats).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: Part of the standardized calculation engine input for a component, now including `starting_stitch_count`, `target_stitch_count`, `rows_for_shaping`, `stitches_per_shaping_event`.
        * Output (within a component's calculation results):
            ```json
            "shaping_schedule": [
              {
                "type": "decrease", // or "increase"
                "total_stitches_to_decrease": 20,
                "stitches_per_event": 2, // e.g., 1 at each end
                "num_shaping_events": 10,
                "instructions_text_simple": "Decrease 1 stitch at each end of the row every 6th row, 10 times.",
                "detailed_breakdown": [ // More precise for instruction generator
                   {"action_row_offset": 0, "instruction": "Work 5 rows plain."}, // Starting from previous row
                   {"action_row_offset": 6, "instruction": "Decrease Row: Dec 1 st at beg, work to last 2 sts, dec 1 st."},
                   // ... repeated for num_shaping_events
                ]
              }
            ]
            ```
    * **API Endpoints (Conceptual):**
        * This logic is part of the `POST /api/pattern_calculator/calculate_pattern` implementation.
    * **Logic/Processing:**
        * Algorithm for even distribution:
            * `total_rows = total_rows_for_shaping`
            * `num_events = num_shaping_rows`
            * If `num_events == 0`, no shaping.
            * `base_interval = floor(total_rows / num_events)`
            * `remainder_rows = total_rows % num_events`
            * `num_longer_intervals = remainder_rows`
            * `num_shorter_intervals = num_events - remainder_rows`
            * This means `num_shorter_intervals` will have `base_interval` rows between shaping, and `num_longer_intervals` will have `base_interval + 1` rows between shaping. Distribute these.
        * This logic will initially apply to straight tapers like sleeves or A-line sides. More complex shaping (e.g., armholes, necklines) requires more sophisticated algorithms (future phases).
    * **UI Considerations (High-Level):**
        * Not directly UI-facing, but the `instructions_text_simple` can be shown in the Pattern Outline (US 5.3) or an advanced preview.
    * **Integration Points:**
        * Core part of the `CorePatternCalculationEngine.java`.
        * Output will be used by US 7.3 to generate shaped instructions.
        * Requires component definitions (from Phase 4 tools like US 4.5 for sleeves) to specify starting/target widths/stitch counts for shaping.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: To decrease from 60 sts to 40 sts (20 sts total dec) over 60 rows, decreasing 2 sts per dec row (1 each end): Needs 10 dec rows. Calculation should be "Decrease every 6th row, 10 times."
    * AC2: To increase from 30 sts to 50 sts (20 sts total inc) over 55 rows, increasing 2 sts per inc row: Needs 10 inc rows. Calculation should be "Increase every 5th row 5 times, then every 6th row 5 times" (or similar even distribution).
    * AC3: The output data structure correctly describes the shaping schedule.
    * AC4: Handles cases with no shaping required.
7.  **Assumptions/Pre-conditions:**
    * The system can determine `starting_stitch_count`, `target_stitch_count`, and `total_rows_for_shaping` for a component section based on the user's definitions (e.g., for a sleeve, cuff stitches to upper arm stitches over sleeve length).
    * For now, assumes symmetrical shaping (same increase/decrease at both ends of a row if shaping 2 stitches).
8.  **Impacted System Components (Illustrative):**
    * Modified Backend: `CorePatternCalculationEngine.java` (new module/methods for shaping calculations like `ShapingCalculatorService.java`).

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

---

This concludes Phase 7. The application can now handle basic accessories and, critically, can calculate and provide instructions for simple linear shaping. This opens the door to creating patterns for a much wider variety of non-rectangular garment pieces and is a foundational step for more complex shaping like necklines and armholes.