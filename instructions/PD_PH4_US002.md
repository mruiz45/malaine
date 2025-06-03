**User Story PD_PH4_US002: Enhance 2D Schematic with Sleeve Type Selection**

* **Sequence Number:** PD_PH4_US002
* **Title:** Enhance 2D Schematic Preview with Basic Sleeve Type Selection
* **Description:** As a user designing a garment with sleeves (e.g., a sweater), I want the 2D schematic preview to update in real-time to reflect the basic type of sleeve I select (e.g., Set-in, Raglan, Drop Shoulder - simplified representation).
* **Functional Requirements (What & How - User Perspective):**
    1.  This applies to garments where "Sleeves" is a relevant section.
    2.  When the user selects a sleeve type (e.g., "Set-in," "Raglan," "Drop Shoulder") in the "Sleeves" definition section.
    3.  The 2D schematic in the preview area updates the armhole and sleeve area of the garment outline to give a simplified visual cue of that sleeve construction.
    4.  This is still a schematic representation, not a detailed flat pattern.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Extend `patternState`:**
        * `patternState.sleeves` should store `type` (e.g., "set-in", "raglan", "drop-shoulder") and any primary parameters like `sleeveLength` (if not already in general measurements).
            ```javascript
            // In patternState
            sleeves: {
              isSet: false,
              type: null, // "set-in", "raglan", "drop-shoulder", "none"
              sleeveLength: null, // if applicable
              // ... other sleeve specific parameters
            },
            ```
    2.  **Update Drawing Logic:**
        * Modify `drawSweaterSchematic` (or similar) to accept sleeve type and parameters.
        * Create logic to adjust the shoulder/armhole area:
            * **Set-in:** Typical armhole curve.
            * **Raglan:** Diagonal lines from neckline to underarm.
            * **Drop Shoulder:** Extended shoulder line, sleeve attached lower.
        * Draw simplified sleeve shapes attached according to the type.
    3.  **Real-time Updates:**
        * `SchematicPreview2D` subscribes to changes in `patternState.sleeves.type` and `patternState.measurements` (for sleeve length if it's there).
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a "Sweater" schematic is displayed, initially showing default (e.g., set-in like) sleeves or no distinct sleeve type.
    2.  When the user selects "Raglan" sleeves, then the schematic updates to show diagonal lines indicating raglan seams from the neckline area.
    3.  When the user selects "Drop Shoulder" sleeves, then the schematic updates to show a wider shoulder and sleeves attached lower.
    4.  If "Sleeveless" or an equivalent is chosen (or garment type doesn't have sleeves), the sleeves part of the schematic is removed or shown as a basic armhole.

