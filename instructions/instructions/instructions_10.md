Okay, we will skip the previously planned Phase 10 (User Accounts and Project Management) and proceed directly to a new Phase 10 focusing on advanced auxiliary features. A key auxiliary feature highlighted in your PDF is the adaptation of existing patterns (PDF section 6.3.2). We'll start with a version of this tool.

---

**Phase 10: Advanced Auxiliary Features**

This phase introduces significant new tools that enhance the application's utility beyond generating patterns from scratch. We will begin by tackling the complex but highly useful feature of helping users adapt existing patterns to their own gauge and size.

**User Story 10.1**

1.  **Title:** Implement "Existing Pattern Numerical Resizer" Tool (Basic Version)
2.  **Goal:** As a user who has an existing pattern with known stitch/row counts and dimensions for a simple garment structure (e.g., a basic sweater), I want a tool where I can input these key numerical values, my own gauge, and my desired finished dimensions, so that the tool can attempt to rescale the pattern's numerical values (stitches, rows, shaping rates) for me.
3.  **Description:** This tool aims to help users adapt a pattern they already possess (but perhaps not in digital, parsable format) to their specific needs. Instead of trying to parse free-form text (which is very complex), this initial version will require the user to manually extract and input the core numerical data from their existing pattern into a structured form. The tool will then use this data, along with the user's gauge and desired new size, to provide adjusted numbers. This is a first step towards "Adaptation de Patrons Existants" (PDF 6.3.2).
4.  **Functional Requirements:**
    * FR1: User can select a basic garment structure template that the tool understands (e.g., "Simple Drop Shoulder Sweater," "Basic Rectangular Scarf," "Simple Tapered Sleeve"). This template defines the expected key numerical inputs.
    * FR2: For the selected template (e.g., "Simple Drop Shoulder Sweater - Body Panel"):
        * User inputs the original pattern's gauge (stitches/rows per unit).
        * User inputs key numbers for a main flat piece from their existing pattern:
            * Cast-on stitches.
            * Rows worked plain (or to a certain point like armhole).
            * Finished width and length of this piece in the original pattern.
        * If the piece has simple linear shaping (like an A-line side or a very basic sleeve taper):
            * Original starting stitches for shaping.
            * Original ending stitches after shaping.
            * Number of rows over which shaping occurred in the original pattern.
            * Number of stitches increased/decreased per shaping row in the original pattern.
    * FR3: User inputs their own new gauge (from US 1.1 or direct input).
    * FR4: User inputs their desired NEW finished dimensions for that piece (e.g., new width, new length).
    * FR5: The tool will then calculate and display:
        * New suggested cast-on stitches for the new gauge and new desired width.
        * New suggested total rows for the new gauge and new desired length.
        * If shaping was involved:
            * New suggested starting/ending stitches based on the new desired widths at those points.
            * A new suggested shaping rate (e.g., "Decrease 1 st each end every X rows, Y times") to achieve the new target shaping over the new target length/rows.
    * FR6: The tool should clearly label original values, user's new parameters, and the newly calculated values.
    * FR7: Provide disclaimers that this is a numerical rescaling and doesn't understand complex pattern features, shaping intricacies not covered by the template, or how stitch patterns might be affected. The user must use their judgment.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * No new primary database tables for storing *user-inputted existing pattern numbers* unless we want to save these attempts (which would require user accounts, so skipping for now). This tool is primarily a calculator.
        * It will use existing `gauge_profiles` (US 1.1).
        * It will need internal templates defining the expected numerical inputs for different simple garment structures.
            * Example template structure (`pattern_resizer_templates.json`):
            ```json
            [
              {
                "template_key": "simple_body_panel_rectangular",
                "display_name": "Simple Rectangular Body Panel (Sweater/Cardigan)",
                "inputs_original_pattern": [
                  {"key": "original_gauge_stitches", "label": "Original Gauge: Stitches per 10cm/4in"},
                  {"key": "original_gauge_rows", "label": "Original Gauge: Rows per 10cm/4in"},
                  {"key": "original_cast_on", "label": "Original Cast-On Stitches"},
                  {"key": "original_rows_total", "label": "Original Total Rows"},
                  {"key": "original_finished_width", "label": "Original Finished Width (cm/in)"},
                  {"key": "original_finished_length", "label": "Original Finished Length (cm/in)"}
                ],
                "inputs_new_params": [
                  // user's new gauge (from US 1.1 component)
                  {"key": "new_finished_width", "label": "Desired NEW Finished Width (cm/in)"},
                  {"key": "new_finished_length", "label": "Desired NEW Finished Length (cm/in)"}
                ],
                "outputs_calculated": [
                  "new_cast_on_stitches", "new_total_rows",
                  "new_actual_width", "new_actual_length"
                ]
              },
              {
                "template_key": "simple_sleeve_tapered",
                "display_name": "Simple Tapered Sleeve",
                "inputs_original_pattern": [
                  // original gauge...
                  {"key": "original_cuff_stitches", "label": "Original Cuff Stitches"},
                  {"key": "original_upper_arm_stitches", "label": "Original Upper Arm Stitches"},
                  {"key": "original_sleeve_length_rows", "label": "Original Sleeve Length (in Rows)"},
                  {"key": "original_shaping_stitches_per_event", "label": "Original Sts Inc/Dec per Shaping Row (e.g., 2 for 1 each end)"}
                ],
                "inputs_new_params": [
                  // new gauge...
                  {"key": "new_cuff_width", "label": "Desired NEW Cuff Width (cm/in)"},
                  {"key": "new_upper_arm_width", "label": "Desired NEW Upper Arm Width (cm/in)"},
                  {"key": "new_sleeve_length", "label": "Desired NEW Sleeve Length (cm/in)"}
                ],
                "outputs_calculated": [
                  "new_cuff_stitches", "new_upper_arm_stitches",
                  "new_sleeve_length_rows", "new_shaping_schedule_summary"
                ]
              }
              // ... more templates ...
            ]
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/tools/pattern_resizer/calculate`
            * Payload: `{ "template_key": "...", "original_pattern_values": {...}, "new_gauge": {...}, "new_dimension_values": {...} }`
            * Response: `{ "calculated_new_values": {...}, "warnings": [...] }`
    * **Logic/Processing:**
        1.  **Get Inputs:** Original pattern numbers, original gauge, new gauge, new desired dimensions.
        2.  **Calculate New Stitches/Rows for Main Dimensions:**
            * `New Cast-On = new_desired_width * (new_gauge_stitches / unit)` (Similar to US 6.2).
            * `New Total Rows = new_desired_length * (new_gauge_rows / unit)`.
        3.  **Calculate New Shaping (if applicable, for templates like "simple_sleeve_tapered"):**
            * Convert new desired cuff/upper arm widths to stitch counts using the *new* gauge: `new_cuff_stitches`, `new_upper_arm_stitches`.
            * Convert new desired sleeve length to row count using the *new* gauge: `new_sleeve_length_rows`.
            * Use the shaping calculation logic from US 7.2 with these new start/end stitches and new total rows. The `stitches_changed_per_shaping_row` can be taken from the original pattern's input or assumed to be 2 (1 each side).
        4.  Package results with clear labels and any warnings (e.g., "Original pattern had X shaping events, new pattern suggests Y. Verify if this change in frequency is acceptable.").
    * **UI Considerations (High-Level):**
        * A dedicated tool section.
        * Dropdown to select the "Existing Pattern Structure Template."
        * Dynamically displayed input fields based on the selected template.
        * Clear separation of "Original Pattern Inputs," "Your New Gauge & Size," and "Calculated New Numbers."
        * Prominent display of disclaimers.
    * **Integration Points:**
        * Uses gauge input component (US 1.1).
        * Reuses shaping calculation logic (US 7.2).
    * **Testing and Validation:**
        * Scenario 1 (Rectangular piece): User inputs original cast-on 100 sts (for 50cm width at 20sts/10cm gauge) and 150 rows (for 75cm length at 20rows/10cm gauge). User's new gauge is 22sts/30rows per 10cm. Desired new width 55cm, new length 80cm.
            * Tool calculates: New Cast-On = $55 \text{cm} \times (22\text{sts}/10\text{cm}) = 121 \text{ sts}$. New Total Rows = $80 \text{cm} \times (30\text{rows}/10\text{cm}) = 240 \text{ rows}$.
        * Scenario 2 (Tapered Sleeve): User inputs original cuff 40sts, upper arm 80sts, length 100 rows, shaping 2sts/event. New gauge, new desired cuff width (e.g. $18 \text{ cm}$), new upper arm width (e.g. $36 \text{ cm}$), new length ($50 \text{ cm}$). Tool converts new widths/length to new stitches/rows using new gauge, then applies shaping logic from US 7.2.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select a "Simple Rectangular Body Panel" template and input all required original and new parameters.
    * AC2: The tool correctly calculates and displays the new cast-on stitches and total rows based on the new gauge and desired dimensions for the rectangular panel.
    * AC3: User can select a "Simple Tapered Sleeve" template and input all required parameters.
    * AC4: The tool correctly calculates new cuff/upper arm stitches, new total rows for sleeve length, and provides a new shaping schedule summary (e.g., "Inc 1 st each end every X rows, Y times").
    * AC5: Disclaimers about the limitations of the tool are clearly visible.
