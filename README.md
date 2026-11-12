# Ocean Shop — Admin

Admin panel for **Ocean Shop**: manage shops, their catalog (products, categories, tags, attributes), orders, customers and admin users. The UI language is Ukrainian.

## Tech stack

- **Angular 22** — standalone components, zoneless change detection, signals
- **TanStack Query** (`@tanstack/angular-query-experimental`) — server state
- **Signal Forms** (`@angular/forms/signals`)
- **Tailwind CSS 4**
- **Highcharts** — dashboard charts
- **Vitest** + jsdom — unit tests with coverage
- **ESLint** (angular-eslint) + **Prettier**

## Getting started

Requirements: Node.js 22+, npm 11.

```bash
npm install
npm start
```

The dev server runs at `http://localhost:3001` with the `local` configuration (API at `http://localhost:3000`).

### Environments

Environments are swapped via `fileReplacements` in `angular.json`; only `API_URL` differs.

| Configuration | File | API |
| --- | --- | --- |
| `local` (default for `ng serve`) | `environment.local.ts` | `http://localhost:3000` |
| `development` | `environment.development.ts` | Railway dev API |
| `production` (default for `ng build`) | `environment.ts` | `https://api.oceanmarket.com.ua` |

To run the app against the Railway dev API:

```bash
npx ng serve -c development
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Dev server on port 3001 (`local` config) |
| `npm run build` | Production build to `dist/` |
| `npm run watch` | Rebuild on changes (`local` config) |
| `npm test` | Unit tests (single run) with coverage |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Prettier write / check |
| `npm run check` | Format check + lint + tests + build (same as CI) |

Run a single spec file:

```bash
npx ng test --watch=false --include src/app/core/guards/auth/auth.guard.spec.ts
```

Coverage thresholds (70% statements / branches / lines) are configured in `angular.json` and fail the run if not met.

## Features

- **Login** — OTP-based sign-in (`/login`)
- **Dashboard** (`/admin`)
- **Shops** — list and shop detail (`/admin/shops`, `/admin/shop/:shopId`)
- **Shop catalog** — products (create / update with a sectioned product editor), categories, tags, attributes
- **Orders** — list and order detail
- **Users** — shop customers list and detail
- **Admins** — admin user management
- **Settings**

## Project structure

```
src/
├─ app/
│  ├─ core/             # app-wide singletons (@core): constants, guards, helpers, interceptors, models, services
│  ├─ pages/            # public pages (login)
│  ├─ modules/admin/    # authenticated area
│  │  ├─ layout/        # shell: header, menu
│  │  └─ pages/         # admins, home, settings, shop, shops, system
│  ├─ app.config.ts
│  └─ app.routes.ts     # all routes, declared flat
├─ ui/                  # reusable presentational components (@ui)
├─ testing/             # shared test helpers (@testing)
└─ environments/
```

Each feature folder is self-contained and may contain `components/`, `pages/`, `services/`, `helpers/`, `constants/` and `models/`. Types live in `models/`, constants and user-facing texts (`*_TEXTS`) in `constants/` — never inline in components or services.

Path aliases: `@core/*` → `src/app/core/*`, `@ui/*` → `src/ui/*`, `@testing/*` → `src/testing/*`.

## Architecture notes

- **Auth** — the access token is kept in memory only; the refresh token is an HTTP-only cookie. A session hint in `localStorage` lets `authGuard` silently refresh after a reload. Refresh is de-duplicated, serialized across tabs (`navigator.locks`), and login/logout are synced between tabs via `BroadcastChannel`.
- **HTTP pipeline** — `credentialsInterceptor` → `authInterceptor` → `loaderInterceptor` → `errorInterceptor`. The error interceptor refreshes the token once on 401 and retries, shows error toasts, and redirects to `not-permission` on 403.
- **Server state** — TanStack Query with query-key factories in `constants/*-query-keys.constants.ts`. Global defaults: `staleTime` 30s, `retry` 1, no refetch on window focus.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request: `format:check` → `lint` → `test` → `build`. Run `npm run check` locally before pushing.
