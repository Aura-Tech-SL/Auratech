## ADDED Requirements

### Requirement: Next.js serves all public pages (replace Lovable SPA)
After migration, ALL public pages currently served by the Lovable SPA (frontend:8080) SHALL be served by the Next.js application (backend:3000). The Lovable SPA, prerender service, and their Docker containers SHALL be eliminated.

#### Scenario: Nginx routes all traffic to Next.js
- **WHEN** a visitor requests `https://auratech.cat/en/serveis`
- **THEN** Nginx SHALL proxy the request to `backend:3000` (Next.js)
- **AND** the frontend:8080 and prerender:3001 services SHALL NOT be running

#### Scenario: SSR replaces prerender
- **WHEN** a crawler (Googlebot) requests any page
- **THEN** Next.js SHALL return server-rendered HTML directly (no prerender service needed)

### Requirement: Visual parity with Lovable SPA
All pages ported from Lovable SHALL maintain equivalent visual quality and functionality. No visible regression.

#### Scenario: Home page visual parity
- **WHEN** comparing the Lovable home page with the Next.js home page
- **THEN** the Next.js version SHALL include: animated mesh background, parallax hero, animated counters, manifesto section, services grid, testimonials, CTA section

#### Scenario: Services page visual parity
- **WHEN** comparing the Lovable services page with the Next.js version
- **THEN** the Next.js version SHALL include: service cards with parallax images, FAQ accordion section

### Requirement: Port all missing pages from Lovable
The following pages that exist in Lovable but NOT in Next.js SHALL be created:

#### Scenario: Service landing pages exist
- **WHEN** a visitor navigates to `/en/serveis/estrategia-digital`
- **THEN** the page SHALL render a full service landing page with hero, features, process, CTA
- **AND** the same SHALL work for `/serveis/cloud-devops`, `/serveis/desenvolupament`, `/serveis/iot-retail`

#### Scenario: Cases page exists
- **WHEN** a visitor navigates to `/en/casos`
- **THEN** the page SHALL render case study cards with images, stats, testimonials, JSON-LD

#### Scenario: Legal pages exist
- **WHEN** a visitor navigates to `/en/avis-legal`
- **THEN** the page SHALL render the legal notice text
- **AND** the same SHALL work for `/privacitat` and `/cookies`

#### Scenario: Custom 404 page
- **WHEN** a visitor navigates to a non-existent URL
- **THEN** the server SHALL return HTTP 404 with a custom page showing suggested navigation links

### Requirement: Port visual components from Lovable
The following Lovable-specific visual components SHALL be ported to Next.js:

#### Scenario: AnimatedMeshBg component
- **WHEN** the home page hero renders
- **THEN** it SHALL display the canvas-based animated gradient orbs background

#### Scenario: Parallax scroll effects
- **WHEN** a user scrolls on the home or services page
- **THEN** elements SHALL have parallax motion effects via framer-motion `useScroll`/`useTransform`

#### Scenario: AnimatedCounter component
- **WHEN** the stats section scrolls into view
- **THEN** numbers SHALL animate from 0 to their target value

#### Scenario: Accordion component for FAQ
- **WHEN** the services page renders the FAQ section
- **THEN** accordion items SHALL expand/collapse on click using Radix UI accordion

### Requirement: Copy static assets from Lovable
All image assets, favicons, and OG images from the Lovable SPA SHALL be copied to the Next.js `public/` directory.

#### Scenario: Favicons present
- **WHEN** any page is loaded
- **THEN** the browser SHALL show the Auratech favicon (copied from Lovable `public/`)

#### Scenario: OG image present
- **WHEN** sharing a page on social media
- **THEN** the og:image SHALL load from `https://auratech.cat/og-image.png`

#### Scenario: Service images present
- **WHEN** a service card renders
- **THEN** the service image SHALL load from `/images/` (copied from Lovable `src/assets/`)

### Requirement: Font consistency
The Next.js application SHALL use the same primary font as the Lovable SPA.

#### Scenario: Font matches Lovable
- **WHEN** any page renders
- **THEN** the body text SHALL use Space Grotesk (or the agreed-upon font) consistently across all pages

### Requirement: Upgrade existing Next.js pages to Lovable quality
Pages that already exist in both apps SHALL be upgraded to match Lovable's visual richness.

#### Scenario: Serveis page upgraded
- **WHEN** `/en/serveis` renders
- **THEN** it SHALL show service cards with images and a FAQ accordion section (not just a text list)

#### Scenario: Projectes page upgraded
- **WHEN** `/en/projectes` renders
- **THEN** it SHALL show project cards with images (not just a plain list)

#### Scenario: Sobre page upgraded
- **WHEN** `/en/sobre` renders
- **THEN** it SHALL show the full who-we-are section with values grid (not just the minimal fallback)

#### Scenario: Blog post page upgraded
- **WHEN** a blog post renders
- **THEN** it SHALL include share buttons, related posts section, and CTA at the bottom

#### Scenario: Header upgraded
- **WHEN** the header renders
- **THEN** it SHALL include a language selector and updated navigation with Cases link

#### Scenario: Footer upgraded
- **WHEN** the footer renders
- **THEN** legal links SHALL point to `/avis-legal`, `/privacitat`, `/cookies` (not `#`)

### Requirement: Docker and Nginx reconfiguration
The production Docker Compose and Nginx configuration SHALL be updated to eliminate Lovable and prerender services.

#### Scenario: Docker services after migration
- **WHEN** `docker compose ps` runs on the production server
- **THEN** only `db` and `backend` services SHALL be running
- **AND** `frontend` and `prerender` services SHALL NOT exist

#### Scenario: Nginx proxies everything to Next.js
- **WHEN** any request arrives at `https://auratech.cat`
- **THEN** Nginx SHALL proxy to `127.0.0.1:3000` (Next.js backend) for ALL paths
- **AND** there SHALL be no user-agent sniffing or prerender routing

### Requirement: Git tag before migration
Before starting the migration implementation, a git tag `pre-migration-v1` SHALL be created for easy rollback.

#### Scenario: Tag exists
- **WHEN** running `git tag -l pre-migration-v1`
- **THEN** the tag SHALL exist pointing to the last known-good commit

### Requirement: Lovable files removed from repo
After confirming production stability (minimum 1 week), all Lovable-specific files SHALL be removed from the repository root.

#### Scenario: Root cleanup
- **WHEN** listing files at the repo root after cleanup
- **THEN** the following SHALL NOT exist: `src/` (Lovable), `dist/`, `index.html`, `vite.config.ts`, `vitest.config.ts`, root `package.json` (Lovable), root `tailwind.config.ts`, root `postcss.config.js`

#### Scenario: auratech-web remains intact
- **WHEN** listing `auratech-web/` after cleanup
- **THEN** all Next.js files SHALL be present and unchanged

### Requirement: 301 redirects for changed URLs
If any URL path changes during migration (e.g., new routes), the application SHALL serve 301 redirects from old URLs to new ones.

#### Scenario: Old URL without locale prefix
- **WHEN** a visitor or crawler requests `/serveis` (no locale prefix, old URL)
- **THEN** the middleware SHALL redirect (301) to `/en/serveis`

#### Scenario: Bookmarked old URLs still work
- **WHEN** a user has bookmarked `https://auratech.cat/blog/some-post`
- **THEN** they SHALL be redirected to `https://auratech.cat/en/blog/some-post`