7.  **Assumptions/Pre-conditions:**
    * US 1.1 (Gauge input) and US 7.2 (Shaping Calculation logic) are implemented and can be reused.
    * A set of initial "Existing Pattern Structure Templates" (defining input fields and expected calculations) is created. This requires careful thought about common simple structures.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `PatternResizerTool.vue`, `PatternResizerInputForm.vue`.
    * New Backend service: `PatternResizerService.java` (or similar), potentially using `ShapingCalculatorService.java`.
    * New API endpoint: `POST /api/tools/pattern_resizer/calculate`.
    * Configuration file: `pattern_resizer_templates.json` (or DB table for these templates).

**User Story 10.2 (Follow-up to 10.1, if pursued)**

1.  **Title:** Enhance "Existing Pattern Resizer" to Parse Simplified Structured Text Input
2.  **Goal:** As a user, instead of manually inputting every number from my existing pattern, I want to be able to paste in the pattern text (if it follows a very simple, predefined structure or uses specific keywords for key numbers) and have the tool attempt to extract some of the original numerical values automatically.
3.  **Description:** This makes US 10.1 more user-friendly by reducing manual data entry *if* the source pattern text is cooperative or if users are willing to slightly reformat their pattern text to match a simple template. This is still far from full NLP parsing of arbitrary patterns.
4.  **Functional Requirements:**
    * FR1: Define a very simple, keyword-based, or line-based structured text format that users could use to represent their existing pattern's key numbers.
        * Example:
            ```
            PATTERN_NAME: My Old Sweater
            ORIGINAL_GAUGE_STITCHES_PER_10CM: 20
            ORIGINAL_GAUGE_ROWS_PER_10CM: 28
            COMPONENT: BodyPanel
            CAST_ON: 100
            ROWS_TOTAL: 150
            FINISHED_WIDTH_CM: 50
            FINISHED_LENGTH_CM: 75
            COMPONENT: Sleeve
            CUFF_STITCHES: 40
            UPPER_ARM_STITCHES: 80
            // ... etc.
            ```
    * FR2: Provide a text area where the user can paste this structured text.
    * FR3: Implement a parser that can read this specific format and extract the numerical values to populate the "Original Pattern Values" fields of the tool from US 10.1.
    * FR4: If parsing fails or some values are missing, provide clear error messages and allow the user to manually correct or fill in the fields.
    * FR5: Once values are extracted/corrected, the rest of the resizing process from US 10.1 proceeds as before.
