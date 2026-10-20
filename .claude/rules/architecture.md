# Architecture Rules

## Top-level layout

```
src/
├─ app/
│  ├─ core/            # app-wide singletons (alias @core)
│  │  ├─ constants/    # API_URL, storage keys, ...
│  │  ├─ guards/       # functional guards (CanActivateFn)
│  │  ├─ interceptors/ # functional interceptors (HttpInterceptorFn)
│  │  ├─ models/
│  │  └─ services/<name>/<name>.service.ts
│  ├─ pages/           # public (unauthenticated) pages, e.g. login
│  └─ modules/admin/   # authenticated area
│     ├─ layout/       # shell: header, menu
│     └─ pages/<feature>/
├─ ui/                 # reusable presentational components (alias @ui)
├─ testing/            # shared test providers (alias @testing)
└─ environments/
```

## Feature folder

Every feature (page) is self-contained and uses the same sub-folders. Only create the folders you need.

```
<feature>/
├─ <feature>.ts / .html / .scss / .spec.ts
├─ components/<child>/      # feature-private components (same structure, recursively)
├─ pages/<sub-page>/         # nested routed pages (e.g. shop/pages/tags)
├─ services/<x>.service.ts   # HTTP + feature services
├─ helpers/<x>.helper.ts     # pure functions (mapping, parsing, tree building)
├─ constants/<x>.constants.ts
└─ models/                   # all types, interfaces, enums
```

Code shared by several sub-pages lives one level up (e.g. `shop/constants`, `shop/helpers`, `shop/models`). Code shared by the whole app goes to `core/` (logic) or `ui/` (presentation).

## Where things go — strict

Component, service, helper, guard and interceptor files contain **only** their class/function. Nothing else is declared at module level.

| What | Where | File name |
| --- | --- | --- |
| Object types / interfaces | `models/` | `<name>.model.ts` |
| Union / alias types (`'a' \| 'b'`) | `models/` | `<name>.type.ts` |
| Enums and `as const` enum-objects | `models/` | `<name>.enum.ts` (or next to its union type in `.type.ts`) |
| Constants, defaults, config, tokens (`HttpContextToken`, `InjectionToken`) | `constants/` | `<name>.constants.ts` |
| User-facing texts | `constants/` | `<FEATURE>_TEXTS` object |
| Query key factories | `constants/` | `<scope>-query-keys.constants.ts` |
| Types used only by helpers | `helpers/models/` | `<name>.model.ts` |

Also forbidden in component/service/helper files:

- Inline object types in signatures: `(x: { id: string; payload: P })`, `signal<{...}>`, `jwtDecode<{...}>`, `Map<string, {...}>` — create a named type in `models/`.
- Inline string unions: `'asc' | 'desc'` — create a `.type.ts`.
- Hardcoded user-facing strings (in `.ts` **and** `.html`) — including fallbacks like `'Атрибут'`, button labels, empty states, error messages.
- Magic numbers (page sizes, limits, debounce times) — name them in `constants/`.
- Re-exporting models from component files (`export type { X } from './models/...'`). Import types directly from `models/`.

Specs are the exception: small test fixtures/types may be declared inline in `*.spec.ts`.

## Naming

- Files: kebab-case, no `.component` suffix: `tag-form-modal.ts`, class `TagFormModal`.
- Services: `<name>.service.ts`, class `<Name>Service`, `providedIn: 'root'`.
- Helpers: `<name>.helper.ts`, exported `const fn = () => {}` arrow functions.
- Constants: `SCREAMING_SNAKE_CASE`, prefixed with the feature (`TAGS_PAGE_SIZE`, `TAGS_TEXTS`).
- Texts object keys: `SCREAMING_SNAKE_CASE` (`PAGE_TITLE`, `CREATE_SUCCESS_TITLE`). Exposed in components as `protected readonly textData = X_TEXTS`.

## Data flow

1. **Service** — thin HTTP layer: `HttpClient` + `API_URL`, returns `Observable<ApiType>`, `withCredentials: true`. No state, no mapping to view models, no toasts.
2. **API models** (`XApiItem`, `XListResponse`) — fields are nullable/optional as the backend may send them.
3. **Mapping** — API → domain model (`XApiItem` → `X`) with trimmed values and fallbacks; lives in a helper (preferred) or a small private method.
4. **Page component** — owns queries/mutations, route params, modal state, toasts. Passes data down via inputs.
5. **Child/UI components** — presentational: `input()` in, `output()` out. No HTTP, no router (UI components in `src/ui` never inject feature services).

## Cross-cutting

- Errors: handled globally by `errorInterceptor` (toast + 401 refresh + 403 redirect). Don't duplicate error toasts in components; only show success toasts via `ToasterService`.
- Auth: `AuthService` (core), guards `authGuard` / `guestGuard`.
- Loading: `loaderInterceptor` + `LoaderService` for global loader; per-query `isPending()` for local loaders.
