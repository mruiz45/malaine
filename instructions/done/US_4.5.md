**User Story 4.5**

1.  **Title:** Implement "Sleeve Style and Length Selector" Tool
2.  **Goal:** As a user defining a garment with sleeves (e.g., a sweater), I want to choose a sleeve style (which might be constrained by construction method) and length (e.g., Short, Three-Quarter, Long, Custom) so I can customize the sleeves of my garment.
3.  **Description:** This tool allows users to define sleeve characteristics. The available sleeve styles (e.g., Straight, Tapered, Bell, Puff) can be heavily influenced by the construction method chosen in US 4.3. Length is a more general parameter. This relates to PDF section 3.1.3 ("Manches") and 3.1.4 ("Longueurs").
4.  **Functional Requirements:**
    * FR1: This tool is displayed if the selected garment type (US 4.2) and construction method (US 4.3) include sleeves.
    * FR2: Based on the chosen construction method (e.g., Drop Shoulder, Set-in Sleeve, Raglan), display compatible sleeve style options (e.g., "Straight/Untapered," "Slightly Tapered," "Fitted," "Bell Sleeve" - some styles may only work with certain constructions).
    * FR3: User can select a sleeve length category (e.g., "Cap Sleeve," "Short Sleeve," "Elbow Length," "Three-Quarter Length," "Long Sleeve") or opt for a custom length input (in cm/inches).
    * FR4: User can define cuff style if applicable (e.g., "No Cuff," "Ribbed Cuff," "Folded Cuff"). PDF 3.1.5 ("Finitions").
    * FR5: Each option should ideally have a simple illustrative icon/diagram.
    * FR6: The selected sleeve style, length, and cuff style are saved as attributes of the 'Sleeve' component(s) within the `pattern_definition_session`.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * Sleeve styles, lengths, and cuff options defined in `garment_component_templates` for 'Sleeve' components, potentially filtered by `construction_method` selected on the body component.
        * Example `configurable_attributes` for a "sleeve" component template:
            ```json
            {
              "styles_by_construction": {
                "drop_shoulder": [
                  {"key": "straight", "name": "Straight"},
                  {"key": "tapered", "name": "Tapered"}
                ],
                "set_in_sleeve": [
                  {"key": "straight", "name": "Straight"},
                  {"key": "tapered", "name": "Tapered"},
                  {"key": "puff_cap", "name": "Puff Cap"}
                ]
              },
              "lengths": [
                {"key": "short", "name": "Short Sleeve"},
                // ...
                {"key": "custom", "name": "Custom Length (input required)"}
              ],
              "cuff_styles": [
                {"key": "none", "name": "No Cuff"},
                {"key": "ribbed_1x1", "name": "1x1 Ribbed Cuff", "params": ["cuff_depth_cm"]},
                // ...
              ]
            }
            ```
        * User's choices stored in `selected_attributes` of the 'Sleeve' `pattern_definition_components` entry.
            * Example: `{"style": "tapered", "length_key": "long_sleeve", "cuff_style": "ribbed_1x1", "cuff_depth_cm": 5}`.
    * **API Endpoints (Conceptual):**
        * Options fetched via existing `component_template` GET endpoints, potentially with query parameters indicating context (like construction method).
        * Choices saved via `PUT /api/pattern_definition_sessions/{session_id}`.
    * **Logic/Processing:**
        * Frontend dynamically filters sleeve style options based on selected construction method.
        * Conditional input for custom length or cuff parameters.
    * **UI Considerations (High-Level):**
        * Visual selectors for style, length, cuff.
        * Conditional display of options and parameter inputs.
    * **Integration Points:**
        * Depends on US 4.1, 4.2, and especially 4.3.
        * Critical for sleeve shaping, length calculations, and cuff instructions.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: If a "Drop Shoulder Sweater" is being defined, the sleeve style selector offers compatible options (e.g., "Straight," "Tapered").
    * AC2: User can select "Tapered" style, "Long Sleeve" length, and "1x1 Ribbed Cuff" with a $5 \text{ cm}$ depth.
    * AC3: These selections are correctly saved to the sleeve component's attributes in the `pattern_definition_session`.
    * AC4: Illustrative icons/diagrams are present for options.
    * AC5: If an incompatible garment type (e.g., "Scarf") or construction (e.g., "Sleeveless Vest" if that's an option) is chosen, the sleeve selector is not available or appropriately modified.
7.  **Assumptions/Pre-conditions:**
    * US 4.1, 4.2, 4.3 implemented.
    * Predefined sleeve styles, lengths, cuff options, and their compatibilities/icons are available.
8.  **Impacted System Components (Illustrative):**
    * New UI component: `SleeveSelector.vue`.
    * Modified UI: `PatternDefinitionWorkspace.vue`.
    * Backend logic within `PatternDefinitionSessionService` and component templates.

