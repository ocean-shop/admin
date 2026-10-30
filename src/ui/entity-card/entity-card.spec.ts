import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { EntityCard } from './entity-card';
import { EntityCardData } from './models/entity-card.model';

const ENTITY: EntityCardData = {
  id: 'entity-1',
  title: 'Ocean Shop',
  subtitle: 'Main warehouse shop',
  detail: 'https://ocean-shop.example',
  badge: 'active',
};

describe('EntityCard', () => {
  let fixture: ComponentFixture<EntityCard>;
  let component: EntityCard;

  const cardElement = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityCard],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityCard);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('entity', ENTITY);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders entity data', () => {
    expect(cardElement().textContent).toContain('Ocean Shop');
    expect(cardElement().textContent).toContain('Main warehouse shop');
    expect(cardElement().textContent).toContain('https://ocean-shop.example');
    expect(cardElement().textContent).toContain('active');
  });

  it('renders the title as plain text without a title link', () => {
    expect(cardElement().querySelector('.entity-title-link')).toBeNull();
  });

  it('renders the title as a link when a title link is provided', async () => {
    fixture.componentRef.setInput('entity', { ...ENTITY, titleLink: '/admin/shop/entity-1' });
    await fixture.whenStable();

    const link = cardElement().querySelector('.entity-title-link') as HTMLAnchorElement;
    expect(link.textContent?.trim()).toBe('Ocean Shop');
    expect(link.getAttribute('href')).toBe('/admin/shop/entity-1');
  });

  it('emits edit event', () => {
    const editSpy = vi.fn();
    component.edit.subscribe(editSpy);

    const editButton = fixture.debugElement.query(By.css('.icon-btn-edit'));
    editButton?.triggerEventHandler('click');

    expect(editSpy).toHaveBeenCalledTimes(1);
  });

  it('emits removed event', () => {
    const removedSpy = vi.fn();
    component.removed.subscribe(removedSpy);

    const removeButton = fixture.debugElement.query(By.css('.icon-btn-delete'));
    removeButton?.triggerEventHandler('click');

    expect(removedSpy).toHaveBeenCalledTimes(1);
  });
});
