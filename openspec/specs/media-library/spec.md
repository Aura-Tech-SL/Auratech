## ADDED Requirements

### Requirement: Drag-and-drop upload zone
The media library SHALL provide a drag-and-drop upload zone where administrators can drop files to upload them. The zone SHALL also include a clickable "Selecciona fitxers" (Select files) button as an alternative.

#### Scenario: Drop files to upload
- **WHEN** an admin drags and drops 3 image files onto the upload zone
- **THEN** all 3 files SHALL begin uploading simultaneously with individual progress indicators

#### Scenario: Drop zone visual feedback
- **WHEN** an admin drags files over the upload zone
- **THEN** the zone SHALL visually highlight (border color change, background overlay) to indicate it is ready to receive files

#### Scenario: Click to select files
- **WHEN** an admin clicks the "Selecciona fitxers" button
- **THEN** a native file picker dialog SHALL open allowing single or multiple file selection

### Requirement: Multiple file upload
The system SHALL support uploading multiple files simultaneously. Each file SHALL show its own progress bar and status (uploading, complete, error).

#### Scenario: Simultaneous uploads
- **WHEN** an admin selects 5 files for upload
- **THEN** all 5 SHALL upload concurrently (up to a configurable concurrency limit, default 3)
- **AND** each file SHALL display its upload progress percentage

#### Scenario: Partial upload failure
- **WHEN** 3 files are uploading and 1 fails due to a network error
- **THEN** the failed file SHALL show an error message with a "Reintentar" (Retry) button
- **AND** the other 2 files SHALL continue uploading normally

### Requirement: Accepted file types and size limits
The system SHALL validate file type and size before upload. Accepted types: images (jpg, jpeg, png, webp, svg, gif), documents (pdf), videos (mp4, webm). Max size: 10MB for images and documents, 50MB for videos.

#### Scenario: Valid image upload
- **WHEN** an admin uploads a 3MB PNG file
- **THEN** the file SHALL be accepted and uploaded successfully

#### Scenario: Oversized image rejected
- **WHEN** an admin uploads a 15MB JPEG file
- **THEN** the upload SHALL be rejected with message: "El fitxer supera la mida maxima de 10MB" (File exceeds max size of 10MB)

#### Scenario: Invalid file type rejected
- **WHEN** an admin uploads a `.exe` file
- **THEN** the upload SHALL be rejected with message: "Tipus de fitxer no acceptat. Tipus permesos: jpg, png, webp, svg, gif, pdf, mp4, webm" (File type not accepted)

#### Scenario: Valid video upload
- **WHEN** an admin uploads a 40MB MP4 file
- **THEN** the file SHALL be accepted (under 50MB video limit) and uploaded successfully

#### Scenario: Oversized video rejected
- **WHEN** an admin uploads a 60MB MP4 file
- **THEN** the upload SHALL be rejected with message: "El fitxer de video supera la mida maxima de 50MB" (Video file exceeds max size of 50MB)

### Requirement: Auto-generate thumbnails for images
Upon successful image upload, the system SHALL automatically generate a thumbnail version (e.g., 300x300 max, preserving aspect ratio) for use in the gallery grid view.

#### Scenario: Thumbnail generated on upload
- **WHEN** an admin uploads a 2000x1500 JPEG image
- **THEN** the system SHALL generate a thumbnail of max 300px on the longest side
- **AND** the thumbnail SHALL be stored alongside the original

#### Scenario: SVG thumbnail
- **WHEN** an admin uploads an SVG file
- **THEN** the system SHALL use the SVG itself as the thumbnail (no rasterization needed)

### Requirement: Extract and store metadata
Upon upload, the system SHALL extract and store file metadata: original filename, mime type, file size in bytes, and for images: width and height in pixels.

#### Scenario: Image metadata stored
- **WHEN** a 1920x1080 PNG of 2.5MB is uploaded
- **THEN** the media record SHALL store `mimeType: "image/png"`, `size: 2621440`, `width: 1920`, `height: 1080`

#### Scenario: PDF metadata stored
- **WHEN** a 1.2MB PDF is uploaded
- **THEN** the media record SHALL store `mimeType: "application/pdf"`, `size: 1258291`, `width: null`, `height: null`

