## ADDED Requirements

### Requirement: Login rate limiting

The login endpoint SHALL apply per-IP rate limiting to mitigate brute-force attacks
against credential authentication.

- Limit: 5 failed authentication attempts per IP within a 15-minute rolling window.
- Successful logins SHALL NOT count toward the limit (avoid penalising legitimate
  users who type their password right after several wrong tries).
- Storage: persistent (Postgres `RateLimit` table) so the limit survives backend
  restarts and works across multiple instances if scaled out.
- IP source: `x-forwarded-for` header (first hop) when present, falling back to
  `x-real-ip`. Both are set by the Nginx reverse proxy in front of the backend.

#### Scenario: Sixth failed attempt blocked

- **WHEN** a client sends 5 failed login attempts from IP `203.0.113.42` within 5
  minutes
- **AND** the same client sends a sixth login attempt
- **THEN** the response SHALL have status 401 with error message
  "Massa intents. Torna a provar en uns minuts."
- **AND** the credential check SHALL NOT execute (no DB read for the user)

#### Scenario: Rate limit window slides

- **WHEN** an IP made 5 failed attempts at minute 0
- **AND** the same IP attempts again at minute 16
- **THEN** the request SHALL be processed normally (the window has expired)

#### Scenario: Successful login does not consume rate limit budget

- **WHEN** a user makes 4 failed attempts then 1 successful attempt
- **THEN** the successful attempt SHALL NOT increment the failed-attempts counter
- **AND** the user retains 1 remaining attempt in the current window for any
  subsequent failures

#### Scenario: Rate limit applies per IP, not per email

- **WHEN** an attacker uses one IP to try logging in to 5 different accounts (one
  failed attempt each)
- **AND** then attempts a sixth login (any account)
- **THEN** the request SHALL be rate-limited (the limit is the total failed
  attempts from that IP, not per-account)

### Requirement: Uniform credential error message

The `authorize()` callback SHALL return a single, uniform error message for all
credential failures (whether the email is unknown or the password is wrong).

- Message: `"Email o contrasenya incorrectes"` (matched in EN as `"Invalid email or
  password"` and ES as `"Email o contraseña incorrectos"`).
- Internal logging MAY distinguish the two cases for debugging, but the response
  body MUST NOT.

#### Scenario: Unknown email returns generic error

- **WHEN** a client submits credentials with an email that doesn't exist in the
  `User` table
- **THEN** the response SHALL contain error `"Email o contrasenya incorrectes"`
- **AND** the response SHALL NOT contain phrases like "user not found", "no such
  email", or any other text that would let an attacker enumerate valid emails

#### Scenario: Wrong password returns same generic error

- **WHEN** a client submits credentials with a valid email but wrong password
- **THEN** the response SHALL contain error `"Email o contrasenya incorrectes"`
- **AND** the message SHALL be byte-identical to the response for an unknown email

#### Scenario: Internal logs distinguish the two cases

- **WHEN** the `authorize()` callback rejects credentials
- **THEN** the server log MAY include `[auth] login_failed reason=user_not_found`
  or `[auth] login_failed reason=password_mismatch` for operator visibility
- **AND** this log SHALL NOT be exposed to the client
