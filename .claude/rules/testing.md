---
paths:
  - "src/**/*.ts"
---

# Unit Testing Rules (Vitest)

## Requirements

- Every component, service, helper, guard and interceptor has a sibling `<name>.spec.ts`. When you add or change one, add or update its spec in the same change.
- `models/` and `constants/` files need no specs (unless a constant contains logic, e.g. a builder function).
- Cover branches, not just "should create": guard clauses / early returns, empty and fallback values, error paths, disabled/loading states.
- Run `npm test` and keep it green. Check the coverage table for the files you touched.

## Conventions

- Vitest globals (`describe`, `it`, `expect`, `vi`, `beforeEach`) — no imports from `vitest`, no Jasmine/Jest APIs.
- Standalone components go into `imports: [Component]`, never `declarations`.
- Always add `provideZonelessChangeDetection()` to providers.
- Use `await fixture.whenStable()` to flush signals/async work; `fixture.detectChanges()` only when you need a synchronous render.
- Set inputs with `fixture.componentRef.setInput('name', value)`.
- Components using TanStack Query: add `...provideTestQueryClient()` from `@testing/query-client-test.provider`.
- Mock dependencies with `{ provide: X, useValue: { method: vi.fn() } }`; return `of(...)` / `throwError(() => ...)` for Observables.
- Route params: mock `ActivatedRoute` with `snapshot.paramMap` + `paramMap` (`BehaviorSubject` of `convertToParamMap(...)`).
- Services: `provideHttpClient()` + `provideHttpClientTesting()`, assert method, URL, params, body, `withCredentials`; `httpMock.verify()` in `afterEach`.
- Helpers: plain function tests, no TestBed.
- Guards / interceptors: `TestBed.runInInjectionContext(() => guard(...))`; interceptors via `provideHttpClient(withInterceptors([x]))`.
- Assert user-visible text through `*_TEXTS` constants, not duplicated string literals.
- Accessing protected members: `(component as any).method()` is acceptable in specs.

## Example

```ts
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

describe('Button', () => {
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Save');
    await fixture.whenStable();
  });

  it('renders label', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Save');
  });
});
```
