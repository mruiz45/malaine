**User Story 2.2**

1.  **Title:** Implement Basic Yarn Quantity Estimator Tool
2.  **Goal:** As a user planning a project, I want a tool to provide a rough estimate of the total yarn quantity (in grams or skeins) I will need, based on my gauge, selected yarn, basic garment type, and approximate size, so I can purchase enough yarn.
3.  **Description:** This tool provides an initial, simplified estimation of yarn requirements. It's not a full pattern calculation but a helper during the planning phase. This relates to PDF section 4.4 ("Estimation de la Quantité de Laine") but is framed as an early-stage tool.
4.  **Functional Requirements:**
    * FR1: User can select their saved Gauge Profile (from US 1.1) or input gauge details directly.
    * FR2: User can select their saved Yarn Profile (from US 1.4) or input key yarn details (yardage/meterage per weight, e.g., meters per $100\text{g}$).
    * FR3: User can select a basic project type from a predefined list (e.g., Scarf, Baby Blanket, Simple Hat, Basic Adult Sweater - S/M/L approximation).
    * FR4: For some project types (like Scarf, Blanket), user can input desired dimensions (length and width).
    * FR5: For garments like "Basic Adult Sweater", user can select an approximate size (e.g., S, M, L, XL) which maps to predefined typical surface areas or yardage requirements.
    * FR6: The tool estimates the total yarn needed in:
        * Total meterage/yardage.
        * Total weight (e.g., grams).
        * Number of skeins/balls (based on the selected yarn's skein information).
    * FR7: The tool should provide a disclaimer that this is a rough estimate and actual usage may vary based on stitch pattern complexity, exact sizing, and individual tension.
5.  **Technical Implementation Guidance:**
    * **Data Models:**
        * No new primary tables for this tool itself. It uses `gauge_profiles` (US 1.1) and `yarn_profiles` (US 1.4).
        * Might need a configuration table or internal data structure for "basic project type estimations":
            * `project_type_yarn_estimators` (internal configuration, not necessarily a user-facing DB table initially):
                * `project_type_key` (e.g., "scarf", "adult_sweater_medium")
                * `estimation_method` (e.g., "area_based", "fixed_yardage_range")
                * `parameters` (JSONB):
                    * For "area_based": `{"avg_yarn_consumption_per_sq_cm_stockinette": 0.5}` (in meters of yarn, for a reference stitch, this is a simplification). The actual yarn consumption depends on yarn thickness and stitch pattern. A more common metric is (total stitches * avg yarn per stitch) or area * density factor.
                    * A simpler method might be to find industry standard approximate yardages for basic items and adjust slightly by gauge or yarn weight category. Example: A medium adult sweater in worsted weight typically requires 1000-1200 yards.
                    * The formula for area-based estimation for a flat piece:
                        * `Area = width_cm * length_cm`
                        * `Stitches_per_cm = gauge_stitches / gauge_swatch_width`
                        * `Rows_per_cm = gauge_rows / gauge_swatch_height`
                        * `Total_stitches_approx = (width_cm * Stitches_per_cm) * (length_cm * Rows_per_cm)` -- This is for a dense fabric. A simpler approach for yarn estimation uses area and yarn weight.
                        * A common method is: `Total Yarn (length) = Surface Area of Fabric (cm^2) * Yarn Factor (length/cm^2)`. The `Yarn Factor` depends heavily on yarn thickness and stitch pattern.
                        * `Yarn Factor (length/cm^2)` can be derived from `(Meters per Skein / Weight per Skein)` and `(Stitch Density * Row Density)`.
                        * Let's use a weight-based estimation: `Total Yarn Weight = Surface Area * Fabric Weight per Area`.
                        * `Fabric Weight per Area (g/cm^2)` can be estimated from gauge and yarn weight per length. A swatch of known area ($10\text{cm} \times 10\text{cm} = 100 \text{cm}^2$) if weighed would give this.
                        * Or, from yarn properties: `Yarn linear density (g/m) = Skein Weight (g) / Skein Meterage (m)`.
                        * `Total yarn length needed (m) = (Total stitches in project * average length per stitch) + (Total rows * average length per row segment)`. This is too complex for a *basic* estimator.
                        * Alternative: Estimate based on total surface area and a factor based on yarn weight category.
                            * E.g., Adult Medium Sweater $\approx 1.2 \text{m}^2$ surface area.
                            * Worsted weight yarn might require $\approx 800\text{m} / \text{m}^2$ for stockinette.
                            * So, $1.2 \text{m}^2 \times 800 \text{m/m}^2 = 960 \text{m}$.
    * **API Endpoints (Conceptual):**
        * `POST /api/tools/yarn_quantity_estimator`
            * Payload: `{ "gauge_profile_id": "...", "yarn_profile_id": "...", "project_type": "scarf", "dimensions": { "width": 20, "length": 150, "unit": "cm" } }` OR
            * Payload: `{ ..., "project_type": "adult_sweater", "size": "M" }`
    * **Logic/Processing:**
        1.  **Gather Inputs:** Gauge, Yarn details (meterage/gram, skein size), Project Type, Dimensions/Size.
        2.  **Calculate Surface Area (if applicable):** For scarves, blankets, convert dimensions to a standard unit (e.g., $\text{cm}^2$ or $\text{m}^2$). For predefined sizes (sweater S/M/L), use lookup values for typical surface area.
            * `predefined_surface_areas = { "adult_sweater_S": 1.0, "adult_sweater_M": 1.2, ... }` (in $\text{m}^2$)
        3.  **Determine Yarn Consumption Factor:** This is the trickiest part. It depends on yarn thickness and stitch pattern.
            * **Simplification 1:** Use yarn weight category (from US 1.4) to pick a factor.
                * `yarn_factors_meter_per_sq_meter = { "Fingering": 1200, "DK": 1000, "Worsted": 800, "Bulky": 600 }` (these are illustrative values for stockinette stitch; actual values need research).
            * **Simplification 2:** If the gauge swatch itself (US 1.1) could optionally have its weight recorded, that would be most accurate: `yarn_needed (g) = (total_project_area_cm2 / swatch_area_cm2) * swatch_weight_g`. This relies on an optional field not in US 1.1.
        4.  **Calculate Total Yarn Length:** `total_length_meters = surface_area_m2 * yarn_factor_meter_per_sq_meter`.
        5.  **Calculate Total Yarn Weight:**
            * `yarn_linear_density_g_per_m = yarn_skein_weight_g / yarn_skein_meterage_m`.
            * `total_weight_g = total_length_meters * yarn_linear_density_g_per_m`.
        6.  **Calculate Number of Skeins:** `num_skeins = ceil(total_length_meters / yarn_skein_meterage_m)` OR `ceil(total_weight_g / yarn_skein_weight_g)`. Use the one based on the primary skein unit (length or weight).
        7.  Add a buffer (e.g., 10-15%) to the final estimate.
    * **UI Considerations (High-Level):**
        * Dedicated UI section for the tool.
        * Selectors for existing gauge and yarn profiles, or links to create them.
        * Dropdown for project type.
        * Conditional input fields for dimensions or size based on project type.
        * Clear display of results (total length, total weight, number of skeins) with units.
        * Visible disclaimer about estimation accuracy.
    * **Integration Points:**
        * Uses `gauge_profiles` (US 1.1) and `yarn_profiles` (US 1.4).
        * Part of the "Pattern Definition Session" (US 1.6) UI.
6.  **Acceptance Criteria (Testing & Validation):**
    * AC1: User can select their gauge, yarn, project type, and provide dimensions/size.
    * AC2: Given inputs for a scarf ($20 \text{ cm} \times 150 \text{ cm}$), a specific gauge, and yarn (e.g., DK weight, $100\text{g} = 200\text{m}$ per skein), the tool provides an estimated yarn quantity in meters, grams, and skeins.
        * Example: Scarf Area = $0.2\text{m} \times 1.5\text{m} = 0.3 \text{ m}^2$.
        * If DK factor is $1000 \text{ m/m}^2$: $0.3 \text{ m}^2 \times 1000 \text{ m/m}^2 = 300 \text{ m}$ total length.
        * Yarn linear density: $100\text{g} / 200\text{m} = 0.5 \text{ g/m}$.
        * Total weight: $300\text{m} \times 0.5 \text{ g/m} = 150 \text{ g}$.
        * Number of skeins: `ceil(300m / 200m/skein) = ceil(1.5) = 2` skeins. (Assuming 10% buffer, this would be `ceil(1.65) = 2` skeins).
    * AC3: The tool correctly calculates number of skeins, rounding up to the nearest whole skein.
    * AC4: The disclaimer regarding estimation accuracy is displayed.
    * AC5: If critical inputs (like yarn meterage per skein) are missing, the estimation for skeins is gracefully handled or prompts the user.
7.  **Assumptions/Pre-conditions:**
    * US 1.1 (Gauge) and US 1.4 (Yarn) are implemented.
    * A researched list of basic project types with their typical surface areas or yardage factors is available. (This data needs to be provided or researched by the AI/developer).
8.  **Impacted System Components (Illustrative):**
    * New UI: `YarnQuantityEstimatorTool.vue`.
    * New Backend (optional, if logic is server-side): `ToolsController.java`, `YarnEstimatorService.java`.
    * Internal configuration data for project types and yarn factors.
    * Uses existing `GaugeInputForm` and `YarnInputForm` or selector components.
