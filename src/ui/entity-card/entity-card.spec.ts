import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { EntityCard } from './entity-card';

describe('EntityCard', () => {
  let fixture: ComponentFixture<EntityCard>;
  let component: EntityCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityCard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(EntityCard);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('entity', {
      id: 'entity-1',
      title: 'Ocean Shop',
      subtitle: 'Main warehouse shop',
      detail: 'https://ocean-shop.example',
      badge: 'active',
    });
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders entity data', () => {
    const cardElement = fixture.nativeElement as HTMLElement;

    expect(cardElement.textContent).toContain('Ocean Shop');
    expect(cardElement.textContent).toContain('Main warehouse shop');
    expect(cardElement.textContent).toContain('https://ocean-shop.example');
    expect(cardElement.textContent).toContain('active');
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
