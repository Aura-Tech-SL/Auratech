## MODIFIED Requirements

### Requirement: Dashboard data sources

The client dashboard SHALL render only data persisted in the database for the
authenticated user. Hardcoded mock values are prohibited.

When the authenticated user has zero records in a given category, the
relevant view SHALL render an empty-state component with a clear message
inviting the user to contact Auratech, rather than rendering "0" silently
or fake placeholder values.

#### Scenario: Client without projects sees empty state

- **WHEN** an authenticated CLIENT with no rows in `Project` where
  `userId === session.user.id` opens `/dashboard/projectes`
- **THEN** the page SHALL render the empty state with a contact CTA
- **AND** the page SHALL NOT show fictional projects ("Redisseny portal web",
  "Migració cloud", etc. that today appear hardcoded)

#### Scenario: Client with real projects sees them

- **WHEN** an authenticated CLIENT has at least one row in `Project` with
  `userId === session.user.id`
- **THEN** `/dashboard/projectes` SHALL render those rows ordered by
  `createdAt` descending
- **AND** clicking a project SHALL open `/dashboard/projectes/[id]` showing
  that project's details, returning 404 if the id doesn't belong to the
  caller

#### Scenario: Dashboard index counters reflect real counts

- **WHEN** any authenticated user opens `/dashboard`
- **THEN** the three counters (active projects, pending invoices, unread
  messages) SHALL show the result of `prisma.project.count`,
  `prisma.invoice.count`, `prisma.message.count` filtered by their session
  user id
- **AND** if the database is unreachable, the counters SHALL fall back to
  zero with a non-disruptive log line, never returning 500
