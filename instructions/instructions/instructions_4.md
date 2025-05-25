**User Story 3.3**

1.  **Title:** Implement "Basic Stitch Pattern Effects Preview" Tool
2.  **Goal:** As a user selecting a basic stitch pattern, I want to see a simple visual representation of that stitch and understand its common characteristics (e.g., "curls at edges," "lies flat," "very textured," "eats yarn") so I can make a more informed choice for my project.
3.  **Description:** This tool enhances US 1.5 (Basic Stitch Pattern Selection) by providing more than just a name. It aims to give a visual hint and key properties for basic, common stitches. This is a step towards PDF Section 5.3 ("Diagrammes et Schémas") but focused on being a *definition aid* rather than full charting.
4.  **Functional Requirements:**
    * FR1: When a user selects a basic stitch pattern (from US 1.5's predefined list like Stockinette, Garter, Rib 1x1, Seed Stitch), the tool displays:
        * A small, static visual swatch image or a simple dynamically rendered graphical representation of the stitch fabric.
        * A list of key characteristics/properties (e.g., "Fabric behavior: Curls at edges", "Texture: Smooth", "Reversible: No", "Stretch: Moderate width-wise", "Relative yarn consumption: Average").
    * FR2: The visual representation and properties should be pre-defined for each basic stitch in the system.
    * FR3: This preview should be displayed within or alongside the stitch selection interface.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Enhance the `stitch_patterns` table (from US 1.5) with new fields:
            ```sql
            ALTER TABLE stitch_patterns
            ADD COLUMN IF NOT EXISTS swatch_image_url TEXT, -- Path to a static image of the swatch
            ADD COLUMN IF NOT EXISTS properties JSONB; -- Store characteristics
            -- Example for properties JSONB:
            -- {
            --   "fabric_behavior": "Curls at edges (stockinette)", "lies_flat": "Yes (garter)",
            --   "texture_description": "Smooth with V's (stockinette)", "Bumpy rows (garter)",
            --   "reversibility": "No (stockinette)", "Yes (garter)",
            --   "stretch_horizontal": "Moderate", "High",
            --   "stretch_vertical": "Low",
            --   "relative_yarn_consumption": "Average", "Higher than stockinette (garter, ribbing)",
            --   "notes": "Good for general fabric", "Great for edgings"
            -- }
            ```
        * Pre-populate these new fields for all basic stitches defined in US 1.5.
    * **API Endpoints (Conceptual):**
        * `GET /api/stitch_patterns/{id}` (from US 1.5) should now return the `swatch_image_url` and `properties` as well.
    * **Logic/Processing:**
        * Frontend fetches the selected stitch pattern's details and displays the image and properties.
        * For dynamically rendered graphical representation (more advanced, optional for "basic"):
            * A simple frontend component could draw basic stitches (like stockinette, garter) on a small grid using SVG or Canvas if static images are not preferred for very simple cases.
    * **UI Considerations (High-Level):**
        * When a stitch is selected in the `StitchPatternSelector.vue` (from US 1.5), a designated area updates to show the swatch image and its properties.
        * Properties can be displayed as a list or a set of tags.
    * **Integration Points:**
        * Directly enhances the `stitch_patterns` data and the UI component from US 1.5 (`StitchPatternSelector.vue`).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: When "Stockinette Stitch" is selected, a visual swatch (image or rendering) of stockinette is displayed, along with properties like "Curls at edges," "Smooth texture," "Not reversible."
    * AC2: When "Garter Stitch" is selected, its corresponding swatch and properties (e.g., "Lies flat," "Bumpy texture," "Reversible," "Stretchy") are displayed.
    * AC3: All basic stitch patterns in the system have associated swatch images/renderings and descriptive properties.
    * AC4: The information is presented clearly and is easily accessible upon stitch selection.
7.  **Assumptions/Pre-conditions:**
    * US 1.5 (Basic Stitch Pattern Selection) is implemented.
    * Swatch images for basic stitches have been created and are accessible via URLs, or simple rendering logic is defined.
    * Descriptive properties for each basic stitch have been researched and documented.
8.  **Impacted System Components (Illustrative):**
    * Modified DB table: `stitch_patterns`.
    * Modified UI: `StitchPatternSelector.vue` (from US 1.5) will be updated to include a preview area.
    * Potentially new UI component: `StitchPreviewDisplay.vue`.
    * Backend: `StitchPatternController`/`Service` will serve the enhanced data.

---

This completes Phase 3. These tools should significantly improve the user's ability to define the initial parameters and characteristics of their desired pattern with more confidence. Phase 4 will begin to tackle the definition of simple garment structures themselves.