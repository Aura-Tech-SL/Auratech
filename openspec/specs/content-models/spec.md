# Content Models

## Overview

Data models for all CMS-managed content in the Auratech website. These models define the persistence layer for pages, blog posts, services, projects, media assets, and page version history. All models use Prisma with PostgreSQL and follow consistent patterns for CRUD, slugs, status management, soft delete, and ordering.

## Tech Context

- **ORM**: Prisma 5.x with PostgreSQL
- **IDs**: cuid() generated strings
- **Timestamps**: `createdAt` (auto), `updatedAt` (auto), `publishedAt` (manual)
- **Slug Generation**: Based on title/name, URL-safe, auto-generated on create
- **Soft Delete**: `deletedAt` nullable timestamp field; queries exclude soft-deleted records by default
- **Validation**: Zod schemas for API input validation; Prisma handles DB constraints

---

## Models

### Page

Represents a CMS-managed page composed of content blocks.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| title           | String           | required, max 200 chars            |
| slug            | String           | @unique, URL-safe                  |
| description     | String?          | max 500 chars                      |
| metaTitle       | String?          | max 60 chars (SEO title)           |
| metaDescription | String?          | max 160 chars (SEO description)    |
| ogImage         | String?          | URL to Open Graph image            |
| status          | PageStatus       | DRAFT / PUBLISHED / ARCHIVED       |
| template        | String?          | optional layout template key       |
| blocks          | Block[]          | relation, ordered by `order`       |
| authorId        | String           | FK to User                         |
| publishedAt     | DateTime?        | set when first published           |
| deletedAt       | DateTime?        | soft delete timestamp              |
| createdAt       | DateTime         | @default(now())                    |
| updatedAt       | DateTime         | @updatedAt                         |

### BlogPost

Blog articles with block-based content.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| title           | String           | required, max 200 chars            |
| slug            | String           | @unique, URL-safe                  |
| excerpt         | String           | required, max 300 chars            |
| content         | Block[]          | relation, ordered by `order`       |
| coverImage      | String?          | URL to cover image                 |
| tags            | String[]         | array of tag strings               |
| category        | String?          | single category                    |
| authorId        | String           | FK to User                         |
| status          | ContentStatus    | DRAFT / PUBLISHED                  |
| readTime        | Int?             | estimated minutes, auto-calculated |
| publishedAt     | DateTime?        | set when published                 |
| deletedAt       | DateTime?        | soft delete timestamp              |
| createdAt       | DateTime         | @default(now())                    |
| updatedAt       | DateTime         | @updatedAt                         |

### Service

Services offered by Auratech.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| name            | String           | required, max 100 chars            |
| slug            | String           | @unique, URL-safe                  |
| description     | String           | required, max 500 chars            |
| icon            | String           | lucide icon name                   |
| features        | Json             | array of {title, description} pairs|
| order           | Int              | @default(0), for sorting           |
| isActive        | Boolean          | @default(true)                     |
| deletedAt       | DateTime?        | soft delete timestamp              |
| createdAt       | DateTime         | @default(now())                    |
| updatedAt       | DateTime         | @updatedAt                         |

### Project

Portfolio projects / case studies.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| name            | String           | required, max 200 chars            |
| slug            | String           | @unique, URL-safe                  |
| client          | String           | client company name                |
| category        | ProjectCategory  | IOT / CLOUD / STRATEGY             |
| description     | String           | required, short description        |
| longDescription | Block[]          | relation, block-based detail page  |
| technologies    | String[]         | array of tech names                |
| image           | String?          | main project image URL             |
| gallery         | String[]         | array of image URLs                |
| isActive        | Boolean          | @default(true)                     |
| order           | Int              | @default(0), for sorting           |
| deletedAt       | DateTime?        | soft delete timestamp              |
| createdAt       | DateTime         | @default(now())                    |
| updatedAt       | DateTime         | @updatedAt                         |

### Media

