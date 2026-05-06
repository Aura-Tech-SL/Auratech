# Block Editor

## Overview

The visual page editor engine for the Auratech CMS. Administrators use this interface to compose pages by adding, arranging, configuring, and previewing content blocks. The editor provides a drag-and-drop canvas with live preview, side-panel editing, version history, and autosave.

## Tech Context

- **Framework**: Next.js 14 (App Router) + TypeScript
- **State Management**: React context + useReducer for editor state; undo/redo via action stack
- **Drag-and-Drop**: @dnd-kit or native HTML5 DnD
- **Persistence**: API routes (Next.js Route Handlers) backed by Prisma + PostgreSQL
- **Real-time Preview**: Client-side rendering of block components with editor data
- **Forms**: react-hook-form + Zod resolvers for block editing panels
- **Animations**: framer-motion for panel transitions and reorder animations

---

## Requirements

### REQ-BE-1: Add Blocks from Palette

The editor must provide a block palette (toolbar or insertion menu) from which administrators can add new blocks to the page at any position.

#### Scenario: Opening the block palette

- **WHEN** an admin clicks the "Add block" button between two existing blocks
- **THEN** a palette panel appears showing all available block types grouped by category (Layout, Content, Marketing, Interactive, Team)
- **AND** each type shows its icon and display name

#### Scenario: Searching the block palette

- **WHEN** an admin types "hero" in the palette search field
- **THEN** the palette filters to show only block types whose name or category matches the query
- **AND** results update as the admin types (debounced at 150ms)

#### Scenario: Inserting a block at a specific position

- **WHEN** an admin clicks the "Add block" button between blocks at positions 2 and 3
- **AND** selects "Features Grid" from the palette
- **THEN** a new features-grid block is created at position 3 with default data
- **AND** all subsequent blocks have their `order` values incremented by 1
- **AND** the editor scrolls to the newly inserted block
- **AND** the block editor panel opens for the new block

#### Scenario: Adding the first block to an empty page

- **WHEN** an admin opens the editor for a page with no blocks
- **THEN** the canvas shows an empty state with a prominent "Add your first block" button
- **AND** clicking the button opens the block palette
- **AND** the selected block is inserted at position 0

#### Scenario: Keyboard shortcut for adding blocks

- **WHEN** an admin presses `/` (slash) while the editor canvas is focused
- **THEN** an inline command palette appears at the cursor position
- **AND** the admin can type to filter and press Enter to insert a block

---

### REQ-BE-2: Remove Blocks

The editor must allow administrators to remove blocks from a page with a confirmation step to prevent accidental deletion.

#### Scenario: Deleting a block with confirmation

- **WHEN** an admin clicks the delete button on a block's toolbar
- **THEN** a confirmation dialog appears with the message "Delete this [block type] block? This action can be undone."
- **AND** the dialog shows "Delete" and "Cancel" buttons

#### Scenario: Confirming block deletion

- **WHEN** an admin confirms the deletion in the dialog
- **THEN** the block is removed from the page
- **AND** all subsequent blocks have their `order` values decremented by 1
- **AND** the deletion is added to the undo stack
- **AND** the editor shows a brief toast notification "Block deleted" with an "Undo" action

#### Scenario: Cancelling block deletion

- **WHEN** an admin clicks "Cancel" in the deletion dialog
- **THEN** the dialog closes
- **AND** the block remains in place unchanged

#### Scenario: Undoing a block deletion

- **WHEN** an admin clicks "Undo" in the deletion toast or presses Ctrl+Z
- **THEN** the deleted block is restored at its original position
- **AND** block order values are restored to their prior state

---

### REQ-BE-3: Drag-and-Drop Reorder

The editor must support drag-and-drop reordering of blocks on the page canvas.

#### Scenario: Initiating a drag

- **WHEN** an admin clicks and holds the drag handle on a block (grip icon on the left side)
- **THEN** the block enters drag mode with a visual lift effect (shadow, slight scale)
- **AND** other blocks show drop zone indicators (blue lines between blocks)

#### Scenario: Reordering by dragging

- **WHEN** an admin drags a block from position 1 to between positions 3 and 4
- **THEN** a blue insertion indicator appears between positions 3 and 4
- **AND** upon drop, the block moves to position 3
- **AND** all affected blocks have their `order` values recalculated
- **AND** the reorder is added to the undo stack
- **AND** the transition animates smoothly using framer-motion (layout animation)

