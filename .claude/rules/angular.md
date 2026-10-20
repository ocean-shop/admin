---
paths:
  - "src/**/*.ts"
  - "src/**/*.html"
  - "src/**/*.scss"
---

# Modern Angular (v22) Rules

## Change detection & reactivity

- The app is **zoneless** (`provideZonelessChangeDetection()`). Never import `zone.js`, never use `NgZone`, `ChangeDetectorRef.detectChanges()` or `setTimeout` to "kick" rendering.
- All state that the template reads must be a signal: `signal`, `computed`, `linkedSignal`. Plain mutable class fields do not re-render.
- Derive, don't sync: use `computed()` / `linkedSignal()` instead of `effect()` that writes to another signal.
- `effect()` only for side effects outside Angular (DOM APIs, charts, storage). Keep it small.
- RxJS only for real streams (router params, HTTP inside services, interceptors). Convert with `toSignal()` or unsubscribe via `takeUntilDestroyed(this.destroyRef)`. No manual `subscribe` without teardown.

## Components, directives, pipes

- Standalone only, no `NgModule`. Do not write `standalone: true` (it is the default).
- DI via `inject()`, not constructor parameters.
- Signal-based APIs only: `input()`, `input.required()`, `output()`, `model()`, `viewChild()`, `viewChildren()`, `contentChild()`. Never `@Input`, `@Output`, `@ViewChild`, `@HostBinding`, `@HostListener` — use the `host: {}` metadata object instead.
- Fields are `readonly`. Template-only members are `protected`; internal members are `private`. Public API = inputs/outputs only.
- External templates/styles: `templateUrl: './x.html'`, `styleUrl: './x.scss'`.
- Selector prefix `app-` (kebab-case for components, camelCase attributes for directives).
- Keep components lean: methods small and single-purpose. Mapping/normalization/parsing logic goes to `helpers/` (pure functions) or a service.
- Lazy-load routed pages with `loadComponent`.

## Templates

- Built-in control flow only: `@if`, `@for` (always with `track`), `@switch`, `@let`, `@defer`. Never `*ngIf`, `*ngFor`, `ngSwitch`.
- Use `[class.x]` / `[style.x]` bindings instead of `ngClass` / `ngStyle`.
- No logic in templates beyond simple reads — expose a `computed()` instead of calling methods that compute.
- No hardcoded user-facing text in templates — read it from a `*_TEXTS` constant (see `architecture.md`).
- Keep templates accessible (labels for inputs, `type` on buttons, `aria-*` where needed) — `templateAccessibility` lint rules are on.

## Forms

- Use **Signal Forms** (`@angular/forms/signals`): `form()`, validators (`required`, `maxLength`, `pattern`, …) and the `[formField]` directive.
- Never use `ReactiveFormsModule` (`FormGroup`, `FormControl`) or template-driven forms (`ngModel`).
- Form model is a `signal<XFormData>()` with the type in `models/`.

## Server state

- Use TanStack Query (`injectQuery`, `injectMutation`, `injectQueryClient`). Services return `Observable`; wrap with `lastValueFrom()` in `queryFn` / `mutationFn`.
- Query keys come from a `*-query-keys.constants.ts` factory — never inline arrays in components.
- After mutations: update cache with `setQueryData` for instant UI, then `invalidateQueries` to refetch.

## Styling

- Tailwind CSS only. Component SCSS uses `@reference "<relative>/styles.scss";` and `@apply` with design tokens. No raw CSS properties, no inline `style=""`.
- Prefer semantic class names in templates (`.tags-header`) styled with `@apply` in the SCSS file.

## TypeScript

- Strict mode. Avoid `any` in production code (allowed in specs for accessing protected members).
- Prefer `type` aliases (the codebase convention). Use `as const` for literal objects.
- Explicit return types on public and private methods.
