# Admin Dashboard Spec

## Purpose

Define the admin panel for the Auratech CMS, covering layout, navigation, and CRUD management for pages, blog posts, services, projects, media, and users.

## Requirements

### Requirement: Dashboard Layout

The admin panel SHALL use a persistent sidebar + top bar layout, accessible at `/admin/*`.

- **Sidebar** — collapsible, with navigation sections: Dashboard, Pages, Blog, Services, Projects, Media, Users, Settings. Each section highlights when active.
- **Top bar** — displays the logged-in user's name and role, a notification bell with unread count, and quick-action buttons (new page, new post).
- **Responsive** — sidebar collapses to an icon rail on tablet (< 1024px). Full sidebar hidden behind hamburger menu on narrower viewports.

#### Scenario: Sidebar reflects current route

- **WHEN** an admin navigates to `/admin/blog`
- **THEN** the "Blog" item in the sidebar SHALL be visually highlighted
- **AND** other items SHALL not be highlighted

#### Scenario: Sidebar collapses on tablet

- **WHEN** the viewport width is less than 1024px
- **THEN** the sidebar SHALL collapse to show only icons
- **AND** hovering or tapping an icon SHALL reveal the section label in a tooltip

#### Scenario: Top bar shows user info

- **WHEN** an admin is logged in
- **THEN** the top bar SHALL display the user's name, avatar (or initials), and role badge
- **AND** a dropdown menu SHALL provide links to "Profile" and "Logout"

#### Scenario: Notification bell shows unread count

- **WHEN** there are unread notifications (e.g., new contact form submissions)
- **THEN** the notification bell SHALL display a badge with the unread count
- **AND** clicking the bell SHALL open a dropdown listing recent notifications

### Requirement: Pages Management

Admins and editors SHALL manage website pages through a list view with full CRUD operations.

- **List view** — table with columns: Title, Slug, Status (draft/published/archived), Last Modified, Actions.
- **Status badges** — color-coded: green for published, yellow for draft, gray for archived.
- **Create** — form with fields: title (auto-generates slug), slug (editable), template selection dropdown (e.g., "Default", "Landing", "Service").
- **Edit** — opens the block editor for the selected page.
- **Preview** — renders the page as it would appear on the public site, in a new tab or iframe.
- **Publish/Unpublish/Archive** — status transition actions available from the list and edit views.
- **Duplicate** — creates a copy of the page with title suffixed " (Copy)" and status set to draft.

#### Scenario: Admin views page list

- **WHEN** an admin navigates to `/admin/pages`
- **THEN** the system SHALL display a table of all pages sorted by last modified date (newest first)
- **AND** each row SHALL show the title, slug, a color-coded status badge, and last modified timestamp

#### Scenario: Create a new page

- **WHEN** an admin clicks "New Page" and fills in the title "Our Services"
- **THEN** the slug field SHALL auto-populate with "our-services"
- **AND** the admin SHALL be able to select a template from a dropdown
- **AND WHEN** the admin submits the form
- **THEN** a new page SHALL be created with status "draft" and the admin SHALL be redirected to the block editor for that page

#### Scenario: Edit existing page

- **WHEN** an admin clicks "Edit" on a page row
- **THEN** the system SHALL navigate to `/admin/pages/[id]/edit`
- **AND** load the block editor with the page's existing blocks and metadata

#### Scenario: Preview page before publishing

- **WHEN** an admin clicks "Preview" on a draft page
- **THEN** the system SHALL open a new tab rendering the page at `/preview/[slug]?token=<preview-token>`
- **AND** the preview SHALL reflect the current saved state including unpublished changes

#### Scenario: Publish a draft page

- **WHEN** an admin clicks "Publish" on a page with status "draft"
- **THEN** the page status SHALL change to "published"
- **AND** the page SHALL become accessible on the public website at its slug
- **AND** the status badge SHALL update to green

#### Scenario: Unpublish a published page

