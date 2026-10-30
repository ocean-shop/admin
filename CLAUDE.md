# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Ocean Shop — Admin

Admin panel for Ocean Shop. Angular 22 (zoneless, standalone, signals), TanStack Query for server state, Signal Forms, Tailwind CSS 4, Vitest. UI language is Ukrainian.

## Commands

- `npm start` — dev server on port 3001, `local` configuration (API at `http://localhost:3000`). Use `ng serve -c development` to hit the Railway dev API.
- `npm test` — Vitest with coverage (single run). Coverage thresholds in `angular.json` (70% statements/branches/lines) fail the run.
- `npx ng test --watch=false --include src/app/core/guards/auth/auth.guard.spec.ts` — run a single spec file (`--include` also accepts globs/folders). The whole app is still compiled, so any TS error anywhere fails the run.
- `npm run lint` — ESLint (angular-eslint)
- `npm run format` / `npm run format:check` — Prettier
- `npm run check` — format check + lint + test + build (same steps as CI in `.github/workflows/ci.yml`). Run before considering a task done.

Environments (`src/environments/`) are swapped via `fileReplacements`: `environment.ts` = production (default build), `environment.development.ts`, `environment.local.ts`. Only `API_URL` differs.

## Rules

Detailed rules live in `.claude/rules/`:

- `angular.md` — modern Angular conventions (zoneless, signals, control flow, Signal Forms, Tailwind)
- `architecture.md` — folder structure, file naming, where types/constants/texts go, data flow
- `testing.md` — Vitest + TestBed conventions and coverage expectations

## Path aliases

- `@core/*` → `src/app/core/*`
- `@ui/*` → `src/ui/*`
- `@testing/*` → `src/testing/*`

## Big picture

- **Routing** — all routes are declared flat in `src/app/app.routes.ts`. `/login` (`guestGuard`) and `/admin` (`authGuard`, `Layout` shell). Shop sub-pages (`shop/:shopId/tags`, `.../products/:productId/update`, …) are flat sibling routes, not router children, even though their code lives under `modules/admin/pages/shop/pages/`. Route paths used in code come from `APP_ROUTES` (`@core/constants/routes.constants`).
- **HTTP pipeline** (`app.config.ts`, order matters): `credentialsInterceptor` (adds `withCredentials` for our API) → `authInterceptor` (Bearer token, only for `isApiUrl`, skipped for refresh/logout) → `loaderInterceptor` → `errorInterceptor` (on 401 refreshes once via `RETRIED_AFTER_REFRESH` context token and retries; refresh failure clears session and goes to login; error toast; 403 → `not-permission`). URL checks live in `@core/helpers/api-url/api-url.helper` — reuse them rather than `startsWith(API_URL)`.
- **Auth session** (`AuthService`) — OTP login; access token kept **in memory only** (signal), refresh token is an HTTP-only cookie. A `SESSION_HINT_KEY` in localStorage tells `authGuard` to attempt a silent refresh after reload. Refresh is de-duplicated (`shareReplay`), serialized across tabs with `navigator.locks`, and session/logout are synced across tabs via `BroadcastChannel`. Clearing the session also clears the TanStack Query cache.
- **Query keys** — the shop area shares one factory, `SHOP_QUERY_KEYS` (`shop/constants/shop-query-keys.constants.ts`). `*Scope` keys are prefixes used to invalidate all pages of a list; `disabled(scope)` is the key for queries waiting on a route param. `ADMINS_QUERY_KEYS` / `SHOPS_QUERY_KEYS` follow the same shape (`scope` prefix). Global defaults (staleTime 30s, retry 1, no refetch on focus) are in `@core/constants/query-client.constants`.
- **Test helpers** (`src/testing/`) — `provideTestQueryClient()`, `flushQueries(fixture)` (needed to let TanStack Query resolve before asserting), `buildAuthSession()` fixture. A service that calls `injectMutation` and is created with `TestBed.inject` (no component) needs `TestBed.tick()` afterwards: the observer is subscribed in a root effect, and without a subscriber TanStack silently skips the `mutate(…, { onSuccess })` callbacks.
- **Product editor** (`shop/components/product-form`) — the page owns the main form; sidebar sections (categories, tags, attributes, images, variations) are self-saving, each with a component-scoped service extending `ProductFormSectionService` (configured via `configure()` with the host inputs). Debounced searches use `createDebouncedScheduler` from `@core/helpers`.
