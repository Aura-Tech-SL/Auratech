## ADDED Requirements

### Requirement: Blog listing page with pagination
The blog listing page at `/blog` SHALL display a paginated list of published blog posts, ordered by publication date descending (newest first). Each page SHALL show a configurable number of posts (default: 9).

#### Scenario: First page of blog
- **WHEN** a visitor navigates to `/blog`
- **THEN** the page SHALL display up to 9 published posts ordered by `publishedAt` descending
- **AND** a pagination control SHALL appear if there are more than 9 posts

#### Scenario: Navigating to page 2
- **WHEN** a visitor navigates to `/blog?page=2`
- **THEN** the page SHALL display posts 10-18 (the second batch of 9)
- **AND** the pagination control SHALL indicate page 2 is active

#### Scenario: No published posts
- **WHEN** there are no posts with `status: PUBLISHED`
- **THEN** the page SHALL display a message: "Encara no hi ha articles publicats" (No articles published yet)

#### Scenario: Draft posts excluded
- **WHEN** 5 posts exist but 2 have `status: DRAFT`
- **THEN** only 3 published posts SHALL appear in the listing

### Requirement: Filter by category
The blog listing SHALL support filtering posts by category via URL parameter or UI selector.

#### Scenario: Filter by IOT category
- **WHEN** a visitor navigates to `/blog?category=IOT`
- **THEN** only posts with category `IOT` SHALL be displayed

#### Scenario: Filter shows empty state
- **WHEN** a visitor filters by a category with no published posts
- **THEN** the page SHALL display: "No hi ha articles en aquesta categoria" (No articles in this category)

#### Scenario: Filter preserves pagination
- **WHEN** a visitor navigates to `/blog?category=CLOUD&page=2`
- **THEN** the second page of CLOUD-category posts SHALL be displayed

### Requirement: Filter by tag
The blog listing SHALL support filtering posts by tag.

#### Scenario: Filter by tag
- **WHEN** a visitor navigates to `/blog?tag=kubernetes`
- **THEN** only posts tagged with "kubernetes" SHALL be displayed

#### Scenario: Combined category and tag filter
- **WHEN** a visitor navigates to `/blog?category=CLOUD&tag=kubernetes`
- **THEN** only posts matching both category CLOUD and tag "kubernetes" SHALL be displayed

### Requirement: Search by title and content
The blog listing SHALL support full-text search across post titles and content.

#### Scenario: Search matches title
- **WHEN** a visitor enters "IoT industrial" in the search field
- **THEN** posts whose title contains "IoT industrial" SHALL appear in the results

#### Scenario: Search matches content
- **WHEN** a visitor searches for "sensor de temperatura"
- **THEN** posts whose block content contains "sensor de temperatura" SHALL appear

#### Scenario: Search with no results
- **WHEN** a visitor searches for "xyznonexistent"
- **THEN** the page SHALL display: "No s'han trobat resultats per a 'xyznonexistent'" (No results found)

#### Scenario: Search combined with category
- **WHEN** a visitor searches for "cloud" while category filter is set to STRATEGY
- **THEN** only STRATEGY posts matching "cloud" SHALL appear

### Requirement: Blog post card display
Each post in the listing SHALL render as a card showing: title, excerpt (max 160 characters), cover image, publication date, estimated read time, and category badge.

#### Scenario: Card with all fields
- **WHEN** a post has title, excerpt, cover image, publishedAt, and category
- **THEN** the card SHALL display all five elements with the category as a colored badge

#### Scenario: Card without cover image
- **WHEN** a post has no cover image
- **THEN** the card SHALL display a placeholder image with the Auratech brand color

#### Scenario: Long excerpt truncated
- **WHEN** a post excerpt exceeds 160 characters
- **THEN** the card SHALL truncate it to 160 characters followed by "..."

#### Scenario: Read time displayed
- **WHEN** a post has an estimated read time of 5 minutes
- **THEN** the card SHALL display "5 min de lectura" (5 min read)

### Requirement: Blog post page rendering
A blog post at `/blog/[slug]` SHALL render the full post content using the same block rendering system as pages. Only posts with `status: PUBLISHED` and `publishedAt <= now` SHALL be visible.

#### Scenario: Published post renders
- **WHEN** a visitor navigates to `/blog/iot-per-a-industria` and the post is PUBLISHED with `publishedAt` in the past
- **THEN** the post SHALL render with its title, cover image, author info, date, and all blocks

