**User Story PD_PH6_US004: Display Generated Pattern Instructions and Schematics to User**

* **Sequence Number:** PD_PH6_US004
* **Title:** Display Generated Pattern Instructions and Associated Schematics/Visuals to User
* **Description:** As a user, after the pattern calculations are complete and instructions generated, I want to view them in a clear, readable format on the web application, potentially alongside any relevant 2D schematics or diagrams.
* **Functional Requirements (What & How - User Perspective):**
    1.  A dedicated view/page displays the full generated pattern.
    2.  Textual instructions (from PD_PH6_US003) are well-formatted and easy to read.
    3.  If 2D flat pattern schematics (detailed piece diagrams, not just the preview schematic from Phase 2) are generated, they should be displayed alongside or linked from the relevant instruction sections. (Note: generating detailed 2D flat patterns is a significant feature in itself, may require a separate US or be considered optional for a first version of this phase).
    4.  Ability to navigate between sections (e.g., Front, Back, Sleeves).
    5.  Option to print or download the pattern (e.g., as PDF â€“ this could be a separate US but is often coupled).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Frontend View Component:**
        * Create a `PatternDisplay` component in the frontend application.
        * This component takes the `calculatedPatternDetails` and the generated textual instructions as input (or fetches them via API if calculation is asynchronous).
    2.  **Rendering Instructions:**
        * Render the Markdown/HTML instructions.
        * Provide clear typographical hierarchy (headings for pieces, bolding for key actions).
    3.  **Integrating 2D Schematics (if available):**
        * If the calculation engine also produces data for detailed 2D flat pattern diagrams (e.g., SVG data, or parameters for a Canvas drawing component), this component would render them. This might reuse or extend the `SchematicPreview2D` component from Phase 2 but with more detail.
    4.  **Navigation:** Implement tabs or an internal table of contents for easy navigation.
    5.  **"Print to PDF" Functionality:**
        * Can be achieved using browser's print functionality with a print-specific stylesheet.
        * Or, use a library (e.g., `jsPDF`, `pdfmake` on client-side, or a server-side PDF generation library) to create a more polished PDF. This is a common follow-up and can be its own US if complex.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given generated pattern instructions and `calculatedPatternDetails`.
    2.  When the user navigates to the pattern display page.
    3.  Then all textual instructions are displayed correctly and legibly.
    4.  Each section (Front, Back, Sleeve) is clearly delineated.
    5.  (If 2D detailed schematics are implemented) Verify they are displayed correctly for each piece.
    6.  (If Print/PDF is implemented in this US) Verify the pattern can be printed or downloaded as a PDF and the output is well-formatted.

---
