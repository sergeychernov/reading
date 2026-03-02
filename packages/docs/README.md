# Sift Docs (`@sift/docs`)

This package contains the Sift documentation site built with [Docusaurus](https://docusaurus.io/).

## Run From Monorepo Root

```bash
yarn docs          # dev server on port 3003
yarn docs:build    # production static build
yarn docs:serve    # serve built output
```

## Run From This Package

```bash
yarn start
yarn build
yarn serve
yarn typecheck
```

Copy `.env.example` to `.env`. For local development you can set `DOCS_AUTH_DISABLED=true` to skip GitHub OAuth. For OAuth or contributor-check testing, fill the other variables (see [GitHub OAuth on Vercel](/docs/vercel-github-oauth)). Do not commit `.env`.

## Content Structure

- `docs/architecture.md`: current technical architecture
- `docs/development-plans.md`: near-term development roadmap
- `src/pages/index.tsx`: documentation landing page
- `static/`: static assets copied as-is
- `docusaurus.config.ts`: site config
- `sidebars.ts`: docs sidebar definitions
- `api/auth/`: Vercel serverless routes (login, callback, logout)
- `middleware.ts`: Edge middleware that enforces auth

## GitHub OAuth (Vercel)

When deployed on Vercel, the site can be protected with GitHub OAuth so only logged-in GitHub users (or optionally only repo contributors) can access the docs. See [GitHub OAuth on Vercel](/docs/vercel-github-oauth) for setup: GitHub OAuth App, env vars (`GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `AUTH_SECRET`), and optional contributor restriction.

## Quality Checks

- Broken links are treated as errors (`onBrokenLinks: "throw"` in config).
- Run `yarn build` before merge to validate routes, markdown, and links.

Scripts set `NODE_OPTIONS=--disable-warning=DEP0169` to suppress the `url.parse()` deprecation warning from a dependency (Node 24+).
