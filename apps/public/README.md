# Public App (`@sift/public`)

Public-facing Next.js application for the Sift public zone.

## Run From Monorepo Root

```bash
yarn dev:public
yarn build:public
yarn start:public
yarn test:public
```

## Run From This Package

```bash
yarn dev
yarn build
yarn start
yarn typecheck
yarn lint
yarn test
```

## Notes

- Runs on port `3000`.
- Uses shared UI primitives and theme from `@sift/ui`.
- Uses Next.js App Router with Material UI integration.
