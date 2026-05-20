---
sidebar_position: 1
---

# Architecture

Sift is a Yarn workspaces monorepo with three frontend applications, one shared UI package, and one documentation package.

## Repository layout

```text
apps/
  public/   # Next.js public zone (:3000)
  admin/    # Next.js admin area (:3001)
  client/   # Next.js client area (:3002)
packages/
  ui/       # Shared Material UI components, theme, and Storybook
  docs/     # Docusaurus documentation site (:3003)
```

## Application layer

- <a href="/docs/readmes/public-app-readme">`apps/public`</a>, <a href="/docs/readmes/admin-app-readme">`apps/admin`</a>, and <a href="/docs/readmes/client-app-readme">`apps/client`</a> are Next.js apps using the App Router.
- Each app has its own runtime port and deployment boundary.
- Each app currently renders a dedicated zone homepage and consumes shared UI primitives from `@sift/ui`.

## Shared UI layer

- `packages/ui` centralizes design tokens and reusable components.
- The shared `AppThemeProvider` wraps every app layout.
- Material UI and Emotion are used for component styling and theme propagation.
- Storybook is used to develop and validate UI components independently.

## Documentation layer

- `packages/docs` is a Docusaurus site used for technical/product documentation.
- The docs site is versioned in the same repository as apps and shared UI, so architecture and delivery plans evolve with code.

## Tooling and quality gates

- Workspace management: Yarn `4.x` workspaces.
- Language/tooling: TypeScript across apps and packages.
- Tests: Vitest for frontend apps.
- Pre-commit guardrails: Husky runs workspace `typecheck` and `lint` before commit.

## Hi Level sequence diagram

```mermaid
sequenceDiagram
  participant C as Client
  participant W as NextJS

  participant DB as DB
  participant CR as Cron

  participant B as NestJS
  participant A as API
  participant CA as calculation
  participant N as notification

  C->>W: Create team
  W->>DB: UPSERT team
  C->>W: Create player
  W->>DB: UPSERT player

  C->>W: Add contract (configure)
  W->>DB: UPSERT contract

  CR->>B: Check the match result

  B->>DB: GET /team
  B->>A: GET /statistics
  B->>CA: calculate triggers
  B->>DB: UPSERT report
  B->>N: notify clients
  C->>W: look at the report
  W->>DB: get /report
```
