# REST API Spec

## Purpose

Define the REST API endpoints, request/response formats, authentication, pagination, filtering, and validation standards for the Auratech CMS backend.

## Requirements

### Requirement: Standard Response Format

All API responses SHALL use a consistent JSON envelope:

```json
{
  "data": <object|array|null>,
  "error": <string|null>,
  "meta": <object|null>
}
```

- On success: `data` contains the result, `error` is `null`.
- On error: `data` is `null`, `error` contains a human-readable message.
- `meta` is included for paginated responses and is `null` otherwise.

#### Scenario: Successful single resource response

- **WHEN** a client sends `GET /api/pages/abc123`
- **THEN** the response SHALL have status 200
- **AND** the body SHALL be `{ "data": { "id": "abc123", ... }, "error": null, "meta": null }`

#### Scenario: Successful list response with pagination

- **WHEN** a client sends `GET /api/pages?page=2&limit=10`
- **THEN** the response SHALL have status 200
- **AND** `data` SHALL be an array of up to 10 page objects
- **AND** `meta` SHALL include `{ "page": 2, "limit": 10, "total": <n>, "pages": <ceil(n/10)> }`

#### Scenario: Error response format

- **WHEN** an API request fails (e.g., resource not found)
- **THEN** the response SHALL have the appropriate HTTP status (e.g., 404)
- **AND** the body SHALL be `{ "data": null, "error": "Page not found", "meta": null }`

### Requirement: Pagination

List endpoints SHALL support pagination via query parameters.

- `page` — page number, 1-indexed, defaults to 1.
- `limit` — items per page, defaults to 20, maximum 100.
- Response `meta` includes: `page`, `limit`, `total` (total item count), `pages` (total page count).

#### Scenario: Default pagination

- **WHEN** a client sends `GET /api/blog` without pagination params
- **THEN** the response SHALL return the first 20 posts
- **AND** `meta.page` SHALL be 1 and `meta.limit` SHALL be 20

#### Scenario: Custom pagination

- **WHEN** a client sends `GET /api/blog?page=3&limit=5`
- **THEN** the response SHALL return posts 11-15 (offset 10)
- **AND** `meta` SHALL reflect `{ "page": 3, "limit": 5, "total": <n>, "pages": <ceil(n/5)> }`

#### Scenario: Limit capped at maximum

- **WHEN** a client sends `GET /api/blog?limit=500`
- **THEN** the system SHALL cap the limit to 100
- **AND** `meta.limit` SHALL be 100

#### Scenario: Page beyond available data

- **WHEN** a client requests a page number beyond the total pages (e.g., page 999)
- **THEN** `data` SHALL be an empty array
- **AND** `meta` SHALL still reflect the correct `total` and `pages` values

### Requirement: Filtering and Sorting

List endpoints SHALL support filtering and sorting via query parameters.

- **Filtering** — field-specific: `?status=published`, `?category=iot`, `?isActive=true`.
- **Sorting** — `?sort=<field>&order=asc|desc`. Default sort: `createdAt` desc.
- Invalid filter fields SHALL be silently ignored. Invalid sort fields SHALL fall back to default.

#### Scenario: Filter by status

- **WHEN** a client sends `GET /api/pages?status=published`
- **THEN** the response SHALL include only pages with status "published"

#### Scenario: Filter by multiple fields

- **WHEN** a client sends `GET /api/blog?status=published&category=iot`
- **THEN** the response SHALL include only posts that are published AND in the "iot" category

#### Scenario: Sort by field ascending

- **WHEN** a client sends `GET /api/pages?sort=title&order=asc`
- **THEN** the response SHALL return pages sorted alphabetically by title in ascending order

#### Scenario: Invalid sort field falls back to default

- **WHEN** a client sends `GET /api/pages?sort=nonexistent`
- **THEN** the system SHALL ignore the invalid sort field and sort by `createdAt` descending

### Requirement: Input Validation with Zod

All API inputs (request bodies and query parameters) SHALL be validated using Zod schemas. Validation failures SHALL return HTTP 400 with field-level error details.

Error response format for validation failures:

```json
{
  "data": null,
  "error": "Validation failed",
  "meta": {
    "fieldErrors": {
      "title": "Title is required",
      "slug": "Slug must contain only lowercase letters, numbers, and hyphens"
    }
  }
}
```

#### Scenario: Valid input passes validation

- **WHEN** a client sends `POST /api/pages` with `{ "title": "About Us", "slug": "about-us", "templateId": "default" }`
- **THEN** validation SHALL pass and the page SHALL be created with status 201

#### Scenario: Missing required field