#### Scenario: Future scheduled post returns 404
- **WHEN** a visitor navigates to `/blog/futur-post` and the post has `publishedAt` in the future
- **THEN** the server SHALL return 404

#### Scenario: Draft post returns 404
- **WHEN** a visitor navigates to `/blog/esborrany` and the post has `status: DRAFT`
- **THEN** the server SHALL return 404

### Requirement: Author info display
Each blog post SHALL display author information including name, avatar image, and optional bio.

#### Scenario: Author with avatar
- **WHEN** a post has an author with `name: "Marc Puig"` and an avatar image
- **THEN** the post SHALL display the author name with a circular avatar image

#### Scenario: Author without avatar
- **WHEN** a post author has no avatar
- **THEN** the post SHALL display initials in a colored circle (e.g., "MP" for "Marc Puig")

### Requirement: Tags as clickable links
Each post SHALL display its tags as clickable elements that link to the blog listing filtered by that tag.

#### Scenario: Tag links to filtered listing
- **WHEN** a post displays a tag "kubernetes"
- **THEN** clicking the tag SHALL navigate to `/blog?tag=kubernetes`

#### Scenario: Multiple tags displayed
- **WHEN** a post has tags ["kubernetes", "docker", "devops"]
- **THEN** all three tags SHALL be rendered as separate clickable badges

### Requirement: Related posts
Each blog post page SHALL display up to 3 related posts based on shared category and tags.

#### Scenario: Related posts by category
- **WHEN** a post has category IOT and there are 5 other IOT posts
- **THEN** the related posts section SHALL display up to 3 IOT posts, prioritizing those with shared tags

#### Scenario: No related posts
- **WHEN** a post is the only one in its category
- **THEN** the related posts section SHALL be hidden

#### Scenario: Related posts exclude current post
- **WHEN** related posts are calculated for post with id "abc"
- **THEN** post "abc" SHALL NOT appear in its own related posts

### Requirement: Share buttons
Each blog post SHALL include share buttons for Twitter, LinkedIn, and a copy-link button.

#### Scenario: Twitter share
- **WHEN** a visitor clicks the Twitter share button on a post titled "IoT Industrial"
- **THEN** a new window SHALL open with a Twitter intent URL containing the post title and URL

#### Scenario: LinkedIn share
- **WHEN** a visitor clicks the LinkedIn share button
- **THEN** a new window SHALL open with a LinkedIn share URL containing the post URL

#### Scenario: Copy link
- **WHEN** a visitor clicks the copy-link button
- **THEN** the post URL SHALL be copied to the clipboard and a "Enllaç copiat!" (Link copied!) toast SHALL appear

### Requirement: Estimated read time
The system SHALL calculate estimated read time based on the total word count across all text content in the post's blocks, using an average of 200 words per minute.

#### Scenario: Short article
- **WHEN** a post contains 400 words across its blocks
- **THEN** the estimated read time SHALL be "2 min de lectura"

#### Scenario: Long article
- **WHEN** a post contains 2000 words
- **THEN** the estimated read time SHALL be "10 min de lectura"

#### Scenario: Minimum read time
- **WHEN** a post contains 50 words
- **THEN** the estimated read time SHALL be "1 min de lectura" (minimum 1 minute)

### Requirement: Table of contents auto-generated from headings
Each blog post SHALL auto-generate a table of contents (TOC) from heading blocks (H2, H3) found in the post content.

#### Scenario: TOC generated from headings
- **WHEN** a post contains blocks with headings "Introducció" (H2), "Beneficis" (H2), "Escalabilitat" (H3)
- **THEN** a table of contents SHALL render with "Introducció" and "Beneficis" at the top level and "Escalabilitat" nested under "Beneficis"

#### Scenario: TOC links scroll to heading
- **WHEN** a visitor clicks a TOC entry for "Beneficis"
- **THEN** the page SHALL smooth-scroll to the "Beneficis" heading

#### Scenario: No headings, no TOC
- **WHEN** a post has no heading blocks
- **THEN** the table of contents section SHALL not be rendered

### Requirement: Blog categories
The system SHALL support the following fixed categories: IOT, CLOUD, STRATEGY, GENERAL. Each post SHALL belong to exactly one category.

