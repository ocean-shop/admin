---
name: angular-modern
description: Authors and reviews Angular code using the latest patterns in this workspace - zoneless change detection, signals, signal-based inputs/outputs/queries/models, new control flow, and standalone components. Use ONLY when the user explicitly requests this skill.
disable-model-invocation: true
---

# Angular Modern (Zoneless + Signals)

This skill encodes the Angular conventions used in this Nx workspace. The stack is **Angular 21.x**, **Nx 22.x**, strict TypeScript.

## Hard Rules

1. **Zoneless.** App bootstraps with `provideZonelessChangeDetection()`. Never import `zone.js`, never call `NgZone.run`.
2. **Standalone only.** No `NgModule`. Every component, directive, and pipe is `standalone` (do not pass `standalone: true` explicitly as it is default in v19+).
3. **Signals over RxJS.** Use `signal`, `computed`, `linkedSignal`, `effect` for state. Reserve RxJS for true streams.
4. **Signal IO.** Never use `@Input()`, `@Output()`, `@ViewChild()`. Use `input()`, `input.required()`, `output()`, `model()`, `viewChild()`.
5. **Control Flow.** Use `@if`, `@for` (always with `track`), `@switch`, `@let`, `@defer`. Never `*ngIf`, `*ngFor`.
6. **DI.** Use `inject()` over constructor DI.
7. **Nx.** Always use `nx` commands to generate code (e.g. `nx g @nx/angular:component name`).

## Example Component

```ts
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-user-card',
  imports: [DecimalPipe],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss'
})
export class UserCard {
  readonly userId = input.required<string>();
  readonly selected = output<string>();

  // Use signal for state
  protected readonly score = signal(0);
  // Computed for derived state
  protected readonly user = computed(() => ({ id: this.userId(), name: 'Test User' }));

  protected select(): void {
    this.selected.emit(this.userId());
  }
}
```

**`user-card.html`**:
```html
@let u = user();
@if (u) {
  <article>
    <h3>{{ u.name }}</h3>
    <p>Score: {{ score() | number }}</p>
    <button type="button" (click)="select()">Select</button>
  </article>
}
```

**`user-card.scss`**:
```scss
article {
  @apply p-4 border border-gray-300 rounded;
}
```
