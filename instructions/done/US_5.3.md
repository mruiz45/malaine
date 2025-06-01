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
