

### Phase 1: Foundational Refactoring - Garment-Centric & Dynamic UI Core

**Goal:** Transition from a linear flow to a garment-type-driven UI. Establish the main pattern definition workspace where modules can be loaded dynamically.

**User Story PD_PH1_US001: Implement Garment Type as Primary Selector and Dynamic Section Loading**

* **Sequence Number:** PD_PH1_US001
* **Title:** Establish Garment Type as Primary Selector and Dynamically Load Relevant Pattern Definition Sections
* **Description:** As a user, after starting a new pattern, I want to first select the main garment type (e.g., Sweater, Scarf, Hat). Based on this selection, I want the application to only show me relevant sections for defining that specific garment, allowing me to access them in a non-linear fashion later.
* **Functional Requirements (What & How - User Perspective):**
    1.  The initial step in pattern definition *must* be the selection of "Garment Type" (e.g., from a dropdown or a visual card selection).
    2.  Once a garment type is selected (e.g., "Scarf"), the UI should update to display only the relevant pattern definition modules/sections (e.g., "Gauge," "Measurements (Length, Width)," "Yarn," "Stitch Pattern"). Modules like "Ease," "Sleeves," "Neckline" should be hidden or disabled.
    3.  If "Sweater" is selected, modules like "Gauge," "Measurements," "Ease," "Body Structure," "Neckline," "Sleeves" should become available.
    4.  A main navigation or panel should be visible, listing these available sections. The user should understand that these sections can be visited in any order (though this US focuses on displaying them; full non-linear navigation will be in a later US).
    5.  The system must have a clear mapping of which sections are relevant for each garment type.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Data Model:**
        * Define a configuration (e.g., JSON object or a database table `GarmentTypeSections`) that maps garment types to their relevant pattern definition sections/modules.
            ```json
            // Example in-memory configuration
            const garmentTypeConfig = {
              "scarf": ["gauge", "measurements", "yarn", "stitchPattern"],
              "sweater": ["gauge", "measurements", "ease", "bodyStructure", "neckline", "sleeves", "yarn", "stitchPattern"],
              "hat": ["gauge", "measurements", "ease", "structure", "yarn", "stitchPattern"]
            };
            ```
    2.  **Frontend:**
        * Refactor the main pattern definition entry point.
        * The `GarmentTypeSelection` component will be the first component loaded.
        * Upon selection, the application state (e.g., in a Redux store, Vuex store, or React Context) should be updated with the chosen `currentGarmentType`.
        * A `PatternDefinitionWorkspace` component will listen to changes in `currentGarmentType`.
        * This workspace will dynamically render navigation links/tabs and content areas for only the sections applicable to the `currentGarmentType`, based on `garmentTypeConfig`.
        * Each section (e.g., `GaugeSection`, `MeasurementsSection`) should be a distinct component.
    3.  **State Management:**
        * Implement an in-memory data structure to hold the current pattern definition. This could be a single JSON object. Example:
            ```javascript
            // initialPatternState
            let currentPattern = {
              garmentType: null,
              gauge: { /* ... */ },
              measurements: { /* ... */ },
              // ... other sections
            };
            ```
        * When a garment type is selected, `currentPattern.garmentType` is populated. Other sections are initialized as empty or with default values.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user starts defining a new pattern, then the first and only option presented is to select a garment type.
    2.  Given a user selects "Scarf" as the garment type, then UI sections for "Ease," "Neckline," and "Sleeves" are not visible or are disabled.
    3.  Given a user selects "Sweater" as the garment type, then UI sections for "Ease," "Neckline," and "Sleeves" are visible and accessible.
    4.  Verify that for each defined garment type, the correct set of pattern definition sections is displayed.
    5.  The in-memory `currentPattern` object should correctly reflect the selected garment type and initialize (or clear) other sections appropriately.

