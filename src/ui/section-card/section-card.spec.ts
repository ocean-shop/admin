import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SectionCard } from './section-card';

@Component({
  imports: [SectionCard],
  template: `<app-section-card title="General">
    <span class="addon" sectionCardTitleAddon>3</span>
    <p class="body">Body</p>
  </app-section-card>`,
})
class HostComponent {}

describe('SectionCard', () => {
  it('renders the title, projects the title addon and the body', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.section-card-title span')?.textContent?.trim()).toBe('General');
    expect(element.querySelector('.section-card-title .addon')).not.toBeNull();
    expect(element.querySelector('.section-card .body')).not.toBeNull();
  });
});
