---
name: unit-testing
description: Authors and reviews Unit Tests in Vitest for Angular (zoneless) projects. Use ONLY when the user explicitly requests this skill.
disable-model-invocation: true
---

# Unit Testing (Vitest)

This skill encodes the Unit Testing conventions used in this workspace.

## Hard Rules

1. **Vitest.** The workspace uses Vitest, not Jest or Jasmine. Expect `vitest/globals` to provide global test functions. Use global `describe`, `it`, `expect`, and `vi` functions.
2. **Angular Zoneless Testing.** Angular testing uses `provideExperimentalZonelessChangeDetection()`. Do not use `fixture.detectChanges()` blindly after state changes - signal-based bindings and zoneless change detection handle most updates. Use `await fixture.whenStable()` if needed.
3. **Standalone Angular Components.** Configure TestBed with `imports: [Component]` instead of `declarations` for standalone components.
4. **Test Commands.** Run tests using standard project scripts, e.g., `npm run test` or `ng test`.

## Example Angular Test

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```