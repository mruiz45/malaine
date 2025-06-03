**User Story PD_PH2_US003: Enhance 2D Schematic with Neckline Type Selection**

* **Sequence Number:** PD_PH2_US003
* **Title:** Enhance 2D Schematic Preview with Neckline Type Selection
* **Description:** As a user designing a garment with a neckline (e.g., a sweater), I want the 2D schematic preview to update in real-time to reflect the type of neckline I select (e.g., Round Neck, V-Neck).
* **Functional Requirements (What & How - User Perspective):**
    1.  This applies to garments where "Neckline" is a relevant section.
    2.  When the user selects a neckline type (e.g., "Round," "V-Neck," "Boat Neck") in the "Neckline" definition section.
    3.  The 2D schematic in the preview area updates to show a simplified representation of that neckline shape on the garment outline.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Extend `patternState`:**
        * Ensure `patternState.neckline` can store `type` (e.g., "round", "v-neck") and any relevant parameters (e.g., `depth`, `width` for some types, although these might be calculated later).
            ```javascript
            // In patternState
            neckline: {
              isSet: false,
              type: null, // "round", "v-neck", "square", "boat"
              depth: null,
              width: null,
              // ... other neckline specific parameters
            },
            ```
    2.  **Update Drawing Logic:**
        * Modify the schematic drawing functions (e.g., `drawSweaterSchematic`) to accept neckline parameters.
        * Implement sub-functions like `drawRoundNeckline(centerX, width, depth)` or `drawVNeckline(centerPoint, width, depth)` that draw paths or shapes onto the existing garment outline.
    3.  **Real-time Updates:**
        * The `SchematicPreview2D` component subscribes to changes in `patternState.neckline.type` (and other relevant neckline parameters).
        * On change, it re-renders the schematic, incorporating the new neckline shape.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a "Sweater" schematic is displayed.
    2.  When the user selects "Round Neck" in the "Neckline" section, then the schematic updates to show a curved neckline.
    3.  When the user changes the selection to "V-Neck," then the schematic updates to show a V-shaped neckline.
    4.  The update is visually immediate.
    5.  If the garment type does not support necklines (e.g., "Scarf"), this functionality does not apply, and no neckline is drawn.

---
