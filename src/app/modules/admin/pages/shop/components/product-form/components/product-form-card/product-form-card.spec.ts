import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormCard } from './product-form-card';

@Component({
  imports: [ProductFormCard],
  template: `<app-product-form-card [title]="'Images'" [icon]="'perm_media'" [disabled]="true">
    <button cardActions class="action" type="button">Upload</button>
    <p class="body">Body</p>
  </app-product-form-card>`,
})
class HostComponent {}

describe('ProductFormCard', () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, ProductFormCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders title, icon and disabled state', () => {
    expect(element.querySelector('.product-form-card-title')?.textContent).toContain('Images');
    expect(element.querySelector('.product-form-card-icon')?.textContent?.trim()).toBe(
      'perm_media',
    );
    expect(element.querySelector('.product-form-card-disabled')).not.toBeNull();
  });

  it('projects header actions and body', () => {
    expect(element.querySelector('.product-form-card-header .action')).not.toBeNull();
    expect(element.querySelector('.product-form-card > .body')).not.toBeNull();
  });

  it('omits the icon when none is given', async () => {
    const cardFixture = TestBed.createComponent(ProductFormCard);
    cardFixture.componentRef.setInput('title', 'Plain');
    await cardFixture.whenStable();

    const cardElement = cardFixture.nativeElement as HTMLElement;
    expect(cardElement.querySelector('.product-form-card-icon')).toBeNull();
    expect(cardElement.querySelector('.product-form-card-disabled')).toBeNull();
  });
});
