import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';
import { EMPTY_STATE_DEFAULT_ICON } from './constants/empty-state.constants';

@Component({
  imports: [EmptyState],
  template: `<app-empty-state title="Нічого" text="Опис" icon="sell">
    <button type="button" class="action">Додати</button>
  </app-empty-state>`,
})
class HostComponent {}

describe('EmptyState', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, EmptyState],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders title, text, icon and projected action', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state-title')?.textContent).toContain('Нічого');
    expect(element.querySelector('.empty-state-text')?.textContent).toContain('Опис');
    expect(element.querySelector('.empty-state-icon')?.textContent).toContain('sell');
    expect(element.querySelector('.empty-state-actions .action')).toBeTruthy();
  });

  it('omits the text paragraph and uses the default icon', async () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentRef.setInput('title', 'Порожньо');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state-text')).toBeNull();
    expect(element.querySelector('.empty-state-icon')?.textContent).toContain(
      EMPTY_STATE_DEFAULT_ICON,
    );
  });
});
