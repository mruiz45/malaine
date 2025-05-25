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