- **WHEN** an admin clicks "Unpublish" on a published page
- **THEN** the page status SHALL change to "draft"
- **AND** the page SHALL no longer be accessible on the public website (returning 404)

#### Scenario: Archive a page

- **WHEN** an admin clicks "Archive" on a page
- **THEN** the page status SHALL change to "archived"
- **AND** the page SHALL not appear in the default page list (only visible with "Show archived" filter)

#### Scenario: Duplicate a page

- **WHEN** an admin clicks "Duplicate" on a page titled "About Us"
- **THEN** the system SHALL create a new page with title "About Us (Copy)", slug "about-us-copy", and status "draft"
- **AND** all blocks from the original page SHALL be copied to the new page

### Requirement: Blog Management

Admins and editors SHALL manage blog posts with filtering, categorization, and scheduled publishing.

- **List view** — table with filters for status (all/draft/published/scheduled), category, and date range.
- **Create/Edit** — form with: title, slug, excerpt, cover image upload, category selection, tags (comma-separated or autocomplete), and block editor for body content.
- **Cover image** — upload via file picker or drag-and-drop; preview thumbnail shown.
- **Categories** — managed via a separate sub-page (`/admin/blog/categories`); each post belongs to one category.
- **Tags** — free-form, with autocomplete from existing tags.
- **Scheduled publishing** — posts can have a future publish date; they become published automatically when the date is reached.

#### Scenario: Filter posts by status

- **WHEN** an admin selects "Published" from the status filter dropdown on the blog list
- **THEN** only posts with status "published" SHALL be displayed
- **AND** the URL SHALL update to include `?status=published` for bookmarkability

#### Scenario: Filter posts by category and date

- **WHEN** an admin selects category "IoT" and date range "2026-01-01 to 2026-03-28"
- **THEN** only posts in category "IoT" created within that date range SHALL be displayed

#### Scenario: Create a blog post with cover image

- **WHEN** an admin fills in the blog post form and uploads a cover image
- **THEN** the cover image SHALL be uploaded to the media library
- **AND** a thumbnail preview SHALL appear in the form
- **AND WHEN** the admin saves the post
- **THEN** the post SHALL be stored with a reference to the uploaded media item

#### Scenario: Schedule a post for future publishing

- **WHEN** an admin sets the publish date to a future date (e.g., 2026-04-15 09:00) and saves
- **THEN** the post status SHALL be set to "scheduled"
- **AND** the post SHALL NOT be visible on the public blog
- **AND WHEN** the scheduled date/time is reached
- **THEN** a cron job or server-side check SHALL change the status to "published"
- **AND** the post SHALL become visible on the public blog

#### Scenario: Manage tags with autocomplete

- **WHEN** an admin types "Ras" in the tags field
- **THEN** the system SHALL suggest existing tags matching the prefix (e.g., "Raspberry Pi")
- **AND** the admin SHALL be able to select a suggestion or create a new tag

### Requirement: Services and Projects Management

Admins SHALL manage services and projects with reordering support.

- **CRUD** — standard create, read, update, delete operations.
- **Drag-and-drop reordering** — items have a `sortOrder` field; drag-and-drop updates the order and persists via `PUT /api/services/reorder`.
- **Active/Inactive toggle** — each item has an `isActive` boolean; inactive items are hidden from the public site.
- **Rich editor** — descriptions use a rich text editor (simplified block editor or WYSIWYG).

#### Scenario: Reorder services via drag-and-drop

- **WHEN** an admin drags "IoT Solutions" from position 3 to position 1 in the services list
- **THEN** the UI SHALL reorder the items immediately (optimistic update)
- **AND** the system SHALL call `PUT /api/services/reorder` with the new order
- **AND** the public website SHALL reflect the new order

#### Scenario: Toggle service inactive

- **WHEN** an admin toggles "Web Development" to inactive
- **THEN** the service SHALL remain in the admin list with a visual "inactive" indicator
- **AND** the service SHALL NOT appear on the public services page

#### Scenario: Delete a project with confirmation