Uploaded media assets managed by the media library.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| url             | String           | required, full URL to asset        |
| filename        | String           | required, original filename        |
| alt             | String?          | accessibility alt text             |
| width           | Int?             | pixel width (images/video)         |
| height          | Int?             | pixel height (images/video)        |
| size            | Int              | file size in bytes                 |
| mimeType        | String           | e.g. "image/jpeg", "video/mp4"     |
| folder          | String?          | virtual folder path                |
| tags            | String[]         | organizational tags                |
| uploadedById    | String           | FK to User                         |
| deletedAt       | DateTime?        | soft delete timestamp              |
| createdAt       | DateTime         | @default(now())                    |

### PageVersion

Immutable snapshots of page state for version history.

| Field           | Type             | Constraints                        |
|-----------------|------------------|------------------------------------|
| id              | String           | @id, cuid()                        |
| pageId          | String           | FK to Page                         |
| data            | Json             | complete page + blocks snapshot    |
| version         | Int              | auto-incrementing per page         |
| createdById     | String           | FK to User                         |
| createdAt       | DateTime         | @default(now())                    |

---

## Enums

```
PageStatus: DRAFT | PUBLISHED | ARCHIVED
ContentStatus: DRAFT | PUBLISHED
ProjectCategory: IOT | CLOUD | STRATEGY
```

---

## Requirements

### REQ-CM-1: CRUD Operations

Each content model must support Create, Read, Update, and Delete operations through API route handlers with proper authorization.

#### Scenario: Creating a Page

- **WHEN** an authenticated admin sends a POST to `/api/pages` with `{ title: "Serveis IoT", description: "..." }`
- **THEN** a new Page record is created with a generated `id` (cuid)
- **AND** the `slug` is auto-generated from the title: "serveis-iot"
- **AND** the `status` defaults to DRAFT
- **AND** `authorId` is set to the authenticated user's ID
- **AND** `createdAt` and `updatedAt` are set to the current timestamp
- **AND** the response returns the created Page with status 201

#### Scenario: Reading a Page by slug

- **WHEN** a GET request is sent to `/api/pages/serveis-iot`
- **THEN** the Page matching slug "serveis-iot" is returned with its associated blocks ordered by `order`
- **AND** soft-deleted pages return 404

#### Scenario: Listing Pages with filtering

- **WHEN** a GET request is sent to `/api/pages?status=PUBLISHED&page=1&limit=10`
- **THEN** the response returns paginated published pages (excluding soft-deleted)
- **AND** the response includes `total`, `page`, `limit`, and `pages` (total page count)
- **AND** results are ordered by `updatedAt` descending by default

#### Scenario: Updating a Page

- **WHEN** an authenticated admin sends a PATCH to `/api/pages/[id]` with `{ title: "Serveis IoT Industrial" }`
- **THEN** the Page's title is updated
- **AND** the slug is NOT automatically regenerated (slugs are stable once created)
- **AND** `updatedAt` is refreshed
- **AND** the response returns the updated Page

#### Scenario: Deleting a Page (soft delete)

- **WHEN** an authenticated admin sends a DELETE to `/api/pages/[id]`
- **THEN** the Page's `deletedAt` is set to the current timestamp
- **AND** the page no longer appears in list queries
- **AND** the page's blocks are preserved (not deleted)
- **AND** the response returns status 204

#### Scenario: Creating a BlogPost

- **WHEN** an authenticated admin sends a POST to `/api/blog` with `{ title: "Novetats IoT 2026", excerpt: "..." }`
- **THEN** a new BlogPost is created with auto-generated slug "novetats-iot-2026"
- **AND** status defaults to DRAFT
- **AND** `readTime` is calculated based on content length (average 200 words/minute)

#### Scenario: Creating a Service

- **WHEN** an authenticated admin sends a POST to `/api/services` with `{ name: "Cloud Solutions", description: "...", icon: "cloud" }`
- **THEN** a new Service is created with auto-generated slug "cloud-solutions"
- **AND** `order` defaults to 0
- **AND** `isActive` defaults to true

