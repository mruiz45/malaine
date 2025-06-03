**User Story PD_PH2_US004: Implement Standard Size Chart Selection in "Measurements" Section with Visual Feedback**

* **Sequence Number:** PD_PH2_US004
* **Title:** Implement Standard Size Chart Selection with Dynamic Filtering and Real-Time Visual Feedback
* **Description:** As a user, within the "Measurements" section, I want to be able to select from standard size charts (e.g., based on garment type, age category, sex, region/country) OR input my custom measurements. My selections should immediately populate the relevant measurement fields and update the 2D schematic preview.
* **Functional Requirements (What & How - User Perspective):**
    1.  In the "Measurements" section, the user can choose between "Custom Measurements" or "Standard Sizes."
    2.  If "Standard Sizes" is selected, the user is presented with filters to narrow down the size charts:
        * **Age Category:** (e.g., Baby, Child, Teen, Adult)
        * **Sex/Target Group:** (e.g., Women, Men, Unisex)
        * **Region/System:** (e.g., EU, US, UK, JP, or generic S/M/L/XL). This determines the available size names (e.g., 38, 40, M, L).
        * Filters should be dynamic; e.g., available age categories or sex might depend on the selected `garmentType`.
    3.  Once filters are applied, a list of relevant standard sizes (e.g., "Women - EU - Medium (38-40)") is displayed.
    4.  Selecting a standard size automatically populates the corresponding measurement fields in the `patternState.measurements` object (e.g., chest circumference, waist, hips, height, typical sleeve length for that size).
    5.  These newly populated measurements must immediately update the 2D schematic preview (PD_PH2_US002) and later the 3D preview.
    6.  The user can switch between different standard sizes, or back to "Custom Measurements" to override specific values.
    7.  If a standard size is chosen, the underlying specific measurements should still be visible (and perhaps editable, which would switch mode to "Custom" with standard as base).
* **Technical Implementation (What & How - Developer Perspective):**
    1.  **Data Model for Standard Sizes:**
        * Define a comprehensive database structure or JSON files for storing standard size charts.
        * `standard_size_charts` table:
            ```sql
            CREATE TABLE standard_size_charts (
                size_chart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                chart_name VARCHAR(255) NOT NULL UNIQUE, -- e.g., "EU Women General"
                region VARCHAR(50), -- "EU", "US", "UK", "JP", "INTL"
                age_category VARCHAR(50), -- "Adult", "Child", "Baby"
                target_group VARCHAR(50) -- "Women", "Men", "Unisex"
            );

            CREATE TABLE standard_sizes (
                standard_size_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                size_chart_id UUID REFERENCES standard_size_charts(size_chart_id),
                size_name VARCHAR(50) NOT NULL, -- "S", "M", "38", "10"
                sort_order INT, -- For displaying sizes in correct order
                -- Core measurements, add more as needed per original spec (Conception doc)
                chest_circumference_cm NUMERIC,
                waist_circumference_cm NUMERIC,
                hip_circumference_cm NUMERIC,
                height_cm NUMERIC,
                typical_sleeve_length_cm NUMERIC,
                -- ... other relevant standard measurements for this size
                UNIQUE (size_chart_id, size_name)
            );
            ```
    2.  **Backend API:**
        * Endpoint to fetch available filter options for standard sizes (e.g., `/api/sizes/filters?garmentType=sweater`).
        * Endpoint to fetch specific standard sizes based on selected filters (e.g., `/api/sizes?chartName=EU%20Women%20General` or `?region=EU&age=Adult&group=Women`).
        * Endpoint to fetch the detailed measurements for a selected `standard_size_id`.
    3.  **Frontend "Measurements" Component:**
        * UI elements for selecting mode (Custom/Standard) and filters.
        * Logic to call APIs and populate filter dropdowns.
        * When a standard size is selected, fetch its measurements and update `patternState.measurements`.
        * Ensure that `patternState.measurements` reflects the change, triggering updates in `SchematicPreview2D` (and later 3D preview).
    4.  **Mapping:** Map the fetched standard measurements to the fields within `patternState.measurements`.
* **Acceptance Criteria (Testing & Validation):**
    1.  Given the user is in the "Measurements" section for a "Women's Sweater".
    2.  When the user selects "Standard Sizes," then filters for "Adult," "Women," "EU" are available and can be selected.
    3.  When the user selects "Medium" from the resulting list, then the measurement fields (chest, waist, etc.) in `patternState` are populated with the standard values for an EU Women's Medium.
    4.  Verify the 2D schematic preview updates its proportions immediately to reflect these new standard measurements.
    5.  Verify the user can switch to "Custom Measurements," modify a value, and the schematic updates.
    6.  Verify that selecting a different standard size (e.g., "Large") correctly updates all measurements and the schematic.

