**User Story 9.2**

1.  **Title:** Implement PDF Output for Generated Patterns
2.  **Goal:** As a user, once my pattern is generated and displayed, I want to be able to download it as a formatted PDF file so I can save it offline, print it, or use it on devices where web access is not ideal.
3.  **Description:** This story addresses a key requirement from PDF section 5.1 ("Format de Sortie du Patron") by providing a portable, printable version of the generated pattern.
4.  **Functional Requirements:**
    * FR1: In the Pattern Viewer UI (US 9.1), provide a "Download PDF" button.
    * FR2: Clicking the button should trigger the generation of a PDF document containing the full pattern content, mirroring the structure and information shown in the Pattern Viewer (materials, gauge, instructions for all components, assembly, etc.).
    * FR3: The PDF layout should be clean, readable, and optimized for printing (e.g., appropriate font sizes, margins, page breaks between major sections if possible).
    * FR4: The PDF should include a header or footer with the pattern title and page numbers.
    * FR5: (Optional) Include any schematic diagrams generated in US 9.3 within the PDF.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Input is the same structured pattern JSON used by the Pattern Viewer (US 9.1).
    * **API Endpoints (Conceptual):**
        * `POST /api/pattern_exports/pdf`
            * Request Body: The full pattern JSON data (or an ID to retrieve it if it's stored server-side after generation).
            * Response: A PDF file stream (`application/pdf`).
    * **Logic/Processing:**
        * Server-side PDF generation library (e.g., Apache PDFBox, iText for Java; pdfmake, Puppeteer for Node.js; ReportLab for Python).
        * Logic to take the structured pattern JSON and map its content to PDF elements (paragraphs, headings, lists, tables if used for abbreviations, page breaks).
        * Define a template or styling rules for the PDF output to ensure consistency and readability.
        * Puppeteer (headless Chrome) can be a good option if you want the PDF to closely mirror a well-styled HTML view of the pattern by "printing to PDF" a server-rendered HTML page.
    * **UI Considerations (High-Level):**
        * A clear "Download PDF" button in the `PatternViewer.vue`.
        * Feedback to the user while the PDF is being generated if it takes time.
    * **Integration Points:**
        * Leverages the assembled pattern data from US 9.1.
        * May integrate with US 9.3 if schematics are to be included.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can click "Download PDF" and receives a valid PDF file.
    * AC2: The PDF content accurately reflects the pattern displayed in the UI, including all sections and instructions.
    * AC3: The PDF is well-formatted, readable, and includes page numbers.
    * AC4: The PDF can be opened and printed correctly using standard PDF viewers.
7.  **Assumptions/Pre-conditions:**
    * US 9.1 is implemented and provides the complete pattern data.
    * A suitable server-side PDF generation library is chosen and configured for the project's backend stack.
8.  **Impacted System Components (Illustrative):**
    * Modified UI: `PatternViewer.vue` (adds download button).
    * New Backend service: `PdfExportService.java` (or similar, using a PDF library).
    * New API endpoint: `POST /api/pattern_exports/pdf`.