- **WHEN** a client sends `POST /api/pages` with `{ "slug": "about-us" }` (missing title)
- **THEN** the response SHALL have status 400
- **AND** `meta.fieldErrors.title` SHALL contain "Title is required"

#### Scenario: Invalid field format

- **WHEN** a client sends `POST /api/pages` with `{ "title": "About", "slug": "About Us!" }`
- **THEN** the response SHALL have status 400
- **AND** `meta.fieldErrors.slug` SHALL describe the format requirement

#### Scenario: Extra fields are stripped

- **WHEN** a client sends `POST /api/pages` with valid fields plus `{ "hackerField": "malicious" }`
- **THEN** the extra field SHALL be stripped by the Zod schema
- **AND** the page SHALL be created without the extra field

### Requirement: Authentication and Authorization on API Routes

All API routes (except explicitly public ones) SHALL require a valid JWT. Role-based access SHALL be enforced per endpoint.

- **Public routes** — `POST /api/contact`, `GET /api/pages` (public-facing page data).
- **Authenticated routes** — all others require a valid JWT.
- **Role-restricted routes** — user management requires ADMIN+, settings require SUPERADMIN.
- Unauthenticated requests return HTTP 401. Insufficient role returns HTTP 403.

#### Scenario: Authenticated request succeeds

- **WHEN** a client sends a request with a valid JWT to `GET /api/blog`
- **THEN** the system SHALL process the request and return blog data

#### Scenario: Unauthenticated request to protected route

- **WHEN** a client sends `POST /api/pages` without a JWT
- **THEN** the response SHALL have status 401
- **AND** `error` SHALL be "Authentication required"

#### Scenario: Insufficient role for endpoint

- **WHEN** a client with role `EDITOR` sends `DELETE /api/pages/abc123`
- **THEN** the response SHALL have status 403
- **AND** `error` SHALL be "Insufficient permissions"

#### Scenario: Public contact form works without auth

- **WHEN** an anonymous visitor sends `POST /api/contact` with valid form data
- **THEN** the response SHALL have status 201
- **AND** the submission SHALL be stored in the database

### Requirement: Pages API

Endpoints for managing website pages.

| Method | Path                              | Role      | Description                |
|--------|-----------------------------------|-----------|----------------------------|
| GET    | `/api/pages`                      | Public*   | List pages (public: published only; admin: all) |
| POST   | `/api/pages`                      | EDITOR+   | Create a new page          |
| GET    | `/api/pages/[id]`                 | Public*   | Get page by ID             |
| PUT    | `/api/pages/[id]`                 | EDITOR+   | Update page metadata       |
| DELETE | `/api/pages/[id]`                 | ADMIN+    | Delete a page              |
| GET    | `/api/pages/[id]/blocks`          | EDITOR+   | Get page blocks            |
| POST   | `/api/pages/[id]/blocks`          | EDITOR+   | Save/replace page blocks   |
| PUT    | `/api/pages/[id]/publish`         | ADMIN+    | Publish a page             |
| POST   | `/api/pages/[id]/revert/[versionId]` | ADMIN+ | Revert page to a version   |

*Public GET returns only published pages; authenticated requests with EDITOR+ return all statuses.

#### Scenario: Public user gets only published pages

- **WHEN** an unauthenticated client sends `GET /api/pages`
- **THEN** the response SHALL contain only pages with status "published"
- **AND** draft and archived pages SHALL NOT be included

#### Scenario: Admin gets all pages including drafts

- **WHEN** an authenticated ADMIN sends `GET /api/pages`
- **THEN** the response SHALL contain pages of all statuses (draft, published, archived)

#### Scenario: Create a page

- **WHEN** an EDITOR sends `POST /api/pages` with `{ "title": "FAQ", "slug": "faq", "templateId": "default" }`
- **THEN** a new page SHALL be created with status "draft"
- **AND** the response SHALL have status 201 with the created page in `data`

#### Scenario: Publish a page

- **WHEN** an ADMIN sends `PUT /api/pages/abc123/publish`
- **THEN** the page status SHALL change to "published"
- **AND** a version snapshot SHALL be created for the page's current state

#### Scenario: Revert page to a previous version

- **WHEN** an ADMIN sends `POST /api/pages/abc123/revert/v5`
- **THEN** the page's blocks and metadata SHALL be restored to the state captured in version v5
- **AND** a new version SHALL be created representing the reverted state

#### Scenario: Editor cannot delete a page

- **WHEN** an EDITOR sends `DELETE /api/pages/abc123`
- **THEN** the response SHALL have status 403
- **AND** the page SHALL NOT be deleted

### Requirement: Blog API

Endpoints for managing blog posts.