- **WHEN** an admin clicks "Delete" on a project
- **THEN** a confirmation dialog SHALL appear with the message "Are you sure you want to delete this project?"
- **AND WHEN** the admin confirms
- **THEN** the project SHALL be soft-deleted (or hard-deleted, based on config)
- **AND** the project SHALL be removed from the list

### Requirement: Media Library

All users with EDITOR+ role SHALL manage uploaded files through a media library interface.

- **Views** — toggle between grid view (thumbnails) and list view (table with filename, type, size, date).
- **Upload** — drag-and-drop zone or file picker; supports multiple files; shows upload progress.
- **Folders** — optional folder organization; files can be moved between folders.
- **Image preview** — clicking an image opens a lightbox with metadata (dimensions, size, upload date, usage count).
- **Bulk actions** — select multiple items to delete or move to a folder.

#### Scenario: Upload files via drag-and-drop

- **WHEN** an admin drags image files onto the media library drop zone
- **THEN** the system SHALL show upload progress for each file
- **AND** on completion, the new files SHALL appear in the grid/list

#### Scenario: Switch between grid and list view

- **WHEN** an admin clicks the "List" view toggle
- **THEN** the media library SHALL switch from thumbnail grid to a table view with columns: Filename, Type, Size, Uploaded Date
- **AND** the view preference SHALL persist across sessions (stored in localStorage)

#### Scenario: Preview image with metadata

- **WHEN** an admin clicks on an image thumbnail in the grid
- **THEN** a lightbox/modal SHALL open showing the full image
- **AND** metadata SHALL be displayed: dimensions, file size, upload date, and number of pages/posts using the image

#### Scenario: Bulk delete media items

- **WHEN** an admin selects 5 media items and clicks "Delete Selected"
- **THEN** a confirmation dialog SHALL appear listing the items to be deleted
- **AND WHEN** the admin confirms
- **THEN** all 5 items SHALL be deleted from storage and the database
- **AND** any pages referencing those images SHALL have their image references cleared or flagged

#### Scenario: Organize media into folders

- **WHEN** an admin creates a folder named "Blog Covers" and moves 3 images into it
- **THEN** the images SHALL appear under the "Blog Covers" folder in the sidebar/breadcrumb
- **AND** the images SHALL no longer appear in the root folder view

### Requirement: User Management

Admins SHALL manage user accounts, roles, and account status.

- **List view** — table with columns: Name, Email, Role (badge), Status (active/disabled), Last Login.
- **Create user** — form with: name, email, password, role selection.
- **Edit user** — update name, email, role. Password change is a separate action.
- **Disable/Enable** — toggle account active status; disabled users cannot log in.
- **Role constraints** — only SUPERADMIN can assign the SUPERADMIN role. ADMIN can create EDITOR and CLIENT users.

#### Scenario: Admin creates an editor user

- **WHEN** an admin fills in the user creation form with role "EDITOR" and submits
- **THEN** a new user SHALL be created with the specified details
- **AND** the password SHALL be stored as a bcrypt hash
- **AND** the new user SHALL appear in the user list with an "EDITOR" role badge

#### Scenario: Admin cannot assign SUPERADMIN role

- **WHEN** an admin with role `ADMIN` attempts to create or edit a user and selects role "SUPERADMIN"
- **THEN** the role dropdown SHALL NOT include "SUPERADMIN" as an option
- **AND** if the API receives a request to set role SUPERADMIN from a non-SUPERADMIN user, it SHALL return HTTP 403

#### Scenario: Disable a user account

- **WHEN** an admin toggles a user's status to "Disabled"
- **THEN** the user's `isActive` field SHALL be set to `false`
- **AND** if the user is currently logged in, their session SHALL be invalidated on the next request
- **AND** the user list SHALL show a "Disabled" status badge for that user

#### Scenario: View user last login

- **WHEN** an admin views the user list
- **THEN** each user row SHALL display the last login timestamp
- **AND** users who have never logged in SHALL show "Never" in the Last Login column