#### Scenario: Cancelling a drag

- **WHEN** an admin presses Escape during a drag operation
- **THEN** the block returns to its original position
- **AND** no order changes are applied

#### Scenario: Dragging to the top of the page

- **WHEN** an admin drags a block to above the first block
- **THEN** a drop zone indicator appears above block 0
- **AND** upon drop, the dragged block becomes position 0 and all others shift down

#### Scenario: Dragging to the bottom of the page

- **WHEN** an admin drags a block to below the last block
- **THEN** a drop zone indicator appears below the last block
- **AND** upon drop, the dragged block becomes the last position

#### Scenario: Keyboard-based reorder

- **WHEN** an admin selects a block and presses Alt+ArrowUp
- **THEN** the block swaps position with the block above it
- **AND** pressing Alt+ArrowDown swaps it with the block below
- **AND** if the block is already at the top/bottom, no change occurs

---

### REQ-BE-4: Edit Block Data

The editor must provide a form interface for editing each block's configuration and content.

#### Scenario: Opening the edit panel

- **WHEN** an admin clicks on a block in the canvas (not on the drag handle)
- **THEN** a side panel slides in from the right showing the block's edit form
- **AND** the selected block is highlighted with a blue border on the canvas
- **AND** the panel header shows the block type name and icon

#### Scenario: Editing block fields

- **WHEN** an admin modifies a text field in the edit panel
- **THEN** the live preview updates the block rendering within 200ms (debounced)
- **AND** the field shows validation status (error/success) inline

#### Scenario: Switching between blocks

- **WHEN** an admin clicks a different block while the edit panel is open
- **THEN** the panel transitions to show the new block's form
- **AND** unsaved changes to the previous block are preserved in the editor state (they are part of the draft)

#### Scenario: Closing the edit panel

- **WHEN** an admin clicks the close button on the edit panel or presses Escape
- **THEN** the panel slides out
- **AND** the block deselects (border removed)
- **AND** block data remains as edited (changes are kept in draft state)

#### Scenario: Inline editing for rich-text blocks

- **WHEN** an admin clicks on a rich-text block in the canvas
- **THEN** the block becomes directly editable inline (contentEditable)
- **AND** a floating toolbar appears above the block with formatting options
- **AND** no side panel opens (rich-text uses inline editing exclusively)

#### Scenario: Validation errors prevent saving

- **WHEN** an admin modifies block data to an invalid state (e.g., removes a required heading)
- **THEN** the field shows a red border and error message
- **AND** the preview still updates to reflect current data (allowing the admin to see the effect)
- **AND** the page cannot transition from draft to published while validation errors exist

---

### REQ-BE-5: Live Preview

The editor must display a real-time preview of the page as blocks are arranged and configured.

#### Scenario: Preview renders all visible blocks

- **WHEN** a page with 5 blocks is open in the editor
- **THEN** the canvas renders each block using its public React renderer component
- **AND** blocks appear in their configured order
- **AND** the layout matches the public website appearance (same CSS, same component tree)

#### Scenario: Preview updates on block edit

- **WHEN** an admin changes the heading text in a hero block's edit panel
- **THEN** the hero block in the canvas re-renders with the new heading within 200ms

#### Scenario: Preview updates on reorder

- **WHEN** an admin completes a drag-and-drop reorder operation
- **THEN** the canvas instantly reflects the new block order with a layout animation

#### Scenario: Preview hides invisible blocks with indicator

- **WHEN** a block has `visible: false`
- **THEN** the editor canvas shows the block with a muted/grayed-out overlay and a "Hidden" badge
- **AND** the block is still draggable and editable
- **AND** a toggle in the block toolbar can restore visibility

#### Scenario: Responsive preview modes

- **WHEN** an admin clicks the device toggle buttons in the editor toolbar (desktop/tablet/mobile icons)
- **THEN** the preview canvas resizes to simulate the selected viewport width
- **AND** desktop = 1280px, tablet = 768px, mobile = 375px
- **AND** blocks re-render with responsive styles applied

#### Scenario: Full-screen preview

- **WHEN** an admin clicks the "Preview" button in the editor toolbar
- **THEN** a new browser tab opens showing the page as it would appear to visitors
- **AND** the preview uses the current draft data (not only published data)
- **AND** the preview URL includes a token-based parameter to allow viewing unpublished content

---

