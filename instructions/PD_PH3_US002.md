**User Story PD_PH3_US002: Implement Restore Point Functionality**

* **Sequence Number:** PD_PH3_US002
* **Title:** Implement Restore Points for Pattern Definition
* **Description:** As a user, at any point during my pattern design, I want to be able to save the current state as a "Restore Point" with a name, and later revert the entire design back to that specific Restore Point.
* **Functional Requirements (What & How - User Perspective):**
    1.  A UI element allows the user to "Create Restore Point."
    2.  When creating, the user can optionally give the restore point a name (e.g., "After basic shaping," "Trying V-Neck"). If no name is given, a default name (e.g., "Restore Point 1," timestamp) is used.
    3.  A list of saved restore points is accessible.
    4.  The user can select a restore point from the list and click a "Revert to this point" button.
    5.  Reverting replaces the current `patternState` with the state saved in the selected restore point. This action should be undoable itself (i.e., reverting to a restore point is an action that can be undone).
    6.  Restore points are for the current design session; persistence across browser sessions is not required for this US (can be a future enhancement).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Restore Point Storage:**
        * Maintain an array or list within the application's state (e.g., `patternState.restorePoints`) to store copies of `patternState` at different moments.
            ```javascript
            // In patternState
            restorePoints: [
              // { name: "Initial", timestamp: "...", state: { ...full patternState snapshot... } },
              // { name: "V-Neck idea", timestamp: "...", state: { ... } }
            ],
            ```
    2.  **Creating Restore Points:**
        * When the user triggers "Create Restore Point," make a deep copy of the current `patternState` (excluding the `restorePoints` array itself to avoid recursion, and potentially the undo/redo history if it's too large or complex to restore meaningfully).
        * Add this copy along with a name and timestamp to the `restorePoints` array.
    3.  **Reverting:**
        * When the user chooses to revert, replace the current `patternState` with the selected snapshot from `restorePoints`. This action itself should be pushed onto the undo stack.
    4.  **UI:** Develop components to display the list of restore points and buttons for creation/reversion.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user has made several changes to a pattern.
    2.  When the user creates a restore point named "RP1".
    3.  Then "RP1" appears in the list of restore points.
    4.  Given the user makes further significant changes.
    5.  When the user reverts to "RP1," then the pattern state (and visual preview) returns to how it was when "RP1" was created.
    6.  Verify that reverting to a restore point can be undone using the Undo button.

