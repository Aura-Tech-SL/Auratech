# Authentication & Authorization Spec

## Purpose

Define the authentication and authorization system for the Auratech CMS, including role-based access control, session management, and password security using NextAuth.js with JWT strategy.

## Requirements

### Requirement: Role Definitions

The system SHALL support four distinct roles with hierarchical permissions:

- **SUPERADMIN** — full system access, can manage other admins and impersonate users.
- **ADMIN** — manage all content (pages, blog, services, projects), clients, and projects.
- **EDITOR** — manage blog posts, pages, and media only. Cannot manage users, services, or projects.
- **CLIENT** — access client portal only, restricted to own projects, invoices, and messages.

Roles MUST be stored in the `User` model as an enum field and included in the JWT payload.

#### Scenario: SUPERADMIN has full access

- **WHEN** a user with role `SUPERADMIN` makes any API request
- **THEN** the request SHALL be authorized regardless of the resource or action

#### Scenario: ADMIN can manage content but not other admins

- **WHEN** a user with role `ADMIN` attempts to create, read, update, or delete pages, blog posts, services, or projects
- **THEN** the request SHALL be authorized
- **AND WHEN** the same user attempts to create or modify a user with role `SUPERADMIN`
- **THEN** the request SHALL be rejected with HTTP 403

#### Scenario: EDITOR is restricted to content resources

- **WHEN** a user with role `EDITOR` attempts to create or edit blog posts, pages, or media
- **THEN** the request SHALL be authorized
- **AND WHEN** the same user attempts to delete a page, manage users, or modify services
- **THEN** the request SHALL be rejected with HTTP 403

#### Scenario: CLIENT sees only own data

- **WHEN** a user with role `CLIENT` requests projects via `/api/projects`
- **THEN** the response SHALL contain only projects where the client is the assigned owner
- **AND** the response SHALL NOT include projects belonging to other clients

### Requirement: Email and Password Authentication

Authentication SHALL use the NextAuth.js credentials provider with email and password. No OAuth providers are required at launch.

- Login endpoint: `POST /api/auth/callback/credentials` (handled by NextAuth.js).
- Credentials: `email` (valid email format) and `password` (minimum 8 characters).
- On success: return a signed JWT containing `userId`, `email`, `role`, and `name`.
- On failure: return a generic error message without revealing whether the email exists.

#### Scenario: Successful login with valid credentials

- **WHEN** a user submits a valid email and correct password via the login form
- **THEN** NextAuth.js SHALL return a signed JWT session token
- **AND** the response SHALL set an `httpOnly` secure cookie with the token
- **AND** the user SHALL be redirected to the appropriate dashboard based on their role

#### Scenario: Login fails with wrong password

- **WHEN** a user submits a valid email but incorrect password
- **THEN** the system SHALL return a 401 error with message "Invalid credentials"
- **AND** the response SHALL NOT indicate whether the email exists in the system

#### Scenario: Login fails with non-existent email

- **WHEN** a user submits an email that does not exist in the database
- **THEN** the system SHALL return a 401 error with the same "Invalid credentials" message
- **AND** the response time SHALL be comparable to a valid-email attempt (to prevent timing attacks)

#### Scenario: Login with disabled account

- **WHEN** a user with `isActive: false` submits valid credentials
- **THEN** the system SHALL return a 401 error with message "Account disabled"
- **AND** no JWT SHALL be issued

### Requirement: JWT Session Strategy

Sessions SHALL use the JWT strategy (stateless). No database session table is required.

- JWT secret: loaded from `NEXTAUTH_SECRET` environment variable.
- Token payload: `userId`, `email`, `role`, `name`, `iat`, `exp`.
- Access token expiry: 15 minutes.
- Refresh behavior: NextAuth.js `session.maxAge` set to 7 days; token is refreshed on each request within the window.

#### Scenario: Valid JWT grants access

- **WHEN** a request includes a valid, non-expired JWT in the session cookie
- **THEN** the middleware SHALL extract the user identity and role from the token
- **AND** attach them to the request context for downstream route handlers

#### Scenario: Expired JWT triggers re-authentication

- **WHEN** a request includes an expired JWT
- **THEN** the system SHALL return HTTP 401
- **AND** the client-side auth handler SHALL redirect the user to the login page

#### Scenario: Missing JWT on protected route

- **WHEN** a request to a protected API route or admin page lacks a JWT cookie
- **THEN** the middleware SHALL return HTTP 401 for API routes
- **AND** redirect to `/admin/login` for page routes

### Requirement: Password Hashing

All passwords MUST be hashed using bcrypt with a minimum cost factor of 10 rounds. Plain-text passwords SHALL never be stored or logged.

#### Scenario: Password stored as bcrypt hash on user creation

