# Reading Monorepo

A web application for a book club with an English-language book database. Users upload EPUB files which are parsed and processed to extract idioms, phrasal verbs, and rare words from each chapter.

## Requirements

- Node.js `>=20.19.0` (recommended: use `.nvmrc`, currently `24.11.0`)
- Yarn `4.12.0` (via `corepack`)
- MongoDB Atlas account (or local MongoDB)
- Vercel Blob storage token

## Setup

```bash
nvm use
corepack enable
yarn install
```

### Environment variables

Copy `.env.example` files and fill in the values:

```bash
cp apps/public/.env.example apps/public/.env.local
cp apps/pipeline/.env.example apps/pipeline/.env
```

| Variable | Where | Description |
|----------|-------|-------------|
| `MONGODB_URI` | both | MongoDB Atlas connection string |
| `BLOB_READ_WRITE_TOKEN` | both | Vercel Blob storage token |
| `AUTH_DISABLED` | public | Set to `true` to skip Google OAuth in dev |
| `AUTH_SECRET` | public | NextAuth secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | public | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | public | Google OAuth client secret |
| `PIPELINE_API_URL` | public | Pipeline service URL (`http://localhost:3001` for local) |
| `PIPELINE_BASE_URL` | pipeline | Self-invocation URL (`http://localhost:3001` for local) |

## Workspace Layout

```text
apps/
  public/       # Next.js app — UI + CRUD API               (:3000)
  pipeline/     # NestJS app — EPUB processing pipelines     (:3001)
packages/
  ui/           # Shared MUI components + Storybook          (:6006)
  epub-utils/   # Shared EPUB parsing library
  docs/         # Docusaurus documentation site              (:3003)
```

## Development

Run **both** the site and the pipeline backend:

```bash
yarn dev
```

This starts:
- **public** — Next.js on [http://localhost:3000](http://localhost:3000)
- **pipeline** — NestJS on [http://localhost:3001](http://localhost:3001)

Run only one service:

```bash
yarn dev:public      # Next.js only
yarn dev:pipeline    # NestJS pipeline only
```

Run docs or Storybook:

```bash
yarn docs            # Docusaurus on :3003
yarn storybook       # Storybook on :6006
```

## Architecture

```
User uploads EPUB
     │
     ▼
[Next.js :3000]  POST /api/books
     │  ├─ upload EPUB to Vercel Blob
     │  ├─ parse metadata + chapters (via @reading/epub-utils)
     │  ├─ save book + chapters (with rawText) to MongoDB
     │  └─ fire-and-forget: POST → pipeline
     ▼
[NestJS :3001]  POST /api/v1/book-processing
     │
     ├─ Stage 1: parse-epub
     │     load chapters from MongoDB (no EPUB re-parsing)
     │
     └─ Stage 2: dispatch-chapters
           for each chapter → POST /api/v1/chapter-extraction
                │
                ▼
          [chapter-extraction pipeline] × N chapters
                ├─ LLM extraction (idioms, phrasal verbs, rare words, summary)
                └─ save languageItems + update chapter status in MongoDB

[Next.js :3000]  GET /api/books/:id/status
     ├─ computes book completion from chapter statuses
     └─ returns per-chapter statuses (UI polls every 3s)
```

### How Next.js connects to Pipeline

Next.js triggers the pipeline via `PIPELINE_API_URL` env variable:

| Environment | `PIPELINE_API_URL` value |
|-------------|--------------------------|
| `yarn dev` | `http://localhost:3001` (both servers run locally) |
| Production | URL of the deployed NestJS service |

The pipeline also calls itself (`PIPELINE_BASE_URL`) to fan out chapter-extraction pipelines.

## Build

Build everything (UI + app + docs):

```bash
yarn build
```

Build individual targets:

```bash
yarn build:ui
yarn build:public
yarn docs:build
```

## Test

```bash
yarn test              # all tests
yarn test:public       # Next.js app tests only
```

## Type checking & linting

```bash
yarn typecheck         # tsc --noEmit across all workspaces
yarn lint              # lint across all workspaces
```
