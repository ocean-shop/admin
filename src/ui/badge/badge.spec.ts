import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let fixture: ComponentFixture<Badge>;

  const badgeElement = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.badge') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('label', 'Оплачено');
    await fixture.whenStable();
  });

  it('renders the label with the neutral tone by default', () => {
    expect(badgeElement().textContent?.trim()).toBe('Оплачено');
    expect(badgeElement().className).toBe('badge');
  });

  it.each([
    ['primary', 'badge-primary'],
    ['success', 'badge-success'],
    ['warning', 'badge-warning'],
    ['danger', 'badge-danger'],
    ['info', 'badge-info'],
  ])('applies the %s tone class', async (tone, className) => {
    fixture.componentRef.setInput('tone', tone);
    await fixture.whenStable();

    expect(badgeElement().classList).toContain(className);
  });

  it('hides the dot in plain mode', async () => {
    fixture.componentRef.setInput('plain', true);
    await fixture.whenStable();

    expect(badgeElement().classList).toContain('badge-plain');
  });
});