| Method | Path               | Role    | Description              |
|--------|--------------------|---------|--------------------------|
| GET    | `/api/blog`        | Public* | List posts               |
| POST   | `/api/blog`        | EDITOR+ | Create a post            |
| GET    | `/api/blog/[id]`   | Public* | Get post by ID or slug   |
| PUT    | `/api/blog/[id]`   | EDITOR+ | Update a post            |
| DELETE | `/api/blog/[id]`   | ADMIN+  | Delete a post            |

#### Scenario: List published blog posts publicly

- **WHEN** an unauthenticated client sends `GET /api/blog`
- **THEN** the response SHALL contain only published posts, ordered by publish date descending

#### Scenario: Filter blog posts by category

- **WHEN** a client sends `GET /api/blog?category=iot`
- **THEN** the response SHALL contain only posts in the "iot" category

#### Scenario: Create a blog post

- **WHEN** an EDITOR sends `POST /api/blog` with valid post data including title, slug, content blocks, and categoryId
- **THEN** the post SHALL be created with status "draft"
- **AND** the response SHALL have status 201

#### Scenario: Update a blog post

- **WHEN** an EDITOR sends `PUT /api/blog/post123` with updated title and content
- **THEN** the post SHALL be updated
- **AND** the `updatedAt` timestamp SHALL reflect the current time

### Requirement: Services API

Endpoints for managing services.

| Method | Path                    | Role   | Description              |
|--------|-------------------------|--------|--------------------------|
| GET    | `/api/services`         | Public | List active services     |
| POST   | `/api/services`         | ADMIN+ | Create a service         |
| GET    | `/api/services/[id]`    | Public | Get service by ID        |
| PUT    | `/api/services/[id]`    | ADMIN+ | Update a service         |
| DELETE | `/api/services/[id]`    | ADMIN+ | Delete a service         |
| PUT    | `/api/services/reorder` | ADMIN+ | Bulk reorder services    |

#### Scenario: Public sees only active services

- **WHEN** an unauthenticated client sends `GET /api/services`
- **THEN** the response SHALL contain only services with `isActive: true`, ordered by `sortOrder`

#### Scenario: Reorder services

- **WHEN** an ADMIN sends `PUT /api/services/reorder` with `{ "order": ["svc3", "svc1", "svc2"] }`
- **THEN** the `sortOrder` of each service SHALL be updated to match the new order
- **AND** subsequent `GET /api/services` SHALL reflect the new ordering

#### Scenario: Non-admin cannot create service

- **WHEN** an EDITOR sends `POST /api/services` with service data
- **THEN** the response SHALL have status 403

### Requirement: Projects API

Endpoints for managing projects.

| Method | Path                  | Role    | Description              |
|--------|-----------------------|---------|--------------------------|
| GET    | `/api/projects`       | Public* | List projects            |
| POST   | `/api/projects`       | ADMIN+  | Create a project         |
| GET    | `/api/projects/[id]`  | Public* | Get project by ID        |
| PUT    | `/api/projects/[id]`  | ADMIN+  | Update a project         |
| DELETE | `/api/projects/[id]`  | ADMIN+  | Delete a project         |

*Public GET returns only active/published projects. CLIENT role returns only their assigned projects.

#### Scenario: Client sees only own projects

- **WHEN** a CLIENT sends `GET /api/projects`
- **THEN** the response SHALL contain only projects where `clientId` matches the authenticated user's ID

#### Scenario: Public sees only published projects

- **WHEN** an unauthenticated client sends `GET /api/projects`
- **THEN** the response SHALL contain only projects with `isActive: true`

### Requirement: Media API

Endpoints for file upload and media management.

| Method | Path               | Role    | Description              |
|--------|--------------------|---------|--------------------------|
| POST   | `/api/media/upload`| EDITOR+ | Upload file(s)           |
| GET    | `/api/media`       | EDITOR+ | List media with pagination |
| GET    | `/api/media/[id]`  | EDITOR+ | Get media item details   |
| DELETE | `/api/media/[id]`  | ADMIN+  | Delete media item        |

- Upload uses `multipart/form-data`.
- Maximum file size: 10MB.
- Accepted file types: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `application/pdf`.

#### Scenario: Upload a valid image

- **WHEN** an EDITOR sends `POST /api/media/upload` with a 2MB JPEG file via multipart/form-data
- **THEN** the file SHALL be stored (local disk or cloud storage)
- **AND** a media record SHALL be created in the database with filename, mimeType, size, and URL
- **AND** the response SHALL have status 201 with the media record in `data`

#### Scenario: Upload rejected for exceeding size limit

