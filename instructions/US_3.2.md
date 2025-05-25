**User Story 3.2**

1.  **Title:** Implement "Ease Selection Advisor" Tool
2.  **Goal:** As a user, especially if I'm unsure about how much ease to choose, I want a tool that advises me on appropriate ease amounts based on the type of garment I'm planning, desired fit (e.g., close-fitting, classic, oversized), and optionally yarn characteristics, so I can achieve the intended style and comfort.
3.  **Description:** This tool guides users in selecting ease (US 1.3), which can be a confusing concept. It provides recommendations rather than strict rules. This directly relates to PDF Section 1.3 ("Aisance") by making ease selection more user-friendly and context-aware.
4.  **Functional Requirements:**
    * FR1: User can select a general garment category (e.g., Sweater, Cardigan, Hat, Socks, Shawl).
    * FR2: User can select a desired fit (e.g., "Very Close-fitting/Negative Ease", "Close-fitting/Zero Ease", "Classic/Slightly Positive Ease", "Relaxed Fit", "Oversized").
    * FR3: (Optional) User can indicate yarn weight category (e.g., Fingering, Worsted, Bulky), as heavier yarns might drape differently or require different ease for the same perceived fit.
    * FR4: Based on these inputs, the tool suggests a range of ease values (e.g., "+2 to +5 cm for bust ease for a classic fit sweater in DK weight").
    * FR5: The suggestions should cover key ease points relevant to the garment type (e.g., bust/chest ease for sweaters, head circumference ease for hats).
    * FR6: The tool should allow the user to accept the suggestion (which then populates the ease input fields from US 1.3) or ignore it.
    * FR7: Display brief explanations for why certain ease amounts are suggested for a given context.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * No new primary DB tables for user-generated data. This tool uses rules/heuristics.
        * This logic could be stored in a configuration file (e.g., JSON) or a dedicated backend service.
        * Example structure for `ease_advice_rules.json`:
            ```json
            [
              {
                "garment_category": "Sweater",
                "fit_preference": "Classic/Slightly Positive Ease",
                "yarn_weight_categories": ["Fingering", "Sport", "DK"],
                "advised_ease": {
                  "bust_cm": {"min": 5, "max": 10, "recommended": 7.5},
                  "sleeve_upper_arm_cm": {"min": 2, "max": 5, "recommended": 3}
                },
                "explanation": "Provides a comfortable, classic fit allowing for light layering."
              },
              {
                "garment_category": "Sweater",
                "fit_preference": "Oversized",
                // ...
              },
              {
                "garment_category": "Hat",
                "fit_preference": "Close-fitting/Negative Ease", // For snug hats
                "advised_ease": {
                  "head_circumference_cm": {"min": -5, "max": -2, "recommended": -3}
                },
                "explanation": "Ensures the hat stays on securely. Relies on stretch."
              }
              // ... more rules
            ]
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/tools/ease_advisor`
            * Payload: `{ "garment_category": "Sweater", "fit_preference": "Classic/Slightly Positive Ease", "yarn_weight_category": "DK" }`
            * Response: `{ "advised_ease": { "bust_cm": {...} }, "explanation": "..." }`
    * **Logic/Processing:**
        * Backend service takes inputs, matches them against the rules in the configuration.
        * If multiple rules match (e.g., yarn weight is optional), select the most specific or average the suggestions.
        * Logic to convert suggested ease to the user's preferred unit (cm/inches) if needed.
    * **UI Considerations (High-Level):**
        * A modal or a dedicated section for the tool.
        * Dropdowns for garment category, fit preference, and (optional) yarn weight.
        * Clear display of suggested ease ranges and explanations.
        * "Apply Suggestion" button to populate the main ease fields (from US 1.3).
    * **Integration Points:**
        * Uses the `ease_preferences` data model/input component (US 1.3).
        * Can use `yarn_profiles` (US 1.4) to get yarn weight category if user has selected a yarn.
        * Input for garment category will later link to garment definitions (Phase 4).
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: Given "Sweater", "Classic Fit", and "DK" yarn, the tool suggests a reasonable ease range for bust (e.g., +5 to +10 cm) and provides an explanation.
    * AC2: Given "Hat", "Close-fitting", the tool suggests a reasonable negative ease range for head circumference.
    * AC3: If the user clicks "Apply Suggestion", the suggested ease values are populated into the main ease input fields.
    * AC4: The explanations provided are clear and helpful.
    * AC5: If no specific rule matches, a general guidance or default is provided, or a message indicating so.
7.  **Assumptions/Pre-conditions:**
    * US 1.3 (Ease Preference Input) is implemented.
    * A set of well-defined rules and recommendations for ease (the `ease_advice_rules.json` or similar) has been researched and created. This requires domain knowledge.
    * Basic garment categories are defined.
8.  **Impacted System Components (Illustrative):**
    * New UI: `EaseAdvisorTool.vue`.
    * New Backend: `EaseAdvisorService.java` (or similar), `ease_advice_rules.json` (or DB table for rules if more complex management is needed).
    * Interacts with UI and data of `EaseInput.vue` (US 1.3).

