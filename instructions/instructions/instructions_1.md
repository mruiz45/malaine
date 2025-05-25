Okay, I have analyzed the provided PDF document "Conception application tricot et crochet_.pdf" and the example User Story. I will now outline a phased development plan with detailed User Stories for building the knitting and crochet pattern generation application, with a special focus on integrating "tools to help define patterns" into an existing project.

The following document breaks down the project into sequential phases. Each phase contains one or more User Stories. Each User Story is designed to be understood by a generative AI developer and includes: a title, goal, description, functional requirements, technical implementation guidance, acceptance criteria, assumptions, and illustrative impacted components. PostgreSQL table definitions are included where necessary.

---

**Project Development Plan: Custom Knitting & Crochet Pattern Generator**

**Introduction**

This document outlines the phased development of a web application for generating custom knitting and crochet patterns, as detailed in the "Conception application tricot et crochet_.pdf". The primary goal of this new development phase is to complement an existing project by introducing a suite of tools that assist users in the definition of patterns. Development will be progressive and step-by-step to ensure stability and functionality.

**Phase 0: Existing Project Analysis and Integration Strategy**

This initial phase is crucial for understanding the current system and planning a non-disruptive integration of new features.

**User Story 0.1**

1.  **Title:** Analyze Existing Project Architecture and Define Integration Strategy for Pattern Definition Tools
2.  **Goal:** As a development team, we need to thoroughly analyze the existing project's architecture (frontend, backend, database, APIs), identify key integration points, and define a clear strategy for incorporating the new pattern definition tools and features to ensure seamless integration and avoid destabilizing existing functionalities.
3.  **Description:** This foundational story involves a deep dive into the current codebase, data structures, and deployment environment. The output will be an integration plan document, outlining how new modules/services for pattern definition will interact with the existing system, data migration/synchronization strategies if needed, and any necessary refactoring of existing components to support the new features. This will also include setting up the development environment for the AI.
4.  **Functional Requirements:**
    * FR1: Document the current architecture of the existing application (key components, technologies used, data flow).
    * FR2: Identify existing data models relevant to users, patterns, or materials, if any.
    * FR3: Define the strategy for UI integration (e.g., new sections in the existing UI, separate views, shared component library).
    * FR4: Define the strategy for backend integration (e.g., new API endpoints, extending existing services, microservice architecture).
    * FR5: Identify potential risks and challenges in integration and propose mitigation strategies.
    * FR6: Establish guidelines for coding standards, version control, and testing for the new modules, consistent with or improving upon existing project practices.
5.  **Technical Implementation Guidance:**
    * **Activities:**
        * Review existing source code (frontend and backend).
        * Analyze existing database schema.
        * Map out existing API endpoints and their functionalities.
        * Discuss with any existing development team members or stakeholders if possible.
        * Evaluate the current technology stack for compatibility with planned features.
    * **Deliverables:**
        * An "Integration Strategy Document" detailing:
            * Chosen architectural approach for new features (e.g., modular monolith, microservices).
            * Defined API contracts or interface points between old and new systems.
            * Data schema extension plan (how new tables will relate to existing ones).
            * UI integration mockups or wireframes (high-level).
            * Technology choices for new components (if different or new are needed, e.g., a specific library for a new tool).
            * Setup instructions for the AI development environment to mirror the project structure.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: The Integration Strategy Document is comprehensive and approved by the project owner/stakeholder.
    * AC2: Key developers (or the AI) can articulate the integration points and development approach.
    * AC3: The development environment is successfully set up and allows for initial file/module creation according to the plan.
7.  **Assumptions/Pre-conditions:**
    * Access to the existing project's codebase and documentation is available.
    * The AI (Cursor/WindSurf) has the capability to understand the existing project structure once explained/loaded.
8.  **Impacted System Components (Illustrative):**
    * This story primarily produces documentation and understanding, rather than code. It will inform all future stories' "Impacted System Components."

---

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

**User Story 1.4**

