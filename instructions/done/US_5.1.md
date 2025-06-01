

**Phase 5: Advanced Helper Tools & Initial Pattern Outline Generation**

This phase adds sophisticated tools to further aid the user in the creative and fitting aspects of pattern definition. It also introduces the first step towards visualizing the complete pattern by generating a structured outline or summary of the defined garment.

**User Story 5.1**

1.  **Title:** Implement "Color Scheme Simulator" Tool for Yarn Choices
2.  **Goal:** As a user selecting yarns for my project, I want to use a Color Scheme Simulator to visualize how different yarn colors (from my selected yarn profiles or a general color palette) would look together in basic stripe patterns or color blocks, so I can make more confident color choices for my garment.
3.  **Description:** This tool allows users to experiment with color combinations for their selected yarns or general colors. It provides a simple visual preview, helping with the aesthetic definition of the pattern. This directly corresponds to "Simulateur de Rendu des Couleurs" (PDF section 6.3.1).
4.  **Functional Requirements:**
    * FR1: User can select 2 to 5 yarn profiles (from US 1.4, which include a `color_hex_code`) or pick colors from a general color palette.
    * FR2: The tool should offer a few basic preview templates:
        * Simple Stripes (e.g., 2-color alternating stripes, multi-color sequence).
        * Color Blocks (e.g., 2-3 blocks of color juxtaposed).
        * (Optional) A very schematic representation of a garment shape (e.g., a simple sweater outline) with areas fillable by the selected colors.
    * FR3: User can assign selected colors to different sections of the preview template.
    * FR4: The preview should update in real-time or near real-time as colors are assigned.
    * FR5: User should be able to save a favored color scheme, perhaps by associating it with the current `pattern_definition_session` or their yarn choices.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Uses `yarn_profiles` (US 1.4) which should have a `color_hex_code` field.
        * A `pattern_definition_sessions` (US 1.6) could store an array of selected `yarn_profile_ids` and perhaps a JSONB field for the saved color scheme details (e.g., `{"scheme_type": "stripes", "colors": ["#FF0000", "#00FF00"]}`).
    * **API Endpoints (Conceptual):**
        * No new specific backend API for the simulation itself if done client-side.
        * `PUT /api/pattern_definition_sessions/{session_id}` to save the selected color scheme.
    * **Logic/Processing:**
        * Client-side JavaScript/Canvas/SVG for rendering the color previews.
        * Logic to map selected yarn colors to template sections.
    * **UI Considerations (High-Level):**
        * A dedicated modal or section for the tool.
        * Interface to select yarn profiles or colors from a palette.
        * Preview area displaying the chosen template (stripes, blocks, simple garment outline).
        * Controls to assign colors to template elements.
        * "Save Scheme" button.
    * **Integration Points:**
        * Uses `yarn_profiles` data, specifically the `color_hex_code` (US 1.4).
        * Can be part of the "Pattern Definition Session" (US 1.6), allowing users to plan colors alongside other parameters.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select at least two yarn profiles with defined HEX colors.
    * AC2: User can choose a "stripes" template and see the selected colors rendered as alternating stripes.
    * AC3: User can change a color assignment, and the preview updates correctly.
    * AC4: User can save a color scheme, and this information is associated with their current pattern definition session (if applicable).
    * AC5: If a yarn profile lacks a `color_hex_code`, it's handled gracefully (e.g., not selectable for this tool or shows a default placeholder).
7.  **Assumptions/Pre-conditions:**
    * US 1.4 (Yarn and Material Details) is implemented, and yarn profiles can store a HEX color code.
    * Client-side rendering capabilities (SVG or Canvas) are available in the chosen frontend framework.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `ColorSchemeSimulator.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue` (to launch the simulator).
    * Modified Backend: `PatternDefinitionSessionService` might be updated to store selected scheme.

