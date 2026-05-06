## ADDED Requirements

### Requirement: Resource ownership enforcement (IDOR prevention)

API routes that expose resources owned by individual users SHALL verify that the
requesting user owns the resource (or has an admin role) before returning, modifying
or deleting it. Authentication alone is NOT sufficient — authorisation against the
specific resource is required.

The check uses the helper `ownsResource(resourceOwnerId, session)` from
`src/lib/authz.ts`:

- Returns `true` if `session.user.role` is `SUPERADMIN` or `ADMIN`.
- Returns `true` if `resourceOwnerId === session.user.id`.
- Otherwise returns `false`.

Endpoints that MUST apply this check:

- `GET /api/projects/[id]` — owner is `Project.userId`.
- `PUT /api/projects/[id]` — owner is `Project.userId`.
- `DELETE /api/media/[id]` — owner is `Media.uploadedById`.
- `GET /api/missatges` — list is filtered to messages where the session user is
  either `senderId` or `receiverId` (admins see all).

Failed ownership checks SHALL return HTTP 403 with body `{ error: "Insufficient
permissions" }`.

#### Scenario: Client attempts to read another client's project

- **WHEN** a CLIENT user with id `client-A-id` sends `GET /api/projects/<id-of-
  client-B-project>`
- **THEN** the response SHALL have status 403
- **AND** the body SHALL be `{ error: "Insufficient permissions" }`
- **AND** no project data SHALL be leaked in the response

#### Scenario: Admin can read any project

- **WHEN** a SUPERADMIN or ADMIN user sends `GET /api/projects/<any-project-id>`
- **THEN** the response SHALL have status 200
- **AND** the project data SHALL be returned

#### Scenario: Owner can read their own project

- **WHEN** a CLIENT user with id `client-A-id` sends `GET /api/projects/<id-of-
  client-A-project>`
- **THEN** the response SHALL have status 200
- **AND** the project data SHALL be returned

#### Scenario: Client cannot delete media uploaded by another user

- **WHEN** a CLIENT user with id `client-A-id` sends `DELETE /api/media/<id-of-
  media-uploaded-by-client-B>`
- **THEN** the response SHALL have status 403
- **AND** the media file and database record SHALL remain intact

#### Scenario: Messages list is scoped to participants

- **WHEN** a CLIENT user sends `GET /api/missatges`
- **THEN** the response SHALL contain only messages where the user is the sender
  or the recipient
- **AND** the response SHALL NOT contain messages between two other users

### Requirement: Complete Zod validation coverage on write endpoints

Every API endpoint that accepts a JSON body for creation or modification SHALL
validate the body against a Zod schema before any database operation. Endpoints
that pass `body` directly into `prisma.create({ data: body })` or similar are
prohibited.

This requirement applies to all POST, PUT and PATCH endpoints under `/api/`
(except `/api/auth/*` which is owned by NextAuth).

#### Scenario: Endpoint with missing required field rejected

- **WHEN** a client sends `POST /api/missatges` with body `{ content: "hello" }`
  (missing `receiverId`)
- **THEN** the response SHALL have status 400
- **AND** the body SHALL describe the validation error

#### Scenario: Endpoint with extra unexpected fields rejected or stripped

- **WHEN** a client sends `POST /api/missatges` with body containing a `senderId`
  field (an attempt to impersonate another sender)
- **THEN** the validated body SHALL NOT include `senderId`
- **AND** the actual sender SHALL be set from `session.user.id` server-side

### Requirement: File upload MIME validation with magic bytes

The `POST /api/media/upload` endpoint SHALL validate uploaded files against an
allowlist of MIME types AND verify the actual file content with magic-byte
detection (not just the client-supplied `Content-Type` header).

- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif`,
  `application/pdf`, `video/mp4`, `video/webm`.
- `image/svg+xml` is NOT in the allowlist (XML payload can contain scripts).
- Magic bytes are read from the first 4 KB of the file using the `file-type`
  npm package.
- If the detected type does NOT match the client-declared `Content-Type` OR the
  detected type is not in the allowlist, the upload SHALL be rejected.

#### Scenario: Valid JPEG accepted

- **WHEN** a SUPERADMIN uploads a 2 MB JPEG file declared as `image/jpeg`
- **AND** magic bytes confirm JPEG (`FF D8 FF`)
- **THEN** the upload SHALL succeed

#### Scenario: Mislabelled executable rejected

- **WHEN** a user uploads `shell.php` declared as `image/jpeg`
- **AND** magic bytes do NOT match any allowed type
- **THEN** the response SHALL have status 400
- **AND** the body SHALL be `{ error: "Tipus de fitxer no acceptat" }`

#### Scenario: SVG rejected by default

- **WHEN** a user uploads a file declared as `image/svg+xml`
- **THEN** the upload SHALL be rejected (SVG is not in the default allowlist)

#### Scenario: Upload restricted to admin roles

- **WHEN** a CLIENT user attempts `POST /api/media/upload`
- **THEN** the response SHALL have status 403
- **AND** the file SHALL NOT be persisted
