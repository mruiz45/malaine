Okay, let's continue with Phase 5. In this phase, we'll introduce more advanced helper tools, including one specifically mentioned in the PDF's "Outils d'Aide à la Création" section (Color Simulator), another to help with body morphology adaptations, and then culminate in generating an initial outline of the pattern based on all the user's choices so far.

---

**Phase 5: Advanced Helper Tools & Initial Pattern Outline Generation**

This phase adds sophisticated tools to further aid the user in the creative and fitting aspects of pattern definition. It also introduces the first step towards visualizing the complete pattern by generating a structured outline or summary of the defined garment.

**User Story 5.1**

1.  **Title:** Implement "Color Scheme Simulator" Tool for Yarn Choices
2.  **Goal:** As a user selecting yarns for my project, I want to use a Color Scheme Simulator to visualize how different yarn colors (from my selected yarn profiles or a general color palette) would look together in basic stripe patterns or color blocks, so I can make more confident color choices for my garment.
3.  **Description:** This tool allows users to experiment with color combinations for their selected yarns or general colors. It provides a simple visual preview, helping with the aesthetic definition of the pattern. This directly corresponds to "Simulateur de Rendu des Couleurs" (PDF section 6.3.1).
4.  **Functional Requirements:**
    * FR1: User can select 2 to 5 yarn profiles (from US 1.4, which include a `color_hex_code`) or pick colors from a general color palette.
    * FR2: The tool should offer a few basic preview templates:
        * Simple Stripes (e.g., 2-color alternating stripes, multi-color sequence).
        * Color Blocks (e.g., 2-3 blocks of color juxtaposed).
        * (Optional) A very schematic representation of a garment shape (e.g., a simple sweater outline) with areas fillable by the selected colors.
    * FR3: User can assign selected colors to different sections of the preview template.
    * FR4: The preview should update in real-time or near real-time as colors are assigned.
    * FR5: User should be able to save a favored color scheme, perhaps by associating it with the current `pattern_definition_session` or their yarn choices.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Uses `yarn_profiles` (US 1.4) which should have a `color_hex_code` field.
        * A `pattern_definition_sessions` (US 1.6) could store an array of selected `yarn_profile_ids` and perhaps a JSONB field for the saved color scheme details (e.g., `{"scheme_type": "stripes", "colors": ["#FF0000", "#00FF00"]}`).
    * **API Endpoints (Conceptual):**
        * No new specific backend API for the simulation itself if done client-side.
        * `PUT /api/pattern_definition_sessions/{session_id}` to save the selected color scheme.
    * **Logic/Processing:**
        * Client-side JavaScript/Canvas/SVG for rendering the color previews.
        * Logic to map selected yarn colors to template sections.
    * **UI Considerations (High-Level):**
        * A dedicated modal or section for the tool.
        * Interface to select yarn profiles or colors from a palette.
        * Preview area displaying the chosen template (stripes, blocks, simple garment outline).
        * Controls to assign colors to template elements.
        * "Save Scheme" button.
    * **Integration Points:**
        * Uses `yarn_profiles` data, specifically the `color_hex_code` (US 1.4).
        * Can be part of the "Pattern Definition Session" (US 1.6), allowing users to plan colors alongside other parameters.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select at least two yarn profiles with defined HEX colors.
    * AC2: User can choose a "stripes" template and see the selected colors rendered as alternating stripes.
    * AC3: User can change a color assignment, and the preview updates correctly.
    * AC4: User can save a color scheme, and this information is associated with their current pattern definition session (if applicable).
    * AC5: If a yarn profile lacks a `color_hex_code`, it's handled gracefully (e.g., not selectable for this tool or shows a default placeholder).
7.  **Assumptions/Pre-conditions:**
    * US 1.4 (Yarn and Material Details) is implemented, and yarn profiles can store a HEX color code.
    * Client-side rendering capabilities (SVG or Canvas) are available in the chosen frontend framework.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `ColorSchemeSimulator.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue` (to launch the simulator).
    * Modified Backend: `PatternDefinitionSessionService` might be updated to store selected scheme.

**User Story 5.2**

