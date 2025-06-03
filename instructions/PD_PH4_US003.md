**User Story PD_PH4_US003: Implement Interdependency: Sleeve Type Affecting Body Shape (Conceptual)**

* **Sequence Number:** PD_PH4_US003
* **Title:** Implement Interdependency: Sleeve Type Affecting Body Armhole Shape (Conceptual Link)
* **Description:** As a developer, I need to establish a conceptual link in the data model and trigger system indicating that a change in "Sleeve Type" *can* necessitate recalculations or adjustments in the "Body Structure" (specifically armhole shaping) for pattern generation, even if the schematic doesn't show full detail yet.
* **Functional Requirements (What & How - User Perspective):**
    * Mostly non-functional from a direct UI perspective for this US, but sets the stage.
    * The user might see a notification: "Changing sleeve type may require adjustments to armhole depth/shape. These will be calculated in the final pattern." (Optional for this US).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Event System / Watchers:**
        * When `patternState.sleeves.type` changes, the system should recognize this event.
    2.  **Dependency Graph (Conceptual):**
        * Internally, the application should understand that `sleeves.type` is a dependency for `bodyStructure.armholeCalculations`.
    3.  **Flagging for Recalculation:**
        * When `sleeves.type` changes, set a flag or trigger an event indicating that parts of the `bodyStructure` (related to armholes) might be "stale" and need re-evaluation when the full pattern calculation is eventually run.
        * Example: `patternState.bodyStructure.armholeRequiresRecalculation = true;`
    4.  **No Automatic Changes (Yet):** This US does not require the system to *automatically change* body measurements or detailed shape parameters in the UI. It's about recognizing the dependency for later calculation stages. The detailed calculation logic will be part of the pattern generation engine (US_12.x in `ALL_US.pdf`, which may need updating).
    5.  **Schema Update:** The 2D schematic *might* subtly change the armhole curve representation based on sleeve type, but detailed geometric changes are out of scope for this specific schematic-focused US. The focus is on the underlying data dependency.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user changes the sleeve type from "Set-in" to "Raglan".
    2.  Verify through logging (PD_PH3_US003) or internal state inspection that an event is fired or a flag is set indicating that body/armhole calculations are potentially affected.
    3.  (Optional) If a user notification is implemented, verify it appears.
    4.  The final pattern generation logic (outside this specific US but within the larger project) would eventually consume this information to adjust armhole shaping.

---

