
### Phase 2: Interactive Visual Feedback (2D Schematic) & Non-Sequential Navigation

**Goal:** Allow users to freely navigate between relevant sections and provide a basic, real-time 2D schematic preview that updates with key selections.

**User Story PD_PH2_US001: Enable Non-Sequential Navigation Between Active Pattern Sections**

* **Sequence Number:** PD_PH2_US001
* **Title:** Enable Non-Sequential Navigation Between Active Pattern Definition Sections
* **Description:** As a user, after selecting my garment type, I want to be able to click on any available pattern definition section (e.g., "Gauge," "Sleeves," "Neckline") in any order I choose and have that section load for editing.
* **Functional Requirements (What & How - User Perspective):**
    1.  After selecting a garment type (from PD_PH1_US001), a navigation menu/area (e.g., sidebar, tabs) displays all relevant sections for that garment.
    2.  The user can click on any section in this navigation.
    3.  The main content area updates to display the selected section's input fields and information.
    4.  The previously entered data for any section is retained (as per PD_PH1_US002).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Frontend Routing/State:**
        * If using a SPA framework (React, Vue, Angular), utilize client-side routing or a state variable to manage the currently active section view.
        * Example: `patternState.uiSettings.currentSection = "neckline";`
        * The `PatternDefinitionWorkspace` component will observe `currentSection` and render the appropriate section component (e.g., `NecklineEditor`, `SleeveDesigner`).
    2.  **Navigation Component:**
        * The navigation component (e.g., `PatternSectionsNav`) will list links/buttons for each section relevant to the `currentGarmentType`.
        * Clicking a link updates `patternState.uiSettings.currentSection`.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a "Sweater" garment type is selected, and sections "Gauge," "Measurements," "Neckline," and "Sleeves" are available.
    2.  When the user clicks "Neckline," then the neckline definition UI is shown.
    3.  When the user then clicks "Gauge," then the gauge definition UI is shown.
    4.  When the user clicks back to "Neckline," any data previously entered in "Neckline" is still there.
    5.  Verify that only sections relevant to the chosen garment type are navigable.

