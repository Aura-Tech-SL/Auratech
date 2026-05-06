# Contact System Spec

## Purpose

Public contact form and submission management system. Visitors can submit inquiries through the `/contacte` page, and admins can view and manage submissions from the admin dashboard.

## Requirements

### Requirement: Contact Form

Public-facing form for website visitors to reach Auratech.

#### Scenario: Visitor submits contact form

- **WHEN** a visitor fills in name, email, phone (optional), subject, and message
- **AND** clicks the submit button
- **THEN** the form data is validated client-side (React Hook Form + Zod)
- **AND** sent via POST to `/api/contact`
- **AND** stored in the ContactSubmission table with `isRead: false`
- **AND** the visitor sees a success confirmation message

#### Scenario: Visitor submits with invalid data

- **WHEN** a visitor submits the form with missing required fields or invalid email
- **THEN** inline validation errors are shown next to the invalid fields
- **AND** no API request is made

#### Scenario: Visitor submits with empty message

- **WHEN** a visitor submits with an empty message field
- **THEN** a validation error is shown: message must be at least 10 characters

#### Scenario: Rate limiting

- **WHEN** the same IP submits more than 5 contact forms within 1 hour
- **THEN** subsequent submissions are rejected with a 429 status
- **AND** an error message is shown asking the visitor to try again later

### Requirement: Email Notification

Auratech receives an email notification for each new contact submission.

#### Scenario: New submission triggers email

- **WHEN** a contact form is successfully submitted
- **THEN** an email is sent via Resend API to the configured admin email
- **AND** the email includes: sender name, email, subject, message, timestamp
- **AND** a link to view the submission in the admin dashboard

#### Scenario: Email service unavailable

- **WHEN** the Resend API fails to send the notification
- **THEN** the submission is still saved to the database
- **AND** the error is logged
- **AND** the visitor still sees the success message (email failure is silent)

### Requirement: Submission Management (Admin)

Admins can view and manage contact form submissions.

#### Scenario: Admin views submissions list

- **WHEN** an ADMIN navigates to the contact submissions section
- **THEN** they see a list of all submissions sorted by date (newest first)
- **AND** each entry shows: name, email, subject, date, read/unread badge
- **AND** unread submissions are visually highlighted

#### Scenario: Admin reads a submission

- **WHEN** an ADMIN clicks on a submission
- **THEN** the full submission details are shown
- **AND** the submission is marked as `isRead: true`

#### Scenario: Admin deletes a submission

- **WHEN** an ADMIN deletes a submission
- **THEN** the submission is permanently removed from the database
- **AND** a confirmation dialog is shown before deletion

#### Scenario: Admin marks submission as unread

- **WHEN** an ADMIN marks a read submission as unread
- **THEN** the `isRead` flag is set to `false`
- **AND** the submission appears highlighted again in the list

### Requirement: Auto-Reply

Visitors receive an automatic confirmation email after submitting the form.

#### Scenario: Auto-reply sent on submission

- **WHEN** a contact form is successfully submitted
- **THEN** an auto-reply email is sent to the visitor's email address
- **AND** the email thanks them for their inquiry and sets expectations for response time
- **AND** the email is branded with Auratech identity
