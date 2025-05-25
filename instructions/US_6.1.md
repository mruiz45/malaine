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

