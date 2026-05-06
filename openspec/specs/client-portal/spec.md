# Client Portal Spec

## Purpose

Authenticated area where Auratech clients can track their projects, view invoices, exchange messages with the team, and manage their profile. Accessible at `/dashboard` for users with the CLIENT role.

## Requirements

### Requirement: Dashboard Overview

The dashboard home displays a summary of the client's active engagement with Auratech.

#### Scenario: Client views dashboard home

- **WHEN** an authenticated CLIENT navigates to `/dashboard`
- **THEN** they see a stats bar with: active projects count, pending invoices count, unread messages count, overall progress percentage
- **AND** a list of their 3 most recent projects with status badges and progress bars
- **AND** a list of their 3 most recent invoices with amounts and payment status

#### Scenario: Client with no projects

- **WHEN** a CLIENT with no assigned projects views the dashboard
- **THEN** they see a welcome message and a prompt to contact Auratech to get started

### Requirement: Project Tracking

Clients can view the status and progress of their projects in detail.

#### Scenario: Client views project list

- **WHEN** a CLIENT navigates to `/dashboard/projectes`
- **THEN** they see all their projects with: name, status badge (PENDING/IN_PROGRESS/REVIEW/COMPLETED), progress percentage, start date, category
- **AND** projects are sorted by status (active first) then by updatedAt descending

#### Scenario: Client views project detail

- **WHEN** a CLIENT clicks on a project
- **THEN** they see the full project page at `/dashboard/projectes/[id]`
- **AND** it shows: description, timeline, current status, progress bar, milestones if any, technologies used
- **AND** they can only view projects assigned to them

#### Scenario: Client tries to access another client's project

- **WHEN** a CLIENT navigates to `/dashboard/projectes/[id]` where the project belongs to another user
- **THEN** they receive a 404 response

### Requirement: Invoice Management

Clients can view and track their invoices.

#### Scenario: Client views invoice list

- **WHEN** a CLIENT navigates to `/dashboard/factures`
- **THEN** they see all their invoices with: invoice number, amount (EUR), status (PENDING/PAID/OVERDUE), issue date, due date
- **AND** invoices are sorted by date descending
- **AND** status badges use color coding: PENDING (yellow), PAID (green), OVERDUE (red)

#### Scenario: Client views invoice detail

- **WHEN** a CLIENT clicks on an invoice
- **THEN** they see the full invoice with line items, subtotal, taxes, total
- **AND** a download PDF button

#### Scenario: Overdue invoice alert

- **WHEN** a CLIENT has overdue invoices
- **THEN** a warning banner appears on the dashboard home highlighting the overdue amount

### Requirement: Messaging System

Clients can communicate with the Auratech team through an internal messaging system.

#### Scenario: Client views messages

- **WHEN** a CLIENT navigates to `/dashboard/missatges`
- **THEN** they see a conversation-style list of messages between them and Auratech team
- **AND** messages are sorted chronologically (newest at bottom)
- **AND** unread messages are visually highlighted

#### Scenario: Client sends a message

- **WHEN** a CLIENT types a message and clicks send
- **THEN** the message is stored in the database with sender=CLIENT user, receiver=assigned ADMIN
- **AND** the message appears immediately in the conversation
- **AND** the admin receives a notification (if notification system is active)

#### Scenario: Client reads unread messages

- **WHEN** a CLIENT opens the messages page with unread messages
- **THEN** all visible messages are marked as read
- **AND** the unread count in the sidebar updates to 0

### Requirement: Profile Management

Clients can view and update their profile information.

#### Scenario: Client views profile

- **WHEN** a CLIENT navigates to `/dashboard/perfil`
- **THEN** they see their profile: name, email, phone, company name

#### Scenario: Client updates profile

- **WHEN** a CLIENT modifies their profile fields and saves
- **THEN** the updated information is validated (email format, phone format)
- **AND** the profile is saved to the database
- **AND** a success confirmation is shown

#### Scenario: Client changes password

- **WHEN** a CLIENT enters current password, new password, and confirmation
- **THEN** the current password is verified against the stored hash
- **AND** the new password must be at least 8 characters
- **AND** the password is hashed with bcrypt and saved
- **AND** the session remains active

#### Scenario: Client enters wrong current password

- **WHEN** a CLIENT provides an incorrect current password
- **THEN** the password change is rejected with an error message
- **AND** the existing password remains unchanged

### Requirement: Data Isolation

Clients can only access their own data across all portal sections.

#### Scenario: API enforces data isolation

- **WHEN** any API request is made by a CLIENT user
- **THEN** all queries are filtered by the authenticated user's ID
- **AND** no data from other clients is ever returned

#### Scenario: Client attempts direct API access to other user's data

- **WHEN** a CLIENT makes an API request with another user's ID in the URL
- **THEN** the response is 404 (not 403, to avoid leaking existence)
