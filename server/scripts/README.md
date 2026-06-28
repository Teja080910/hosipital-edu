# Server Scripts

## Database Setup Flow

These commands set up the PostgreSQL schema and run the data migration from Firestore.

**`npm run db:generate`** — Scans `schema.ts` for changes and generates Drizzle migration SQL files in `server/drizzle/`. Run this after modifying any table definition.

**`npm run db:migrate`** — Applies all pending migration files to the PostgreSQL database. Creates tables, columns, indexes, etc. Run this before importing data.

**`npm run db:push`** — Pushes schema changes directly to PostgreSQL without creating migration files. For development only; avoids migration file clutter.

**`npm run db:studio`** — Opens Drizzle Studio in the browser for visual database inspection and editing.

## Data Migration Flow (Firebase → PostgreSQL)

These scripts pull data from Firebase Firestore and insert it into PostgreSQL. The flow is: `export:rest` → `db:firebase-migrate`.

**`npm run export:rest`** — Connects to Firestore via REST API (using gcloud auth), exports all 17 collections, and writes clean JSON files to `server/exports/`. Handles pagination (500 docs per page) and token refresh. Output: ~891MB of JSON with ~15,400 documents.

Requires [gcloud CLI](https://cloud.google.com/sdk) authenticated with a Firebase project. If `gcloud` is not on your PATH, set the binary path:
```bash
export GCLOUD_BIN=/var/www/.../hosipital-edu/server/exports/
```

**`npm run db:firebase-migrate`** — Reads the JSON files from `server/exports/`, transforms Firestore data model to the PostgreSQL schema, and inserts into all tables (users, questions, flashcards, subscriptions, video modules/lessons, payments, articles, translations, etc.). Idempotent — safe to re-run; skips existing records by matching on email/title/text keys.

## Post-Migration Utilities

**`npm run create:admin`** — `node scripts/create-admin.js` — Creates an admin user with email/password for initial system access.

**`npm run db:cleanup-stream`** — Scans Cloudflare Stream for videos not referenced in any `video_lessons` row and deletes them. Frees storage space after content reorganization.

**`npm run db:batch-reset-migrated`** — Sends password-reset emails to all users who were imported via migration (no password hash set). Allows them to set their own password.

**`npm run db:migrate-videos`** — Matches Google Drive video URLs in video lessons to Cloudflare Stream uploads and updates the database to point to the new Cloudflare URLs. One-time migration after uploading Drive content to Cloudflare.
