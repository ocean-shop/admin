import { ComponentFixture } from '@angular/core/testing';

/** Lets TanStack Query start and resolve (it notifies via macrotasks), then re-renders the fixture. */
export async function flushQueries<T>(fixture: ComponentFixture<T>): Promise<void> {
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
}