### REQ-BE-6: Save Draft and Publish

The editor must support saving pages as drafts and publishing them to the live website.

#### Scenario: Saving a draft

- **WHEN** an admin clicks the "Save Draft" button
- **THEN** the current page state (all blocks with their data and order) is persisted with status DRAFT
- **AND** a success toast appears: "Draft saved"
- **AND** the page is not visible on the public website

#### Scenario: Publishing a page

- **WHEN** an admin clicks "Publish" on a page in DRAFT status
- **THEN** the system validates all blocks (all must pass Zod validation)
- **AND** if all valid, the page status changes to PUBLISHED
- **AND** `publishedAt` is set to the current timestamp
- **AND** a new PageVersion snapshot is created
- **AND** the page becomes visible on the public website
- **AND** a success toast appears: "Page published"

#### Scenario: Publishing with validation errors

- **WHEN** an admin clicks "Publish" and one or more blocks have invalid data
- **THEN** the publish action is blocked
- **AND** a notification lists the blocks with errors, each clickable to jump to the block
- **AND** the page remains in DRAFT status

#### Scenario: Unpublishing a page

- **WHEN** an admin clicks "Unpublish" on a PUBLISHED page
- **THEN** the page status changes to DRAFT
- **AND** the page is no longer visible on the public website
- **AND** the content is preserved for further editing

#### Scenario: Publishing an already published page (update)

- **WHEN** an admin edits a PUBLISHED page and clicks "Update"
- **THEN** a new PageVersion snapshot is created with an incremented version number
- **AND** the published content is replaced with the current draft
- **AND** `updatedAt` is refreshed

---

### REQ-BE-7: Page Version History

The editor must maintain a history of page versions, allowing administrators to view and restore previous versions.

#### Scenario: Automatic version creation on publish

- **WHEN** a page is published or updated
- **THEN** a new PageVersion record is created containing a JSON snapshot of all blocks and page metadata
- **AND** the version number auto-increments (1, 2, 3...)
- **AND** `createdBy` records the admin user's ID

#### Scenario: Viewing version history

- **WHEN** an admin clicks "Version History" in the editor toolbar
- **THEN** a panel shows a chronological list of versions with: version number, date/time, author name
- **AND** the list is ordered newest-first

#### Scenario: Previewing a historical version

- **WHEN** an admin clicks on a version in the history list
- **THEN** the canvas renders the page as it appeared in that version
- **AND** a banner appears: "Viewing version N -- This is a historical snapshot"
- **AND** editing is disabled while viewing a historical version

#### Scenario: Restoring a historical version

- **WHEN** an admin clicks "Restore this version" while previewing a historical version
- **THEN** a confirmation dialog appears: "Restore version N? The current draft will be replaced."
- **AND** upon confirmation, the current draft is replaced with the version's snapshot data
- **AND** the editor exits history mode and returns to normal editing
- **AND** the restore action is added to the undo stack

#### Scenario: Version data integrity

- **WHEN** a PageVersion snapshot is created
- **THEN** the snapshot contains the complete page state: title, slug, description, meta fields, and all blocks with their data, order, and visibility
- **AND** the snapshot is immutable once created (never updated, only new versions are added)

---

### REQ-BE-8: Undo/Redo

The editor must support undo and redo operations within a single editing session.

#### Scenario: Undoing a block edit

- **WHEN** an admin modifies a block's heading from "Hello" to "World" and then presses Ctrl+Z (Cmd+Z on Mac)
- **THEN** the heading reverts to "Hello"
- **AND** the edit panel and preview both update to reflect the reverted state

#### Scenario: Undoing a block reorder

- **WHEN** an admin reorders blocks and then presses Ctrl+Z
- **THEN** the blocks return to their previous order
- **AND** the preview canvas animates the blocks back to their original positions

#### Scenario: Undoing a block deletion

- **WHEN** an admin deletes a block and then presses Ctrl+Z
- **THEN** the deleted block is restored at its original position with its original data

#### Scenario: Undoing a block addition

- **WHEN** an admin adds a new block and then presses Ctrl+Z
- **THEN** the newly added block is removed
- **AND** other blocks' order values revert to their prior state

#### Scenario: Redo after undo

- **WHEN** an admin performs an undo and then presses Ctrl+Shift+Z (Cmd+Shift+Z on Mac)
- **THEN** the undone action is re-applied

#### Scenario: Undo stack limit