#### Scenario: Creating a Project

- **WHEN** an authenticated admin sends a POST to `/api/projects` with `{ name: "Smart Grid Monitor", client: "Endesa", category: "IOT" }`
- **THEN** a new Project is created with auto-generated slug "smart-grid-monitor"
- **AND** `isActive` defaults to true

#### Scenario: Uploading a Media asset

- **WHEN** an authenticated admin sends a POST to `/api/media` with a multipart form containing a JPEG file
- **THEN** the file is uploaded to the configured storage (local or cloud)
- **AND** a Media record is created with `url`, `filename`, `mimeType`, `size`, `width`, `height` extracted from the file
- **AND** `uploadedById` is set to the authenticated user's ID

#### Scenario: Listing Media with folder filtering

- **WHEN** a GET request is sent to `/api/media?folder=projects&mimeType=image/*`
- **THEN** the response returns media assets in the "projects" folder with image MIME types
- **AND** results are ordered by `createdAt` descending
- **AND** soft-deleted media is excluded

#### Scenario: Unauthorized access

- **WHEN** an unauthenticated user sends a POST, PATCH, or DELETE to any content API
- **THEN** the response returns status 401 with `{ error: "Unauthorized" }`
- **AND** no data is modified

---

### REQ-CM-2: Slug Generation and Uniqueness

Slugs must be auto-generated from the title/name field, URL-safe, and unique within their model.

#### Scenario: Basic slug generation

- **WHEN** a Page is created with title "Solucions IoT per a la Industria"
- **THEN** the slug is generated as "solucions-iot-per-a-la-industria"
- **AND** all characters are lowercased
- **AND** spaces are replaced with hyphens
- **AND** accented characters are transliterated (e.g., "a" stays "a", "e" stays "e")
- **AND** special characters are removed

#### Scenario: Slug with Catalan special characters

- **WHEN** a BlogPost is created with title "L'energia del futur: com els ESL canvien tot"
- **THEN** the slug is generated as "lenergia-del-futur-com-els-esl-canvien-tot"
- **AND** apostrophes and colons are removed
- **AND** consecutive hyphens are collapsed to a single hyphen

#### Scenario: Duplicate slug resolution

- **WHEN** a Page is created with title "Serveis" and a page with slug "serveis" already exists
- **THEN** the new page's slug is set to "serveis-1"
- **AND** if "serveis-1" also exists, it becomes "serveis-2", and so on

#### Scenario: Slug uniqueness is per-model

- **WHEN** a Page with slug "cloud" exists and a Service is created with name "Cloud"
- **THEN** the Service's slug is set to "cloud" (no conflict because they are different models)

#### Scenario: Manual slug override

- **WHEN** an admin creates a Page with `{ title: "Our Services", slug: "serveis" }`
- **THEN** the provided slug "serveis" is used instead of auto-generating from the title
- **AND** the slug is still validated for URL-safety and uniqueness

#### Scenario: Slug validation format

- **WHEN** an admin provides a manual slug "Invalid Slug!!"
- **THEN** the API returns a validation error: "Slug must contain only lowercase letters, numbers, and hyphens"
- **AND** the record is not created

#### Scenario: Slug stability on update

- **WHEN** a Page with slug "serveis-iot" has its title updated to "Serveis IoT Avancats"
- **THEN** the slug remains "serveis-iot" (unchanged)
- **AND** the admin can explicitly update the slug if needed via a separate field

---

### REQ-CM-3: Status Transitions

Content with status fields must follow defined state transitions with side effects.

#### Scenario: Draft to Published (Page)

- **WHEN** an admin updates a DRAFT page's status to PUBLISHED
- **THEN** the status changes to PUBLISHED
- **AND** `publishedAt` is set to the current timestamp (if not already set)
- **AND** a new PageVersion snapshot is created
- **AND** the page becomes visible on the public website

