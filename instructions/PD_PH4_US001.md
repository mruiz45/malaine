### Phase 4: Advanced Interdependencies and Visual Refinements

**Goal:** Implement logic for how different pattern parts affect each other and refine the visual preview with more details.

**User Story PD_PH4_US001: Implement Basic Interdependency: Ease Affecting Dimensions in Schematic**

* **Sequence Number:** PD_PH4_US001
* **Title:** Implement Basic Interdependency: Ease Affecting Finished Dimensions in 2D Schematic
* **Description:** As a user, when I input my body measurements and then specify ease values (e.g., chest ease), I want the 2D schematic preview to update its proportions based on the *finished dimensions* (body measurement + ease), not just the raw body measurements.
* **Functional Requirements (What & How - User Perspective):**
    1.  This applies to garments where "Ease" is a relevant section (e.g., Sweaters, some Hats).
    2.  The user first enters their body measurements in the "Measurements" section. The schematic updates based on these (as per PD_PH2_US002).
    3.  The user then navigates to the "Ease" section and inputs ease values (e.g., +5cm to chest circumference).
    4.  The 2D schematic should update its proportions to reflect the calculated finished dimensions (body measurement + ease amount).
    5.  If ease is changed or removed, the schematic updates accordingly.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Calculated Values in State:**
        * The `patternState` should store both raw measurements and selected ease values.
        * Introduce a mechanism (e.g., selectors in Redux, computed properties in Vuex/Pinia, or derived state functions) to calculate `finishedDimensions` based on `measurements` and `ease`.
            ```javascript
            // In patternState
            // measurements: { chestCircumference: 90 }
            // ease: { chestEaseCm: 5 }

            // Derived state/getter
            // getFinishedChestCircumference() {
            //   return patternState.measurements.chestCircumference + patternState.ease.chestEaseCm;
            // }
            ```
    2.  **Update Schematic Logic:**
        * The `SchematicPreview2D` component should now use these `finishedDimensions` for drawing, instead of raw body measurements directly where ease is applicable.
        * It needs to subscribe to changes in `measurements` and `ease` sections of the `patternState`.
    3.  **UI for Ease:** Ensure the "Ease" section allows input of positive or negative ease values (cm, inches, or percentage as per original design).
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user has entered a chest circumference of 90cm for a sweater, the schematic reflects this.
    2.  When the user adds 5cm of positive ease for the chest, then the width of the sweater schematic visibly increases to represent a 95cm finished circumference.
    3.  When the user changes the ease to -2cm, then the schematic width decreases to represent an 88cm finished circumference.
    4.  If ease is set to 0 or the "Ease" section is not applicable/set, the schematic uses raw measurements.

