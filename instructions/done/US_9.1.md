
**Phase 9: Full Pattern Generation and Output**

This phase focuses on assembling all the calculated data and generated instructions for each garment component into a single, coherent pattern document. It also introduces user-friendly output formats like PDF and basic visual schematics to aid comprehension.

**User Story 9.1**

1.  **Title:** Assemble Full Pattern Document from Calculated Components and Display in UI
2.  **Goal:** As a user, after all calculations and individual component instructions are generated for my defined garment, I want to view the complete, assembled pattern in a dedicated UI view, with all sections (e.g., materials, gauge, front, back, sleeves, finishing) clearly organized.
3.  **Description:** This story focuses on taking the outputs from the `CorePatternCalculationEngine` (which now includes calculations and instructions for various components, potentially with shaping and specific stitch patterns) and presenting them as a unified, multi-section pattern within the application's UI. This is the primary "pattern viewing" experience before any file export.
4.  **Functional Requirements:**
    * FR1: The system must retrieve the complete calculation and instruction set for all components of the garment defined in the current `pattern_definition_session`.
    * FR2: A new UI view ("Pattern Viewer") should be implemented to display the full pattern.
    * FR3: The Pattern Viewer should organize the content into standard pattern sections:
        * **Header/Title:** Garment Name (user-defined or generated), Size.
        * **Materials & Tools:** Selected Yarn(s) (with quantity estimates from US 2.2), Needle/Hook sizes, Gauge.
        * **Abbreviations & Special Stitches:** List of abbreviations used and explanations for any special stitches (e.g., from the Stitch Library US 8.1 if selected).
        * **Finished Measurements:** Key finished dimensions of the garment.
        * **Component Instructions:** Separate, clearly labeled sections for each garment component (e.g., "Back Panel," "Front Panel," "Sleeves (Make 2)," "Neckband"). Each section should contain its full textual instructions generated in previous phases (US 6.3, 7.3, 8.3).
        * **Assembly/Finishing:** Basic, generic instructions for assembling the pieces (e.g., "Sew shoulder seams. Set in sleeves. Sew side and sleeve seams. Weave in ends."). More detailed assembly will be an enhancement.
    * FR4: The Pattern Viewer should be easy to navigate (e.g., scrollable, perhaps with a table of contents or jump links for longer patterns).
    * FR5: Display any warnings or notes generated by the calculation engine (e.g., "Actual width slightly adjusted to accommodate stitch pattern.").
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * The primary input is the comprehensive JSON response from the `POST /api/pattern_calculator/calculate_pattern` endpoint, which should now contain a structured representation of the entire pattern (metadata, materials, gauge, and an array of components, each with its own set_of calculations and instructions).
        * Example structure of the full pattern data passed to the UI:
            ```json
            {
              "patternTitle": "My Custom Drop Shoulder Sweater",
              "targetSizeLabel": "Medium", // or based on measurements
              "craftType": "knitting",
              "gauge": { /* ... from US 6.1 ... */ },
              "yarns": [ { "name": "...", "estimated_quantity": "X skeins/grams" } ],
              "needles_hooks": ["4.0mm circular needles", "3.5mm needles for ribbing"],
              "abbreviations": [ {"abbr": "k", "definition": "knit"}, {"abbr": "p", "definition": "purl"}, /* ... */ ],
              "special_stitches": [ { "name": "3x3 LC", "instructions": "..." } ], // If complex stitch used
              "finished_measurements": { "chest": "100cm", "length": "60cm", /* ... */ },
              "components": [
                {
                  "componentName": "Back Panel",
                  "calculations": { /* ... cast_on, rows etc ... */ },
                  "instructions": [ {"step": 1, "text": "..."} /* ... */ ],
                  "shaping_summary": "Decrease 1 st each end every 6th row..." // Optional summary
                },
                // ... other components (Front Panel, Sleeves, Neckband) ...
              ],
              "assembly_instructions": [ "Sew shoulder seams.", /* ... */ ],
              "pattern_notes": [ "Gauge is critical for this pattern." ]
            }
            ```
    * **API Endpoints (Conceptual):**
        * Uses the existing `POST /api/pattern_calculator/calculate_pattern` endpoint, but now its response is expected to be more complete, covering all components and pattern sections.
    * **Logic/Processing:**
        * A "Pattern Assembler" service on the backend might be responsible for taking the raw component calculations/instructions and organizing them into the final, structured pattern JSON. This service would also generate the list of abbreviations, generic assembly steps, etc.
        * Frontend logic to parse this JSON and render it into the different sections of the Pattern Viewer UI.
    * **UI Considerations (High-Level):**
        * A clean, readable layout for the Pattern Viewer.
        * Good typography for instructions.
        * Ability to easily distinguish different sections and components.
        * Consider a "Print Preview" mode within this viewer.
    * **Integration Points:**
        * This is the primary consumer of the full output from the `CorePatternCalculationEngine` and `InstructionGeneratorService`.
        * It presents the culmination of data defined in Phases 1, 4, 5 and processed in Phases 6, 7, 8.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: After a full pattern calculation for a simple sweater (e.g., body panels, sleeves, neckband), the Pattern Viewer UI displays all required sections (Materials, Gauge, Back, Front, Sleeves, Neckband, Assembly) populated with correct data and instructions.
    * AC2: Instructions for each component reflect any shaping or special stitch patterns defined.
    * AC3: Generic assembly instructions are included.
    * AC4: The layout is clear, organized, and easy to read.
7.  **Assumptions/Pre-conditions:**
    * The calculation engine and instruction generator (Phases 6, 7, 8) are capable of producing detailed data for all components of at least one complete basic garment (e.g., a drop-shoulder sweater).
    * A "Pattern Assembler" service exists or will be created to structure the final pattern JSON for the UI.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `PatternViewer.vue`, `PatternSection.vue`.
    * New Backend service: `PatternAssemblerService.java` (responsible for compiling the final pattern JSON from engine outputs).
    * Modified Backend: `CorePatternCalculationEngine` and `InstructionGeneratorService` now produce output for all garment components, which is then assembled.

