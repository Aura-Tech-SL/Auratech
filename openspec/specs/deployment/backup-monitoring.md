## ADDED Requirements

### Requirement: Daily PostgreSQL backup

The production server SHALL run a daily automated backup of the PostgreSQL database.

#### Scenario: Backup runs daily

- **WHEN** the cron job triggers at 03:00 UTC daily
- **THEN** `pg_dump` SHALL export the `auratech` database to a compressed file at `/opt/auratech/backups/auratech-YYYY-MM-DD.sql.gz`

#### Scenario: Old backups cleaned up

- **WHEN** the backup script runs
- **THEN** backup files older than 7 days SHALL be deleted automatically

#### Scenario: Backup on empty database

- **WHEN** the database has no data
- **THEN** the backup SHALL still create a valid (empty) dump file without errors

### Requirement: Better Stack uptime monitoring

The production site SHALL be monitored via Better Stack free tier with alerts configured.

#### Scenario: Monitors configured

- **WHEN** Better Stack is set up
- **THEN** the following monitors SHALL exist:
  - `https://auratech.cat` (home page)
  - `https://auratech.cat/en/serveis` (key page)
  - `https://auratech.cat/en/blog` (blog)
  - `https://auratech.cat/api/blog` (API health)
  - SSL certificate expiry for `auratech.cat`

#### Scenario: Alert on downtime

- **WHEN** any monitor detects the site is unreachable for 2 consecutive checks (6 minutes)
- **THEN** Better Stack SHALL send an alert via email (and SMS if configured)

### Requirement: Hetzner SysMon basic monitoring

The Hetzner server SHALL have SysMon enabled for basic service monitoring.

#### Scenario: SysMon active

- **WHEN** checking the Hetzner Robot panel
- **THEN** HTTP monitoring on port 443 SHALL be enabled with email alerts
