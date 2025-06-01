**User Story 9.3**

1.  **Title:** Develop Basic Schematic Generation for Key Garment Parts
2.  **Goal:** As a user viewing my generated pattern, I want to see simple schematic diagrams for the main garment pieces (e.g., front, back, sleeves) showing their basic shape and key finished dimensions, so I can better visualize the construction and proportions.
3.  **Description:** This addresses PDF section 5.3 ("Diagrammes et Schémas") by providing basic visual aids. These are not detailed, graded technical drawings but simple outlines with critical measurements.
4.  **Functional Requirements:**
    * FR1: For each major flat-knitted/crocheted piece of a garment (e.g., sweater front, back, sleeve), generate a simple 2D schematic diagram.
    * FR2: The schematic should visually represent the basic shape of the piece (e.g., rectangle for a drop-shoulder body, tapered rectangle for a sleeve).
    * FR3: Key finished dimensions (calculated by the engine, e.g., width at cast-on, width at top, overall length, sleeve length, cuff width, upper arm width) should be clearly labeled on the schematic.
    * FR4: These schematics should be displayable within the Pattern Viewer UI (US 9.1) alongside the textual instructions for that component.
    * FR5: (Optional) These schematics should be includable in the PDF output (US 9.2).
    * FR6: The generation should be dynamic based on the calculated dimensions of the piece.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input: The calculated dimensions for each garment component from the `CorePatternCalculationEngine` response.
    * **API Endpoints (Conceptual):**
        * Schematics could be generated on the server and sent as part of the main pattern data (e.g., as SVG strings or image URLs if pre-rendered).
        * `GET /api/pattern_components/{component_id}/schematic` (returns SVG/image data).
        * Or, schematics could be rendered client-side using a JavaScript library.
    * **Logic/Processing:**
        * **SVG Generation (Recommended for scalability and clarity):**
            * A service (backend or frontend) that takes component dimensions and generates an SVG string.
            * Define basic SVG templates for common shapes (rectangle, trapezoid for simple tapering).
            * Dynamically set coordinates, line lengths, and text labels for dimensions based on input.
        * **Canvas Rendering (Client-side):**
            * JavaScript logic to draw shapes and text onto an HTML5 canvas element.
        * For very simple shapes, even HTML/CSS with borders and carefully set dimensions could create a visual block.
    * **UI Considerations (High-Level):**
        * Display the schematic near the start of each component's instructions in `PatternViewer.vue`.
        * Ensure labels are clear and don't overlap poorly.
    * **Integration Points:**
        * Uses calculated dimension data from the `CorePatternCalculationEngine`.
        * Integrated into the `PatternViewer.vue` (US 9.1).
        * Can be included in PDF export (US 9.2).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: For a rectangular back panel ($50 \text{ cm}$ wide, $60 \text{ cm}$ long), a simple rectangular schematic is displayed with these dimensions labeled.
    * AC2: For a tapered sleeve (e.g., $20 \text{ cm}$ cuff width, $30 \text{ cm}$ upper arm width, $45 \text{ cm}$ length), a trapezoidal schematic is displayed with these key dimensions labeled.
    * AC3: Schematics are reasonably proportional to the dimensions they represent.
    * AC4: Labels are legible.
    * AC5: Schematics are present for all major garment pieces.
7.  **Assumptions/Pre-conditions:**
    * The calculation engine provides accurate finished dimensions for all key points of each component.
    * A method for generating or drawing simple 2D shapes with labels (SVG, Canvas, or server-side image generation) is chosen.
8.  **Impacted System Components (Illustrative):**
    * New Service: `SchematicGeneratorService.java` (if backend SVG/image generation) or new frontend component `SchematicDisplay.vue` (if client-side SVG/Canvas rendering).
    * Modified UI: `PatternViewer.vue` and `PatternSection.vue` to display schematics.
    * Potentially modified PDF export logic (US 9.2) to embed these.
