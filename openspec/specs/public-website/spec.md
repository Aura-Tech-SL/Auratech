## ADDED Requirements

### Requirement: BlockRenderer dispatches by block type
The `<BlockRenderer>` component SHALL receive a block object and render the correct React component based on the block's `type` field. Each block type (e.g., HERO, TEXT, IMAGE, CTA, FEATURES, TESTIMONIALS) SHALL map to a dedicated component.

#### Scenario: Known block type renders correct component
- **WHEN** `<BlockRenderer>` receives a block with `type: "HERO"`
- **THEN** it SHALL render the `<HeroBlock>` component with the block's content as props

#### Scenario: Known block type TEXT
- **WHEN** `<BlockRenderer>` receives a block with `type: "TEXT"`
- **THEN** it SHALL render the `<TextBlock>` component with the block's rich text content

#### Scenario: Known block type CTA
- **WHEN** `<BlockRenderer>` receives a block with `type: "CTA"`
- **THEN** it SHALL render the `<CtaBlock>` component with button label, URL, and styling props

### Requirement: Unknown block type fallback
When `<BlockRenderer>` encounters an unrecognized block type, it SHALL render nothing visible in production (`NODE_ENV=production`) and SHALL render a visible warning box with the unknown type name in development.

#### Scenario: Unknown type in production
- **WHEN** `<BlockRenderer>` receives a block with `type: "NONEXISTENT"` and `NODE_ENV` is `production`
- **THEN** it SHALL render an empty fragment (no visible output, no error thrown)

#### Scenario: Unknown type in development
- **WHEN** `<BlockRenderer>` receives a block with `type: "NONEXISTENT"` and `NODE_ENV` is `development`
- **THEN** it SHALL render a styled warning box showing "Unknown block type: NONEXISTENT"

### Requirement: Blocks render in order
When rendering a list of blocks for a page, the system SHALL sort blocks by their `order` field (ascending) and render them in that sequence.

#### Scenario: Blocks with explicit order
- **WHEN** a page has blocks with order values [3, 1, 2]
- **THEN** the rendered output SHALL display blocks in order [1, 2, 3] from top to bottom

#### Scenario: Blocks with same order value
- **WHEN** two blocks share the same `order` value
- **THEN** the system SHALL use the block creation timestamp as a tiebreaker (oldest first)

### Requirement: Hidden blocks are excluded
Blocks with `visible: false` SHALL NOT be included in the rendered page output, regardless of their type or order.

#### Scenario: Hidden block skipped
- **WHEN** a page has 3 blocks and the second block has `visible: false`
- **THEN** only 2 blocks SHALL be rendered, in order, with the hidden block absent from the DOM

#### Scenario: All blocks hidden
- **WHEN** a page has blocks but all have `visible: false`
- **THEN** the page SHALL render with an empty content area (no blocks)

### Requirement: Dynamic page routes
The application SHALL serve pages at `/{slug}` where `slug` matches a `Page` record in the database. The route SHALL use Next.js dynamic routing (`[slug]/page.tsx`).

#### Scenario: Valid published page
- **WHEN** a visitor navigates to `/serveis-cloud` and a Page with `slug: "serveis-cloud"` and `status: PUBLISHED` exists
- **THEN** the page SHALL render with the page title, metadata, and all visible blocks

#### Scenario: Draft page returns 404
- **WHEN** a visitor navigates to `/nova-pagina` and the Page has `status: DRAFT`
- **THEN** the server SHALL return a 404 response with the custom 404 page

#### Scenario: Archived page returns 404
- **WHEN** a visitor navigates to `/pagina-antiga` and the Page has `status: ARCHIVED`
- **THEN** the server SHALL return a 404 response

#### Scenario: Non-existent slug returns 404
- **WHEN** a visitor navigates to `/pagina-que-no-existeix`
- **THEN** the server SHALL return a 404 response