5.  **Technical Implementation Guidance:**
    * **Data Models:** No new database models. Input is text.
    * **API Endpoints (Conceptual):**
        * The `POST /api/tools/pattern_resizer/calculate` endpoint might be enhanced to optionally accept `original_pattern_text_structured` instead of `original_pattern_values`. The backend would then parse it.
        * Or, a new endpoint: `POST /api/tools/pattern_resizer/parse_text` which returns the extracted `original_pattern_values` that the client then uses with the existing calculate endpoint.
    * **Logic/Processing:**
        * A simple text parser (e.g., using regular expressions or line-by-line keyword matching) to extract values based on the predefined structured format.
        * Robust error handling for malformed input.
    * **UI Considerations (High-Level):**
        * Add a text area input to `PatternResizerTool.vue`.
        * "Parse Text" button.
        * Feedback on parsing success/failure. Parsed values automatically populate the manual input fields from US 10.1.
    * **Integration Points:** Directly enhances US 10.1.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User pastes text conforming to the defined simple structured format.
    * AC2: The tool correctly parses the text and populates the "Original Pattern Values" fields (e.g., cast-on, rows).
    * AC3: If the text is malformed (e.g., missing keyword, non-numeric value), an appropriate error message is shown.
    * AC4: After successful parsing, the user can proceed with the resizing calculation as in US 10.1.
7.  **Assumptions/Pre-conditions:**
    * US 10.1 is implemented.
    * A clear, simple, and well-documented structured text format for pattern input is defined.