#### Scenario: Published to Archived (Page)

- **WHEN** an admin updates a PUBLISHED page's status to ARCHIVED
- **THEN** the status changes to ARCHIVED
- **AND** the page is removed from the public website
- **AND** the page remains accessible in the admin panel for reference
- **AND** `publishedAt` is preserved (historical record)

#### Scenario: Archived to Draft (Page)

- **WHEN** an admin updates an ARCHIVED page's status to DRAFT
- **THEN** the status changes to DRAFT
- **AND** the page is editable again
- **AND** the page remains invisible on the public website until re-published

#### Scenario: Invalid transition

- **WHEN** an admin attempts to set a DRAFT page's status directly to ARCHIVED
- **THEN** the API returns a validation error: "Cannot archive a page that has never been published"
- **AND** the status remains DRAFT

#### Scenario: Draft to Published (BlogPost)

- **WHEN** an admin publishes a DRAFT blog post
- **THEN** the status changes to PUBLISHED
- **AND** `publishedAt` is set to the current timestamp
- **AND** `readTime` is recalculated based on final content
- **AND** the post appears in the public blog listing and RSS feed

#### Scenario: Published to Draft (BlogPost)

- **WHEN** an admin unpublishes a PUBLISHED blog post
- **THEN** the status changes to DRAFT
- **AND** the post is removed from the public blog listing
- **AND** `publishedAt` is preserved

#### Scenario: Bulk status change

- **WHEN** an admin selects multiple pages and changes their status to ARCHIVED
- **THEN** all selected pages that are in PUBLISHED status transition to ARCHIVED
- **AND** pages in DRAFT status are skipped with a warning: "N pages skipped (cannot archive unpublished pages)"
- **AND** the operation returns a summary of successes and skips

---

### REQ-CM-4: Soft Delete

All content models must support soft delete via a `deletedAt` timestamp field, preserving data for potential recovery.

#### Scenario: Soft deleting a Page

- **WHEN** an admin deletes a page
- **THEN** the page's `deletedAt` is set to the current timestamp
- **AND** the page no longer appears in standard list queries
- **AND** the page's blocks are not deleted
- **AND** the page's PageVersions are not deleted

#### Scenario: Soft deleting a published page

- **WHEN** an admin deletes a page that is currently PUBLISHED
- **THEN** the page is soft deleted
- **AND** the page is immediately removed from the public website
- **AND** public URL requests for the page's slug return 404

#### Scenario: Listing deleted items (trash)

- **WHEN** an admin navigates to the "Trash" section in the admin panel
- **THEN** all soft-deleted items are listed with their deletion date
- **AND** items are grouped by type (Pages, Blog Posts, Services, Projects, Media)
- **AND** each item shows a "Restore" and "Delete permanently" action

#### Scenario: Restoring a soft-deleted item

- **WHEN** an admin clicks "Restore" on a soft-deleted Page
- **THEN** the page's `deletedAt` is set to null
- **AND** the page reappears in the standard list with its previous status (DRAFT, not auto-published)
- **AND** a success toast appears: "Page restored"

#### Scenario: Permanent deletion

- **WHEN** an admin clicks "Delete permanently" on a soft-deleted Page
- **THEN** a confirmation dialog appears: "This action cannot be undone. The page and all its versions will be permanently deleted."
- **AND** upon confirmation, the Page record, all its Block records, and all its PageVersion records are hard-deleted from the database

#### Scenario: Auto-cleanup of old soft-deleted items

- **WHEN** a soft-deleted item has been in the trash for more than 30 days
- **THEN** a scheduled job permanently deletes the item
- **AND** the admin is not notified (this is background cleanup)

#### Scenario: Soft-deleted media handling

