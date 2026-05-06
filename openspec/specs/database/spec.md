# Database Spec

## Purpose

PostgreSQL database schema managed via Prisma ORM. Defines all data models, relationships, enums, and migration strategy for the Auratech CMS platform.

## Module

`prisma/schema.prisma`

## Requirements

### Requirement: User Model

Represents all platform users: admins, editors, and clients.

#### Scenario: User model fields

- **WHEN** the User model is defined
- **THEN** it has: id (cuid), email (unique), name, password (hashed), role (enum), phone, company, avatar, isActive (default true), createdAt, updatedAt
- **AND** role is one of: SUPERADMIN, ADMIN, EDITOR, CLIENT

#### Scenario: User relations

- **WHEN** a User exists
- **THEN** it has relations to: projects (many), invoices (many), sentMessages (many), receivedMessages (many), blogPosts (many as author), pageVersions (many as creator), media (many as uploader)

### Requirement: Page Model

CMS pages composed of blocks.

#### Scenario: Page model fields

- **WHEN** the Page model is defined
- **THEN** it has: id (cuid), title, slug (unique), description, metaTitle, metaDescription, ogImage, status (DRAFT/PUBLISHED/ARCHIVED), template (optional), createdAt, updatedAt, publishedAt (nullable), authorId
- **AND** default status is DRAFT

#### Scenario: Page relations

- **WHEN** a Page exists
- **THEN** it has relations to: blocks (many, ordered by `order`), versions (many), author (User)

### Requirement: Block Model

Individual content blocks within pages.

#### Scenario: Block model fields

- **WHEN** the Block model is defined
- **THEN** it has: id (cuid), type (string), order (integer), data (JSON), isVisible (default true), pageId, blogPostId (nullable)
- **AND** a block belongs to either a Page or a BlogPost (not both)

#### Scenario: Block ordering

- **WHEN** blocks are queried for a page
- **THEN** they are ordered by the `order` field ascending
- **AND** order values are sequential integers starting from 0

### Requirement: BlogPost Model

Blog articles with block-based content.

#### Scenario: BlogPost model fields

- **WHEN** the BlogPost model is defined
- **THEN** it has: id (cuid), title, slug (unique), excerpt, coverImage, tags (string[]), category (IOT/CLOUD/STRATEGY/GENERAL), status (DRAFT/PUBLISHED), readTime (integer, minutes), authorId, createdAt, updatedAt, publishedAt (nullable)

#### Scenario: BlogPost relations

- **WHEN** a BlogPost exists
- **THEN** it has relations to: blocks (many, ordered by `order`), author (User)

### Requirement: Service Model

Company service offerings displayed on the public website.

#### Scenario: Service model fields

- **WHEN** the Service model is defined
- **THEN** it has: id (cuid), name, slug (unique), description, icon (string - Lucide icon name), features (JSON array of {title, description}), order (integer), isActive (default true), createdAt, updatedAt

### Requirement: Project Model

Portfolio projects and client project tracking.

#### Scenario: Project model fields

- **WHEN** the Project model is defined
- **THEN** it has: id (cuid), name, slug (unique), client (string), category (IOT/CLOUD/STRATEGY), description, technologies (string[]), image, isActive (default true), order (integer), status (PENDING/IN_PROGRESS/REVIEW/COMPLETED), progress (integer 0-100), startDate, endDate (nullable), userId (nullable - assigned client), createdAt, updatedAt

#### Scenario: Project relations

- **WHEN** a Project exists
- **THEN** it has optional relation to: user (User - assigned client)

### Requirement: Media Model

Uploaded files and images.

#### Scenario: Media model fields

- **WHEN** the Media model is defined
- **THEN** it has: id (cuid), url, filename, alt (default ""), width (nullable), height (nullable), size (integer, bytes), mimeType, folder (default "/"), tags (string[]), uploadedById, createdAt

#### Scenario: Media relations

- **WHEN** a Media exists
- **THEN** it has relation to: uploadedBy (User)

### Requirement: PageVersion Model

Version history snapshots for pages.

#### Scenario: PageVersion model fields

- **WHEN** the PageVersion model is defined
- **THEN** it has: id (cuid), pageId, version (integer), data (JSON - full page snapshot including blocks), createdAt, createdById

#### Scenario: Version auto-increment