### Requirement: SEO metadata from page fields
Each rendered page SHALL include `<meta>` tags populated from the page's metadata fields: `metaTitle`, `metaDescription`, and `ogImage`.

#### Scenario: Full metadata present
- **WHEN** a page has `metaTitle: "Serveis Cloud"`, `metaDescription: "Solucions cloud per a empreses"`, and `ogImage: "/uploads/cloud.jpg"`
- **THEN** the HTML `<head>` SHALL contain `<title>Serveis Cloud</title>`, `<meta name="description" content="Solucions cloud per a empreses">`, and `<meta property="og:image" content="https://auratech.cat/uploads/cloud.jpg">`

#### Scenario: Missing metadata falls back to defaults
- **WHEN** a page has no `metaTitle` or `metaDescription`
- **THEN** the system SHALL use the page `title` as `<title>` and generate a description from the first text block content (truncated to 160 characters)

### Requirement: Canonical URLs
Every page SHALL include a `<link rel="canonical">` tag with the full absolute URL of the page.

#### Scenario: Canonical URL for slug page
- **WHEN** a page with slug `serveis` is rendered
- **THEN** the HTML SHALL contain `<link rel="canonical" href="https://auratech.cat/serveis">`

#### Scenario: Canonical URL for home page
- **WHEN** the home page is rendered
- **THEN** the HTML SHALL contain `<link rel="canonical" href="https://auratech.cat/">`

### Requirement: Home page composed from blocks
The home page (`/`) SHALL load its content from a Page record with `slug: "home"` (or a designated `isHomePage: true` flag) and render its blocks using the standard block rendering pipeline.

#### Scenario: Home page loads blocks from database
- **WHEN** a visitor navigates to `/`
- **THEN** the system SHALL fetch the Page with `slug: "home"` and render its blocks in order

#### Scenario: Home page missing from database
- **WHEN** no Page with `slug: "home"` exists
- **THEN** the system SHALL render a fallback home page with the company name and a message indicating content is being set up

### Requirement: Static pages are block-based
The pages at `/serveis`, `/sobre`, and `/labs` SHALL each correspond to a Page record in the database with matching slugs and SHALL render their blocks identically to any other page.

#### Scenario: Services page renders from CMS
- **WHEN** a visitor navigates to `/serveis`
- **THEN** the system SHALL fetch the Page with `slug: "serveis"` and render its published blocks

#### Scenario: About page renders from CMS
- **WHEN** a visitor navigates to `/sobre`
- **THEN** the system SHALL fetch the Page with `slug: "sobre"` and render its published blocks

### Requirement: ISR with revalidation on publish
Pages SHALL use Next.js Incremental Static Regeneration. Static pages SHALL be revalidated when content is published or updated via the CMS admin.

#### Scenario: Page served from cache
- **WHEN** a visitor requests a page that has been previously generated
- **THEN** the server SHALL return the cached HTML immediately without querying the database

#### Scenario: Revalidation triggered on publish
- **WHEN** an admin publishes or updates a page in the CMS
- **THEN** the system SHALL call `revalidatePath('/{slug}')` to invalidate the cached version
- **AND** the next visitor request SHALL receive the updated content

#### Scenario: Revalidation on page deletion
- **WHEN** an admin archives or deletes a page
- **THEN** the system SHALL revalidate the path so subsequent requests return 404

### Requirement: Image optimization via Next.js Image
All images rendered in blocks SHALL use the Next.js `<Image>` component with appropriate `width`, `height`, and `alt` attributes for automatic optimization, lazy loading, and responsive sizing.

#### Scenario: Block image uses Next.js Image
- **WHEN** an image block renders an image from `/uploads/foto.jpg`
- **THEN** the rendered HTML SHALL use `<img>` with `srcset` containing optimized sizes and `loading="lazy"` for below-fold images

#### Scenario: Cover images use Image component
- **WHEN** a hero block includes a background image
- **THEN** the image SHALL be rendered via `<Image>` with `priority={true}` for above-fold loading