1.  **Title:** Implement "Body Morphology Adaptation Advisor" Tool
2.  **Goal:** As a user whose body proportions may not perfectly match standard sizing charts (e.g., larger bust with smaller waist, broader shoulders, longer/shorter torso), I want a tool that helps me understand how to adjust key measurements or pattern elements to better suit my specific morphology, so I can achieve a better custom fit.
3.  **Description:** This tool provides guidance on common fit adjustments based on described body characteristics. It builds on the measurements from US 1.2 and aims to address PDF sections 2.1 ("Prise en Compte des Différentes Morphologies") and 2.2 ("Options de Personnalisation Avancées") by offering more tailored advice than just raw measurements and ease.
4.  **Functional Requirements:**
    * FR1: User can select from a list of common body morphology characteristics or fit challenges (e.g., "Full Bust," "Sway Back," "Broad Shoulders," "Sloping Shoulders," "Long/Short Torso," "Long/Short Arms").
    * FR2: For each selected characteristic, the tool provides:
        * A brief explanation of the characteristic and its common fitting implications.
        * Suggestions for which body measurements (from US 1.2) might need particular attention or specific adjustment techniques (e.g., "For a Full Bust, consider adding short rows across the front chest or choosing a pattern with bust darts.").
        * Advice on how ease (US 1.3) might be applied differently.
        * (Advanced) Links to resources or brief explanations of common pattern adjustment techniques (e.g., "Full Bust Adjustment (FBA) principles," "Short row shaping for bust/shoulders").
    * FR3: The tool should not directly alter measurements but rather empower the user to refine their own measurements or choices based on the advice.
    * FR4: The content for these advisories should be configurable and based on common fitting knowledge.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Content for morphology advice (similar to US 3.1 Measurement Guide or US 3.2 Ease Advisor):
            * Could be stored in a JSON file (`morphology_advice.json`) or a DB table.
            ```sql
            CREATE TABLE IF NOT EXISTS morphology_advisories (
                id SERIAL PRIMARY KEY,
                morphology_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'full_bust', 'sway_back'
                display_name VARCHAR(255) NOT NULL,
                description TEXT,
                implications TEXT, -- Common fitting issues
                measurement_focus TEXT, -- Which measurements are key
                ease_considerations TEXT,
                adjustment_suggestions TEXT, -- High-level techniques
                -- image_url TEXT, -- Optional: diagram illustrating the issue/adjustment
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
    * **API Endpoints (Conceptual):**
        * `GET /api/morphology_advisories` (to list available advisories).
        * `GET /api/morphology_advisories/{morphology_key}` (to get details for one).
    * **Logic/Processing:**
        * Frontend displays selectable morphology characteristics.
        * On selection, fetches and displays the relevant advisory content.
    * **UI Considerations (High-Level):**
        * A dedicated tool section or a modal.
        * Checkboxes or a multi-select list for morphology characteristics.
        * Clear presentation of advisory text, possibly with tabs for different aspects (implications, measurements, adjustments).
    * **Integration Points:**
        * Relates to and advises on `measurement_sets` (US 1.2) and `ease_preferences` (US 1.3).
        * This tool provides information; it doesn't directly modify the pattern definition data but guides user input.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select "Full Bust" from a list of morphology characteristics.
    * AC2: Upon selecting "Full Bust," the tool displays relevant information regarding fitting implications, key measurements to check (e.g., high bust vs. full bust), and common adjustment techniques (e.g., suggesting need for more fabric in front, potential for short rows/darts).
    * AC3: All defined morphology characteristics in the system have corresponding advisory content.
    * AC4: The advice provided is clear, actionable (in terms of guiding the user's thinking), and well-organized.
7.  **Assumptions/Pre-conditions:**
    * US 1.2 (Measurements) and US 1.3 (Ease) are implemented.
    * Content for morphology advisories has been researched, written, and populated (requires significant knitting/crochet fitting expertise).
8.  **Impacted System Components (Illustrative):**
    * New UI component: `MorphologyAdvisorTool.vue`.
    * New Backend: `MorphologyController` (if content is DB-driven), `morphology_advice.json` or `morphology_advisories` table.

**User Story 5.3**

1.  **Title:** Implement Initial "Pattern Outline Generator"
2.  **Goal:** As a user who has defined all the foundational parameters, garment type, and structural details, I want to generate a high-level "Pattern Outline" or summary that lists all my choices and provides a structured overview of the garment to be made, so I can review my decisions before proceeding to detailed calculations or instructions.
3.  **Description:** This tool synthesizes all the information gathered through Phases 1-4 and the preceding parts of Phase 5 into a consolidated, human-readable summary. It's not the final pattern instructions but a structured checklist or blueprint of the defined garment. This is a significant step towards PDF Section 5 ("Génération et Visualisation du Patron").
4.  **Functional Requirements:**
    * FR1: The tool should access the current `pattern_definition_session` data.
    * FR2: Generate a structured textual summary that includes:
        * **Pattern Foundations:** Selected Gauge, Measurement Set (key measurements used), Ease Preferences, primary Yarn, main Stitch Pattern.
        * **Garment Overview:** Selected Garment Type (e.g., "Drop Shoulder Sweater").
        * **Component Breakdown:** For each defined garment component (e.g., Front Body, Back Body, Sleeves, Neckband):
            * List the selected style and key parameters (e.g., "Front Body: Straight Shape", "Sleeves: Tapered, Long, 1x1 Ribbed Cuff - 5cm depth", "Neckline: V-Neck - 12cm depth").
        * **(Optional) Color Scheme:** If a color scheme was saved (US 5.1), summarize it.
        * **(Optional) Morphology Notes:** If user interacted with morphology advisor, perhaps a note "User reviewed morphology advice for X, Y, Z."
    * FR3: The outline should be presented in a clear, well-organized format (e.g., using headings, bullet points).
    * FR4: Allow the user to view this outline on screen.
    * FR5: (Optional for this US, for future) Allow user to print or save this outline as a simple text/PDF file.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Primarily reads from `pattern_definition_sessions` and its related linked tables/data (gauge profiles, measurement sets, yarn profiles, stitch patterns, garment type, definition components with their attributes).
    * **API Endpoints (Conceptual):**
        * `GET /api/pattern_definition_sessions/{session_id}/outline`
            * This endpoint would trigger the backend logic to compile the outline based on the session data.
            * Response would be a structured JSON or pre-formatted text/HTML representing the outline.
    * **Logic/Processing:**
        * Backend service to traverse the `pattern_definition_session` data.
        * Logic to fetch details from linked entities (e.g., gauge profile name, yarn name, stitch pattern name).
        * Formatting logic to construct the human-readable outline. This involves mapping internal keys (e.g., `v_neck`) to display names (e.g., "V-Neck").
    * **UI Considerations (High-Level):**
        * A dedicated view or modal to display the generated outline.
        * "Generate Outline" button within the `PatternDefinitionWorkspace.vue`.
        * Clear formatting, possibly with collapsible sections for complex garments.
    * **Integration Points:**
        * Consolidates data from nearly all previous User Stories (Phases 1, 4, and relevant parts of 2, 3, 5).
        * This is a direct precursor to the full pattern calculation engine (Phase 6) and instruction generation (later phases).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User clicks "Generate Outline" after fully defining a simple sweater (e.g., drop shoulder, straight shape, V-neck, long tapered sleeves).
    * AC2: The system generates and displays an outline that accurately reflects all selected options: gauge, key measurements used (e.g., chest from selected set), ease, yarn, stitch, garment type, construction, body shape, neckline style/depth, sleeve style/length/cuff.
    * AC3: The outline is well-structured and easy to read.
    * AC4: If a parameter is not yet defined (e.g., user skipped neckline definition), the outline indicates this (e.g., "Neckline: Not yet defined").
7.  **Assumptions/Pre-conditions:**
    * All relevant preceding User Stories (especially in Phases 1 and 4) are implemented and allow for a reasonably complete pattern definition to be stored in the session.
    * The structure of `pattern_definition_sessions` and its related data is stable.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `PatternOutlineViewer.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue` (to add the generation button).
    * New Backend: `PatternOutlineService.java` (or similar), updates to `PatternDefinitionSessionController` to add the `/outline` endpoint.

---

This completes Phase 5. The user now has a comprehensive set of tools to define the foundational, structural, and some aesthetic aspects of their pattern, and can get a summary of their choices. Phase 6 will be a major step: integrating these definitions with a core pattern calculation engine.