1.  **Title:** Implement Yarn and Material (Laine et Matériel) Details Input and Management
2.  **Goal:** As a user, I want to record details about the yarn I plan to use (e.g., fiber, weight category, yardage per skein, color) so that the system can help estimate quantity needed and so I can keep track of materials for my projects.
3.  **Description:** This story allows users to define the yarn they are using. This information is crucial for yarn quantity estimation and can also be used by tools like the color simulator. This corresponds to PDF section 1.4.
4.  **Functional Requirements:**
    * FR1: User can input yarn name/brand.
    * FR2: User can select fiber content (e.g., wool, cotton, acrylic, blend - allow multiple selections or text input).
    * FR3: User can select yarn weight category (e.g., Lace, Fingering, DK, Worsted, Bulky).
    * FR4: User can input yardage/meterage per skein/ball and weight per skein/ball (e.g., 100g / 200m).
    * FR5: User can input color information (name, dye lot if necessary).
    * FR6: User can save yarn profiles for re-use.
    * FR7: (Optional) Link to where the yarn was purchased or its Ravelry ID.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `yarn_profiles` table:
            ```sql
            CREATE TABLE IF NOT EXISTS yarn_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id), -- Or can be a global library supplemented by user additions
                yarn_name VARCHAR(255),
                brand_name VARCHAR(255),
                fiber_content TEXT, -- Could be JSONB for multiple fibers e.g. [{"fiber": "wool", "percentage": 80}, {"fiber": "nylon", "percentage": 20}]
                yarn_weight_category VARCHAR(50), -- e.g., 'Worsted', 'DK'. Standard categories.
                skein_yardage DECIMAL(10,2),
                skein_meterage DECIMAL(10,2), -- Store one, calculate other or store both
                skein_weight_grams DECIMAL(10,2),
                color_name VARCHAR(100),
                color_hex_code VARCHAR(7), -- For color simulator
                dye_lot VARCHAR(50),
                notes TEXT,
                -- image_url TEXT, -- For yarn picture
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/yarn_profiles`
        * `GET /api/yarn_profiles` (with filtering/searching)
        * `GET /api/yarn_profiles/{profile_id}`
        * `PUT /api/yarn_profiles/{profile_id}`
        * `DELETE /api/yarn_profiles/{profile_id}`
    * **Logic/Processing:**
        * Standardized list for yarn weight categories (e.g., Craft Yarn Council standards).
        * Possible integration with external yarn databases (e.g., Ravelry API) in a future enhancement.
    * **UI Considerations (High-Level):**
        * Form for yarn details. Dropdowns for standardized fields like weight category.
        * Ability to search/browse saved yarn profiles.
        * Color picker for `color_hex_code`.
    * **Integration Points:**
        * `gauge_profiles` (gauge is often tied to a specific yarn).
        * Yarn Quantity Estimator Tool.
        * Color Rendering Simulator Tool.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can successfully input all specified yarn details and save a yarn profile.
    * AC2: Saved yarn profiles are correctly retrieved and displayed.
    * AC3: Dropdown for yarn weight category contains standard options.
    * AC4: Data is correctly stored in the `yarn_profiles` table.
7.  **Assumptions/Pre-conditions:**
    * Decision on whether yarn profiles are user-specific or part of a global, extensible library.
8.  **Impacted System Components (Illustrative):**
    * New: `YarnProfileController`, `YarnProfileService`, `YarnProfileRepository`, `yarn_profiles` DB table.
    * UI: `YarnInputForm.vue`, `YarnProfileList.vue`.

**User Story 1.5**

1.  **Title:** Implement Basic Stitch Pattern (Choix du Point) Selection and Definition
2.  **Goal:** As a user, I want to select or define the primary stitch pattern I will be using for my project so its characteristics (like texture and effect on gauge) can be considered.
3.  **Description:** This story allows users to specify the main stitch pattern. Initially, this could be a selection from common stitches. This corresponds to PDF section 1.5. More complex stitch library is a future US (8.1).
4.  **Functional Requirements:**
    * FR1: User can select a stitch pattern from a predefined list of basic stitches (e.g., Stockinette, Garter, Rib 1x1, Rib 2x2, Seed Stitch).
    * FR2: For each stitch, store basic properties like stitch repeat width and height (if applicable and simple, e.g. Rib 1x1 is 2 sts wide, 1 row high for texture).
    * FR3: (Future) Allow user to define a custom stitch pattern by inputting its row-by-row instructions (this is more advanced).
    * FR4: The selected stitch pattern should be associated with the current pattern definition session/project.
    * FR5: System may provide a visual swatch representation for selected basic stitches.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `stitch_patterns` table (for a predefined library):
            ```sql
            CREATE TABLE IF NOT EXISTS stitch_patterns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                stitch_name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                stitch_repeat_width INT, -- Number of stitches in one horizontal repeat
                stitch_repeat_height INT, -- Number of rows in one vertical repeat
                -- instructions_text TEXT, -- For more complex stitches later
                -- image_url TEXT, -- For a visual swatch
                -- properties JSONB, -- e.g., {"reversible": true, "flat_lying": false, "texture_depth": "medium"}
                is_basic BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * Seed this table with common basic stitches.
    * **API Endpoints (Conceptual):**
        * `GET /api/stitch_patterns` (List available stitch patterns, filter by `is_basic=true`)
        * `GET /api/stitch_patterns/{id}`
        * (Later, POST/PUT for custom stitch patterns if that feature is built via Admin or user input)
    * **Logic/Processing:**
        * The selected stitch pattern might influence gauge. The user's gauge (US 1.1) should ideally be made *in the selected stitch pattern*. The system should remind the user of this.
    * **UI Considerations (High-Level):**
        * A dropdown or selectable list/grid of basic stitch patterns.
        * Display a small image/preview of the stitch if available.
        * Show basic properties like repeat width/height.
    * **Integration Points:**
        * `gauge_profiles` (gauge is stitch-dependent).
        * Pattern calculation algorithms (especially for stitch count adjustments).
        * Stitch Pattern Visualizer Tool (future US).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select a basic stitch pattern from the predefined list.
    * AC2: The selected stitch pattern's details (name, basic properties) are displayed and stored with the current pattern definition.
    * AC3: The `stitch_patterns` table is pre-populated with at least 5 common basic stitches.
    * AC4: The UI clearly indicates that gauge should be swatched in the chosen stitch.
7.  **Assumptions/Pre-conditions:**
    * A list of initial basic stitch patterns and their properties is defined.
8.  **Impacted System Components (Illustrative):**
    * New: `StitchPatternController`, `StitchPatternService`, `StitchPatternRepository`, `stitch_patterns` DB table.
    * UI: `StitchPatternSelector.vue`.

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

---

This concludes Phase 0 and Phase 1. Subsequent phases will build upon this foundation, introducing the "pattern definition helper tools" and then expanding to pattern calculation and generation for specific garment types, as outlined in the PDF. I will continue with Phase 2 in the next message if you are satisfied with this level of detail and structure.