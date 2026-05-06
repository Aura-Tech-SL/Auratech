# Content Blocks

## Overview

Catalogue of all block types available in the Auratech CMS page editor. Each block has a unique type identifier, a JSON schema defining its data structure, and renders as a React component on the public website. Blocks are the fundamental unit of page composition.

The CMS serves the Catalan-language website auratech.cat. Block data stores user-authored content (which will be in Catalan), while all system labels, types, and code identifiers use English.

## Tech Context

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Validation**: Zod schemas for each block type's data
- **Database**: PostgreSQL via Prisma -- block data stored as JSON column
- **Styling**: Tailwind CSS + class-variance-authority
- **Icons**: lucide-react
- **Animations**: framer-motion

---

## Data Model

Every block persists with the following base fields:

| Field    | Type    | Description                                      |
|----------|---------|--------------------------------------------------|
| id       | String  | Unique identifier (cuid)                         |
| type     | String  | Block type key from the registry                 |
| order    | Int     | Zero-based position within the page              |
| data     | JSON    | Payload conforming to the type's Zod schema      |
| pageId   | String  | Foreign key to the parent Page                   |
| visible  | Boolean | Whether the block renders on the public site     |

---

## Block Type Definitions

### hero

Full-width hero section for page headers.

```typescript
{
  heading: string;            // required, max 120 chars
  subheading?: string;        // max 200 chars
  ctaLabel?: string;          // button text
  ctaUrl?: string;            // button link
  ctaVariant?: "primary" | "secondary" | "outline";
  backgroundType: "image" | "video" | "color";
  backgroundImage?: string;   // media URL
  backgroundVideo?: string;   // media URL (mp4) or embed URL
  backgroundColor?: string;   // hex or Tailwind class
  overlayOpacity?: number;    // 0-100, default 40
  textAlign?: "left" | "center" | "right";
  minHeight?: "sm" | "md" | "lg" | "full"; // default "lg"
}
```

### rich-text

Free-form HTML content with formatting.

```typescript
{
  html: string;               // sanitized HTML content
  maxWidth?: "sm" | "md" | "lg" | "full"; // default "md"
}
```

Supported formatting: bold, italic, underline, strikethrough, headings (h2-h4), links, ordered lists, unordered lists, blockquotes, inline code.

### image

Single image with optional caption.

```typescript
{
  src: string;                // required, media URL
  alt: string;                // required, accessibility text
  caption?: string;
  width?: number;
  height?: number;
  sizing: "contain" | "cover" | "full-width" | "original";
  rounded?: boolean;          // default false
  shadow?: boolean;           // default false
  link?: string;              // optional click-through URL
}
```

### gallery

Grid of images with lightbox support.

```typescript
{
  images: Array<{
    src: string;              // required
    alt: string;              // required
    caption?: string;
  }>;                         // min 1 image
  columns: 2 | 3 | 4;        // default 3
  gap: "sm" | "md" | "lg";   // default "md"
  aspectRatio?: "square" | "landscape" | "portrait" | "auto";
  enableLightbox: boolean;    // default true
}
```

### cta

Call-to-action section.

```typescript
{
  heading: string;            // required, max 100 chars
  text?: string;              // supporting copy, max 300 chars
  buttons: Array<{
    label: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
  }>;                         // 1-3 buttons
  backgroundStyle: "light" | "dark" | "brand" | "gradient";
  alignment?: "left" | "center"; // default "center"
}
```

### features-grid

Grid of feature cards.

```typescript
{
  heading?: string;
  subheading?: string;
  features: Array<{
    icon: string;             // lucide icon name
    title: string;            // required
    description: string;      // required, max 200 chars
    link?: string;
  }>;                         // min 1, max 12
  columns: 2 | 3 | 4;        // default 3
  style: "card" | "minimal" | "icon-top" | "icon-left";
}
```

### testimonial

Customer testimonial quote.

```typescript
{
  quote: string;              // required, max 500 chars
  author: string;             // required
  role?: string;
  company?: string;
  avatar?: string;            // media URL
  style: "simple" | "card" | "large-quote";
}
```

### stats

Row of statistics with labels.

```typescript
{
  stats: Array<{
    value: string;            // e.g. "15000+", "99.9%"
    label: string;            // e.g. "ESL units deployed"
    icon?: string;            // lucide icon name
  }>;                         // min 1, max 6
  style: "simple" | "card" | "highlighted";
  animate: boolean;           // count-up animation, default true
}
```

### video

Embedded or self-hosted video.

