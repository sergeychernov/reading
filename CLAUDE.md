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
  public/    — Next.js public site (:3000)
packages/
  ui/        — Shared MUI component library + Storybook (:6006)
  docs/      — Docusaurus documentation site (:3003)
```

- All apps share `@reading/ui` package and `tsconfig.base.json`
- Next.js apps transpile `@reading/ui` via `transpilePackages`
- Pre-commit hooks: `typecheck` + `lint` across all workspaces

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