#### Scenario: Post assigned to category
- **WHEN** an admin creates a post and selects category "CLOUD"
- **THEN** the post SHALL be stored with `category: "CLOUD"` and display a CLOUD badge on listing and detail pages

#### Scenario: Category archive page
- **WHEN** a visitor navigates to `/blog/categoria/iot`
- **THEN** the page SHALL display all published posts with category IOT, with the heading "Articles sobre IoT"

#### Scenario: Invalid category archive
- **WHEN** a visitor navigates to `/blog/categoria/nonexistent`
- **THEN** the server SHALL return 404

### Requirement: Tags with auto-suggest
Tags SHALL be free-form strings. The admin editor SHALL auto-suggest existing tags as the user types to encourage reuse and consistency.

#### Scenario: Auto-suggest existing tags
- **WHEN** an admin types "kub" in the tag input field and tags "kubernetes" and "kubelet" exist
- **THEN** a dropdown SHALL appear suggesting "kubernetes" and "kubelet"

#### Scenario: Create new tag
- **WHEN** an admin types "nouframework" and no matching tag exists
- **THEN** the admin SHALL be able to create "nouframework" as a new tag by pressing Enter

#### Scenario: Remove tag from post
- **WHEN** an admin clicks the X on a tag badge in the editor
- **THEN** the tag SHALL be removed from that post (but the tag itself remains available for other posts)

### Requirement: RSS feed
The application SHALL serve an RSS 2.0 feed at `/blog/feed.xml` containing all published blog posts.

#### Scenario: RSS feed content
- **WHEN** a reader requests `/blog/feed.xml`
- **THEN** the response SHALL be valid RSS 2.0 XML with `Content-Type: application/rss+xml`
- **AND** each `<item>` SHALL contain `<title>`, `<description>` (excerpt), `<link>`, `<pubDate>`, and `<guid>`

#### Scenario: RSS feed ordered by date
- **WHEN** 10 posts are published
- **THEN** the RSS items SHALL be ordered by `pubDate` descending (newest first)

#### Scenario: Draft posts excluded from RSS
- **WHEN** a post has `status: DRAFT`
- **THEN** it SHALL NOT appear in the RSS feed

#### Scenario: RSS feed metadata
- **WHEN** the RSS feed is requested
- **THEN** the `<channel>` SHALL contain `<title>Auratech Blog</title>`, `<link>https://auratech.cat/blog</link>`, and `<language>ca</language>`

### Requirement: Blog admin create and edit
Administrators SHALL create and edit blog posts using the block editor. Posts SHALL support `status` values: DRAFT, PUBLISHED, ARCHIVED.

#### Scenario: Create new draft post
- **WHEN** an admin creates a new post with title "Nou Article" and adds text blocks
- **THEN** the post SHALL be saved with `status: DRAFT` and SHALL NOT appear on the public blog

#### Scenario: Publish a draft
- **WHEN** an admin changes a post's status from DRAFT to PUBLISHED and sets `publishedAt` to now
- **THEN** the post SHALL appear on the public blog listing and its page SHALL be accessible

#### Scenario: Edit published post
- **WHEN** an admin edits the content of a published post
- **THEN** the changes SHALL be saved and the public page SHALL be revalidated

### Requirement: Schedule posts for future publication
Administrators SHALL be able to set a future `publishedAt` date. Posts with `status: PUBLISHED` and `publishedAt` in the future SHALL not be visible to the public until the scheduled time.

#### Scenario: Schedule a post
- **WHEN** an admin sets `publishedAt` to "2026-04-15 09:00" and status to PUBLISHED
- **THEN** the post SHALL NOT appear in the public listing until 2026-04-15 09:00

#### Scenario: Scheduled post becomes visible
- **WHEN** the current time passes the `publishedAt` timestamp
- **THEN** the post SHALL appear in the public blog listing and be accessible at its URL

### Requirement: Preview before publishing
Administrators SHALL be able to preview a draft post as it would appear on the public site without publishing it.

#### Scenario: Preview draft post
- **WHEN** an admin clicks "Previsualitzar" (Preview) on a draft post
- **THEN** a preview page SHALL render the post using the public layout and block rendering, with a banner indicating it is a preview

#### Scenario: Preview URL not public
- **WHEN** a non-authenticated visitor accesses a preview URL
- **THEN** the server SHALL return 404 or redirect to login
