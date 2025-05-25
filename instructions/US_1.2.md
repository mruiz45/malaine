**User Story 1.2**

1.  **Title:** Implement User Measurements (Mensurations) Input and Management
2.  **Goal:** As a user, I want to input and save my body measurements (e.g., chest, waist, hips, arm length) so that patterns can be sized correctly for me or for whom I am making the garment.
3.  **Description:** This story covers the creation of data models, APIs, and UI for users to manage sets of body measurements. This corresponds to PDF section 1.2.
4.  **Functional Requirements:**
    * FR1: User can input various standard body measurements (e.g., chest/bust, waist, hips, shoulder width, arm length, torso length, head circumference). The list should be comprehensive enough for common garments.
    * FR2: User can specify the unit of measurement (cm or inches) for each set of measurements.
    * FR3: User can name and save a set of measurements (e.g., "My Measurements", "John's Measurements").
    * FR4: The system should store measurement sets associated with a user profile or session.
    * FR5: Allow for adding custom measurement fields if needed in the future (extensibility).
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `measurement_sets` table:
            ```sql
            CREATE TABLE IF NOT EXISTS measurement_sets (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id), -- If user system exists
                set_name VARCHAR(255) NOT NULL,
                measurement_unit VARCHAR(10) NOT NULL, -- 'cm' or 'inch'
                -- Example common measurements. Consider a more flexible EAV model or JSONB for extensibility.
                chest_circumference DECIMAL(6,2),
                waist_circumference DECIMAL(6,2),
                hip_circumference DECIMAL(6,2),
                shoulder_width DECIMAL(6,2),
                arm_length DECIMAL(6,2), -- (e.g., shoulder to wrist)
                inseam_length DECIMAL(6,2),
                torso_length DECIMAL(6,2), -- (e.g., nape to waist)
                head_circumference DECIMAL(6,2),
                -- Add more measurements as identified in the PDF or common practice
                custom_measurements JSONB, -- For additional, non-standard measurements
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/users/{user_id}/measurement_sets`
        * `GET /api/users/{user_id}/measurement_sets`
        * `GET /api/measurement_sets/{set_id}`
        * `PUT /api/measurement_sets/{set_id}`
        * `DELETE /api/measurement_sets/{set_id}`
    * **Logic/Processing:**
        * Backend validation for plausible measurement values.
        * Consider providing guidance or images within the UI on how to take each measurement correctly (future enhancement, but data structure should allow for it).
    * **UI Considerations (High-Level):**
        * A form with clearly labeled fields for each measurement.
        * Option to select units.
        * Ability to save with a descriptive name.
        * A list view for saved measurement sets.
    * **Integration Points:**
        * User authentication system.
        * Will be used by pattern calculation algorithms and potentially by "helper tools" that advise on sizing or fit.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can successfully input a comprehensive set of body measurements and save them with a name.
    * AC2: Saved measurement sets are correctly retrieved and displayed with the correct units.
    * AC3: The system allows for a reasonable range of values for each measurement.
    * AC4: Data is correctly stored in the `measurement_sets` table.
7.  **Assumptions/Pre-conditions:**
    * Phase 0 complete.
    * User Story 1.1 might provide a model for how user-specific data is handled.
8.  **Impacted System Components (Illustrative):**
    * New: `MeasurementSetController`, `MeasurementSetService`, `MeasurementSetRepository`, `measurement_sets` DB table.
    * UI: `MeasurementInputForm.vue`, `MeasurementSetList.vue`.

