import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageLayout } from './page-layout';

@Component({
  imports: [PageLayout],
  template: `<app-page-layout><p class="projected">Content</p></app-page-layout>`,
})
class HostComponent {}

describe('PageLayout', () => {
  it('wraps projected content into the main container', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector('main.page-layout .page-layout-container .projected'),
    ).not.toBeNull();
  });
});
