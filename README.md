# Songs DB Worker

Cloudflare Worker app for de-duplicating song text files from a single uploaded ZIP.

## What it currently does

- Accepts one `.zip` upload (max 50MB) through `/api/uploads`.
- Queues background processing with Cloudflare Queues.
- Extracts only `.txt` entries (ignores `__MACOSX/*` and `._*` metadata files).
- Detects duplicates using text similarity (content-based, not title-based).
- Stores scan data in D1, including each file's raw text for review.
- Always lands in review mode before final archive generation.
- Supports two review styles:
	- `autoMode=true`: preselects one file to keep in each duplicate group, but selections remain editable.
	- `autoMode=false`: no preselection for duplicates; you choose one file per group.
- Lets you finalize review to generate a deduplicated ZIP in R2.
- Returns a timed download link (7-day TTL) via `/api/downloads/:token`.
- Persists progress by `uploadId` in the URL so users can return to the same session.

## Stack

- Cloudflare Worker + Workers Assets
- Cloudflare D1 (metadata, duplicate groups, review state, links)
- Cloudflare R2 (input/output archives)
- Cloudflare Queues (async processing)
- Frontend: Preact + htm (bundled by esbuild)
- Router: itty-router

## Processing flow

1. Upload ZIP to `POST /api/uploads` with `file`, `threshold`, and `autoMode`.
2. Worker stores upload in R2 and creates an `uploads` record in D1.
3. Queue consumer processes the upload and writes songs + duplicate groups.
4. Upload moves to `review` status (for both auto and manual modes).
5. User optionally changes keep/discard choices in review UI.
6. `POST /api/uploads/:uploadId/finalize` validates selections and builds output ZIP.
7. Worker stores output ZIP, issues download token, marks upload `ready`.

## Status lifecycle

- `queued`
- `processing`
- `review`
- `ready`
- `failed`

## API summary

- `POST /api/uploads`
	- Multipart fields: `file` (zip), `threshold` (0 < value <= 1), `autoMode` (`true|false` string)
	- Response: `{ uploadId, status }`
- `GET /api/uploads/:uploadId`
	- Response: upload summary + optional download link
- `GET /api/duplicates?uploadId=...`
	- Response: duplicate groups with file names, scores, raw text, and keep state
- `POST /api/groups/:groupId/keep/:songId`
	- Marks selected song as kept for that group
- `POST /api/uploads/:uploadId/finalize`
	- Requires exactly one kept song per duplicate group
	- Generates download link
- `GET /api/downloads/:token`
	- Serves generated deduplicated ZIP until expiry

## Local development

### Prerequisites

- Node.js 20+
- npm
- Wrangler CLI (installed via local devDependency)
- Cloudflare account (for deploy and remote resources)

### Install

```bash
npm install
```

### Build frontend bundle

```bash
npm run build:frontend
```

### Run type checks

```bash
npm run typecheck
```

### Run locally

```bash
npm run dev
```

Open the local Wrangler URL shown in the terminal.

## Cloudflare resource setup

Create these resources in your Cloudflare account:

- D1 database (default name in config: `songs-db`)
- R2 bucket (default name in config: `songs-db-bucket`)
- Queue (default name in config: `songs-db-process`)

Then update [wrangler.jsonc](wrangler.jsonc) with your real IDs/names.

## Database migrations

Apply migrations:

```bash
npm run db:migrate
```

Migrations currently include:

- [migrations/0001_init.sql](migrations/0001_init.sql)
- [migrations/0002_add_manual_review.sql](migrations/0002_add_manual_review.sql)

## Deploy

```bash
npm run deploy
```

## Notes and limits

- Upload limit is 50MB.
- Input format is ZIP containing `.txt` files.
- Duplicate detection is text-similarity based.
- The source upload archive is deleted from R2 after finalize/output generation.
- Download links currently expire after 7 days.
