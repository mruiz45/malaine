**User Story 1.6**

1.  **Title:** Basic UI for Pattern Definition Session
2.  **Goal:** As a user, I need a central place in the UI where I can input and see all the foundational pattern parameters (Gauge, Measurements, Ease, Yarn, Stitch) I've defined for a new pattern I'm planning.
3.  **Description:** This story integrates the previously defined input mechanisms (US 1.1-1.5) into a cohesive user interface for a "pattern definition session." It doesn't introduce new backend logic for these individual parameters but focuses on their presentation and collective management for a single pattern being conceptualized.
4.  **Functional Requirements:**
    * FR1: Provide a UI view or a multi-step wizard where users can access forms/components for defining Gauge, Measurements, Ease, Yarn, and Stitch Pattern for a single, active "pattern definition."
    * FR2: Display a summary of currently selected/defined parameters.
    * FR3: Allow users to easily navigate between these different definition sections.
    * FR4: (Optional for this US, but for future) Allow users to name this "pattern definition session" or "draft pattern."
    * FR5: Data entered in one step should be retained as the user moves to another step within the same session.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * This might involve a temporary "session" object in the frontend state management, or a backend `draft_patterns` or `pattern_definition_sessions` table if these definitions need to be persisted even in an incomplete state.
            ```sql
            -- Example if persisting draft sessions:
            CREATE TABLE IF NOT EXISTS pattern_definition_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id),
                session_name VARCHAR(255),
                selected_gauge_profile_id UUID REFERENCES gauge_profiles(id),
                selected_measurement_set_id UUID REFERENCES measurement_sets(id),
                -- Ease values might be stored directly or reference an ease_preference_id
                ease_type VARCHAR(20),
                ease_value_bust DECIMAL(5,2),
                ease_unit VARCHAR(10),
                -- Add other ease values as needed
                selected_yarn_profile_id UUID REFERENCES yarn_profiles(id),
                selected_stitch_pattern_id UUID REFERENCES stitch_patterns(id),
                status VARCHAR(50) DEFAULT 'draft', -- e.g., draft, ready_for_calculation
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                -- Store actual values as well, in case referenced profiles are edited/deleted later
                -- This makes the session self-contained once values are "locked in" for a definition
                gauge_stitch_count DECIMAL(5,2),
                gauge_row_count DECIMAL(5,2),
                gauge_unit VARCHAR(10),
                -- etc. for measurements, yarn details... or use JSONB to store a snapshot
                parameter_snapshot JSONB
            );
            ```
    * **API Endpoints (Conceptual):**
        * If using a backend table: `POST /api/pattern_definition_sessions`, `PUT /api/pattern_definition_sessions/{id}`, `GET /api/pattern_definition_sessions/{id}`.
    * **Logic/Processing:**
        * Frontend state management (e.g., Vuex, Redux, Zustand) to hold the current definition data as the user progresses.
        * Logic to save/update the session data to the backend if a persistent draft model is used.
    * **UI Considerations (High-Level):**
        * A dashboard-like view or a tabbed interface/stepper.
        * Clear indication of which section is active.
        * "Save Draft" button.
        * "Proceed to Tools/Calculation" button (disabled until essential info is provided).
    * **Integration Points:**
        * Integrates UI components developed in US 1.1, 1.2, 1.3, 1.4, 1.5.
        * This session data will be the primary input for the "helper tools" and the main pattern calculation engine.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can navigate through different sections for Gauge, Measurements, Ease, Yarn, and Stitch Pattern input.
    * AC2: Data entered in one section is visible/reflected when returning to it or in a summary view.
    * AC3: If using persistent drafts, user can save a partially completed definition and retrieve it later.
    * AC4: The UI provides a clear overview of the current state of the pattern definition.
7.  **Assumptions/Pre-conditions:**
    * User Stories 1.1 to 1.5 are implemented, providing the necessary components and backend capabilities.
8.  **Impacted System Components (Illustrative):**
    * New UI: `PatternDefinitionWorkspace.vue`, `DefinitionStepper.vue`, `DefinitionSummary.vue`.
    * New/Modified Backend: `PatternDefinitionSessionController`, `PatternDefinitionSessionService` and the `pattern_definition_sessions` table.
    * Frontend state management store.

