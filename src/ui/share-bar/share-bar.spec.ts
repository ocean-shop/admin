import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareBar } from './share-bar';

describe('ShareBar', () => {
  let fixture: ComponentFixture<ShareBar>;
  let element: HTMLElement;

  const bar = (): HTMLElement => element.querySelector('.share-bar') as HTMLElement;
  const segments = (): HTMLElement[] =>
    Array.from(element.querySelectorAll<HTMLElement>('.share-bar-segment'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareBar],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareBar);
    fixture.componentRef.setInput('segments', [
      { value: 0.59, tone: 'primary', label: 'Нові · 59%' },
      { value: 0.41, tone: 'secondary', label: 'Повторні · 41%' },
    ]);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a decorative bar with segment widths and tones', () => {
    expect(bar().getAttribute('aria-hidden')).toBe('true');
    expect(bar().hasAttribute('role')).toBe(false);
    expect(segments().map((segment) => segment.style.width)).toEqual(['59%', '41%']);
    expect(segments()[0].classList).toContain('share-bar-primary');
    expect(segments()[1].classList).toContain('share-bar-secondary');
    expect(element.querySelector('.share-bar-label')).toBeNull();
  });

  it('exposes an accessible image with labels when large', async () => {
    fixture.componentRef.setInput('ariaLabel', 'Нові 59%, повторні 41%');
    fixture.componentRef.setInput('large', true);
    await fixture.whenStable();

    expect(bar().getAttribute('role')).toBe('img');
    expect(bar().getAttribute('aria-label')).toBe('Нові 59%, повторні 41%');
    expect(bar().hasAttribute('aria-hidden')).toBe(false);
    expect(bar().classList).toContain('share-bar-large');
    expect(
      Array.from(element.querySelectorAll('.share-bar-label')).map((label) => label.textContent),
    ).toEqual(['Нові · 59%', 'Повторні · 41%']);
  });
});