```typescript
{
  source: "youtube" | "vimeo" | "self-hosted";
  url: string;                // required
  title?: string;
  caption?: string;
  posterImage?: string;       // thumbnail before play
  autoplay?: boolean;         // default false
  aspectRatio: "16:9" | "4:3" | "1:1"; // default "16:9"
  maxWidth?: "sm" | "md" | "lg" | "full";
}
```

### code

Syntax-highlighted code block.

```typescript
{
  code: string;               // required
  language: string;           // e.g. "typescript", "python", "bash"
  filename?: string;          // displayed as tab header
  showLineNumbers: boolean;   // default true
  highlightLines?: number[];  // line numbers to highlight
  maxHeight?: number;         // px, enables scroll if exceeded
}
```

### divider

Visual separator.

```typescript
{
  style: "line" | "dashed" | "dotted" | "gradient" | "space";
  width: "sm" | "md" | "lg" | "full"; // default "md"
  color?: string;             // hex color, default uses theme
  spacing: "sm" | "md" | "lg"; // vertical margin, default "md"
}
```

### accordion

Expandable FAQ-style sections.

```typescript
{
  heading?: string;
  items: Array<{
    title: string;            // required
    content: string;          // HTML content, required
  }>;                         // min 1
  allowMultiple: boolean;     // multiple open at once, default false
  defaultOpen?: number;       // index of initially open item
  style: "simple" | "bordered" | "card";
}
```

### pricing

Pricing tier cards.

```typescript
{
  heading?: string;
  subheading?: string;
  tiers: Array<{
    name: string;             // required
    price: string;            // e.g. "49EUR/mes", "Personalitzat"
    description?: string;
    features: Array<{
      text: string;
      included: boolean;
    }>;
    ctaLabel: string;
    ctaUrl: string;
    highlighted: boolean;     // emphasize this tier
  }>;                         // min 1, max 4
  billingToggle?: boolean;    // show monthly/annual toggle
}
```

### team-grid

Team member cards.

```typescript
{
  heading?: string;
  members: Array<{
    name: string;             // required
    role: string;             // required
    image?: string;           // media URL
    bio?: string;             // max 200 chars
    linkedin?: string;
    email?: string;
    twitter?: string;
  }>;                         // min 1
  columns: 2 | 3 | 4;        // default 3
  style: "card" | "minimal" | "rounded";
}
```

### contact-form

Embedded contact form connected to the ContactSubmission model.

```typescript
{
  heading?: string;
  description?: string;
  fields: Array<"name" | "email" | "phone" | "subject" | "message">;
  requiredFields: Array<"name" | "email" | "phone" | "subject" | "message">;
  submitLabel?: string;       // default "Enviar"
  successMessage?: string;    // default "Missatge enviat correctament"
  recipientEmail?: string;    // override default notification target
  style: "simple" | "card" | "split"; // split = form + contact info side
}
```

### logo-grid

Client or partner logos.

```typescript
{
  heading?: string;
  logos: Array<{
    src: string;              // required, media URL
    alt: string;              // required, company name
    url?: string;             // link to partner site
  }>;                         // min 1
  columns: 3 | 4 | 5 | 6;    // default 4
  grayscale: boolean;         // default true, color on hover
  maxLogoHeight?: number;     // px, default 60
}
```

### spacer

Configurable vertical spacing.

```typescript
{
  height: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  // xs=16px, sm=32px, md=48px, lg=64px, xl=96px, 2xl=128px
  showOnMobile: boolean;      // default true
  mobileHeight?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}
```

---

## Requirements

### REQ-CB-1: Block Type Registry

The system must maintain a typed registry of all supported block types, mapping each type key to its Zod schema, default data, React renderer component, and editor form component.

#### Scenario: Retrieving a registered block type

- **WHEN** a consumer requests the registry entry for type "hero"
- **THEN** the registry returns an object containing the Zod schema, default data factory, renderer component reference, and editor component reference for the hero type

#### Scenario: Listing all available block types

- **WHEN** the block palette requests the list of all registered types
- **THEN** the registry returns all 17 block types with their display names, icons, and category groupings

#### Scenario: Requesting an unregistered block type

- **WHEN** a consumer requests the registry entry for type "unknown-block"
- **THEN** the registry returns null and logs a warning

#### Scenario: Block type categories

- **WHEN** the block palette renders the type selector
- **THEN** block types are grouped into categories: "Layout" (hero, divider, spacer), "Content" (rich-text, image, gallery, video, code, accordion), "Marketing" (cta, features-grid, testimonial, stats, pricing, logo-grid), "Interactive" (contact-form), "Team" (team-grid)

