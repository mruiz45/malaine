**User Story 1: Initial Application Skeleton**

1.  **Title:** 1. Initial Application Skeleton
2.  **Goal:** As a new visitor, I want to see a welcoming homepage with a consistent layout, so I can understand what the site is about and navigate it easily on any device.
3.  **Description:** This story covers the setup of a new Next.js application using TypeScript. It includes creating a main layout, a minimal homepage, and ensuring the setup is responsive from the start. It establishes the foundational project structure, including tooling like ESLint/Prettier, without any backend integration yet.
4.  **Functional Requirements:**
    *   FR1: A Next.js project named "Malaine" is initialized with TypeScript and the App Router.
    *   FR2: A main layout with a header (site title, placeholder navigation) and a footer is applied to all pages.
    *   FR3: A homepage (`/`) displays a welcome message: "Bienvenue sur Malaine – votre assistant tricot/crochet".
    *   FR4: The layout must be responsive, adaptinpm intang to mobile, tablet, and desktop screens using modern CSS (Flexbox/Grid).
    *   FR5: The HTML head must include the viewport meta tag for responsive behavior.
    *   FR6: The project structure must include a `components/` directory (for `Header`, `Footer`) and a `app/styles/` directory for stylesheets.
5.  **Technical Implementation Guidance:**
    *   **Technology Stack:** Next.js (App Router), TypeScript, CSS Modules or global styles.
    *   **Commands:** Use `npx create-next-app@latest` with appropriate flags for TypeScript, Tailwind CSS (optional), ESLint.
    *   **Project Structure (example):**
        ```
        /app
          /layout.tsx
          /page.tsx
          /globals.css
        /components
          /Header.tsx
          /Footer.tsx
        ```
    *   **UI Considerations:** Adopt a mobile-first approach. The header should be a horizontal bar on desktop and stack cleanly on mobile. Full hamburger menu functionality can be a separate story.
6.  **Acceptance Criteria (Testing & Validation):**
    *   AC1: The project runs without errors using `npm run dev`.
    *   AC2: The homepage displays the welcome message with the header and footer.
    *   AC3: When resizing the browser window or using mobile simulation, the layout adjusts without horizontal scrollbars.
    *   AC4: The project's file structure matches the one defined in the technical guidance.
    *   AC5: The code is written in TypeScript and passes linting and type checks.
7.  **Assumptions/Pre-conditions:**
    *   Node.js and a package manager (npm, yarn, or pnpm) are installed on the development machine.
8.  **Impacted System Components:**
    *   New Files: `app/layout.tsx`, `app/page.tsx`, `components/Header.tsx`, `components/Footer.tsx`, `app/globals.css`. 