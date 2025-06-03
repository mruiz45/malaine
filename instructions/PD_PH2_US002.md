**User Story PD_PH2_US002: Implement Real-Time 2D Schematic Preview for Garment Type and Basic Dimensions**

* **Sequence Number:** PD_PH2_US002
* **Title:** Implement Real-Time 2D Schematic Preview for Garment Type and Basic Dimensions
* **Description:** As a user, I want to see a simple 2D schematic representation of my chosen garment type (e.g., a T-shape for a sweater, a rectangle for a scarf). This schematic should update in real-time when I input or change key dimensions like overall length or width.
* **Functional Requirements (What & How - User Perspective):**
    1.  A dedicated area on the pattern definition screen displays a 2D schematic.
    2.  When a garment type is selected, a default, simplified 2D outline for that garment appears (e.g., a basic sweater outline, a rectangle for a scarf).
    3.  When the user enters or modifies primary dimensions (e.g., `bodyLength`, `chestCircumference` for a sweater; `length`, `width` for a scarf) in the "Measurements" section, the proportions of the 2D schematic update in real-time to reflect these changes.
    4.  This is a schematic, not a detailed pattern piece view. It's for overall shape and proportion understanding.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Preview Component:**
        * Create a `SchematicPreview2D` component (e.g., using SVG, HTML Canvas, or a library like Konva.js or Paper.js).
    2.  **Drawing Logic:**
        * Develop functions that take `garmentType` and key dimension parameters from `patternState.measurements` to draw the schematic.
        * `drawSweaterSchematic(width, length, sleevePlaceholder)`
        * `drawScarfSchematic(width, length)`
        * These functions will translate measurements into coordinates/sizes for drawing shapes (rectangles, polygons).
    3.  **Real-time Updates:**
        * The `SchematicPreview2D` component must subscribe to changes in relevant parts of the `patternState` (especially `garmentType` and `measurements`).
        * Whenever these state parts change, the component re-renders by calling the appropriate drawing function with the new parameters.
    4.  **Styling:** Keep the schematic simple and clear (e.g., black outlines on a white background).
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user selects "Scarf" as the garment type, then a 2D rectangle is shown in the preview area.
    2.  When the user enters a length of 150cm and width of 20cm in the "Measurements" section for the scarf, then the rectangle in the preview updates its proportions to reflect this.
    3.  Given a user selects "Sweater" as the garment type, then a basic T-shaped or similar sweater outline is shown.
    4.  When the user enters `bodyLength` and `chestCircumference` in "Measurements," then the sweater schematic updates its main body proportions accordingly.
    5.  The update should be visually immediate upon changing the input values.

