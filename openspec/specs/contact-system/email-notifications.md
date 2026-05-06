## ADDED Requirements

### Requirement: Send email notification on contact form submission

When a visitor submits the contact form, the system SHALL save the submission to the database AND send an email notification to `info@auratech.cat` via Resend.

#### Scenario: Successful submission sends email

- **WHEN** a visitor submits a valid contact form
- **THEN** the system SHALL save a `ContactSubmission` record to the database
- **AND** send an email to `info@auratech.cat` via Resend API with the submission details (name, email, subject, message)

#### Scenario: Email failure does not block submission

- **WHEN** the Resend API fails (timeout, auth error)
- **THEN** the `ContactSubmission` record SHALL still be saved to the database
- **AND** the visitor SHALL see a success message
- **AND** the error SHALL be logged server-side

#### Scenario: Email content

- **WHEN** a notification email is sent
- **THEN** the email SHALL have:
  - From: `noreply@auratech.cat` (verified Resend domain)
  - To: `info@auratech.cat`
  - Subject: `[Auratech Web] Nou missatge de {name}: {subject}`
  - Body: formatted HTML with name, email, phone (if provided), subject, and message

### Requirement: Resend domain verification via DNS

The domain `auratech.cat` SHALL be verified in Resend by adding the required DNS records via OVH API.

#### Scenario: DNS records configured

- **WHEN** Resend provides verification DNS records
- **THEN** the records SHALL be added to the `auratech.cat` zone via OVH API
- **AND** SPF record SHALL be updated to include Resend's sending domain

### Requirement: Honeypot anti-spam protection

The contact form SHALL include a hidden honeypot field to filter bot submissions.

#### Scenario: Bot fills honeypot

- **WHEN** a submission includes a non-empty honeypot field
- **THEN** the API SHALL return HTTP 200 (to not alert the bot)
- **AND** the submission SHALL NOT be saved to the database
- **AND** no email SHALL be sent

#### Scenario: Human leaves honeypot empty

- **WHEN** a submission has an empty honeypot field
- **THEN** the submission SHALL be processed normally

### Requirement: Rate limiting on contact form API

The contact form API endpoint SHALL enforce rate limiting to prevent abuse.

#### Scenario: Rate limit exceeded

- **WHEN** more than 5 submissions arrive from the same IP within 10 minutes
- **THEN** the API SHALL return HTTP 429 (Too Many Requests)
- **AND** no submission SHALL be saved or emailed

#### Scenario: Normal submission rate

- **WHEN** a visitor submits once
- **THEN** the submission SHALL be processed normally
