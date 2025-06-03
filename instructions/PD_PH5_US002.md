**User Story PD_PH5_US002: Interactive 3D Model with Part Selection and Visibility Control**

* **Sequence Number:** PD_PH5_US002
* **Title:** Enable Selection of Garment Parts in 3D Preview and Control Their Visibility
* **Description:** As a user, I want to be able to click on a specific part of the 3D garment preview (e.g., a sleeve, the neckline) to quickly navigate to its corresponding definition section in the UI. I also want to be able to show or hide different parts of the 3D model (e.g., hide the body to see sleeve construction better, or show only the front).
* **Functional Requirements (What & How - User Perspective):**
    1.  **Part Selection (3D to UI):**
        * When the user clicks on a distinguishable part of the 3D model (e.g., the right sleeve, the collar).
        * The UI should either:
            * Automatically navigate to the relevant section for defining that part (e.g., clicking sleeve navigates to "Sleeves" section).
            * Highlight the relevant input fields or section in the main pattern definition UI.
    2.  **Part Visibility Control:**
        * A UI panel (e.g., a checklist or set of toggle buttons) lists major garment components visible in the 3D preview (e.g., "Front Body," "Back Body," "Left Sleeve," "Right Sleeve," "Collar").
        * The user can toggle the visibility of each listed component in the 3D preview.
        * Example: Uncheck "Body" to see only the sleeves, or uncheck "Left Sleeve" to focus on the right.
    3.  The 2D schematic does not need this interactivity for now, focus is on the 3D model.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **3D Object Identification & Raycasting:**
        * Ensure each distinct garment part mesh created in PD_PH5_US001 has a unique identifier or name linked to a pattern definition section (e.g., `leftSleeveMesh.userData = { sectionKey: "sleeves", partIdentifier: "leftSleeve" }`).
        * Implement raycasting in the 3D library: when the user clicks, determine which 3D object (mesh) was intersected.
    2.  **Linking 3D Selection to UI Navigation:**
        * On successful raycast intersection, retrieve the `sectionKey` from the clicked mesh's `userData`.
        * Update the application state to navigate to that section (e.g., set `patternState.uiSettings.currentSection = sectionKey`).
    3.  **Visibility Control Panel:**
        * Create a UI component (`ModelVisibilityPanel`) that lists toggle controls. The list of parts should be dynamically generated based on the `currentGarmentType` and its constructible parts.
        * Each toggle updates a visibility flag (e.g., `patternState.uiSettings.visibility.leftSleeve = false`).
    4.  **Updating 3D Scene Visibility:**
        * The 3D preview component subscribes to these visibility flags.
        * When a flag changes, set the `visible` property of the corresponding 3D mesh in the scene (e.g., `scene.getObjectByName('leftSleeveMesh').visible = false`).
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a 3D preview of a sweater is shown.
    2.  When the user clicks on the 3D representation of a sleeve, then the UI navigates to or highlights the "Sleeves" definition section.
    3.  Given a visibility control panel is available listing "Body" and "Sleeves".
    4.  When the user toggles off "Sleeves" visibility, then the sleeves disappear from the 3D preview, but the body remains.
    5.  When the user toggles "Sleeves" back on, they reappear.
    6.  Verify this works for different identifiable parts of various garment types.
    
---