---

### REQ-CB-2: Block Data Validation

Each block type must define a Zod schema that validates its data field. All block mutations (create, update) must pass validation before persisting.

#### Scenario: Valid hero block data

- **WHEN** a user saves a hero block with `{ heading: "Solucions IoT", backgroundType: "image", backgroundImage: "/uploads/hero.jpg" }`
- **THEN** the Zod schema validates successfully and the block is persisted

#### Scenario: Missing required field

- **WHEN** a user saves a hero block with `{ subheading: "Some text" }` (missing required `heading`)
- **THEN** the Zod schema returns a validation error indicating `heading` is required
- **AND** the block is not persisted
- **AND** the editor displays the field-level error message

#### Scenario: Invalid field value

- **WHEN** a user saves a gallery block with `{ images: [], columns: 7 }`
- **THEN** the Zod schema returns errors: `images` must have at least 1 item, `columns` must be 2, 3, or 4
- **AND** the block is not persisted

#### Scenario: String length enforcement

- **WHEN** a user saves a testimonial block with a `quote` exceeding 500 characters
- **THEN** the Zod schema returns a validation error indicating the maximum length is 500
- **AND** the editor shows the character count and error

#### Scenario: Optional fields with defaults

- **WHEN** a user saves an image block with only `{ src: "/img.jpg", alt: "Photo", sizing: "cover" }`
- **THEN** the Zod schema validates successfully
- **AND** optional fields like `rounded` and `shadow` default to `false`

#### Scenario: Nested array validation

- **WHEN** a user saves a features-grid block with 13 features
- **THEN** the Zod schema returns a validation error indicating the maximum is 12 features
- **AND** the editor prevents adding more items beyond the limit

#### Scenario: HTML sanitization on rich-text

- **WHEN** a user saves a rich-text block with HTML containing `<script>alert('xss')</script>`
- **THEN** the script tags are stripped before validation and persistence
- **AND** only allowed HTML tags and attributes are preserved

---

### REQ-CB-3: Block Rendering (Public)

Each block type must have a corresponding React server component that renders the block's data on the public website. Rendering must be accessible, responsive, and performant.

#### Scenario: Rendering a hero block

- **WHEN** a published page containing a hero block is requested
- **THEN** the hero component renders with the heading in an `<h1>` tag
- **AND** the background image loads with `next/image` optimization
- **AND** the CTA button links to the configured URL
- **AND** the overlay applies at the configured opacity

#### Scenario: Rendering a gallery with lightbox

- **WHEN** a published page containing a gallery block with `enableLightbox: true` is requested
- **THEN** images render in a CSS grid with the configured column count
- **AND** clicking an image opens a lightbox overlay with navigation arrows
- **AND** images are lazy-loaded for performance

#### Scenario: Rendering a hidden block

- **WHEN** a published page contains a block with `visible: false`
- **THEN** the block is not included in the rendered HTML
- **AND** no markup or empty container is emitted for that block

#### Scenario: Rendering a contact-form block

- **WHEN** a published page containing a contact-form block is rendered
- **THEN** the form renders with the configured fields
- **AND** required fields show a required indicator
- **AND** form submission posts to the `/api/contact` endpoint
- **AND** success shows the configured success message
- **AND** the form uses react-hook-form with Zod validation on the client

#### Scenario: Rendering stats with animation

- **WHEN** a stats block with `animate: true` scrolls into the viewport
- **THEN** each stat value animates with a count-up effect using framer-motion
- **AND** the animation triggers only once (intersection observer)

#### Scenario: Responsive rendering

- **WHEN** any block is viewed on a mobile viewport (< 768px)
- **THEN** grid-based blocks (gallery, features-grid, team-grid, logo-grid) collapse to fewer columns
- **AND** the hero block adjusts its minimum height
- **AND** the spacer block uses its `mobileHeight` if configured

#### Scenario: Rendering a video block with YouTube source

- **WHEN** a video block with `source: "youtube"` and a YouTube URL is rendered
- **THEN** the component extracts the video ID and renders a lite-youtube or iframe embed
- **AND** the poster image displays before the user clicks play
- **AND** the aspect ratio matches the configured value

#### Scenario: Rendering an accordion block

- **WHEN** an accordion block is rendered on the public site
- **THEN** each item renders with a clickable header showing the title
- **AND** if `defaultOpen` is set, that item is expanded on load
- **AND** if `allowMultiple` is false, opening one item closes others
- **AND** the expand/collapse uses framer-motion for smooth animation

