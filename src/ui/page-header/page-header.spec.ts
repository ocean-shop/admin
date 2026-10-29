import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

@Component({
  imports: [PageHeader],
  template: `<app-page-header title="Title" description="Description">
    <button class="action" type="button">Action</button>
  </app-page-header>`,
})
class HostComponent {}

describe('PageHeader', () => {
  let fixture: ComponentFixture<PageHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeader, HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeader);
    fixture.componentRef.setInput('title', 'Tags');
    await fixture.whenStable();
  });

  it('renders the title', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header-title')?.textContent?.trim()).toBe('Tags');
  });

  it('hides the description when it is empty', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header-description')).toBeNull();
  });

  it('renders the description when provided', async () => {
    fixture.componentRef.setInput('description', 'All tags');
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header-description')?.textContent?.trim()).toBe('All tags');
  });

  it('projects actions', async () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    await hostFixture.whenStable();

    const element = hostFixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-header-actions .action')).not.toBeNull();
  });
});
