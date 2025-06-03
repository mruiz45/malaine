### Phase 5: Advanced Visuals (Basic 3D Preview) & Finalizing Core Loop

**Goal:** Introduce a basic, interactive 3D preview that reflects key choices, improving the "visuability" aspect significantly, and ensure the core definition loop is robust before moving to detailed pattern piece generation. This phase builds on/replaces the intent of US_7.x (AC4) from `ALL_US.pdf` regarding 3D previews.

**User Story PD_PH5_US001: Implement Basic Real-Time 3D Preview of Garment Form**

* **Sequence Number:** PD_PH5_US001
* **Title:** Implement Real-Time 3D Preview of Garment Form with Component Structure and Basic Interactivity
* **Description:** As a user, I want to see a simple, real-time 3D preview of my garment's approximate shape that updates as I make key design choices. I also want basic interaction like zoom/pan/rotate. The 3D model should be built from distinct components to support further interactions.
* **Functional Requirements (What & How - User Perspective):**
    1.  A dedicated area in the UI shows a 3D preview.
    2.  When a garment type is selected, a basic 3D representation for that garment appears (e.g., using primitives like cylinders, boxes).
    3.  This 3D preview updates in real-time (or near real-time) when:
        * Key dimensions (overall length, width/circumference, sleeve length from `patternState.measurements` and `patternState.ease`) are changed.
        * Neckline type is selected (`patternState.neckline.type`), showing a cut-out or modified shape on the body primitive.
        * Sleeve type is selected (`patternState.sleeves.type`), changing the angle/attachment/shape of sleeve primitives.
    4.  **The user can rotate, pan, and zoom the 3D preview using mouse or touch gestures.** (This explicitly covers the zoom/rotate requirement).
    5.  A clear message indicates this is an *approximate preview* for form visualization.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **3D Library:** Choose and integrate a WebGL-based 3D graphics library (e.g., Three.js, Babylon.js).
    2.  **Component-Based Generation:**
        * The 3D model must be constructed from distinct, named 3D objects (meshes) representing different garment parts (e.g., `frontBodyMesh`, `backBodyMesh`, `leftSleeveMesh`, `necklineDetailMesh`). This is crucial for PD_PH5_US002.
        * Functions like `createBodyMeshes(garmentType, finishedDimensions, bodyStructureParams)` will generate these.
        * `createSleeveMeshes(sleeveType, finishedSleeveDimensions, armholeDataFromBod)`
        * `modifyBodyForNeckline(bodyMeshes, necklineParams)`
    3.  **Scene Management:** Set up 3D scene, camera, lighting. Add/remove/update garment part meshes.
    4.  **Interactivity:** Implement camera controls (e.g., OrbitControls for Three.js).
    5.  **Performance:** Optimize for smooth updates. Debounce if needed.
    6.  **State Subscription:** The 3D preview component subscribes to relevant parts of `patternState`.
    7.  **"CaractÃ©ristiques diffÃ©rentes" (Surface Detail - Initial Thought):** While full texture/stitch pattern rendering in 3D is complex, initial "characteristics" can be represented by:
        * **Different colors per part:** Assign default distinct colors to main components (body, sleeves, cuffs, neckline ribbing) if these are defined as separate structural elements in `patternState`. This provides basic visual differentiation.
        * Actual 3D stitch textures are a significant extension, possibly for a later phase (e.g., Phase 7+). For now, focus on shape and component differentiation.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given a user selects "Sweater" as garment type. Then, basic 3D primitives representing the torso and (if applicable by default) sleeves appear. Each part (e.g., body, each sleeve) should be a distinct 3D object in the scene.
    2.  When dimensions, neckline, or sleeve type are changed in `patternState`, the corresponding 3D primitives update their size, shape, or position.
    3.  The user can freely rotate, pan, and zoom the 3D model.
    4.  A disclaimer about the approximate nature of the preview is visible.
    5.  (Basic Characteristic) Verify that if sleeves are defined as a distinct component with, for instance, a different yarn type or basic structural property than the body (even if not fully rendered), they can be assigned a different default color or material appearance in the 3D preview for differentiation.


---
