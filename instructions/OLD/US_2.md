**User Story 2: Dynamic Internationalization (i18n)**

1.  **Title:** 2. Dynamic Content Internationalization (i18n)
2.  **Goal:** As a user, I want to be able to switch the website's language without reloading the page, so I can use the application in my preferred language.
3.  **Description:** This story involves adding dynamic multilingual support to the application. It focuses on setting up an i18n library (`react-i18next`), creating translation files, and implementing a language switcher component that updates the UI instantly.
4.  **Functional Requirements:**
    *   FR1: The application must support at least two languages: English (default) and French.
    *   FR2: A language switcher (e.g., buttons "EN" / "FR") must be available in the header.
    *   FR3: Clicking the language switcher must update all UI text to the selected language **without a page reload**.
    *   FR4: The user's language preference must be persisted (e.g., in a cookie) and used on subsequent visits or navigation.
    *   FR5: All hardcoded text on existing pages (welcome message, navigation links) must be replaced with keys from translation files.
    *   FR6: English must be the default language if no preference is set by the user.
5.  **Technical Implementation Guidance:**
    *   **Libraries:** `react-i18next`, `i18next`, `i18next-browser-languagedetector`.
    *   **Data Models:**
        *   Translation files should be created, for example: `public/locales/en/translation.json` and `public/locales/fr/translation.json`.
            ```json
            // public/locales/en/translation.json
            { "welcome_message": "Welcome to Malaine – your knitting/crochet assistant" }
            ```
            ```json
            // public/locales/fr/translation.json
            { "welcome_message": "Bienvenue sur Malaine – votre assistant tricot/crochet" }
            ```
    *   **Logic/Processing:**
        *   Use a React Context Provider (`I18nextProvider`) in the main layout to make the i18n instance available throughout the app.
        *   Use the `useTranslation` hook to get the `t` function for translating keys.
        *   The `LanguageSwitcher` component will call `i18n.changeLanguage('fr')`.
        *   Utilize a library like `i18next-browser-languagedetector` to detect and persist the language choice in a cookie.
    *   **UI Considerations:** The language switcher should be easily accessible in the UI, typically in the main header.
6.  **Acceptance Criteria (Testing & Validation):**
    *   AC1: By default, the UI is displayed in English.
    *   AC2: Clicking the "FR" button instantly translates the welcome message and other UI elements to French.
    *   AC3: The browser does not perform a full page reload when switching languages.
    *   AC4: After switching to French, refreshing the page maintains the selected language.
    *   AC5: If a translation key is missing for the active language, the default language's text (or the key itself) is displayed without crashing the app.
7.  **Assumptions/Pre-conditions:**
    *   User Story 1 is completed. The basic application skeleton exists.
8.  **Impacted System Components:**
    *   New Libraries: `react-i18next`, `i18next`, `i18next-browser-languagedetector`.
    *   New UI Component: `components/LanguageSwitcher.tsx`.
    *   New Files: `public/locales/en/translation.json`, `public/locales/fr/translation.json`, `lib/i18n.ts` (configuration file).
    *   Modified Files: `app/layout.tsx` (to add provider), `app/page.tsx` (to use `useTranslation` hook), `components/Header.tsx` (to add switcher). 