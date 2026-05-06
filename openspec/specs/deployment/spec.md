# Deployment Spec

## Purpose

Defines the deployment strategy, environments, Docker configuration, and CI/CD pipeline for the Auratech web platform.

## Requirements

### Requirement: Docker Development Environment

Local development runs entirely via Docker Compose.

#### Scenario: Developer starts the environment

- **WHEN** a developer runs `docker compose up -d`
- **THEN** PostgreSQL 16 starts on port 5432 with persistent volume
- **AND** the database is accessible with credentials from `.env`

#### Scenario: Database initialization

- **WHEN** the database container starts for the first time
- **THEN** the developer runs `npx prisma db push` to create the schema
- **AND** `npm run db:seed` to populate test data
- **AND** the application is ready to use at `http://localhost:3000`

#### Scenario: Data persistence across restarts

- **WHEN** `docker compose down` is run (without `-v`)
- **AND** `docker compose up -d` is run again
- **THEN** all database data is preserved in the Docker volume

### Requirement: Environment Configuration

Environment variables control application behavior across environments.

#### Scenario: Required environment variables

- **WHEN** the application starts
- **THEN** it requires: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET
- **AND** optional variables: RESEND_API_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_APP_NAME
- **AND** production adds: S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY (for media storage)

#### Scenario: Missing required variables

- **WHEN** a required environment variable is missing
- **THEN** the application fails to start with a clear error message indicating which variable is missing

### Requirement: Production Deployment (Vercel)

Primary deployment target is Vercel.

#### Scenario: Vercel deployment

- **WHEN** code is pushed to the `main` branch
- **THEN** Vercel auto-detects the Next.js project
- **AND** runs `npm run build` which includes `prisma generate`
- **AND** deploys the application to the production URL

#### Scenario: Preview deployments

- **WHEN** a pull request is opened
- **THEN** Vercel creates a preview deployment with a unique URL
- **AND** the preview uses a separate database (or the staging database)

#### Scenario: Environment variables in Vercel

- **WHEN** deploying to Vercel
- **THEN** all required environment variables are configured in the Vercel dashboard
- **AND** `NEXTAUTH_URL` matches the production domain
- **AND** `DATABASE_URL` points to a managed PostgreSQL instance (e.g., Neon, Supabase, Railway)

### Requirement: Database Migrations

Schema changes are managed via Prisma migrations.

#### Scenario: Creating a migration

- **WHEN** the Prisma schema is modified
- **THEN** the developer runs `npx prisma migrate dev --name descriptive-name`
- **AND** a migration file is created in `prisma/migrations/`
- **AND** the migration is applied to the local database

#### Scenario: Production migration

- **WHEN** deploying to production with schema changes
- **THEN** `npx prisma migrate deploy` runs automatically as part of the build
- **AND** migrations are applied in order
- **AND** failed migrations halt the deployment

### Requirement: CI/CD Pipeline

Automated checks run on every push and pull request.

#### Scenario: Pull request checks

- **WHEN** a pull request is opened or updated
- **THEN** the following checks run: TypeScript compilation (`tsc --noEmit`), ESLint (`npm run lint`), Prisma schema validation (`npx prisma validate`)
- **AND** the PR cannot be merged until all checks pass

#### Scenario: Build verification

- **WHEN** CI runs on a pull request
- **THEN** `npm run build` completes successfully
- **AND** no TypeScript errors, no ESLint errors

### Requirement: Backup Strategy

Database backups protect against data loss.

#### Scenario: Automated backups

- **WHEN** the production database is running
- **THEN** daily automated backups are configured via the managed database provider
- **AND** backups are retained for 30 days
- **AND** point-in-time recovery is available

#### Scenario: Manual backup

- **WHEN** a developer needs a manual backup
- **THEN** they can run `pg_dump` against the database
- **AND** the dump can be restored with `pg_restore`
