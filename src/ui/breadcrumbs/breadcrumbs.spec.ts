import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Breadcrumbs } from './breadcrumbs';

describe('Breadcrumbs', () => {
  let fixture: ComponentFixture<Breadcrumbs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breadcrumbs],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Breadcrumbs);
    fixture.componentRef.setInput('items', [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Settings' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders breadcrumb navigation with separator', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Dashboard');
    expect(element.textContent).toContain('Settings');
    expect(element.textContent).toContain('chevron_right');
  });

  it('renders clickable and current breadcrumb states', () => {
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector('a');
    const segments = element.querySelectorAll('span');

    expect(link?.getAttribute('href')).toBe('/admin');
    expect(segments[1]?.classList.contains('font-medium')).toBe(true);
    expect(segments[1]?.classList.contains('text-on-surface')).toBe(true);
  });

  it('renders all separators between items', async () => {
    fixture.componentRef.setInput('items', [
      { label: 'Dashboard', href: '/admin' },
      { label: 'Shop', href: '/admin/shop/1' },
      { label: 'Products' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const separators = Array.from(element.querySelectorAll('.material-symbols-outlined')).filter(
      (node) => node.textContent?.trim() === 'chevron_right',
    );

    expect(separators).toHaveLength(2);
  });
});
