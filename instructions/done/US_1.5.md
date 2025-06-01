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

