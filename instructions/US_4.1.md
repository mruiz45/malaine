
**Phase 4: Developing Tools for Simple Garment Structure Definition**

This phase focuses on creating the data models for basic garment types and introducing interactive tools that allow users to select and define the core structural components of a garment they wish to create. This brings us closer to assembling a complete pattern definition.

**User Story 4.1**

1.  **Title:** Define Data Models for Basic Garment Types and Their Core Components
2.  **Goal:** As a system architect/developer, I need to define robust and extensible data models for representing different types of garments (e.g., Sweater, Cardigan, Scarf, Hat) and their fundamental structural components (e.g., Body, Sleeves, Neckline, Ribbing) so that the application can manage and process garment-specific information for pattern generation and tool interaction.
3.  **Description:** This is a foundational backend story for Phase 4. It involves designing database schemas or object models that can describe various garments and their constituent parts, including their relationships and attributes. This will directly support the tools in subsequent user stories within this phase and provide the structure for eventual pattern calculations. This corresponds to the overview of PDF Section 3.
4.  **Functional Requirements:**
    * FR1: Define a primary entity for `GarmentType` (e.g., 'Sweater', 'Cardigan', 'Beanie', 'Scarf').
    * FR2: For each `GarmentType`, define its common `GarmentComponent`s (e.g., a 'Sweater' has 'FrontBody', 'BackBody', 'Sleeves', 'NecklineFinish', 'BottomRibbing').
    * FR3: Define attributes for `GarmentComponent`s that are relevant to their construction (e.g., 'Sleeve' might have attributes for 'SleeveCapStyle', 'SleeveLengthType', 'CuffStyle').
    * FR4: The models should be extensible to accommodate new garment types and components in the future.
    * FR5: The models should allow linking to user-defined parameters from Phase 1 (Gauge, Measurements, Ease, Yarn, Stitch Pattern) as they apply to specific components or the overall garment.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `garment_types` table:
            ```sql
            CREATE TABLE IF NOT EXISTS garment_types (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                type_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'sweater_pullover', 'cardigan', 'beanie', 'scarf'
                display_name VARCHAR(100) NOT NULL,
                description TEXT,
                -- Default components or typical structure can be stored here if simple,
                -- or use a linking table for more complexity.
                -- Example: allowed_construction_methods JSONB -- ['drop_shoulder', 'set_in_sleeve', 'raglan']
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * `garment_components_templates` table (defines available component types):
            ```sql
            CREATE TABLE IF NOT EXISTS garment_component_templates (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                component_key VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'body_panel', 'sleeve', 'neckband', 'cuff', 'brim'
                display_name VARCHAR(100) NOT NULL,
                description TEXT,
                -- JSONB to store typical attributes or configurable options for this component type
                -- e.g., {"length_options": ["short", "standard", "long"], "shaping_options": ["straight", "tapered"]}
                configurable_attributes JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * `pattern_definition_components` table (links components to a specific user's pattern definition session from US 1.6):
            ```sql
            CREATE TABLE IF NOT EXISTS pattern_definition_components (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                pattern_definition_session_id UUID NOT NULL REFERENCES pattern_definition_sessions(id) ON DELETE CASCADE,
                component_template_id UUID NOT NULL REFERENCES garment_component_templates(id),
                component_label VARCHAR(100), -- e.g., "Front Bodice", "Left Sleeve" if user can have multiple of one type
                -- User-selected attributes for this specific instance of the component
                -- e.g., {"length": "long", "shaping": "tapered", "cuff_style": "ribbed_1x1"}
                selected_attributes JSONB,
                -- Potentially link to specific measurements or ease values if they vary per component
                -- measurement_set_id_override UUID REFERENCES measurement_sets(id),
                -- ease_override JSONB,
                notes TEXT,
                sort_order INT DEFAULT 0, -- For ordering components in UI or instructions
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
        * Pre-populate `garment_types` and `garment_component_templates` with initial data (e.g., for a basic sweater, scarf).
    * **API Endpoints (Conceptual):**
        * `GET /api/garment_types` (List available garment types)
        * `GET /api/garment_types/{type_key}/component_templates` (List component templates relevant for a garment type)
        * These models will be part of the `pattern_definition_sessions` (US 1.6) payload or linked to it. CRUD for `pattern_definition_components` would likely be managed via the pattern definition session endpoint.
    * **Logic/Processing:**
        * Define relationships: e.g., which components are mandatory/optional for a given garment type.
        * Validation logic for component attributes.
    * **UI Considerations (High-Level):**
        * No direct UI for this story, but it underpins the UI tools in subsequent stories (4.2 onwards).
    * **Integration Points:**
        * This model is central to the `pattern_definition_sessions` (US 1.6).
        * All subsequent tools in Phase 4 will interact with these models.
        * The core calculation engine (Phase 6) will heavily rely on these structured definitions.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: The `garment_types` table can store entries like 'Sweater' and 'Scarf'.
    * AC2: The `garment_component_templates` table can store entries like 'Body Panel', 'Sleeve', 'Neckband'.
    * AC3: The `pattern_definition_components` table can correctly link instances of components to a pattern definition session, including their specific attributes.
    * AC4: Initial data for at least one garment type (e.g., a simple drop-shoulder sweater) and its components is populated.
    * AC5: The models are documented, explaining relationships and attribute structures.
7.  **Assumptions/Pre-conditions:**
    * US 1.6 (Pattern Definition Session) is established as the context for these components.
    * Analysis of PDF Section 3 has identified initial garment types and components to model.
8.  **Impacted System Components (Illustrative):**
    * New DB tables: `garment_types`, `garment_component_templates`, `pattern_definition_components`.
    * Modified Backend: `PatternDefinitionSessionService` (to manage components within a session).
    * New Backend services: `GarmentTypeService`, `GarmentComponentTemplateService`.

