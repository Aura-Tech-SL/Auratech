## ADDED Requirements

### Requirement: Three supported locales with English as default
The application SHALL support three locales: English (`en`), Catalan (`ca`), and Spanish (`es`). English SHALL be the default locale.

#### Scenario: Root URL redirects to default locale
- **WHEN** a visitor navigates to `/`
- **THEN** the middleware SHALL redirect (307) to `/en/` based on browser `Accept-Language` header, falling back to `/en/` if no match

#### Scenario: Explicit locale in URL
- **WHEN** a visitor navigates to `/ca/serveis`
- **THEN** the page SHALL render in Catalan with all UI text translated

#### Scenario: Invalid locale in URL
- **WHEN** a visitor navigates to `/fr/serveis`
- **THEN** the middleware SHALL redirect to `/en/serveis`

### Requirement: URL-based locale routing with [locale] segment
All public and auth routes SHALL be nested under a `[locale]` dynamic segment in the Next.js App Router. Admin, dashboard, and API routes SHALL remain outside locale routing.

#### Scenario: Public page has locale prefix
- **WHEN** a visitor navigates to `/en/contacte`
- **THEN** the page SHALL render the contact page in English

#### Scenario: Admin routes are not localized
- **WHEN** an admin navigates to `/admin/blog`
- **THEN** the route SHALL work without a locale prefix (unchanged from current behavior)

#### Scenario: API routes are not localized
- **WHEN** a client requests `/api/blog`
- **THEN** the API SHALL respond without locale prefix (unchanged from current behavior)

### Requirement: Translation JSON files per locale
Each locale SHALL have a dedicated JSON file at `messages/{locale}.json` containing all UI strings organized by namespace (nav, footer, home, services, projects, labs, about, blog, contact, auth).

#### Scenario: English translation file
- **WHEN** the app loads locale `en`
- **THEN** it SHALL load `messages/en.json` and all `useTranslations()` calls SHALL return English strings

#### Scenario: Missing translation key
- **WHEN** a translation key is not found in the current locale file
- **THEN** the system SHALL fall back to the English (`en`) string for that key

### Requirement: Language selector in header
The header SHALL display a language selector showing EN / CA / ES. Clicking a language SHALL switch the locale while preserving the current path.

#### Scenario: Switch language on services page
- **WHEN** a visitor is on `/ca/serveis` and clicks "EN"
- **THEN** the browser SHALL navigate to `/en/serveis` with English content

#### Scenario: Language selector shows current locale as active
- **WHEN** the current URL is `/es/projectes`
- **THEN** "ES" SHALL be visually highlighted in the language selector

### Requirement: Language selector in mobile menu
The mobile navigation menu SHALL include the language selector, accessible on all screen sizes.

#### Scenario: Mobile language switch
- **WHEN** a visitor opens the mobile menu on `/en/blog` and taps "CA"
- **THEN** the browser SHALL navigate to `/ca/blog`

### Requirement: Middleware merges i18n with auth
The middleware SHALL handle locale detection and routing for public routes AND authentication for protected routes (`/admin/*`, `/dashboard/*`), without conflict.

#### Scenario: Public route gets locale middleware
- **WHEN** a visitor requests `/serveis`
- **THEN** the i18n middleware SHALL detect the browser locale and redirect to `/{locale}/serveis`

#### Scenario: Admin route gets auth middleware only
- **WHEN** a user requests `/admin/blog`
- **THEN** only the auth middleware SHALL run (redirect to login if not authenticated)
- **AND** no locale prefix SHALL be added

#### Scenario: Static files bypass middleware
- **WHEN** a browser requests `/_next/static/chunks/main.js`
- **THEN** both i18n and auth middleware SHALL be skipped

### Requirement: Locale-aware navigation components
All `<Link>` components in public pages SHALL use locale-aware navigation that automatically prefixes the current locale to hrefs.

#### Scenario: Internal link preserves locale
- **WHEN** a user on `/ca/` clicks a link to `/blog`
- **THEN** the link SHALL navigate to `/ca/blog` (not `/blog`)

#### Scenario: Footer links are locale-aware
- **WHEN** the footer renders on `/es/contacte`
- **THEN** all footer links SHALL point to `/es/...` paths

### Requirement: Translated metadata per page
Each page SHALL generate locale-specific metadata (title, description) using `getTranslations()` in `generateMetadata()` functions.

#### Scenario: English services page metadata
- **WHEN** a crawler requests `/en/serveis`
- **THEN** the HTML `<title>` SHALL be "Services — Auratech" and the meta description SHALL be in English

#### Scenario: Catalan services page metadata
- **WHEN** a crawler requests `/ca/serveis`
- **THEN** the HTML `<title>` SHALL be "Serveis — Auratech" and the meta description SHALL be in Catalan

### Requirement: Translations cover all Lovable content
The translation files SHALL contain all strings currently present in the Lovable SPA's `translations.ts` file (1131 lines), covering: navigation, footer, home page, services, projects, cases, labs, about, blog, contact, legal pages, 404 page, cookie consent, and common UI elements.

#### Scenario: Lovable string parity check
- **WHEN** comparing `messages/ca.json` keys with Lovable `translations.ts` Catalan strings
- **THEN** every user-visible string from Lovable SHALL have a corresponding key in the JSON file
