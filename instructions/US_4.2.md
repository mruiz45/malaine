**User Story 4.2**

1.  **Title:** Implement "Garment Type Selector" Tool
2.  **Goal:** As a user starting to define a new pattern, I want to select the basic type of garment I intend to make (e.g., Sweater, Cardigan, Scarf, Hat) from a clear list, so that the system can then present me with relevant options and tools for that specific garment type.
3.  **Description:** This is the user's entry point into defining a specific garment's structure, after setting up their foundational parameters (gauge, yarn, etc.). The selection here will filter subsequent choices. This directly relates to the high-level categories in PDF Section 3.
4.  **Functional Requirements:**
    * FR1: Display a list of available garment types (from `garment_types` table, US 4.1).
    * FR2: Each garment type in the list should have a clear name and optionally a brief description or an illustrative icon/image.
    * FR3: User can select one garment type to proceed with their pattern definition.
    * FR4: The selected garment type is stored as part of the current `pattern_definition_session` (US 1.6).
    * FR5: Upon selection, the UI should dynamically update to show options/tools relevant to the chosen garment type (handled in subsequent US).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Uses `garment_types` table (US 4.1).
        * The `pattern_definition_sessions` table (US 1.6) needs a field to store the selected `garment_type_id`.
            ```sql
            ALTER TABLE pattern_definition_sessions
            ADD COLUMN IF NOT EXISTS selected_garment_type_id UUID REFERENCES garment_types(id);
            ```
    * **API Endpoints (Conceptual):**
        * `GET /api/garment_types` (already defined in US 4.1, used here to populate the selector).
        * `PUT /api/pattern_definition_sessions/{session_id}` (to update the session with the selected garment type).
    * **Logic/Processing:**
        * Frontend fetches and displays garment types.
        * On selection, frontend updates the `pattern_definition_session` state and notifies the backend.
    * **UI Considerations (High-Level):**
        * A clear, visually appealing selection interface (e.g., cards, a styled list).
        * Displayed within the main pattern definition workspace (US 1.6).
        * This selection acts as a primary filter for subsequent structural definition steps.
    * **Integration Points:**
        * Uses `garment_types` data (US 4.1).
        * Updates `pattern_definition_sessions` (US 1.6).
        * This tool's output will control the visibility/options of tools in US 4.3, 4.4, 4.5.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: The user is presented with a list of garment types (e.g., "Sweater", "Scarf") fetched from the backend.
    * AC2: The user can select a garment type (e.g., "Sweater").
    * AC3: The selected garment type ID is correctly saved to the user's current `pattern_definition_session`.
    * AC4: The UI acknowledges the selection and is ready to present garment-specific options next.
7.  **Assumptions/Pre-conditions:**
    * US 4.1 (Data Models for Garment Types) is implemented, and `garment_types` table is populated.
    * US 1.6 (Pattern Definition Session UI) is implemented and can host this selector.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `GarmentTypeSelector.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue` (to include the selector).
    * Modified Backend: `PatternDefinitionSessionService` (to handle updating the session).
    * Modified `pattern_definition_sessions` table.