- **WHEN** the undo stack reaches 50 actions
- **AND** a new action is performed
- **THEN** the oldest action is dropped from the stack
- **AND** the newest action is added

#### Scenario: Undo stack reset on save

- **WHEN** the editor session ends (page closed or navigated away)
- **THEN** the undo/redo stack is discarded
- **AND** a new session begins with an empty stack

#### Scenario: Redo stack cleared on new action

- **WHEN** an admin performs an undo (creating a redo entry) and then performs a new action (e.g., edits a field)
- **THEN** the redo stack is cleared
- **AND** only the new action and prior undo history remain

---

### REQ-BE-9: Autosave Drafts

The editor must automatically save draft state periodically to prevent data loss.

#### Scenario: Periodic autosave

- **WHEN** an admin has made changes and 30 seconds have elapsed since the last save
- **THEN** the editor automatically saves the current state as a draft
- **AND** a subtle indicator appears: "Draft saved" with a timestamp
- **AND** autosave does not change the page's publish status

#### Scenario: Autosave on significant change

- **WHEN** an admin completes a block reorder, block deletion, or block addition
- **THEN** an autosave is triggered immediately (debounced at 2 seconds to batch rapid changes)

#### Scenario: Autosave before navigation

- **WHEN** an admin navigates away from the editor (clicks a link, closes the tab, presses browser back)
- **AND** there are unsaved changes
- **THEN** the browser shows a confirmation dialog: "You have unsaved changes. Are you sure you want to leave?"
- **AND** if the admin confirms leaving, the editor attempts an autosave before unloading

#### Scenario: Recovering autosaved drafts

- **WHEN** an admin opens the editor for a page that has an autosaved draft newer than the last explicit save
- **THEN** a notification appears: "A more recent draft was found. Restore it?"
- **AND** clicking "Restore" loads the autosaved state
- **AND** clicking "Discard" loads the last explicitly saved state and deletes the autosaved draft

#### Scenario: Autosave failure handling

- **WHEN** an autosave API call fails (network error, server error)
- **THEN** the editor shows a warning indicator: "Autosave failed -- changes exist only locally"
- **AND** the editor retries the autosave after 10 seconds
- **AND** draft data is also stored in localStorage as a fallback

---

### REQ-BE-10: Duplicate Blocks

The editor must allow administrators to duplicate an existing block, creating a copy with the same data.

#### Scenario: Duplicating a block

- **WHEN** an admin clicks the "Duplicate" button in a block's toolbar
- **THEN** a new block of the same type is created with a copy of the original block's data
- **AND** the duplicate is inserted immediately after the original block
- **AND** the duplicate receives a new unique `id`
- **AND** the duplicate's order is set to original order + 1, and subsequent blocks shift
- **AND** the action is added to the undo stack

#### Scenario: Duplicating a block with media references

- **WHEN** an admin duplicates an image block referencing a media file
- **THEN** the duplicate references the same media URL (media is not re-uploaded)
- **AND** the alt text and caption are copied as-is

#### Scenario: Duplicated block is independently editable

- **WHEN** an admin duplicates a block and edits the duplicate's heading
- **THEN** only the duplicate's heading changes
- **AND** the original block's heading remains unchanged

---

### REQ-BE-11: Block Visibility Toggle

The editor must allow administrators to toggle a block's visibility without deleting it.

#### Scenario: Hiding a block

- **WHEN** an admin clicks the "Hide" (eye icon) button in a block's toolbar
- **THEN** the block's `visible` field is set to `false`
- **AND** the block appears muted/grayed in the editor canvas with a "Hidden" badge
- **AND** the block does not render on the public website
- **AND** the action is added to the undo stack

#### Scenario: Showing a hidden block

- **WHEN** an admin clicks the "Show" (eye-off icon toggled) button on a hidden block
- **THEN** the block's `visible` field is set to `true`
- **AND** the block appears normally in the editor canvas
- **AND** the block renders on the public website upon next publish

#### Scenario: Hidden blocks maintain position

- **WHEN** a block is hidden
- **THEN** it remains at its current position in the block order
- **AND** it can still be dragged to a different position
- **AND** it can still be edited via the side panel

#### Scenario: Bulk visibility indicator

- **WHEN** a page has hidden blocks
- **THEN** the editor toolbar shows a count: "N hidden blocks"
- **AND** clicking the indicator scrolls to the first hidden block
