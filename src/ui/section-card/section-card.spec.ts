import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SectionCard } from './section-card';

@Component({
  imports: [SectionCard],
  template: `<app-section-card title="General">
    <span class="addon" sectionCardTitleAddon>3</span>
    <button class="action" type="button" sectionCardActions>Reset</button>
    <p class="body">Body</p>
  </app-section-card>`,
})
class HostComponent {}

@Component({
  imports: [SectionCard],
  template: `<app-section-card title="Colors" icon="palette" description="Storefront palette" />`,
})
class DecoratedHostComponent {}

describe('SectionCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, DecoratedHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders the title, projects the title addon, actions and the body', async () => {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.section-card-title-text')?.textContent?.trim()).toBe('General');
    expect(element.querySelector('.section-card-title .addon')).not.toBeNull();
    expect(element.querySelector('.section-card-head > .action')).not.toBeNull();
    expect(element.querySelector('.section-card .body')).not.toBeNull();
    expect(element.querySelector('.section-card-icon')).toBeNull();
    expect(element.querySelector('.section-card-description')).toBeNull();
  });

  it('renders the optional icon and description', async () => {
    const fixture = TestBed.createComponent(DecoratedHostComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.section-card-icon')?.textContent?.trim()).toBe('palette');
    expect(element.querySelector('.section-card-icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      'Storefront palette',
    );
  });
});
