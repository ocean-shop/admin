import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeBadge } from './change-badge';
import { CHANGE_BADGE_ICONS } from './constants/change-badge.constants';

describe('ChangeBadge', () => {
  let fixture: ComponentFixture<ChangeBadge>;
  let element: HTMLElement;

  const badge = (): HTMLElement => element.querySelector('.change-badge') as HTMLElement;
  const icon = (): string | null | undefined =>
    element.querySelector('.change-badge-icon')?.textContent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeBadge],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeBadge);
    fixture.componentRef.setInput('label', '+5,0%');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a neutral flat change by default', () => {
    expect(badge().textContent).toContain('+5,0%');
    expect(icon()).toBe(CHANGE_BADGE_ICONS.flat);
    expect(badge().className).toBe('change-badge');
  });

  it.each([
    ['success', 'up', 'change-badge-success'],
    ['danger', 'down', 'change-badge-danger'],
    ['warning', 'up', 'change-badge-warning'],
  ] as const)('applies %s tone with %s arrow', async (tone, direction, className) => {
    fixture.componentRef.setInput('tone', tone);
    fixture.componentRef.setInput('direction', direction);
    await fixture.whenStable();

    expect(badge().classList).toContain(className);
    expect(icon()).toBe(CHANGE_BADGE_ICONS[direction]);
  });
});