8.  **Impacted System Components (Illustrative):**
    * Modified UI: `PatternResizerTool.vue` (adds text area and parse button).
    * New Backend logic: `StructuredPatternTextParser.java` (or similar).
    * Modified Backend service: `PatternResizerService.java` to use the parser.

**User Story 10.3**

1.  **Title:** Implement Public Pattern Showcase (Read-Only Examples)
2.  **Goal:** As a new or prospective user, I want to be able to browse a gallery of example patterns generated by this application, so I can see its capabilities and get inspiration, without needing to log in or define a pattern myself.
3.  **Description:** This addresses part of PDF Section 6.4 ("Communauté et Partage") in a simplified, read-only manner, suitable for an application without user accounts for content generation. It involves creating a curated list of pre-generated patterns that users can view.
4.  **Functional Requirements:**
    * FR1: Create a curated set of example patterns. These patterns would be generated by an admin/developer using the application's full capabilities (as developed up to Phase 9) and their full JSON output (from US 9.1) stored.
    * FR2: Develop a new UI view ("Pattern Showcase") that displays a gallery of these example patterns (e.g., showing a title, a main image/schematic thumbnail, and a brief description for each).
    * FR3: Users can click on an example pattern in the gallery to view its full details using the existing `PatternViewer.vue` component (US 9.1), effectively loading the stored pattern JSON into it.
    * FR4: The showcase should be browsable, perhaps with simple categories (e.g., "Sweaters," "Accessories," "Beginner Friendly").
    * FR5: This feature is read-only; users cannot submit their own patterns to this public showcase in this iteration.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * A new table to store metadata for the showcase patterns:
            ```sql
            CREATE TABLE IF NOT EXISTS showcased_patterns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(255) NOT NULL,
                description TEXT,
                thumbnail_image_url TEXT, -- URL to a representative image/schematic
                category VARCHAR(100), -- e.g., 'Sweaters', 'Accessories'
                difficulty_level VARCHAR(50), -- e.g., 'Beginner', 'Intermediate'
                -- Store the full pattern JSON (output of US 9.1) that drives the PatternViewer
                full_pattern_data JSONB NOT NULL,
                is_published BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * This table would be populated by an admin process.
    * **API Endpoints (Conceptual):**
        * `GET /api/showcase/patterns` (to list patterns for the gallery, with filtering/pagination).
        * `GET /api/showcase/patterns/{id}` (to get the `full_pattern_data` JSON for a specific showcased pattern, which is then passed to `PatternViewer.vue`).
    * **Logic/Processing:**
        * Backend service to serve the list of showcased patterns and their full data.
        * Frontend logic to display the gallery and load selected patterns into the `PatternViewer.vue`.
    * **UI Considerations (High-Level):**
        * An attractive gallery layout for `ShowcaseBrowser.vue`.
        * Clear presentation of pattern thumbnails and basic info.
        * Seamless transition to the `PatternViewer.vue` when a pattern is selected.
    * **Integration Points:**
        * Reuses `PatternViewer.vue` (US 9.1) for displaying the pattern details.
        * Requires a set of pre-generated example patterns (using functionalities from Phases 1-9).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: A "Pattern Showcase" or "Examples" link is available in the application.
    * AC2: The showcase gallery displays a list of at least 3-5 example patterns with thumbnails and descriptions.
    * AC3: Clicking on an example pattern loads its full details (materials, instructions, schematics if available) correctly into the Pattern Viewer.
    * AC4: The showcase is accessible to users without logging in.
7.  **Assumptions/Pre-conditions:**
    * US 9.1 (Pattern Viewer) is robust and can display any valid pattern JSON.
    * A process for administrators to generate and add example patterns to the `showcased_patterns` table is established (can be manual DB inserts initially).
    * Example pattern data (full JSON, thumbnails) has been created.
8.  **Impacted System Components (Illustrative):**
    * New UI components: `ShowcaseBrowser.vue`, `ShowcasePatternCard.vue`.
    * New Backend: `ShowcaseController.java`, `ShowcaseService.java`.
    * New DB table: `showcased_patterns`.
    * Reuses `PatternViewer.vue`.

---

This completes the redefined Phase 10. The application now includes a powerful tool for adapting existing numerical patterns and a way to showcase its capabilities through example patterns. Depending on the project's priorities, further auxiliary features or more in-depth community functionalities (if user accounts were to be introduced later) could be explored.