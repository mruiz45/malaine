Okay, let's embark on Phase 6. This is a pivotal phase where all the detailed pattern definition work from the previous phases starts to connect with the core logic of pattern calculation. The goal here is to take the user's defined parameters and begin translating them into quantifiable numbers (stitches, rows) and then into initial, basic instructions. This phase directly addresses PDF Section 4 ("Calculs et Algorithmes") and begins to touch upon Section 5 ("Génération et Visualisation du Patron").

---

**Phase 6: Integrating with Core Pattern Calculation Engine**

This phase focuses on bridging the gap between the pattern definition tools and the underlying calculation engine that will generate the specifics of the pattern. It involves defining the data contract for this engine and implementing the initial calculation logic for a basic garment piece, followed by generating simple textual instructions.

**User Story 6.1**

1.  **Title:** Define API Contract and Data Structure for Core Pattern Calculation Engine Input
2.  **Goal:** As a system architect/developer, I need to define a clear and comprehensive API contract and input data structure for the Core Pattern Calculation Engine, so that the pattern definition data collected via the UI tools can be consistently and accurately passed to the engine for processing.
3.  **Description:** This story is about designing the "handover" mechanism. The `pattern_definition_session` (US 1.6 and enhanced throughout Phases 4 & 5) holds a wealth of information. This story defines precisely how that information is packaged and sent to the calculation engine, whether it's an existing engine being integrated with or a new one being built. This structured input is crucial for decoupling the UI/definition tools from the calculation logic.
4.  **Functional Requirements:**
    * FR1: Define a comprehensive JSON schema (or equivalent data structure definition) for the input to the calculation engine. This schema should encompass all relevant data from the `pattern_definition_session`, including:
        * Selected Gauge Profile (stitch/row counts, units).
        * Relevant User Measurements (from the selected Measurement Set, potentially adjusted based on morphology advice).
        * Ease Preferences (applied to measurements to get finished garment dimensions).
        * Selected Yarn Profile (for informational purposes, e.g., weight category which might influence default shaping algorithms if not overridden by user choices).
        * Selected main Stitch Pattern (name, repeats – for stitch count adjustments).
        * Selected Garment Type and its defined Components (from US 4.1 onwards), including:
            * Construction method, body shape.
            * Neckline style and parameters.
            * Sleeve style and parameters.
            * Any other specific attributes set by the user.
    * FR2: Document the API endpoint (if the engine is a separate service/module) that will accept this data structure. Define request/response formats.
    * FR3: Ensure the data structure can clearly distinguish between raw body measurements, desired ease, and target finished garment dimensions.
    * FR4: The structure must be versionable to accommodate future enhancements to pattern definition capabilities.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * The primary output is a well-defined JSON schema document. This schema will be based on the structure of `pattern_definition_sessions` and its related entities, but flattened or transformed into the ideal input format for the calculation engine.
        * Example snippet of the JSON input structure for the engine:
            ```json
            {
              "version": "1.0.0",
              "sessionId": "uuid-of-pattern-definition-session",
              "units": { // Preferred units for calculation output, or units of input if not converting
                "dimensionUnit": "cm",
                "gaugeUnit": "cm"
              },
              "gauge": {
                "stitchesPer10cm": 22,
                "rowsPer10cm": 30,
                // ...
              },
              "yarn": {
                "name": "Super Fine Merino DK",
                "weightCategory": "DK"
                // ...
              },
              "stitchPattern": {
                "name": "Stockinette Stitch",
                "horizontalRepeat": 1,
                "verticalRepeat": 1
                // ...
              },
              "garment": {
                "typeKey": "sweater_pullover",
                "displayName": "Pullover Sweater",
                "constructionMethod": "drop_shoulder",
                "bodyShape": "straight",
                "measurements": { // These are TARGET FINISHED DIMENSIONS after ease
                  "finishedChestCircumference": 100, // body_chest + ease_chest
                  "finishedLength": 60, // body_torso_length + ease_length
                  // ... other relevant finished dimensions
                },
                "components": [
                  {
                    "componentKey": "front_body_panel", // Or just "body_panel" if front/back are identical initially
                    "targetWidth": 50, // Half of finishedChestCircumference
                    "targetLength": 60,
                    "attributes": {
                       // component specific attributes if any, not already part of global garment settings
                    }
                  },
                  {
                    "componentKey": "sleeve",
                    "targetLength": 45,
                    "targetUpperArmCircumference": 35,
                    "attributes": {
                      "style": "tapered",
                      "cuff_style": "ribbed_1x1",
                      "cuff_depth_cm": 5
                    }
                  },
                  {
                    "componentKey": "neckband",
                    "attributes": {
                       "style": "v_neck",
                       "depth_cm": 12,
                       "target_width_cm": 40 // Example: calculated circumference of neck opening
                    }
                  }
                  // ... other components
                ]
              }
            }
            ```
    * **API Endpoints (Conceptual):**
        * If a new engine module: `POST /api/pattern_calculator/calculate_pattern`
            * Request Body: The JSON object defined above.
            * Response Body: JSON object containing calculated values (stitch/row counts for components, shaping instructions, etc.) – this will be further defined in US 6.2.
    * **Logic/Processing:**
        * A service layer method that transforms data from `pattern_definition_sessions` (and its related entities) into this new defined JSON structure.
        * This transformation logic will need to apply ease to body measurements to get target finished dimensions before passing them to the engine.
    * **UI Considerations (High-Level):**
        * No direct UI for this story, but it enables the "Calculate Pattern" button that users will eventually click.
    * **Integration Points:**
        * The `PatternOutlineService` (US 5.3) might use parts of this transformation logic or the resulting JSON structure.
        * This is the critical input interface for all subsequent calculation User Stories (US 6.2 onwards).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: A JSON schema defining the input structure for the calculation engine is created and documented.
    * AC2: The schema accurately represents all necessary data points from a complete pattern definition session for a simple garment (e.g., a drop-shoulder sweater).
    * AC3: A transformation function/service can successfully convert data from a `pattern_definition_session` object into the defined JSON input structure, correctly applying ease to measurements to derive finished dimensions.
    * AC4: The API endpoint contract (if applicable) is documented.
7.  **Assumptions/Pre-conditions:**
    * The structure of `pattern_definition_sessions` and its related entities is stable and well-understood.
    * A clear decision has been made on whether the calculation engine is an existing component to interface with or a new one to be built (this US focuses on the *input to* the engine).
8.  **Impacted System Components (Illustrative):**
    * New Backend service: `PatternCalculationInputBuilderService.java` (or similar).
    * Documentation: API contract document, JSON schema file.
    * This will influence/define the interface of `CorePatternCalculationEngine.java`.

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

This completes Phase 6. We've now defined the interface to the calculation engine, implemented basic rectangular piece calculations, and generated rudimentary instructions. The subsequent phases will expand on these calculations to include shaping (increases/decreases for necklines, armholes, sleeves), different garment components, and more detailed instructions.