- **WHEN** a Media asset is soft-deleted
- **AND** it is referenced by an existing block (e.g., an image block's `src`)
- **THEN** the media file is not removed from storage until permanent deletion
- **AND** the block continues to render with the image (media remains accessible by URL)

---

### REQ-CM-5: Ordering and Sorting

Content items with an `order` field must support explicit ordering, and all list queries must support configurable sorting.

#### Scenario: Setting initial order for a Service

- **WHEN** a new Service is created without specifying an order
- **THEN** the `order` field defaults to 0

#### Scenario: Reordering Services

- **WHEN** an admin sends a PATCH to `/api/services/reorder` with `[{ id: "s1", order: 0 }, { id: "s2", order: 1 }, { id: "s3", order: 2 }]`
- **THEN** all specified services have their `order` fields updated in a single transaction
- **AND** the response confirms the new order

#### Scenario: Public listing respects order

- **WHEN** the public website requests the list of active services
- **THEN** services are returned sorted by `order` ascending
- **AND** only services with `isActive: true` and `deletedAt: null` are included

#### Scenario: Sorting blog posts by date

- **WHEN** the public blog page requests posts with `?sort=publishedAt&direction=desc`
- **THEN** published blog posts are returned newest-first based on `publishedAt`

#### Scenario: Sorting blog posts by read time

- **WHEN** an admin requests blog posts with `?sort=readTime&direction=asc`
- **THEN** posts are returned sorted by estimated read time, shortest first

#### Scenario: Default sort per model

- **WHEN** a list query does not specify a sort parameter
- **THEN** Pages sort by `updatedAt` descending
- **AND** BlogPosts sort by `publishedAt` descending (published) or `createdAt` descending (drafts)
- **AND** Services sort by `order` ascending
- **AND** Projects sort by `order` ascending
- **AND** Media sorts by `createdAt` descending

#### Scenario: Reordering Projects with drag-and-drop in admin

- **WHEN** an admin reorders projects via drag-and-drop in the admin list
- **THEN** the admin UI sends a batch reorder request with all new order values
- **AND** the operation completes in a single database transaction
- **AND** optimistic UI updates show the new order immediately

---

### REQ-CM-6: Media Attachment to Content

Media assets must be linkable to content models, and the system must track media usage.

#### Scenario: Attaching an image to a block

- **WHEN** an admin selects an image from the media library for an image block's `src` field
- **THEN** the block's data stores the media URL
- **AND** the media asset's usage is trackable (which blocks reference it)

#### Scenario: Attaching a cover image to a blog post

- **WHEN** an admin selects an image for a BlogPost's `coverImage` field
- **THEN** the blog post stores the media URL in the `coverImage` field
- **AND** the image is displayed on the blog listing page and the post detail page

#### Scenario: Uploading a new image during block editing

- **WHEN** an admin clicks "Upload" in a media picker field within a block editor
- **THEN** a file upload dialog opens
- **AND** after upload, a new Media record is created
- **AND** the uploaded image's URL is set as the field value

#### Scenario: Viewing media usage

- **WHEN** an admin views a Media asset's detail page
- **THEN** the page shows a list of all content items referencing this media (pages, blocks, blog posts, projects)
- **AND** each reference is clickable, linking to the content editor

#### Scenario: Preventing deletion of in-use media

- **WHEN** an admin attempts to delete a Media asset that is referenced by one or more blocks or content items
- **THEN** a warning appears: "This media is used in N places. Deleting it will break those references."
- **AND** the admin can choose to proceed (soft delete) or cancel

#### Scenario: Orphaned media detection

- **WHEN** an admin navigates to "Media > Unused" in the admin panel
- **THEN** the system lists all media assets not referenced by any block, page, blog post, or project
- **AND** the admin can bulk-select and delete orphaned media

#### Scenario: Image optimization on upload

- **WHEN** an image file is uploaded via the media API
- **THEN** the system stores the original file
- **AND** generates responsive variants (thumbnail 150px, small 400px, medium 800px, large 1200px) for images wider than those thresholds
- **AND** the Media record stores the original dimensions and file size
- **AND** block renderers use Next.js `<Image>` component with the appropriate variant via `srcSet`
