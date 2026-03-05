# Project Rules for Claude Code

## Project Overview

### Tech Stack

- **Runtime**: Node.js >=20.19.0, Yarn 4 (workspaces)
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Material UI 7, Emotion
- **Language**: TypeScript (strict), no JavaScript allowed
- **Testing**: Vitest, Testing Library, Playwright
- **Components**: Storybook 10
- **Docs**: Docusaurus 3

### Monorepo Architecture

```
apps/
  public/      — Next.js public site (:3000)
  pipeline/    — NestJS processing backend (:3001)
packages/
  ui/          — Shared MUI component library + Storybook (:6006)
  epub-utils/  — EPUB parsing library (@smoores/epub wrapper)
  docs/        — Docusaurus documentation site (:3003)
```

- All apps share `@reading/ui` package and `tsconfig.base.json`
- Next.js apps transpile `@reading/ui` via `transpilePackages`
- Pre-commit hooks: `typecheck` + `lint` across all workspaces
- `yarn dev` starts both `public` and `pipeline` via `concurrently`

### Pipeline Architecture

The book processing pipeline is built on **neuroline** + **neuroline-nestjs**.

#### Data flow

```
EPUB upload (public) → MongoDB chapters (with rawText)
                     → fire-and-forget POST to pipeline

book-processing pipeline (2 stages):
  1. parse-epub     — loads chapters from MongoDB (no EPUB re-parsing)
  2. dispatch-chapters — fans out: 1 HTTP POST per chapter

chapter-extraction pipeline (1 stage, started per chapter):
  1. process-chapter — LLM extraction → save languageItems → update chapter status
```

#### Key design decisions

- **No EPUB re-parsing in pipeline** — `apps/public` parses the EPUB during upload and stores chapter text as `rawText` in MongoDB. The pipeline reads from DB only.
- **`@smoores/epub` is ESM-only** — used only in `packages/epub-utils` via dynamic `import()`. The pipeline does NOT depend on it.
- **Nested pipelines for fan-out** — neuroline doesn't support dynamic job creation. Each chapter is processed by a separate `chapter-extraction` pipeline started via HTTP self-invocation.
- **StubAdapter for testing** — `apps/pipeline/src/llm/stub-adapter.ts` returns realistic English-language test data (idioms, phrasal verbs, rare words). Replace with a real LLM adapter when ready.

#### Database

- **Database name**: `reading` (hardcoded in both `apps/public` and `apps/pipeline`)
- **Collections**: `books`, `chapters` (with `rawText`), `languageItems`, `pipelines` (neuroline state)
- All pipeline jobs use `client.db('reading')` explicitly — do NOT rely on the database name from `MONGODB_URI`
- Mongoose in `app.module.ts` uses `{ dbName: 'reading' }`

#### Pipeline environment variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `PIPELINE_BASE_URL` | Self-invocation URL for chapter dispatch (`http://localhost:3001` in dev) |

#### neuroline specifics

- `JobContext` has `.logger.info()` / `.warn()` / `.error()` (not direct methods)
- `SynapseContext` has `.pipelineInput` and `.getArtifact<T>(jobName)`
- Pipeline stage property is `synapses` (plural)
- `JobDefinition` — use without generics, cast `input` inside `execute` (contravariance issue with typed generics)
- `MongoPipelineStorage` from `neuroline/mongo` requires `moduleResolution: "Bundler"` for subpath exports

### Next.js 16 specifics

- Proxy file: `apps/public/proxy.ts` (not `middleware.ts`) — exports `proxy` function
- `apps/public/tsconfig.dev.json` uses `module: "Node16"` for ts-node-dev CJS compatibility

---

## Git Rules

- **ЗАПРЕЩЕНО**: Никогда не выполняй `git add` — пользователь сам стейджит файлы.
- **ЗАПРЕЩЕНО**: Никогда не выполняй мутирующие git-команды (`git commit`, `git push`, `git checkout`, `git restore` и т.д.). Допускаются только read-only команды (`git status`, `git log`, `git diff`).
- **Коммиты**: Если пользователь просит создать коммит — предложи сообщение, но **не выполняй** команду.
  - Формат: Conventional Commits на русском.
  - Пример: `feat: добавить сервис расчёта стоимости`
  - Первая строка — не более 80 символов.

---

## Code Formatting

- **Indentation**: Tabs (4 spaces width)
- **Quotes**: Single quotes for strings
- **Trailing commas**: Always in multiline structures
- **Semicolons**: Required

```typescript
// ✅ Correct
const config = {
	name: 'reading',
	version: '1.0.0',
	features: [
		'auth',
		'dashboard',
	],
};

// ❌ Wrong
const config = {
  name: "reading",
  version: "1.0.0",
  features: [
    "auth",
    "dashboard"
  ]
}
```

---

## TypeScript Rules

Applies to all `*.ts` and `*.tsx` files.

- `strict: true` is enabled — never weaken it
- `allowJs: false` — all code must be TypeScript
- Never use `any`. Use `unknown` and narrow the type, or define a proper interface
- Never use `@ts-ignore`. Use `@ts-expect-error` with a comment explaining why
- Always type function parameters and return values for exported functions
- Prefer `interface` over `type` for object shapes (use `type` for unions, intersections, mapped types)
- Use `as const` for literal values instead of type assertions
- Avoid non-null assertions (`!`). Use optional chaining or explicit checks

---

## Documentation & Comments Language

All documentation and code comments MUST be in **International English**.

Applies to:
- All `.md`/`.mdx` files in `packages/docs/`, READMEs, architecture docs, API docs, user guides
- Inline (`//`), block (`/* */`), JSDoc (`/** */`), TODO/FIXME comments

**Exceptions:**
- Git commit messages (Conventional Commits на русском, see Git Rules above)
- User-facing UI content (strings, error messages for end users)
- Test fixtures for i18n testing
