## ADDED Requirements

### Requirement: Google Analytics 4 integration
The application SHALL load Google Analytics 4 with measurement ID `G-B42VZG6JKF` on all public pages, respecting cookie consent.

#### Scenario: GA4 script loaded
- **WHEN** any public page is rendered and the user has accepted cookies
- **THEN** the HTML SHALL include the gtag.js script for `G-B42VZG6JKF`
- **AND** `gtag('config', 'G-B42VZG6JKF')` SHALL be called

#### Scenario: GA4 disabled without consent
- **WHEN** a user has not accepted cookies or has rejected them
- **THEN** `window['ga-disable-G-B42VZG6JKF']` SHALL be set to `true`
- **AND** no tracking data SHALL be sent to Google

#### Scenario: GA4 not loaded on admin/dashboard
- **WHEN** an admin navigates to `/admin/blog`
- **THEN** the GA4 script SHALL NOT be loaded

### Requirement: Page view tracking on route changes
The application SHALL fire a `page_view` event on every client-side route change within the SPA navigation.

#### Scenario: Page view on navigation
- **WHEN** a user navigates from `/en/` to `/en/serveis` via client-side navigation
- **THEN** `gtag("event", "page_view", { page_path: "/en/serveis", page_title: "Services — Auratech" })` SHALL be called

#### Scenario: Page view on initial load
- **WHEN** a user first loads `/en/blog`
- **THEN** a `page_view` event SHALL fire with the correct path and title

### Requirement: Cookie consent banner
The application SHALL display a cookie consent banner on first visit, explaining the use of cookies and allowing the user to accept or reject.

#### Scenario: Banner appears on first visit
- **WHEN** a user visits the site for the first time (no consent stored)
- **THEN** a cookie consent banner SHALL appear at the bottom of the viewport

#### Scenario: Consent stored after accepting
- **WHEN** a user clicks "Accept" on the cookie consent banner
- **THEN** the consent SHALL be saved to `localStorage`
- **AND** GA4 SHALL be enabled
- **AND** the banner SHALL not appear on subsequent visits

#### Scenario: Consent stored after rejecting
- **WHEN** a user clicks "Reject" on the cookie consent banner
- **THEN** the rejection SHALL be saved to `localStorage`
- **AND** GA4 SHALL remain disabled
- **AND** the banner SHALL not appear on subsequent visits

#### Scenario: Banner text is translated
- **WHEN** the banner appears on `/es/`
- **THEN** the banner text SHALL be in Spanish

### Requirement: GA4 script uses next/script
The GA4 scripts SHALL be loaded via Next.js `<Script>` component with `strategy="afterInteractive"` to avoid blocking page rendering.

#### Scenario: Script does not block LCP
- **WHEN** a page loads
- **THEN** the GA4 script SHALL load after the page is interactive
- **AND** Largest Contentful Paint SHALL not be delayed by the analytics script

### Requirement: Cookie consent links to privacy policy
The cookie consent banner SHALL include a link to the privacy policy page.

#### Scenario: Privacy link in banner
- **WHEN** the cookie consent banner is displayed on `/en/`
- **THEN** it SHALL contain a link to `/en/privacitat` with the text "Privacy Policy" (translated per locale)
