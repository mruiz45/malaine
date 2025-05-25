

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