- **WHEN** a client sends `POST /api/media/upload` with a 15MB file
- **THEN** the response SHALL have status 400
- **AND** `error` SHALL be "File exceeds maximum size of 10MB"

#### Scenario: Upload rejected for disallowed file type

- **WHEN** a client sends `POST /api/media/upload` with a `.exe` file
- **THEN** the response SHALL have status 400
- **AND** `error` SHALL be "File type not allowed"

#### Scenario: Delete media item

- **WHEN** an ADMIN sends `DELETE /api/media/img123`
- **THEN** the file SHALL be removed from storage
- **AND** the database record SHALL be deleted
- **AND** the response SHALL have status 200

#### Scenario: Editor cannot delete media

- **WHEN** an EDITOR sends `DELETE /api/media/img123`
- **THEN** the response SHALL have status 403

### Requirement: Users API

Endpoints for user management (admin only).

| Method | Path              | Role   | Description              |
|--------|-------------------|--------|--------------------------|
| GET    | `/api/users`      | ADMIN+ | List all users           |
| POST   | `/api/users`      | ADMIN+ | Create a user            |
| GET    | `/api/users/[id]` | ADMIN+ | Get user details         |
| PUT    | `/api/users/[id]` | ADMIN+ | Update a user            |

#### Scenario: List users with role badges

- **WHEN** an ADMIN sends `GET /api/users`
- **THEN** the response SHALL contain all users with their `id`, `name`, `email`, `role`, `isActive`, and `lastLoginAt`

#### Scenario: Create a user

- **WHEN** an ADMIN sends `POST /api/users` with `{ "name": "Joan", "email": "joan@auratech.cat", "password": "securePass1!", "role": "EDITOR" }`
- **THEN** a new user SHALL be created with the password bcrypt-hashed
- **AND** the response SHALL have status 201
- **AND** the response `data` SHALL NOT include the password or hash

#### Scenario: Non-admin cannot access users API

- **WHEN** an EDITOR sends `GET /api/users`
- **THEN** the response SHALL have status 403

### Requirement: Contact Form API

Public endpoint for website visitors to submit contact inquiries.

| Method | Path           | Role       | Description                |
|--------|----------------|------------|----------------------------|
| POST   | `/api/contact` | Public     | Submit contact form        |
| GET    | `/api/contact` | ADMIN+     | List contact submissions   |

- Required fields: `name`, `email`, `message`.
- Optional fields: `phone`, `company`, `subject`.
- Rate limiting: maximum 5 submissions per IP per hour.

#### Scenario: Submit a valid contact form

- **WHEN** a visitor sends `POST /api/contact` with `{ "name": "Maria", "email": "maria@example.com", "message": "I need a quote for a web project" }`
- **THEN** the submission SHALL be stored in the database
- **AND** a notification email SHALL be sent to the configured admin email
- **AND** the response SHALL have status 201 with `{ "data": { "message": "Thank you, we will get back to you soon" }, "error": null, "meta": null }`

#### Scenario: Contact form validation failure

- **WHEN** a visitor sends `POST /api/contact` with `{ "name": "", "email": "not-an-email" }`
- **THEN** the response SHALL have status 400
- **AND** `meta.fieldErrors` SHALL include errors for `name`, `email`, and `message`

#### Scenario: Rate limiting on contact form

- **WHEN** a visitor from the same IP submits more than 5 contact forms within 1 hour
- **THEN** the 6th request SHALL return status 429
- **AND** `error` SHALL be "Too many requests. Please try again later."

#### Scenario: Admin lists contact submissions

- **WHEN** an ADMIN sends `GET /api/contact?page=1&limit=20`
- **THEN** the response SHALL contain paginated contact submissions ordered by date descending
- **AND** each submission SHALL include `name`, `email`, `message`, `createdAt`, and `isRead` status

### Requirement: File Upload Standards

File uploads across all endpoints SHALL follow consistent standards.

- Content type: `multipart/form-data`.
- Max file size: 10MB (configurable via environment variable `MAX_UPLOAD_SIZE_MB`).
- Accepted MIME types: configurable, defaults to images and PDFs.
- Files SHALL be stored with a unique generated filename to prevent collisions.
- Original filename SHALL be preserved in the database record.

#### Scenario: Unique filename generation

- **WHEN** two users upload files both named "logo.png"
- **THEN** each file SHALL be stored with a unique filename (e.g., UUID-based)
- **AND** both database records SHALL preserve "logo.png" as the `originalFilename`

#### Scenario: Concurrent upload handling

- **WHEN** multiple files are uploaded in a single request
- **THEN** all files SHALL be processed
- **AND** the response `data` SHALL be an array of media records, one per uploaded file
