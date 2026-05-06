## ADDED Requirements

### Requirement: Dynamic sitemap.xml with hreflang
The application SHALL generate a dynamic `sitemap.xml` at `/sitemap.xml` containing all public URLs with hreflang alternates for each supported locale (en, ca, es).

#### Scenario: Static pages in sitemap
- **WHEN** a crawler requests `/sitemap.xml`
- **THEN** the response SHALL contain `<url>` entries for all static routes (`/`, `/serveis`, `/projectes`, `/labs`, `/sobre`, `/blog`, `/contacte`, `/casos`, `/avis-legal`, `/privacitat`, `/cookies`) with `<xhtml:link rel="alternate">` for each locale

#### Scenario: Blog posts in sitemap
- **WHEN** there are 5 published blog posts in the database
- **THEN** the sitemap SHALL contain entries for each post under each locale (15 total URLs)

#### Scenario: CMS pages in sitemap
- **WHEN** there are published CMS pages with custom slugs
- **THEN** the sitemap SHALL include them with proper `<lastmod>` dates

#### Scenario: Draft pages excluded
- **WHEN** a page has `status: DRAFT`
- **THEN** it SHALL NOT appear in `sitemap.xml`

### Requirement: robots.txt
The application SHALL serve a `robots.txt` at `/robots.txt` that allows public crawling and blocks protected areas.

#### Scenario: robots.txt content
- **WHEN** a crawler requests `/robots.txt`
- **THEN** the response SHALL contain:
  - `User-agent: *`
  - `Allow: /`
  - `Disallow: /admin/`
  - `Disallow: /dashboard/`
  - `Disallow: /api/`
  - `Sitemap: https://auratech.cat/sitemap.xml`

### Requirement: Canonical URLs on all pages
Every public page SHALL include a `<link rel="canonical">` tag with the full absolute URL including locale prefix.

#### Scenario: Canonical for localized page
- **WHEN** the page `/en/serveis` is rendered
- **THEN** the HTML SHALL contain `<link rel="canonical" href="https://auratech.cat/en/serveis">`

#### Scenario: Hreflang alternates in head
- **WHEN** any public page is rendered
- **THEN** the HTML `<head>` SHALL contain `<link rel="alternate" hreflang="en">`, `<link rel="alternate" hreflang="ca">`, `<link rel="alternate" hreflang="es">` pointing to the same page in each locale

### Requirement: JSON-LD Organization schema
The locale layout SHALL include an Organization JSON-LD script on every public page.

#### Scenario: Organization schema content
- **WHEN** any public page is rendered
- **THEN** the HTML SHALL contain a `<script type="application/ld+json">` with:
  - `@type: "Organization"`
  - `name: "Auratech"`
  - `url: "https://auratech.cat"`
  - `logo: "https://auratech.cat/favicon.svg"`
  - `address` with `addressLocality: "Vic"`, `addressRegion: "Barcelona, Catalunya"`, `addressCountry: "ES"`
  - `contactPoint` with `email: "info@auratech.cat"`

### Requirement: JSON-LD LocalBusiness schema
The home page SHALL include a LocalBusiness JSON-LD schema in addition to Organization.

#### Scenario: LocalBusiness on home page
- **WHEN** the home page is rendered
- **THEN** the HTML SHALL contain a JSON-LD with `@type: "LocalBusiness"`, `name`, `address`, `email`, `openingHours: "Mo-Fr 09:00-18:00"`

### Requirement: JSON-LD WebSite schema with SearchAction
The locale layout SHALL include a WebSite JSON-LD schema.

#### Scenario: WebSite schema content
- **WHEN** any public page is rendered
- **THEN** the HTML SHALL contain a JSON-LD with `@type: "WebSite"`, `name: "Auratech"`, `url`, `inLanguage: ["en", "ca", "es"]`

### Requirement: JSON-LD Article schema on blog posts
Each published blog post page SHALL include an Article JSON-LD schema.

#### Scenario: Article schema content
- **WHEN** a blog post is rendered
- **THEN** the HTML SHALL contain a JSON-LD with:
  - `@type: "Article"`
  - `headline` (post title)
  - `description` (post excerpt)
  - `datePublished` and `dateModified`
  - `author` (Person with name)
  - `publisher` (Organization)
  - `image` (cover image URL)
  - `wordCount` (readTime * 200)
  - `articleSection` (category)
  - `keywords` (tags joined)

### Requirement: JSON-LD Service schema on service pages
Each service landing page SHALL include a Service JSON-LD schema.

#### Scenario: Service schema content
- **WHEN** `/en/serveis/iot-retail` is rendered
- **THEN** the HTML SHALL contain a JSON-LD with `@type: "Service"`, `serviceType`, `description`, `provider` (Organization), `areaServed: "Catalunya, Spain"`

### Requirement: JSON-LD FAQPage schema on services page
The main services page SHALL include FAQPage schema when FAQ accordion content is present.

#### Scenario: FAQ schema
- **WHEN** `/en/serveis` is rendered with FAQ items
- **THEN** the HTML SHALL contain a JSON-LD with `@type: "FAQPage"` and `mainEntity` containing Question/Answer pairs

