Okay, let's move forward to Phase 3. This phase will build on the previous ones by introducing more sophisticated helper tools that assist the user in defining specific garment characteristics and understanding their implications.

---

**Phase 3: Expanding Helper Tools for Garment Characteristics**

This phase focuses on developing tools that provide more nuanced guidance to the user, helping them make informed decisions about measurements, ease, and stitch patterns. These tools aim to enhance the "aide à la définition de patrons" aspect of the application.

**User Story 3.1**

1.  **Title:** Enhance User Measurements with a "Body Measurement Guide" Tool
2.  **Goal:** As a user, I want access to a visual and descriptive guide on how to take each required body measurement accurately, and be able to store more detailed notes with my measurement sets, so that I can provide correct input for pattern generation, leading to better-fitting garments.
3.  **Description:** This story enhances US 1.2 (User Measurements Input and Management) by adding an integrated guide. It will provide illustrations/diagrams and clear instructions for each measurement (e.g., exactly where to measure for "chest circumference"). It also allows for more detailed annotations within a measurement set. This relates to PDF section 1.2, emphasizing accuracy, and touches on section 2.1 ("Prise en Compte des Différentes Morphologies") by ensuring foundational measurements are well-understood.
4.  **Functional Requirements:**
    * FR1: For each standard measurement field defined in US 1.2 (e.g., chest, waist, arm length), display an icon or link that opens a modal/pop-up with:
        * A simple illustration/diagram showing where to take the measurement on a body outline.
        * Clear textual instructions on how to take the measurement correctly (e.g., "Measure around the fullest part of your chest, keeping the tape parallel to the floor").
    * FR2: Enhance the `measurement_sets` data model (from US 1.2) to allow for per-measurement notes (e.g., "bust: taken wearing X bra", "arm length: slightly longer than standard").
    * FR3: The guide content (images, text) should be easily configurable and updatable, possibly from a content management system or a structured JSON file.
    * FR4: Users should be able to easily access this guidance while inputting or editing their measurements.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Modify `measurement_sets` table (from US 1.2) or its related structure. If `custom_measurements JSONB` was used, this could store notes. If measurements were fixed columns, consider adding corresponding `_note` columns or a `measurement_details JSONB` field.
            ```sql
            -- Option 1: Extend measurement_sets with a JSONB field for detailed notes
            ALTER TABLE measurement_sets
            ADD COLUMN IF NOT EXISTS measurement_details JSONB;
            -- Example for measurement_details:
            -- {
            --   "chest_circumference": {"value": 92, "note": "Taken over light t-shirt"},
            --   "waist_circumference": {"value": 75, "note": "At natural waistline"}
            --   ...
            -- }
            -- This would require refactoring how individual measurements are stored if they were previously top-level columns.
            -- Alternatively, if keeping columns, add note columns:
            -- ALTER TABLE measurement_sets ADD COLUMN chest_circumference_note TEXT;
            -- ALTER TABLE measurement_sets ADD COLUMN waist_circumference_note TEXT;
            -- ... etc. (less flexible)
            ```
        * Content for the guides (text, image paths):
            * Could be stored in a simple JSON file deployed with the frontend, e.g., `measurement_guides.json`.
            * Or, if more dynamic, a new table:
            ```sql
            CREATE TABLE IF NOT EXISTS measurement_guides_content (
                id SERIAL PRIMARY KEY,
                measurement_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'chest_circumference', 'arm_length'
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                image_url TEXT, -- Path to static image asset
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
            * Pre-populate this table with content for all standard measurements.
    * **API Endpoints (Conceptual):**
        * If guide content is in a DB table: `GET /api/guides/measurements` (to fetch all guide content) or `GET /api/guides/measurements/{measurement_key}`.
        * APIs for `measurement_sets` (from US 1.2) will need to support saving/retrieving the enhanced notes.
    * **Logic/Processing:**
        * Frontend logic to display guide content in a modal or popover when a user requests help for a specific measurement field.
    * **UI Considerations (High-Level):**
        * Small "info" or "help" icons next to each measurement input field.
        * Modal/popover design that clearly presents the image and text.
        * Input fields for notes alongside or within the measurement input area.
    * **Integration Points:**
        * Directly enhances the UI and data model of US 1.2 (User Measurements).
        * Content can be managed separately.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Clicking the help icon next to "Chest Circumference" displays a modal with the correct diagram and instructions for measuring chest circumference.
    * AC2: All standard measurement fields have associated help content available.
    * AC3: User can add a specific note to an individual measurement (e.g., "Waist: measured after big lunch") and this note is saved and re-displayed correctly.
    * AC4: The guide content is easily viewable and understandable.
7.  **Assumptions/Pre-conditions:**
    * US 1.2 (User Measurements Input and Management) is implemented.
    * Static assets (images/diagrams) for the guides are created and available.
    * A defined list of standard measurements and their corresponding help texts/image paths is ready.
8.  **Impacted System Components (Illustrative):**
    * Modified UI: `MeasurementInputForm.vue` (from US 1.2) will be updated.
    * New UI component: `MeasurementGuideModal.vue`.
    * Modified Backend: `MeasurementSetController`, `MeasurementSetService` (if measurement_details JSONB is used or new note fields are added).
    * New DB table: `measurement_guides_content` (if dynamic content is chosen) or a static JSON file in the frontend.
    * Modified `measurement_sets` table.

**User Story 3.2**

1.  **Title:** Implement "Ease Selection Advisor" Tool
2.  **Goal:** As a user, especially if I'm unsure about how much ease to choose, I want a tool that advises me on appropriate ease amounts based on the type of garment I'm planning, desired fit (e.g., close-fitting, classic, oversized), and optionally yarn characteristics, so I can achieve the intended style and comfort.
3.  **Description:** This tool guides users in selecting ease (US 1.3), which can be a confusing concept. It provides recommendations rather than strict rules. This directly relates to PDF Section 1.3 ("Aisance") by making ease selection more user-friendly and context-aware.
4.  **Functional Requirements:**
    * FR1: User can select a general garment category (e.g., Sweater, Cardigan, Hat, Socks, Shawl).
    * FR2: User can select a desired fit (e.g., "Very Close-fitting/Negative Ease", "Close-fitting/Zero Ease", "Classic/Slightly Positive Ease", "Relaxed Fit", "Oversized").
    * FR3: (Optional) User can indicate yarn weight category (e.g., Fingering, Worsted, Bulky), as heavier yarns might drape differently or require different ease for the same perceived fit.
    * FR4: Based on these inputs, the tool suggests a range of ease values (e.g., "+2 to +5 cm for bust ease for a classic fit sweater in DK weight").
    * FR5: The suggestions should cover key ease points relevant to the garment type (e.g., bust/chest ease for sweaters, head circumference ease for hats).
    * FR6: The tool should allow the user to accept the suggestion (which then populates the ease input fields from US 1.3) or ignore it.
    * FR7: Display brief explanations for why certain ease amounts are suggested for a given context.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * No new primary DB tables for user-generated data. This tool uses rules/heuristics.
        * This logic could be stored in a configuration file (e.g., JSON) or a dedicated backend service.
        * Example structure for `ease_advice_rules.json`:
            ```json
            [
              {
                "garment_category": "Sweater",
                "fit_preference": "Classic/Slightly Positive Ease",
                "yarn_weight_categories": ["Fingering", "Sport", "DK"],
                "advised_ease": {
                  "bust_cm": {"min": 5, "max": 10, "recommended": 7.5},
                  "sleeve_upper_arm_cm": {"min": 2, "max": 5, "recommended": 3}
                },
                "explanation": "Provides a comfortable, classic fit allowing for light layering."
              },
              {
                "garment_category": "Sweater",
                "fit_preference": "Oversized",
                // ...
              },
              {
                "garment_category": "Hat",
                "fit_preference": "Close-fitting/Negative Ease", // For snug hats
                "advised_ease": {
                  "head_circumference_cm": {"min": -5, "max": -2, "recommended": -3}
                },
                "explanation": "Ensures the hat stays on securely. Relies on stretch."
              }
              // ... more rules
            ]
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/tools/ease_advisor`
            * Payload: `{ "garment_category": "Sweater", "fit_preference": "Classic/Slightly Positive Ease", "yarn_weight_category": "DK" }`
            * Response: `{ "advised_ease": { "bust_cm": {...} }, "explanation": "..." }`
    * **Logic/Processing:**
        * Backend service takes inputs, matches them against the rules in the configuration.
        * If multiple rules match (e.g., yarn weight is optional), select the most specific or average the suggestions.
        * Logic to convert suggested ease to the user's preferred unit (cm/inches) if needed.
    * **UI Considerations (High-Level):**
        * A modal or a dedicated section for the tool.
        * Dropdowns for garment category, fit preference, and (optional) yarn weight.
        * Clear display of suggested ease ranges and explanations.
        * "Apply Suggestion" button to populate the main ease fields (from US 1.3).
    * **Integration Points:**
        * Uses the `ease_preferences` data model/input component (US 1.3).
        * Can use `yarn_profiles` (US 1.4) to get yarn weight category if user has selected a yarn.
        * Input for garment category will later link to garment definitions (Phase 4).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given "Sweater", "Classic Fit", and "DK" yarn, the tool suggests a reasonable ease range for bust (e.g., +5 to +10 cm) and provides an explanation.
    * AC2: Given "Hat", "Close-fitting", the tool suggests a reasonable negative ease range for head circumference.
    * AC3: If the user clicks "Apply Suggestion", the suggested ease values are populated into the main ease input fields.
    * AC4: The explanations provided are clear and helpful.
    * AC5: If no specific rule matches, a general guidance or default is provided, or a message indicating so.
7.  **Assumptions/Pre-conditions:**
    * US 1.3 (Ease Preference Input) is implemented.
    * A set of well-defined rules and recommendations for ease (the `ease_advice_rules.json` or similar) has been researched and created. This requires domain knowledge.
    * Basic garment categories are defined.
8.  **Impacted System Components (Illustrative):**
    * New UI: `EaseAdvisorTool.vue`.
    * New Backend: `EaseAdvisorService.java` (or similar), `ease_advice_rules.json` (or DB table for rules if more complex management is needed).
    * Interacts with UI and data of `EaseInput.vue` (US 1.3).

**User Story 3.3**

1.  **Title:** Implement "Basic Stitch Pattern Effects Preview" Tool
2.  **Goal:** As a user selecting a basic stitch pattern, I want to see a simple visual representation of that stitch and understand its common characteristics (e.g., "curls at edges," "lies flat," "very textured," "eats yarn") so I can make a more informed choice for my project.
3.  **Description:** This tool enhances US 1.5 (Basic Stitch Pattern Selection) by providing more than just a name. It aims to give a visual hint and key properties for basic, common stitches. This is a step towards PDF Section 5.3 ("Diagrammes et Schémas") but focused on being a *definition aid* rather than full charting.
4.  **Functional Requirements:**
    * FR1: When a user selects a basic stitch pattern (from US 1.5's predefined list like Stockinette, Garter, Rib 1x1, Seed Stitch), the tool displays:
        * A small, static visual swatch image or a simple dynamically rendered graphical representation of the stitch fabric.
        * A list of key characteristics/properties (e.g., "Fabric behavior: Curls at edges", "Texture: Smooth", "Reversible: No", "Stretch: Moderate width-wise", "Relative yarn consumption: Average").
    * FR2: The visual representation and properties should be pre-defined for each basic stitch in the system.
    * FR3: This preview should be displayed within or alongside the stitch selection interface.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Enhance the `stitch_patterns` table (from US 1.5) with new fields:
            ```sql
            ALTER TABLE stitch_patterns
            ADD COLUMN IF NOT EXISTS swatch_image_url TEXT, -- Path to a static image of the swatch
            ADD COLUMN IF NOT EXISTS properties JSONB; -- Store characteristics
            -- Example for properties JSONB:
            -- {
            --   "fabric_behavior": "Curls at edges (stockinette)", "lies_flat": "Yes (garter)",
            --   "texture_description": "Smooth with V's (stockinette)", "Bumpy rows (garter)",
            --   "reversibility": "No (stockinette)", "Yes (garter)",
            --   "stretch_horizontal": "Moderate", "High",
            --   "stretch_vertical": "Low",
            --   "relative_yarn_consumption": "Average", "Higher than stockinette (garter, ribbing)",
            --   "notes": "Good for general fabric", "Great for edgings"
            -- }
            ```
        * Pre-populate these new fields for all basic stitches defined in US 1.5.
    * **API Endpoints (Conceptual):**
        * `GET /api/stitch_patterns/{id}` (from US 1.5) should now return the `swatch_image_url` and `properties` as well.
    * **Logic/Processing:**
        * Frontend fetches the selected stitch pattern's details and displays the image and properties.
        * For dynamically rendered graphical representation (more advanced, optional for "basic"):
            * A simple frontend component could draw basic stitches (like stockinette, garter) on a small grid using SVG or Canvas if static images are not preferred for very simple cases.
    * **UI Considerations (High-Level):**
        * When a stitch is selected in the `StitchPatternSelector.vue` (from US 1.5), a designated area updates to show the swatch image and its properties.
        * Properties can be displayed as a list or a set of tags.
    * **Integration Points:**
        * Directly enhances the `stitch_patterns` data and the UI component from US 1.5 (`StitchPatternSelector.vue`).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: When "Stockinette Stitch" is selected, a visual swatch (image or rendering) of stockinette is displayed, along with properties like "Curls at edges," "Smooth texture," "Not reversible."
    * AC2: When "Garter Stitch" is selected, its corresponding swatch and properties (e.g., "Lies flat," "Bumpy texture," "Reversible," "Stretchy") are displayed.
    * AC3: All basic stitch patterns in the system have associated swatch images/renderings and descriptive properties.
    * AC4: The information is presented clearly and is easily accessible upon stitch selection.
7.  **Assumptions/Pre-conditions:**
    * US 1.5 (Basic Stitch Pattern Selection) is implemented.
    * Swatch images for basic stitches have been created and are accessible via URLs, or simple rendering logic is defined.
    * Descriptive properties for each basic stitch have been researched and documented.
8.  **Impacted System Components (Illustrative):**
    * Modified DB table: `stitch_patterns`.
    * Modified UI: `StitchPatternSelector.vue` (from US 1.5) will be updated to include a preview area.
    * Potentially new UI component: `StitchPreviewDisplay.vue`.
    * Backend: `StitchPatternController`/`Service` will serve the enhanced data.

---

This completes Phase 3. These tools should significantly improve the user's ability to define the initial parameters and characteristics of their desired pattern with more confidence. Phase 4 will begin to tackle the definition of simple garment structures themselves.