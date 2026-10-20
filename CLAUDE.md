# Ocean Shop — Admin

Admin panel for Ocean Shop. Angular 22 (zoneless, standalone, signals), TanStack Query for server state, Signal Forms, Tailwind CSS 4, Vitest. UI language is Ukrainian.

## Commands

- `npm start` — dev server
- `npm test` — Vitest with coverage (single run)
- `npm run lint` — ESLint (angular-eslint)
- `npm run format` / `npm run format:check` — Prettier
- `npm run check` — format check + lint + test + build. Run before considering a task done.

## Rules

Detailed rules live in `.claude/rules/`:

- `angular.md` — modern Angular conventions (zoneless, signals, control flow, Signal Forms, Tailwind)
- `architecture.md` — folder structure, file naming, where types/constants/texts go, data flow
- `testing.md` — Vitest + TestBed conventions and coverage expectations

## Path aliases

- `@core/*` → `src/app/core/*`
- `@ui/*` → `src/ui/*`
- `@testing/*` → `src/testing/*`