- **WHEN** a new user is created via the admin panel or seed script
- **THEN** the password field in the database SHALL contain a bcrypt hash (starting with `$2b$`)
- **AND** the original plain-text password SHALL NOT appear in any log output

#### Scenario: Password comparison uses bcrypt verify

- **WHEN** a user submits their password during login
- **THEN** the system SHALL compare using `bcrypt.compare()` against the stored hash
- **AND** SHALL NOT perform a plain-text string comparison

### Requirement: Password Reset Flow

Users SHALL be able to reset their password via an email-based flow.

1. User requests reset at `/admin/forgot-password` by entering their email.
2. System generates a cryptographically random token, stores it with a 1-hour expiry.
3. System sends an email with a reset link: `/admin/reset-password?token=<token>`.
4. User sets a new password; token is invalidated after use.

#### Scenario: Successful password reset

- **WHEN** a user requests a password reset with a registered email
- **THEN** the system SHALL generate a unique token and store it in the database with a 1-hour expiry
- **AND** send an email containing a reset link to the user's address
- **AND WHEN** the user submits a new password with the valid token
- **THEN** the password SHALL be updated (bcrypt hashed) and the token SHALL be deleted

#### Scenario: Reset with expired token

- **WHEN** a user submits a new password with a token older than 1 hour
- **THEN** the system SHALL reject the request with message "Reset link has expired"
- **AND** the password SHALL remain unchanged

#### Scenario: Reset with already-used token

- **WHEN** a user attempts to use a reset token that has already been consumed
- **THEN** the system SHALL reject the request with message "Reset link is no longer valid"

#### Scenario: Reset request for non-existent email

- **WHEN** a user requests a password reset for an email not in the system
- **THEN** the system SHALL respond with the same success message ("If the email exists, a reset link has been sent")
- **AND** no email SHALL be sent

### Requirement: Role-Based Route Protection

Middleware SHALL protect all `/admin/*` routes and `/api/*` routes based on user role.

| Route Pattern              | Minimum Role   |
|---------------------------|----------------|
| `/admin/login`            | Public         |
| `/admin/forgot-password`  | Public         |
| `/admin/dashboard`        | EDITOR+        |
| `/admin/pages/*`          | EDITOR+        |
| `/admin/blog/*`           | EDITOR+        |
| `/admin/media/*`          | EDITOR+        |
| `/admin/services/*`       | ADMIN+         |
| `/admin/projects/*`       | ADMIN+         |
| `/admin/users/*`          | ADMIN+         |
| `/admin/settings/*`       | SUPERADMIN     |
| `/portal/*`               | CLIENT         |
| `/api/contact` (POST)     | Public         |
| `/api/*` (other)          | Authenticated  |

#### Scenario: Editor accesses blog management

- **WHEN** a user with role `EDITOR` navigates to `/admin/blog`
- **THEN** the middleware SHALL allow access and render the blog management page

#### Scenario: Editor blocked from services management

- **WHEN** a user with role `EDITOR` navigates to `/admin/services`
- **THEN** the middleware SHALL redirect to `/admin/dashboard` with a "Not authorized" flash message

#### Scenario: Unauthenticated user accesses admin

- **WHEN** an unauthenticated user navigates to any `/admin/*` route (except login and forgot-password)
- **THEN** the middleware SHALL redirect to `/admin/login`
- **AND** store the originally requested URL for post-login redirect

#### Scenario: Client accesses portal

- **WHEN** a user with role `CLIENT` navigates to `/portal/projects`
- **THEN** the middleware SHALL allow access
- **AND WHEN** the same user navigates to `/admin/dashboard`
- **THEN** the middleware SHALL redirect to `/portal` with a "Not authorized" message

### Requirement: SUPERADMIN Impersonation

SUPERADMIN users SHALL be able to impersonate other users for debugging and support purposes.

- Impersonation is activated via `POST /api/auth/impersonate` with target `userId`.
- The impersonating session carries both the original identity and the impersonated identity.
- A visible banner SHALL appear in the UI indicating impersonation is active.
- Impersonation ends via `POST /api/auth/stop-impersonate` or after 1 hour.

#### Scenario: SUPERADMIN impersonates a client

- **WHEN** a SUPERADMIN calls `POST /api/auth/impersonate` with a valid client userId
- **THEN** the session SHALL reflect the client's role and permissions
- **AND** the JWT payload SHALL include `impersonatedBy` with the SUPERADMIN's userId
- **AND** the admin UI SHALL display an impersonation banner

#### Scenario: Non-SUPERADMIN attempts impersonation

- **WHEN** a user with role `ADMIN` calls `POST /api/auth/impersonate`
- **THEN** the system SHALL return HTTP 403
- **AND** no session changes SHALL occur

#### Scenario: Impersonation auto-expires

- **WHEN** an impersonation session has been active for more than 1 hour
- **THEN** the system SHALL automatically revert to the original SUPERADMIN session on the next request
