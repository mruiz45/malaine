

**Phase 1: Core Data Models and Basic Input for Pattern Foundations**

This phase establishes the fundamental data structures and initial UI/API for capturing essential user inputs, as described in Section 1 of the PDF ("Fondations du Patron"). These are prerequisites for both pattern generation and the helper tools.

**User Story 1.1**

1.  **Title:** Implement Gauge (Échantillon) Definition and Management
2.  **Goal:** As a user, I want to define, save, and manage my knitting/crochet gauge (stitch and row count per $10~cm \times 10~cm$ or $4~in \times 4~in$) so that patterns can be accurately calculated for my specific tension and materials.
3.  **Description:** This story involves creating the backend data model and API endpoints for storing gauge information, and a basic UI for users to input these details. This corresponds to PDF section 1.1.
4.  **Functional Requirements:**
    * FR1: User can input stitch count per $10~cm$ (or $4~in$).
    * FR2: User can input row count per $10~cm$ (or $4~in$).
    * FR3: User can specify the unit of measurement (cm or inches) for the gauge swatch.
    * FR4: User can name and save a gauge profile for later re-use (e.g., "My DK wool with 4mm needles").
    * FR5: The system should store the gauge information associated with a user profile (if user accounts exist) or a user session.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `gauge_profiles` table:
            ```sql
            CREATE TABLE IF NOT EXISTS gauge_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id), -- If user system exists
                profile_name VARCHAR(255) NOT NULL,
                stitch_count DECIMAL(5,2) NOT NULL,
                row_count DECIMAL(5,2) NOT NULL,
                measurement_unit VARCHAR(10) NOT NULL, -- 'cm' or 'inch'
                swatch_width DECIMAL(5,2) NOT NULL DEFAULT 10.0, -- e.g., 10 for cm, 4 for inches
                swatch_height DECIMAL(5,2) NOT NULL DEFAULT 10.0,
                notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/users/{user_id}/gauge_profiles` (Create new gauge profile)
        * `GET /api/users/{user_id}/gauge_profiles` (List user's gauge profiles)
        * `GET /api/gauge_profiles/{profile_id}` (Get specific profile)
        * `PUT /api/gauge_profiles/{profile_id}` (Update profile)
        * `DELETE /api/gauge_profiles/{profile_id}` (Delete profile)
    * **Logic/Processing:**
        * Backend validation for input values (numeric, positive).
        * Conversion logic if the system internally prefers one unit (e.g., always store in cm).
    * **UI Considerations (High-Level):**
        * A form with fields for stitch count, row count, unit selection, swatch dimensions (defaulted to 10cm/4in but overridable), and profile name.
        * A list view to display saved gauge profiles.
    * **Integration Points:**
        * User authentication system (if `user_id` is used).
        * This data will be fundamental for all subsequent pattern calculation modules.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can successfully input values for stitch count, row count, select units, and save a named gauge profile.
    * AC2: Saved gauge profiles are correctly retrieved and displayed.
    * AC3: Input validation prevents non-sensical data (e.g., negative stitch count).
    * AC4: Data is correctly stored in the `gauge_profiles` table in the database.
7.  **Assumptions/Pre-conditions:**
    * Phase 0 (Integration Analysis) is complete.
    * Basic UI framework and backend API structure are in place or being set up.
    * If `user_id` is used, a basic user authentication and management system exists or will be created alongside. For a simpler start, `user_id` can be nullable or managed via session if users are not implemented yet.
8.  **Impacted System Components (Illustrative):**
    * New: `GaugeController`, `GaugeService`, `GaugeRepository`, `gauge_profiles` DB table.
    * Potentially new UI components: `GaugeInputForm.vue`, `GaugeProfileList.vue` (example frontend component names).

