**User Story PD_PH6_US002: Develop/Refactor Core Pattern Calculation Engine**

* **Sequence Number:** PD_PH6_US002
* **Title:** Develop/Refactor Core Pattern Calculation Engine to Process `patternState`
* **Description:** As a system, we need a robust calculation engine that takes the flexible `patternState` (including user measurements, gauge, ease, garment type, structural choices, neckline, sleeves, etc.) and computes all necessary dimensional data, stitch counts, and row counts for each piece of the garment.
* **Functional Requirements (What & How - User Perspective):**
    * This is largely a backend process, transparent to the user until results are displayed.
    * The accuracy of these calculations is paramount.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Modular Design:**
        * The engine should be modular, with specific calculation modules for different garment parts (e.g., `BodyCalculator`, `SleeveCalculator`, `NecklineShapingCalculator`, `AccessoryCalculator`).
        * This replaces or significantly refactors the logic implied in US_12.x from `ALL_US.pdf`.
    2.  **Input:** The primary input is the validated `patternState` object (retrieved from memory for current design or from DB for a saved pattern).
    3.  **Core Calculations:**
        * **Finished Dimensions:** Calculate all critical finished dimensions based on body measurements, ease, and garment construction type. This expands on PD_PH4_US001.
        * **Stitch/Row Conversion:** Convert all cm/inch dimensions into stitches and rows using the user's `gauge` from `patternState.gauge`.
        * **Shaping Logic:** Implement algorithms for:
            * Increases/decreases for shaping (e.g., waist shaping, sleeve tapering, armhole curves, neckline curves, sleeve cap shaping).
            * Placement of these shaping elements.
            * Handling different construction methods (e.g., top-down, bottom-up, seamed, seamless components for raglans vs. set-in sleeves).
        * **Interdependency Resolution:** This is where flags like `patternState.bodyStructure.armholeRequiresRecalculation` (from PD_PH4_US003) are acted upon. For example, if a Raglan sleeve is chosen, the `BodyCalculator` and `SleeveCalculator` must coordinate to ensure the diagonal raglan lines match in length and stitch count.
    4.  **Output Data Structure:**
        * The engine should produce a new structured JSON object, let's call it `calculatedPatternDetails`. This object will contain:
            * Dimensions for each pattern piece in cm/inches and in stitches/rows.
            * Number of stitches to cast on/bind off.
            * Details of all shaping (e.g., "decrease 1 stitch at each end every 4 rows, 5 times").
            * Stitch counts at critical points.
            * Yarn estimations (this was US_2.4 in `ALL_US.pdf` - integrate its logic here based on `patternState.yarn` and calculated dimensions).
        * Example snippet of `calculatedPatternDetails`:
            ```json
            {
              "patternInfo": { /* copy of key patternState metadata */ },
              "pieces": {
                "frontBody": {
                  "castOnStitches": 120,
                  "lengthInRows": 200,
                  "shaping": [
                    { "type": "waistDecrease", "instruction": "Dec 1 st each end every 6th row, 5 times." , "startRow": 30, "endRow": 60},
                    { "type": "armhole", "instruction": "Bind off 5 sts at beg of next 2 rows, then dec 1 st each end every RS row 3 times.", "startRow": 150}
                  ],
                  // ... more details
                },
                "backBody": { /* ...similar structure... */ },
                "leftSleeve": { /* ... */ }
              },
              "yarnEstimation": { /* ... */ }
            }
            ```
    5.  **Technology:** Likely backend (Python, Node.js, Java, etc.) as calculations can be complex. Can be a set of pure functions or classes.
    6.  **Extensive Unit Testing:** Each calculation module and algorithm must be rigorously unit-tested with various inputs and edge cases.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a valid `patternState` for a "Sweater" with specified gauge, measurements, ease, set-in sleeves, and round neck.
    2.  When the calculation engine processes this `patternState`.
    3.  Then the output `calculatedPatternDetails` JSON is generated.
    4.  Verify key calculated values:
        * Cast-on stitches for body and sleeves are correct based on finished circumference and gauge.
        * Row counts for length are correct.
        * Armhole shaping (bind-offs, decreases) results in a sensible stitch count for sleeve attachment.
        * Neckline shaping results in expected stitch counts.
        * Sleeve cap shaping is compatible with the armhole.
    5.  Test with different garment types (Scarf, Hat) to ensure calculations are appropriate and sections are omitted if irrelevant.
    6.  Test edge cases (e.g., very small/large sizes, unusual gauges) for robustness.