#### Scenario: Video metadata stored
- **WHEN** an MP4 file is uploaded
- **THEN** the media record SHALL store `mimeType: "video/mp4"` and `size` in bytes

### Requirement: Unique filenames
The system SHALL generate unique filenames for uploaded files to prevent collisions, using a combination of timestamp and random string while preserving the original file extension.

#### Scenario: Unique filename generated
- **WHEN** an admin uploads "foto.jpg"
- **THEN** the file SHALL be stored with a name like `1711612800000-a1b2c3d4.jpg`

#### Scenario: Duplicate original names
- **WHEN** two different admins upload files both named "logo.png"
- **THEN** each file SHALL receive a unique storage filename and both SHALL coexist without conflict

#### Scenario: Original filename preserved in metadata
- **WHEN** a file "informe-trimestral.pdf" is uploaded
- **THEN** the media record SHALL store `originalName: "informe-trimestral.pdf"` while the stored file uses the unique name

### Requirement: Local storage in development
In development (`NODE_ENV=development`), uploaded files SHALL be stored in the local filesystem under `/public/uploads/` and served via the Next.js static file serving.

#### Scenario: File stored locally in dev
- **WHEN** a file is uploaded in development mode
- **THEN** the file SHALL be written to `/public/uploads/{unique-filename}`
- **AND** it SHALL be accessible at `http://localhost:3000/uploads/{unique-filename}`

