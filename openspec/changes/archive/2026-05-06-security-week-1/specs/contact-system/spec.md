## ADDED Requirements

### Requirement: Internal notes on submissions

`ContactSubmission` SHALL include an optional `notes` field (plain text, up to 5000
characters) for internal annotations by admins. The field SHALL be:

- Visible only to authenticated admins (NEVER returned in any public endpoint).
- Editable from the admin UI at `/admin/contacte/[id]`.
- Optional — submissions created by visitors via the public form SHALL have
  `notes = null` initially.
- Plain text — no markdown, HTML or rich text. Newlines preserved on render.

#### Scenario: Admin saves note on submission

- **WHEN** an ADMIN opens a submission and adds the note "Trucat el 7-maig, esperant
  resposta"
- **AND** clicks save
- **THEN** the submission's `notes` field SHALL be updated in the database
- **AND** the next time any admin opens the submission, the note SHALL be visible

#### Scenario: Notes never exposed in public API

- **WHEN** any unauthenticated request is made to any public endpoint that touches
  `ContactSubmission` data
- **THEN** the response SHALL NOT contain a `notes` field

### Requirement: Admin contact-submissions API

The admin panel SHALL be backed by three dedicated API endpoints under `/api/admin/
contact-submissions`. All endpoints REQUIRE the requester to have role
`SUPERADMIN` or `ADMIN`.

| Method | Path                                       | Purpose                          |
|--------|--------------------------------------------|----------------------------------|
| GET    | `/api/admin/contact-submissions`           | List, paginated, filterable      |
| PATCH  | `/api/admin/contact-submissions/[id]`      | Update `isRead` and/or `notes`   |
| DELETE | `/api/admin/contact-submissions/[id]`      | Delete a submission              |

`GET` query parameters:

- `page` (default 1)
- `limit` (default 20, max 100)
- `isRead` (boolean) — filter unread vs read.
- `q` (string) — substring search across `name`, `email`, `subject`, `message`.

Response shape: `{ data: ContactSubmission[], pagination: { page, limit, total,
totalPages } }`.

#### Scenario: List returns most recent first

- **WHEN** an ADMIN sends `GET /api/admin/contact-submissions`
- **THEN** the response SHALL contain submissions ordered by `createdAt` descending
- **AND** the first page SHALL contain the 20 most recent submissions

#### Scenario: Filter by unread

- **WHEN** an ADMIN sends `GET /api/admin/contact-submissions?isRead=false`
- **THEN** the response SHALL contain only submissions where `isRead === false`

#### Scenario: Mark submission as read

- **WHEN** an ADMIN sends `PATCH /api/admin/contact-submissions/<id>` with body
  `{ "isRead": true }`
- **THEN** the submission SHALL be updated
- **AND** the response SHALL contain the updated submission

#### Scenario: Update notes

- **WHEN** an ADMIN sends `PATCH /api/admin/contact-submissions/<id>` with body
  `{ "notes": "Lead qualificat — derivat a Sandra" }`
- **THEN** the `notes` field SHALL be saved
- **AND** the response SHALL contain the updated submission with the new note

#### Scenario: Delete submission

- **WHEN** an ADMIN sends `DELETE /api/admin/contact-submissions/<id>`
- **THEN** the submission SHALL be permanently removed from the database
- **AND** the response SHALL have status 200 with `{ success: true }`

#### Scenario: Non-admin cannot access

- **WHEN** a CLIENT or EDITOR user sends any request to `/api/admin/contact-
  submissions/*`
- **THEN** the response SHALL have status 403

### Requirement: Admin UI for submissions

The admin sidebar SHALL include a "Contacte" entry with a `Mail` icon that links to
`/admin/contacte`. The entry SHALL display a small badge with the count of unread
submissions when greater than zero.

The list page (`/admin/contacte`) SHALL show a table with columns: name, email,
subject, date, read/unread indicator, action buttons.

The detail page (`/admin/contacte/[id]`) SHALL show full submission content (all
fields, formatted for readability), an editable notes textarea with a save button,
and actions to mark as read/unread or delete (with confirmation).

#### Scenario: Sidebar shows unread count

- **WHEN** there are 3 unread submissions in the database
- **AND** an admin renders any page under `/admin/*`
- **THEN** the sidebar "Contacte" entry SHALL show a badge with "3"

#### Scenario: Detail view marks as read

- **WHEN** an admin clicks an unread submission in the list
- **THEN** the detail page SHALL load
- **AND** the submission SHALL be marked `isRead: true` automatically (no extra
  click required)
- **AND** the sidebar badge count SHALL decrement

#### Scenario: Delete requires confirmation

- **WHEN** an admin clicks the delete button on a submission
- **THEN** a confirmation dialog SHALL appear with text "Segur que vols
  eliminar aquest missatge?"
- **AND** only after explicit confirmation SHALL the deletion proceed
