**User Story 1.3**

1.  **Title:** Implement Ease (Aisance) Preference Input and Management
2.  **Goal:** As a user, I want to specify my desired ease (positive, negative, or zero) for a garment so that the final fit matches my preference (e.g., tight, classic, oversized).
3.  **Description:** This story enables users to define how much extra room (or less room, for negative ease) they want in their garments, compared to their body measurements. This corresponds to PDF section 1.3.
4.  **Functional Requirements:**
    * FR1: User can input a numerical value for desired ease.
    * FR2: User can specify the unit for ease (cm or inches) or as a percentage.
    * FR3: User can select a general ease category (e.g., "Negative Ease: -5cm", "Zero Ease: 0cm", "Classic Fit: +5cm", "Oversized: +15cm") which pre-fills the numerical value, but allows override.
    * FR4: Ease preference can be saved, possibly linked to a specific project or garment type definition.
    * FR5: The system should differentiate ease for different parts of a garment (e.g., bust ease vs. sleeve ease) if advanced definition is desired later, but start with a global ease value.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Ease might not need its own dedicated table initially if it's stored per "pattern definition session" or "project". If reusable ease profiles are desired:
            ```sql
            CREATE TABLE IF NOT EXISTS ease_preferences (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                preference_name VARCHAR(255),
                ease_type VARCHAR(20) NOT NULL DEFAULT 'absolute', -- 'absolute' or 'percentage'
                bust_ease DECIMAL(5,2), -- Example: can be global or per body part
                waist_ease DECIMAL(5,2),
                hip_ease DECIMAL(5,2),
                sleeve_ease DECIMAL(5,2),
                measurement_unit VARCHAR(10), -- 'cm' or 'inch', relevant for 'absolute'
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * Alternatively, ease values can be fields within a `pattern_project` or `pattern_definition_session` table. For a "tool," it's likely part of the current definition context.
    * **API Endpoints (Conceptual):**
        * If part of a larger "pattern definition" object: No separate API, but part of the `pattern_definitions` payload.
        * If reusable profiles: Similar CRUD APIs as for `gauge_profiles`.
    * **Logic/Processing:**
        * Backend validation for ease values.
        * Logic to apply ease: `final_garment_measurement = body_measurement + ease_value` or `final_garment_measurement = body_measurement * (1 + ease_percentage/100)`.
    * **UI Considerations (High-Level):**
        * Input field for numerical ease, dropdown for units/percentage.
        * Optional: A slider or predefined buttons for common ease categories.
        * Informative text explaining ease.
    * **Integration Points:**
        * `measurement_sets` data.
        * Core pattern calculation algorithms.
        * "Ease Advisor Tool" (future US).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can input a numerical ease value and specify its unit or type (absolute/percentage).
    * AC2: User can select from predefined ease categories, and this correctly populates the ease value.
    * AC3: The chosen ease value is correctly stored and can be retrieved for use in calculations.
    * AC4: Calculations correctly apply the specified ease to a base measurement (test with a hypothetical base measurement).
7.  **Assumptions/Pre-conditions:**
    * Understanding of how ease will be applied (global vs. per-part) is clarified. Start with global ease for simplicity.
8.  **Impacted System Components (Illustrative):**
    * If part of a larger definition object: Modifies `PatternDefinitionService`, `PatternDefinitionModel`.
    * UI: `EaseInput.vue` component.