### Requirement: S3-compatible storage in production
In production, uploaded files SHALL be stored in an S3-compatible object storage service configured via environment variables: `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `STORAGE_PUBLIC_URL`.

#### Scenario: File stored in S3 in production
- **WHEN** a file is uploaded in production mode
- **THEN** the file SHALL be uploaded to the configured S3 bucket
- **AND** the media record SHALL store the public URL from `STORAGE_PUBLIC_URL`

#### Scenario: Missing S3 configuration
- **WHEN** the application starts in production without `STORAGE_BUCKET` configured
- **THEN** the application SHALL log an error and fail to start with a clear message about missing storage configuration

### Requirement: Folder organization
Administrators SHALL be able to create folders to organize media files. Each media item SHALL optionally belong to a folder.

#### Scenario: Create folder
- **WHEN** an admin creates a folder named "Blog Imatges"
- **THEN** the folder SHALL appear in the media library sidebar

#### Scenario: Move file to folder
- **WHEN** an admin moves a media item to the "Blog Imatges" folder
- **THEN** the item SHALL appear when browsing the "Blog Imatges" folder
- **AND** the item SHALL no longer appear in the root level

#### Scenario: Delete empty folder
- **WHEN** an admin deletes a folder with no files in it
- **THEN** the folder SHALL be removed

#### Scenario: Delete folder with files
- **WHEN** an admin attempts to delete a folder that contains files
- **THEN** the system SHALL display a confirmation: "Aquesta carpeta conte X fitxers. Vols moure'ls a l'arrel o eliminar-los?" (This folder contains X files. Move to root or delete?)

### Requirement: Gallery grid view
The media library SHALL display media items in a responsive grid of thumbnails. Each thumbnail SHALL show a preview, filename, and file type icon overlay for non-image files.

#### Scenario: Image grid display
- **WHEN** an admin opens the media library with 20 images
- **THEN** a responsive grid of image thumbnails SHALL be displayed

#### Scenario: PDF in grid
- **WHEN** the media library contains PDF files
- **THEN** they SHALL display a PDF icon overlay on a generic document thumbnail

#### Scenario: Video in grid
- **WHEN** the media library contains video files
- **THEN** they SHALL display a play icon overlay on a video thumbnail (first frame or generic)

### Requirement: Gallery list view
The media library SHALL support a list view showing: thumbnail, filename, type, dimensions (images), file size, upload date, and folder.

#### Scenario: Toggle to list view
- **WHEN** an admin clicks the list view toggle
- **THEN** the media items SHALL display in a table format with columns for thumbnail, name, type, size, dimensions, date, and folder

#### Scenario: Sort by column
- **WHEN** an admin clicks the "Mida" (Size) column header
- **THEN** the list SHALL sort by file size (toggling ascending/descending on each click)

### Requirement: Search media
The media library SHALL support searching by filename, alt text, and tags.

#### Scenario: Search by filename
- **WHEN** an admin types "logo" in the search field
- **THEN** only media items with "logo" in their original filename or alt text SHALL be displayed

#### Scenario: Search by alt text
- **WHEN** an admin searches for "equip de treball" (work team)
- **THEN** media items with alt text containing "equip de treball" SHALL appear

#### Scenario: No results
- **WHEN** an admin searches for "xyznonexistent"
- **THEN** the gallery SHALL display: "No s'han trobat fitxers" (No files found)

### Requirement: Filter media by type, folder, and date
The media library SHALL support filtering by file type (image, document, video), folder, and upload date range.

#### Scenario: Filter by images only
- **WHEN** an admin selects the "Imatges" (Images) type filter
- **THEN** only image files (jpg, png, webp, svg, gif) SHALL be displayed

#### Scenario: Filter by folder
- **WHEN** an admin selects the "Blog Imatges" folder from the sidebar
- **THEN** only media items in that folder SHALL be displayed

#### Scenario: Filter by date range
- **WHEN** an admin sets a date range filter from 2026-01-01 to 2026-03-31
- **THEN** only media items uploaded within that date range SHALL be displayed

#### Scenario: Combined filters
- **WHEN** an admin filters by type "Imatges" and folder "Blog Imatges"
- **THEN** only images in the "Blog Imatges" folder SHALL be displayed

### Requirement: Gallery pagination
The media gallery SHALL paginate results with a configurable items-per-page (default: 24).

#### Scenario: Paginated gallery
- **WHEN** the media library contains 50 items
- **THEN** the first page SHALL show 24 items with pagination controls to access page 2 (24 items) and page 3 (2 items)

#### Scenario: Filters affect pagination
- **WHEN** an admin filters to 10 results
- **THEN** all 10 SHALL display on a single page with no pagination controls

### Requirement: Auto-resize images to max dimensions
Upon image upload, the system SHALL resize the original image to configurable max dimensions (default: 2400px longest side) if the original exceeds those dimensions. The original proportions SHALL be preserved.

#### Scenario: Large image resized
- **WHEN** a 5000x3000 image is uploaded with max dimension 2400
- **THEN** the stored "original" SHALL be resized to 2400x1440

#### Scenario: Small image not resized
- **WHEN** a 800x600 image is uploaded
- **THEN** the image SHALL be stored at its original 800x600 dimensions

### Requirement: Responsive image sizes
Upon image upload, the system SHALL generate multiple size variants: thumbnail (300px), medium (800px), large (1600px), and original (or max-resized). Each variant preserves the aspect ratio.

#### Scenario: Responsive sizes generated
- **WHEN** a 2400x1600 image is uploaded
- **THEN** the system SHALL generate variants: thumbnail (300x200), medium (800x533), large (1600x1067), and original (2400x1600)

#### Scenario: Small image fewer variants
- **WHEN** a 500x400 image is uploaded
- **THEN** the system SHALL generate only thumbnail (300x240) and keep the original (500x400), skipping medium and large since the original is smaller

### Requirement: WebP conversion
The system SHALL generate WebP versions of uploaded raster images (jpg, png) for optimized web delivery. The original format SHALL be preserved alongside the WebP version.

#### Scenario: WebP generated for JPEG
- **WHEN** a JPEG image is uploaded
- **THEN** the system SHALL generate a WebP version of each size variant
- **AND** the original JPEG SHALL also be preserved

#### Scenario: WebP not generated for SVG
- **WHEN** an SVG file is uploaded
- **THEN** no WebP conversion SHALL occur (SVGs are already optimized vectors)

#### Scenario: WebP not generated for GIF
- **WHEN** an animated GIF is uploaded
- **THEN** no WebP conversion SHALL occur to preserve animation

### Requirement: Usage tracking
The system SHALL track which content entities (pages, posts) reference each media item through block content.

#### Scenario: Image used in blog post
- **WHEN** a media item is inserted into a blog post's image block
- **THEN** the media record SHALL track that it is used by that blog post

#### Scenario: View usage list
- **WHEN** an admin views a media item's details
- **THEN** the system SHALL display a list of pages and posts that reference this media item

#### Scenario: Usage count on gallery
- **WHEN** a media item is used in 3 different pages
- **THEN** the gallery thumbnail SHALL show a usage badge indicating "3"

### Requirement: Warn before deleting media in use
When an administrator attempts to delete a media item that is referenced by content, the system SHALL display a warning listing the content that uses it and require confirmation.

#### Scenario: Delete media in use
- **WHEN** an admin clicks delete on an image used in 2 blog posts
- **THEN** the system SHALL show: "Aquest fitxer s'utilitza a 2 continguts: [Post A], [Post B]. Segur que vols eliminar-lo?" (This file is used in 2 contents. Are you sure you want to delete it?)

#### Scenario: Delete unused media
- **WHEN** an admin clicks delete on a media item with no usage references
- **THEN** a simple confirmation SHALL appear: "Vols eliminar aquest fitxer?" (Do you want to delete this file?)

#### Scenario: Confirm deletion of used media
- **WHEN** an admin confirms deletion of media used in content
- **THEN** the media file SHALL be deleted and references in content blocks SHALL show a broken-media placeholder

### Requirement: Orphan detection
The system SHALL provide a way to identify media items that are not referenced by any content.

#### Scenario: List orphan media
- **WHEN** an admin clicks "Fitxers orfes" (Orphan files) filter
- **THEN** the gallery SHALL display only media items with zero content references

#### Scenario: Bulk delete orphans
- **WHEN** an admin selects multiple orphan files and clicks "Eliminar seleccionats" (Delete selected)
- **THEN** all selected files SHALL be deleted after a single confirmation

### Requirement: Media picker modal
A reusable modal component SHALL allow editors to select media from the media library when editing blocks. The modal SHALL support uploading new files and selecting existing ones.

#### Scenario: Open media picker
- **WHEN** an admin clicks the image selector in a block editor
- **THEN** a modal SHALL open showing the media library grid with search and filter capabilities

#### Scenario: Upload from picker
- **WHEN** an admin clicks "Pujar nou fitxer" (Upload new file) in the media picker modal
- **THEN** the upload zone SHALL appear within the modal
- **AND** the newly uploaded file SHALL be automatically selected upon completion

#### Scenario: Select existing media
- **WHEN** an admin clicks on a media item in the picker modal and clicks "Seleccionar" (Select)
- **THEN** the modal SHALL close and the selected media item SHALL be inserted into the block

### Requirement: Crop and resize before inserting
The media picker SHALL provide basic crop and resize controls before inserting an image into content.

#### Scenario: Crop image
- **WHEN** an admin selects an image and clicks "Retallar" (Crop)
- **THEN** a crop overlay SHALL appear allowing the admin to define a rectangular crop area
- **AND** clicking "Aplicar" (Apply) SHALL save the cropped version as a new media item

#### Scenario: Resize with aspect ratio lock
- **WHEN** an admin enters a new width in the resize controls with aspect ratio locked
- **THEN** the height SHALL automatically adjust to maintain the original proportions

#### Scenario: Skip crop/resize
- **WHEN** an admin selects an image and clicks "Seleccionar" without cropping
- **THEN** the original image SHALL be inserted as-is

### Requirement: Alt text editor
The media picker and media detail view SHALL provide an alt text field. The system SHALL encourage (but not require) alt text for accessibility.

#### Scenario: Set alt text on upload
- **WHEN** an admin uploads an image and fills in `alt: "Equip d'Auratech treballant en un projecte IoT"`
- **THEN** the media record SHALL store the alt text and it SHALL be used wherever the image is rendered

#### Scenario: Alt text warning
- **WHEN** an admin selects an image without alt text from the media picker
- **THEN** a yellow warning SHALL appear: "Recomanem afegir text alternatiu per a l'accessibilitat" (We recommend adding alt text for accessibility)

#### Scenario: Edit alt text later
- **WHEN** an admin edits the alt text of an existing media item
- **THEN** the updated alt text SHALL propagate to all future renders of that image (existing cached pages update on revalidation)