- **WHEN** a new version is created for a page
- **THEN** the version number is the previous max version + 1
- **AND** the data field contains a complete JSON snapshot of the page and all its blocks at that point in time

### Requirement: Invoice Model

Client billing records.

#### Scenario: Invoice model fields

- **WHEN** the Invoice model is defined
- **THEN** it has: id (cuid), number (unique, auto-generated), amount (Decimal), tax (Decimal), total (Decimal), status (PENDING/PAID/OVERDUE), items (JSON array of line items), dueDate, paidAt (nullable), userId, createdAt, updatedAt

### Requirement: Message Model

Internal messaging between clients and admins.

#### Scenario: Message model fields

- **WHEN** the Message model is defined
- **THEN** it has: id (cuid), content (text), isRead (default false), senderId, receiverId, createdAt

### Requirement: ContactSubmission Model

Public contact form entries.

#### Scenario: ContactSubmission model fields

- **WHEN** the ContactSubmission model is defined
- **THEN** it has: id (cuid), name, email, phone (nullable), subject, message (text), isRead (default false), createdAt

### Requirement: Enums

Database enums used across models.

#### Scenario: All enums defined

- **WHEN** the schema is compiled
- **THEN** the following enums exist:
- **AND** `Role`: SUPERADMIN, ADMIN, EDITOR, CLIENT
- **AND** `PageStatus`: DRAFT, PUBLISHED, ARCHIVED
- **AND** `PostStatus`: DRAFT, PUBLISHED
- **AND** `ProjectStatus`: PENDING, IN_PROGRESS, REVIEW, COMPLETED
- **AND** `ProjectCategory`: IOT, CLOUD, STRATEGY
- **AND** `InvoiceStatus`: PENDING, PAID, OVERDUE
- **AND** `BlogCategory`: IOT, CLOUD, STRATEGY, GENERAL

### Requirement: Locale field for multilingual content

Content models that serve public pages SHALL support a `locale` field for multilingual content.

#### Scenario: Locale field on Page model

- **WHEN** the Page model is defined
- **THEN** it SHALL have a `locale` field (String, default "ca")
- **AND** the unique constraint SHALL be `@@unique([slug, locale])` instead of `slug @unique`

#### Scenario: Locale field on BlogPost model

- **WHEN** the BlogPost model is defined
- **THEN** it SHALL have a `locale` field (String, default "ca")
- **AND** the unique constraint SHALL be `@@unique([slug, locale])` instead of `slug @unique`

#### Scenario: Locale field on Service model

- **WHEN** the Service model is defined
- **THEN** it SHALL have a `locale` field (String, default "ca")
- **AND** the unique constraint SHALL be `@@unique([slug, locale])` instead of `slug @unique`

#### Scenario: Locale field on Project model

- **WHEN** the Project model is defined
- **THEN** it SHALL have a `locale` field (String, default "ca")
- **AND** the unique constraint SHALL be `@@unique([slug, locale])` instead of `slug @unique`

#### Scenario: Locale fallback to Catalan

- **WHEN** a public page queries content for locale "en" and no record exists for that locale
- **THEN** the system SHALL fall back to the "ca" version of that content

#### Scenario: Existing data defaults to Catalan

- **WHEN** the migration runs on an existing database
- **THEN** all existing records SHALL have `locale` set to "ca"
- **AND** no data loss SHALL occur

### Requirement: Indexes and Performance

Database indexes for common query patterns.

#### Scenario: Required indexes

- **WHEN** the schema is deployed
- **THEN** unique indexes exist on: User.email, Page.slug, BlogPost.slug, Service.slug, Project.slug, Invoice.number
- **AND** composite indexes exist on: Block(pageId, order), Block(blogPostId, order)
- **AND** filtering indexes exist on: Page.status, BlogPost.status, BlogPost.category, Project.status, Project.category, Invoice.status, Media.folder, Media.mimeType

### Requirement: Soft Delete Pattern

Content is never hard-deleted from the database by default.

#### Scenario: Page soft delete

- **WHEN** an admin deletes a page
- **THEN** the page status is set to ARCHIVED (not removed from DB)
- **AND** the page no longer appears in public queries
- **AND** the page can be restored by changing status back to DRAFT

#### Scenario: Permanent delete

- **WHEN** a SUPERADMIN permanently deletes an archived page
- **THEN** the page and all its blocks and versions are cascade-deleted from the database
- **AND** a confirmation dialog warns this action is irreversible