### Requirement: Lazy loading for below-fold blocks
Blocks that appear below the initial viewport SHALL be lazy-loaded to improve initial page load performance.

#### Scenario: First two blocks load eagerly
- **WHEN** a page has 6 blocks
- **THEN** the first 2 blocks SHALL load eagerly (no lazy loading wrapper)
- **AND** blocks 3 through 6 SHALL be wrapped in a lazy loading boundary

#### Scenario: Lazy block becomes visible
- **WHEN** a user scrolls to a below-fold block
- **THEN** the block content SHALL load and render without a visible layout shift

### Requirement: Header and footer from CMS settings
The site header and footer content (logo, navigation links, contact info, social links) SHALL be managed from a CMS settings model and loaded on every page.

#### Scenario: Header renders navigation links
- **WHEN** CMS settings contain navigation items `[{label: "Serveis", href: "/serveis"}, {label: "Blog", href: "/blog"}]`
- **THEN** the header SHALL render those links in order

#### Scenario: Footer renders company info
- **WHEN** CMS settings contain `companyName`, `address`, `phone`, and `socialLinks`
- **THEN** the footer SHALL display the company info and social media icons with links

#### Scenario: Navigation updated in CMS
- **WHEN** an admin adds a new navigation item in CMS settings
- **THEN** the header SHALL reflect the change after revalidation

### Requirement: Automatic sitemap.xml generation
The application SHALL generate a `sitemap.xml` at `/sitemap.xml` containing URLs for all pages with `status: PUBLISHED`, all published blog posts, and static routes.

#### Scenario: Sitemap includes published pages
- **WHEN** a crawler requests `/sitemap.xml`
- **THEN** the response SHALL be valid XML containing `<url>` entries for every published Page with `<loc>`, `<lastmod>`, and `<changefreq>`

#### Scenario: Draft pages excluded from sitemap
- **WHEN** a page has `status: DRAFT`
- **THEN** it SHALL NOT appear in `sitemap.xml`

#### Scenario: Blog posts in sitemap
- **WHEN** there are 5 published blog posts
- **THEN** the sitemap SHALL contain 5 `<url>` entries under `/blog/{slug}` paths

### Requirement: robots.txt
The application SHALL serve a `robots.txt` at `/robots.txt` that allows crawling of public pages and references the sitemap URL.

#### Scenario: robots.txt content
- **WHEN** a crawler requests `/robots.txt`
- **THEN** the response SHALL contain `User-agent: *`, `Allow: /`, `Disallow: /admin`, and `Sitemap: https://auratech.cat/sitemap.xml`

### Requirement: JSON-LD structured data
Pages SHALL include JSON-LD structured data in `<script type="application/ld+json">` tags. The home page SHALL include `Organization` schema. Blog posts SHALL include `Article` schema.

#### Scenario: Organization schema on home page
- **WHEN** the home page is rendered
- **THEN** the HTML SHALL contain a JSON-LD script with `@type: "Organization"`, `name: "Auratech"`, `url: "https://auratech.cat"`, and `logo`

#### Scenario: Article schema on blog post
- **WHEN** a blog post is rendered
- **THEN** the HTML SHALL contain a JSON-LD script with `@type: "Article"`, `headline`, `author`, `datePublished`, and `image`

### Requirement: Open Graph and Twitter Card meta tags
Every public page SHALL include Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) and Twitter Card (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) meta tags.

#### Scenario: OG tags on a page
- **WHEN** a page with title "Serveis IoT" and description "Connectem dispositius" is rendered
- **THEN** the HTML SHALL contain `<meta property="og:title" content="Serveis IoT">` and `<meta property="og:description" content="Connectem dispositius">`

#### Scenario: Twitter Card tags
- **WHEN** a page with an og:image is rendered
- **THEN** the HTML SHALL contain `<meta name="twitter:card" content="summary_large_image">` and `<meta name="twitter:image">` matching the og:image value
