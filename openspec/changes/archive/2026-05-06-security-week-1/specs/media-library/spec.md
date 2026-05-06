## MODIFIED Requirements

### Requirement: Accepted file types and size limits

The system SHALL validate file type, size AND **actual file content (magic bytes)**
before upload. Accepted MIME types are: images (jpg, jpeg, png, webp, gif),
documents (pdf), videos (mp4, webm). **Note: SVG is no longer in the default
allowlist** because its XML payload can carry executable scripts.

Max size: 10 MB for images and documents, 50 MB for videos.

Validation order:

1. Reject if `file.size` exceeds the relevant limit.
2. Reject if the client-declared `Content-Type` is not in the allowlist.
3. Read the first 4 KB of the file and call `fileTypeFromBuffer()` from the
   `file-type` npm package.
4. Reject if the detected MIME does NOT match the declared type, or if the
   detected MIME is not in the allowlist.

#### Scenario: Valid image upload

- **WHEN** an admin uploads a 3 MB PNG file
- **AND** magic bytes confirm PNG (`89 50 4E 47`)
- **THEN** the file SHALL be accepted and uploaded successfully

#### Scenario: Oversized image rejected

- **WHEN** an admin uploads a 15 MB JPEG file
- **THEN** the upload SHALL be rejected with message: "El fitxer supera la mida
  màxima de 10MB"

#### Scenario: Invalid MIME rejected

- **WHEN** an admin uploads a `.exe` file (declared `application/octet-stream`)
- **THEN** the upload SHALL be rejected with message: "Tipus de fitxer no acceptat.
  Tipus permesos: jpg, png, webp, gif, pdf, mp4, webm"

#### Scenario: SVG rejected (security regression of prior spec)

- **WHEN** an admin uploads a file declared as `image/svg+xml`
- **THEN** the upload SHALL be rejected with the same generic message as other
  unsupported types
- **NOTE**: prior versions of this spec accepted SVG. This was reverted because
  SVG can contain `<script>` tags that execute when rendered inline.

#### Scenario: MIME-spoofed file rejected (NEW)

- **WHEN** an admin uploads a file with name `cute-cat.jpg` and Content-Type
  `image/jpeg`
- **AND** the actual content is a PHP script (magic bytes do NOT match `FF D8 FF`)
- **THEN** the upload SHALL be rejected with message: "El contingut del fitxer no
  coincideix amb el tipus declarat"
- **AND** the file SHALL NOT be persisted to disk

#### Scenario: Valid video upload

- **WHEN** an admin uploads a 40 MB MP4 file
- **THEN** the file SHALL be accepted (under 50 MB video limit) and uploaded
  successfully

### Requirement: Upload restricted to admin roles

The `POST /api/media/upload` endpoint SHALL be restricted to users with role
`SUPERADMIN`, `ADMIN` or `EDITOR`. CLIENT users SHALL NOT be able to upload media.

(Rationale: clients have no UI surface that requires media upload today. EDITOR
keeps access because they author blog posts and CMS pages and need to upload
images.)

#### Scenario: CLIENT cannot upload

- **WHEN** a CLIENT user sends `POST /api/media/upload`
- **THEN** the response SHALL have status 403
- **AND** no file SHALL be persisted

#### Scenario: EDITOR can upload

- **WHEN** an EDITOR user sends `POST /api/media/upload` with a valid image
- **THEN** the upload SHALL succeed