#### Scenario: Rendering a pricing block

- **WHEN** a pricing block with `highlighted: true` on one tier is rendered
- **THEN** the highlighted tier has a distinct visual treatment (border, scale, badge)
- **AND** all tiers display their features with included/excluded indicators
- **AND** each CTA button links to the configured URL

---

### REQ-CB-4: Block Editor (Admin)

Each block type must have a corresponding React client component that provides a form for editing the block's data within the admin panel.

#### Scenario: Editing a hero block

- **WHEN** an admin selects a hero block in the editor
- **THEN** a side panel opens with fields: heading (text input), subheading (text input), CTA label, CTA URL, CTA variant (select), background type (radio), background image (media picker), overlay opacity (range slider), text alignment (segmented control), min height (select)
- **AND** changes reflect in the live preview immediately

#### Scenario: Editing a rich-text block

- **WHEN** an admin selects a rich-text block in the editor
- **THEN** an inline WYSIWYG toolbar appears above the block
- **AND** the toolbar offers: bold, italic, underline, strikethrough, heading level, link, ordered list, unordered list, blockquote, code
- **AND** the content is editable directly in the preview area

#### Scenario: Editing a gallery block -- adding images

- **WHEN** an admin clicks "Add images" in a gallery block editor
- **THEN** the media library picker opens allowing multiple selection
- **AND** selected images are appended to the gallery
- **AND** each image shows fields for alt text and optional caption
- **AND** images can be reordered via drag-and-drop within the gallery

#### Scenario: Editing a features-grid block -- adding a feature

- **WHEN** an admin clicks "Add feature" in a features-grid editor
- **THEN** a new feature card form appears with icon picker, title input, description textarea, and optional link input
- **AND** the icon picker shows searchable lucide icons
- **AND** the form enforces the 12-feature maximum

#### Scenario: Editing a contact-form block

- **WHEN** an admin configures a contact-form block
- **THEN** the editor shows checkboxes for available fields (name, email, phone, subject, message)
- **AND** a separate set of checkboxes for which fields are required
- **AND** a required field must also be an included field (validation enforced)

#### Scenario: Media picker integration

- **WHEN** any block editor field requires an image (hero background, image src, gallery items, team member avatar, logo-grid logos)
- **THEN** clicking the field opens the media library browser
- **AND** the admin can select an existing upload or upload a new file
- **AND** the selected media URL and metadata populate the block data field

#### Scenario: Real-time preview update

- **WHEN** an admin modifies any field in a block editor form
- **THEN** the live preview updates within 200ms (debounced)
- **AND** validation errors appear inline on the field without blocking the preview

---

### REQ-CB-5: Default Data for New Blocks

When a new block is added to a page, it must be initialized with sensible default data that passes Zod validation and renders meaningfully in the preview.

#### Scenario: Adding a new hero block

- **WHEN** an admin adds a hero block from the palette
- **THEN** the block is created with default data: `{ heading: "New Hero Section", backgroundType: "color", backgroundColor: "#1a1a2e", overlayOpacity: 40, textAlign: "center", minHeight: "lg" }`
- **AND** the preview renders the block with placeholder content

#### Scenario: Adding a new features-grid block

- **WHEN** an admin adds a features-grid block from the palette
- **THEN** the block is created with 3 placeholder features, each with a default icon, "Feature Title" heading, and "Feature description" text
- **AND** columns defaults to 3 and style defaults to "card"

#### Scenario: Adding a new accordion block

- **WHEN** an admin adds an accordion block from the palette
- **THEN** the block is created with 2 placeholder items: titles "Question 1" and "Question 2" with placeholder content
- **AND** `allowMultiple` defaults to `false` and `style` defaults to "simple"

#### Scenario: Adding a new contact-form block

- **WHEN** an admin adds a contact-form block from the palette
- **THEN** the block is created with default fields `["name", "email", "subject", "message"]`, required fields `["name", "email", "message"]`, and style `"simple"`

#### Scenario: Adding a new spacer block

- **WHEN** an admin adds a spacer block from the palette
- **THEN** the block is created with `{ height: "md", showOnMobile: true }`
- **AND** the preview shows a labeled spacer indicator (visible only in editor, not on public site)

#### Scenario: Default data always passes validation

- **WHEN** any block type's default data factory is called
- **THEN** the returned data passes the corresponding Zod schema validation without errors
