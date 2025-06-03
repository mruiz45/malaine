**User Story PD_PH1_US002: Basic In-Memory Pattern State Management**

* **Sequence Number:** PD_PH1_US002
* **Title:** Implement Basic In-Memory State Management for Current Pattern Definition
* **Description:** As a developer, I need a robust in-memory data structure to hold all aspects of the pattern being designed by the user, ensuring data is captured and accessible across different pattern definition sections.
* **Functional Requirements (What & How - User Perspective):**
    1.  When the user inputs data into any active pattern definition section (e.g., gauge values, measurements), this data should be temporarily stored.
    2.  If the user navigates away from a section and returns (within the same design session), their previously entered data for that section should still be present.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **State Structure:**
        * Define a comprehensive JavaScript object structure (e.g., `PatternState`) that can hold all possible data points for all garment types and their sections. This structure will be populated progressively.
        * Example:
            ```javascript
            // In-memory PatternState (e.g., in a Pinia/Vuex/Redux store or React Context)
            const patternState = {
              version: "1.0.0", // For future migrations
              metadata: {
                patternId: null, // UUID generated on first save
                createdAt: null,
                updatedAt: null,
                designName: "Untitled Pattern",
              },
              garmentType: null, // e.g., "sweater", "scarf"
              uiSettings: {
                currentSection: "gauge", // Tracks the active UI section
              },
              gauge: {
                isSet: false,
                stitchesPer10cm: null,
                rowsPer10cm: null,
                yarnUsed: null, // Reference to a yarn profile ID
                needleSize: null,
                // ...
              },
              measurements: { // Could be structured per garment type if vastly different
                isSet: false,
                // common ones, or specific like:
                // for sweater: chestCircumference, bodyLength, sleeveLength
                // for scarf: length, width
              },
              ease: {
                isSet: false,
                chestEase: null, // cm or percentage
                // ...
              },
              // ... other sections like bodyStructure, neckline, sleeves, etc.
              // Each section should have an `isSet` flag or similar to track completion/relevance
            };
            ```
    2.  **State Update:**
        * Each pattern definition section component (e.g., `GaugeInputForm`, `MeasurementsForm`) will dispatch actions or directly update this central `patternState` when the user modifies data.
        * Input validation should occur at the component level or on state update.
    3.  **Persistence:** For this US, "in-memory" means client-side (browser memory) or server-side session state. No database persistence is required *yet* for the live design session itself. Final save to DB is a separate concern.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user selects a garment type and inputs data into the "Gauge" section.
    2.  When the user navigates to the "Measurements" section and then back to "Gauge".
    3.  Then the previously entered gauge data is correctly displayed.
    4.  Verify the `patternState` object in the browser's developer tools (or server session) accurately reflects all data entered by the user.
    5.  Changing the garment type should appropriately reset or adapt related fields in the `patternState`.

---
