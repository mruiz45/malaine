**User Story 1.4**

1.  **Title:** Implement Yarn and Material (Laine et Matériel) Details Input and Management
2.  **Goal:** As a user, I want to record details about the yarn I plan to use (e.g., fiber, weight category, yardage per skein, color) so that the system can help estimate quantity needed and so I can keep track of materials for my projects.
3.  **Description:** This story allows users to define the yarn they are using. This information is crucial for yarn quantity estimation and can also be used by tools like the color simulator. This corresponds to PDF section 1.4.
4.  **Functional Requirements:**
    * FR1: User can input yarn name/brand.
    * FR2: User can select fiber content (e.g., wool, cotton, acrylic, blend - allow multiple selections or text input).
    * FR3: User can select yarn weight category (e.g., Lace, Fingering, DK, Worsted, Bulky).
    * FR4: User can input yardage/meterage per skein/ball and weight per skein/ball (e.g., 100g / 200m).
    * FR5: User can input color information (name, dye lot if necessary).
    * FR6: User can save yarn profiles for re-use.
    * FR7: (Optional) Link to where the yarn was purchased or its Ravelry ID.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * `yarn_profiles` table:
            ```sql
            CREATE TABLE IF NOT EXISTS yarn_profiles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id), -- Or can be a global library supplemented by user additions
                yarn_name VARCHAR(255),
                brand_name VARCHAR(255),
                fiber_content TEXT, -- Could be JSONB for multiple fibers e.g. [{"fiber": "wool", "percentage": 80}, {"fiber": "nylon", "percentage": 20}]
                yarn_weight_category VARCHAR(50), -- e.g., 'Worsted', 'DK'. Standard categories.
                skein_yardage DECIMAL(10,2),
                skein_meterage DECIMAL(10,2), -- Store one, calculate other or store both
                skein_weight_grams DECIMAL(10,2),
                color_name VARCHAR(100),
                color_hex_code VARCHAR(7), -- For color simulator
                dye_lot VARCHAR(50),
                notes TEXT,
                -- image_url TEXT, -- For yarn picture
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            ```
    * **API Endpoints (Conceptual):**
        * `POST /api/yarn_profiles`
        * `GET /api/yarn_profiles` (with filtering/searching)
        * `GET /api/yarn_profiles/{profile_id}`
        * `PUT /api/yarn_profiles/{profile_id}`
        * `DELETE /api/yarn_profiles/{profile_id}`
    * **Logic/Processing:**
        * Standardized list for yarn weight categories (e.g., Craft Yarn Council standards).
        * Possible integration with external yarn databases (e.g., Ravelry API) in a future enhancement.
    * **UI Considerations (High-Level):**
        * Form for yarn details. Dropdowns for standardized fields like weight category.
        * Ability to search/browse saved yarn profiles.
        * Color picker for `color_hex_code`.
    * **Integration Points:**
        * `gauge_profiles` (gauge is often tied to a specific yarn).
        * Yarn Quantity Estimator Tool.
        * Color Rendering Simulator Tool.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can successfully input all specified yarn details and save a yarn profile.
    * AC2: Saved yarn profiles are correctly retrieved and displayed.
    * AC3: Dropdown for yarn weight category contains standard options.
    * AC4: Data is correctly stored in the `yarn_profiles` table.
7.  **Assumptions/Pre-conditions:**
    * Decision on whether yarn profiles are user-specific or part of a global, extensible library.
8.  **Impacted System Components (Illustrative):**
    * New: `YarnProfileController`, `YarnProfileService`, `YarnProfileRepository`, `yarn_profiles` DB table.
    * UI: `YarnInputForm.vue`, `YarnProfileList.vue`.

