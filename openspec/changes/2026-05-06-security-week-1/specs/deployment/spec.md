## ADDED Requirements

### Requirement: Decommission obsolete frontend and prerender containers

The Hetzner production server SHALL no longer run the `frontend` (Lovable SPA) and
`prerender` (SEO crawler service) containers. These were superseded by the Next.js
`backend` container during the consolidation of 2026-05-06 (Phase A) when Nginx was
reconfigured to route all traffic to `127.0.0.1:3000`.

The decommissioning consists of:

1. Stop and remove the running containers:
   `docker compose stop frontend prerender && docker compose rm -f frontend prerender`.
2. Remove the associated images to free disk space:
   `docker rmi auratech-frontend auratech-prerender`.
3. Run `docker system prune -af` to reclaim space from intermediate layers and
   dangling images.
4. In `/opt/auratech/docker-compose.yml`, leave the `frontend:` and `prerender:`
   service definitions present but **commented out**, with a header comment:
   ```yaml
   # Decommissioned 2026-05-06. Nginx routes all traffic to backend:3000.
   # Kept commented for reversibility. Remove entirely after 90 days if no issues.
   ```

#### Scenario: After decommission, only backend and db are running

- **WHEN** an operator runs `docker compose ps` on the production server
- **THEN** the output SHALL list only `auratech-backend-1` and `auratech-db-1`
- **AND** the `auratech-frontend-1` and `auratech-prerender-1` containers SHALL NOT
  appear

#### Scenario: Disk usage drops after cleanup

- **WHEN** the cleanup is executed on a host with `df -h /` showing 82% used
- **THEN** after `docker system prune -af`, `df -h /` SHALL show below 75% used

#### Scenario: Web continues to work

- **WHEN** the decommission is complete
- **AND** an external visitor opens `https://auratech.cat`
- **THEN** the response SHALL be HTTP 200 with the Next.js homepage (no
  visible regression)

### Requirement: Disk usage alert threshold

The deployment runbook SHALL document a manual disk-check procedure with two
threshold levels:

- **Warning** — `>= 75%` used. Investigate large files / images and run
  `docker system prune -f`.
- **Critical** — `>= 90%` used. Take immediate action: prune unused Docker
  resources, archive old backups, or expand the volume.

The check command is `df -h /` (root partition). The current backups directory
(`/opt/auratech/backups`) is sized small (~10 KB per daily dump), so the most
likely growth source is Docker layers and uploaded media.

#### Scenario: Operator detects disk above threshold

- **WHEN** an operator runs `df -h /` and observes 78% usage
- **THEN** the runbook SHALL guide them to run `docker system prune -f` first
- **AND** the runbook SHALL document expected savings (~1-3 GB typical)

(Automated alerting via cron + email is out of scope of this change. It will be
addressed in a future deployment-spec change.)

### Requirement: NEXTAUTH_SECRET rotation procedure

The deployment runbook SHALL document the procedure to rotate `NEXTAUTH_SECRET`
in production. Rotation invalidates all currently active JWT sessions; users will
be redirected to `/login` on their next request.

The procedure is:

1. Generate a new secret: `openssl rand -base64 32`.
2. SSH to the host and update `/opt/auratech/.env`:
   `sed -i 's|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET="<new-secret>"|' /opt/auratech/.env`
3. Restart the backend container: `docker compose up -d backend`.
4. Communicate to active users (Oscar, Sandra) that they will need to re-login.

The rotation SHALL happen at least once whenever there is reasonable suspicion that
the secret has been exposed (commit to a public repo, leaked in logs, etc.). It
SHOULD happen at planned maintenance windows otherwise.

#### Scenario: Initial rotation removes the dev-leftover secret

- **WHEN** an operator inspects `/opt/auratech/.env`
- **AND** finds `NEXTAUTH_SECRET="dev-secret-key-not-for-production-use"` (the
  string shipped in the repo's `.env.example`)
- **THEN** they SHALL execute the rotation procedure
- **AND** AFTER rotation, the prod env SHALL contain a 32-byte base64 random
  secret distinct from any value committed to source control
