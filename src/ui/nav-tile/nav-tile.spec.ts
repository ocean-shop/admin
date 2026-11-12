import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NavTile } from './nav-tile';

describe('NavTile', () => {
  it('renders the tile as a router link with title, description and icon', async () => {
    await TestBed.configureTestingModule({
      imports: [NavTile],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(NavTile);
    fixture.componentRef.setInput('tile', {
      title: 'Теги',
      description: 'Керуйте тегами',
      icon: 'sell',
      route: '/admin/shop/1/tags',
      linkLabel: 'Відкрити',
    });
    await fixture.whenStable();

    const link = (fixture.nativeElement as HTMLElement).querySelector('a.nav-tile');
    expect(link?.getAttribute('href')).toBe('/admin/shop/1/tags');
    expect(link?.getAttribute('aria-label')).toBe('Відкрити: Теги');
    expect(link?.textContent).toContain('Керуйте тегами');
    expect(link?.querySelector('.nav-tile-icon')?.textContent).toContain('sell');
  });
});
