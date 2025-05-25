
**Phase 8: Stitch Library and Advanced Pattern Elements**

This phase focuses on building a browsable library of stitch patterns beyond the basics already introduced, and then developing the tools and calculation logic to properly integrate these more complex patterns into garment pieces. This directly addresses PDF Section 6.2 ("Bibliothèque de Points") and Section 4.3 ("Répartition des Mailles pour Motifs").

**User Story 8.1**

1.  **Title:** Develop "Stitch Library" with Categorization, Search, and Detailed Views
2.  **Goal:** As a user, I want access to a browsable and searchable library of diverse stitch patterns (e.g., cables, lace, textured stitches), complete with visual swatches, properties, and row-by-row instructions, so I can discover and select interesting stitch patterns for my projects.
3.  **Description:** This story expands significantly on US 1.5 (Basic Stitch Pattern Selection) and US 3.3 (Basic Stitch Pattern Effects Preview) by creating a full-fledged stitch library. Users will be able to explore various categories of stitches, see detailed information, and select them for potential use in their pattern definition. This is a core feature mentioned in PDF Section 6.2.
4.  **Functional Requirements:**
    * FR1: Create a new database table (or expand `stitch_patterns` from US 1.5) to store a wide variety of stitch patterns. Each entry should include:
        * Name (e.g., "3x3 Left Cross Cable," "Horseshoe Lace," "Moss Stitch").
        * Category (e.g., "Cables," "Lace," "Ribbing," "Textured," "Colorwork").
        * Stitch repeat width (number of stitches) and height (number of rows).
        * Written row-by-row instructions for the stitch pattern repeat.
        * (Optional but highly recommended) Chart symbols for knitting/crochet if a charting tool is envisioned later (PDF 5.3).
        * A clear swatch image.
        * Properties (similar to US 3.3, e.g., reversibility, texture, relative yarn consumption, common uses, difficulty level).
        * Craft type (knitting/crochet).
    * FR2: Implement a UI view for the Stitch Library that allows users to:
        * Browse by category.
        * Search by name or keywords (e.g., "cable," "leaf," "beginner").
        * Filter by properties (e.g., "reversible," "lace," "textured").
    * FR3: Implement a detailed view for each stitch pattern, displaying all its information (name, image, instructions, chart if available, properties).
    * FR4: Users should be able to "select" or "favorite" a stitch pattern from the library to potentially use it in their current `pattern_definition_session`.
    * FR5: The library should be pre-populated with a reasonable number of diverse stitch patterns (e.g., 20-30 initially, with a plan for ongoing additions). An admin interface for adding/editing stitches would be beneficial long-term but is not part of this US.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Significantly enhance or replace the `stitch_patterns` table from US 1.5:
            ```sql
            CREATE TABLE IF NOT EXISTS stitch_patterns (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                stitch_name VARCHAR(255) NOT NULL,
                craft_type VARCHAR(10) NOT NULL CHECK (craft_type IN ('knitting', 'crochet')),
                category VARCHAR(100), -- e.g., 'Cables', 'Lace', 'Textured', 'Ribbing', 'Colorwork'
                description TEXT,
                stitch_repeat_width INT NOT NULL,
                stitch_repeat_height INT NOT NULL,
                instructions_written JSONB, -- e.g., {"knit_side_up": true, "rows": [{"row_num": 1, "instruction": "Knit all stitches."}]} or structured for crochet
                -- chart_symbols JSONB, -- For future charting tool: array of arrays representing the chart grid
                swatch_image_url TEXT,
                properties JSONB, -- { "reversibility": "No", "texture": "High", "difficulty": "Intermediate", "yarn_consumption": "High", "notes": "..." }
                search_keywords TEXT[], -- For easier searching
                is_basic BOOLEAN DEFAULT FALSE, -- To differentiate from US 1.5 basic stitches if needed
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE (stitch_name, craft_type)
            );
            ```
    * **API Endpoints (Conceptual):**
        * `GET /api/stitch_patterns` (with query parameters for search, filtering by category, craft_type, keywords, properties).
        * `GET /api/stitch_patterns/{id}` (to get details of a specific stitch pattern).
    * **Logic/Processing:**
        * Backend logic for searching and filtering stitch patterns based on query parameters.
        * If `instructions_written` are stored as structured JSON, a backend utility might be needed to format them into human-readable text for display.
    * **UI Considerations (High-Level):**
        * A dedicated "Stitch Library" section in the application.
        * Grid or list view for Browse stitches, with thumbnail swatches.
        * Prominent search bar and filter options.
        * Clear and well-organized detail page for each stitch.
        * "Select for Project" or "Add to Favorites" button on the detail page.
    * **Integration Points:**
        * The selected stitch from this library will be used by US 8.2 (Stitch Pattern Integration Tool) and US 8.3 (Calculation Logic).
        * Replaces/Extends the basic stitch selection from US 1.5.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: The Stitch Library UI allows Browse by categories (e.g., "Cables," "Lace") and searching by name.
    * AC2: Clicking on a stitch pattern displays its detailed view with name, swatch image, written instructions, repeat information, and properties.
    * AC3: The library is pre-populated with at least 20 diverse stitch patterns (for both knitting and crochet if applicable).
    * AC4: User can select a stitch pattern, and this selection is somehow noted (e.g., passed to the pattern definition context or added to a temporary "selected stitches" list).
7.  **Assumptions/Pre-conditions:**
    * A collection of stitch patterns (images, instructions, properties) is ready for pre-population. This requires significant content creation or curation.
    * The basic UI framework supports creating new browsable/searchable sections.
8.  **Impacted System Components (Illustrative):**
    * New DB table (or heavily modified): `stitch_patterns`.
    * New UI components: `StitchLibraryBrowser.vue`, `StitchDetailView.vue`, `StitchFilterPanel.vue`.
    * New Backend: `StitchPatternController` (enhanced), `StitchPatternService` (enhanced).

