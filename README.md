# Reading Monorepo

Yarn workspaces monorepo with:

- Next.js public zone app in `apps/public`
- Docusaurus docs site in `packages/docs`
- Shared Material UI kit in `packages/ui`
- Storybook for the UI kit

## Requirements

- Node.js `>=20.19.0` (recommended: use `.nvmrc`, currently `24.11.0`)
- Yarn `4.12.0` (via `corepack`)

## Setup

```bash
nvm use
corepack enable
yarn install
```

## Workspace Layout

```text
apps/
  public/   # Next.js app on :3000
packages/
  ui/       # Shared MUI components + Storybook
  docs/     # Docusaurus documentation site on :3003
```

## Development

Run the app:

```bash
yarn dev
```

Run docs:

```bash
yarn docs
```

Run Storybook:

```bash
yarn storybook
```

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

Vitest is configured for the Next.js app.

Run all tests:

```bash
yarn test
```

Run tests for the public app:

```bash
yarn test:public
```

Workspace-local test command:

```bash
yarn workspace @reading/public test
```
