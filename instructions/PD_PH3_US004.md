**User Story PD_PH3_US004: Adhere to i18n Requirements for New UI Elements**

* **Sequence Number:** PD_PH3_US004
* **Title:** Ensure New UI Elements in Pattern Definition Adhere to i18n Requirements
* **Description:** As a developer, all new user-facing text in the revamped pattern definition module must use English and be added to the existing i18n JSON files without refactoring existing translations.
* **Functional Requirements (What & How - User Perspective):**
    1.  All labels, buttons, tooltips, and messages in the new pattern definition UI are in English.
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Identify Text:** As new UI components for Phase 1, 2, and 3 are developed, identify all user-facing strings.
    2.  **Add to JSON:** Add new keys and their English translations to the primary English i18n JSON file(s). Example:
        ```json
        // In en.json (or equivalent)
        {
          // ... existing keys ...
          "patternDefinition.garmentTypeLabel": "Garment Type",
          "patternDefinition.selectGarmentTypePrompt": "Select the type of garment you want to create:",
          "patternDefinition.section.gauge": "Gauge",
          "patternDefinition.section.measurements": "Measurements",
          "patternDefinition.section.neckline": "Neckline",
          "patternDefinition.undoButton": "Undo",
          "patternDefinition.redoButton": "Redo",
          "patternDefinition.createRestorePointButton": "Create Restore Point",
          "patternDefinition.restorePointNamePrompt": "Enter name for Restore Point:",
          // ... etc.
        }
        ```
    3.  **No Refactoring:** Do not rename, move, or delete existing keys in the i18n files. Only append new ones.
    4.  **Usage:** Ensure all UI components use these i18n keys to render text, not hardcoded strings.
* **Acceptance Criteria (Testing & Validation):**
    1.  Review all new UI elements introduced in Phases 1, 2, and 3.
    2.  Verify that all visible text is in English.
    3.  Inspect the i18n JSON files and confirm that new keys corresponding to the new UI text have been added.
    4.  Confirm that no existing keys or translations (especially French, if present) have been modified or removed.

---