### Requirement: JSON-LD BreadcrumbList schema
Inner pages (not home) SHALL include a BreadcrumbList JSON-LD schema matching the visual breadcrumb trail.

#### Scenario: Breadcrumb on service page
- **WHEN** `/en/serveis/iot-retail` is rendered
- **THEN** the HTML SHALL contain a JSON-LD with `@type: "BreadcrumbList"` with items: Home > Services > IoT & Retail

#### Scenario: Breadcrumb on blog post
- **WHEN** `/en/blog/some-post` is rendered
- **THEN** the breadcrumb SHALL show: Home > Blog > Post Title

### Requirement: Open Graph tags on all pages
Every public page SHALL include complete Open Graph meta tags.

#### Scenario: OG tags present
- **WHEN** any public page is rendered
- **THEN** the HTML `<head>` SHALL contain:
  - `og:title` (page-specific)
  - `og:description` (page-specific)
  - `og:image` (page-specific or default `og-image.png`)
  - `og:url` (canonical URL with locale)
  - `og:type` ("website" for pages, "article" for blog posts)
  - `og:locale` (matching current locale: en_US, ca_ES, es_ES)
  - `og:locale:alternate` (the other two locales)
  - `og:site_name: "Auratech"`

### Requirement: Twitter Card tags on all pages
Every public page SHALL include Twitter Card meta tags.

#### Scenario: Twitter Card tags present
- **WHEN** any public page is rendered
- **THEN** the HTML `<head>` SHALL contain:
  - `twitter:card: "summary_large_image"`
  - `twitter:title` (matching og:title)
  - `twitter:description` (matching og:description)
  - `twitter:image` (matching og:image)

### Requirement: Google Search Console verification
The root HTML SHALL include the Google Search Console verification meta tag.

#### Scenario: GSC meta tag present
- **WHEN** any page is rendered
- **THEN** the HTML `<head>` SHALL contain `<meta name="google-site-verification" content="wbs8IZaZMx7DQvyWATdcyUR5n8zSYoz4iGSJAzc6two">`

### Requirement: Default og-image.png
The application SHALL have a default Open Graph image at `/og-image.png` (1200x630px recommended) used when pages don't specify a custom og:image.

#### Scenario: Default og:image fallback
- **WHEN** a page has no custom `ogImage` field
- **THEN** the og:image meta tag SHALL use `https://auratech.cat/og-image.png`

### Requirement: Security headers
The application SHALL set security headers on all responses via Next.js config.

#### Scenario: Security headers present
- **WHEN** any page is served
- **THEN** the response SHALL include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (via Nginx)

### Requirement: Image alt text on all content images
All `<img>` and `<Image>` tags rendering content images SHALL have descriptive `alt` attributes. Decorative images SHALL use `alt=""`.

#### Scenario: Blog post cover image
- **WHEN** a blog post with title "IoT Trends 2026" has a cover image
- **THEN** the image SHALL have `alt="IoT Trends 2026"`

#### Scenario: Service card image
- **WHEN** a service card for "Cloud & DevOps" renders an image
- **THEN** the image SHALL have `alt="Cloud & DevOps"` or a more descriptive alternative

### Requirement: RSS/Atom feed for blog
The application SHALL generate a dynamic RSS feed at `/feed.xml` listing all published blog posts.

#### Scenario: Feed content
- **WHEN** a reader or aggregator requests `/feed.xml`
- **THEN** the response SHALL be valid RSS 2.0 XML containing `<item>` entries for each published blog post with `<title>`, `<link>`, `<description>` (excerpt), `<pubDate>`, and `<guid>`

#### Scenario: Feed metadata
- **WHEN** `/feed.xml` is requested
- **THEN** the `<channel>` SHALL include `<title>Auratech Blog</title>`, `<link>https://auratech.cat/en/blog</link>`, and `<description>`

#### Scenario: Draft posts excluded from feed
- **WHEN** a blog post has `status: DRAFT`
- **THEN** it SHALL NOT appear in the RSS feed

### Requirement: www to non-www 301 redirect
All requests to `www.auratech.cat` SHALL be redirected with HTTP 301 to `auratech.cat`.

#### Scenario: www redirect
- **WHEN** a visitor requests `https://www.auratech.cat/en/serveis`
- **THEN** Nginx SHALL respond with HTTP 301 redirecting to `https://auratech.cat/en/serveis`

### Requirement: Accessibility basics (a11y)
All public pages SHALL meet basic accessibility standards.

#### Scenario: ARIA labels on interactive elements
- **WHEN** the header navigation renders
- **THEN** it SHALL include `aria-label="Global"` on the `<nav>` element and `aria-expanded` on mobile menu toggle

#### Scenario: Focus visible on keyboard navigation
- **WHEN** a user navigates with Tab key
- **THEN** all focusable elements SHALL have a visible focus indicator

#### Scenario: Semantic HTML structure
- **WHEN** any public page renders
- **THEN** it SHALL use `<header>`, `<nav>`, `<main>`, `<article>` (where applicable), `<section>`, and `<footer>` elements appropriately
