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

