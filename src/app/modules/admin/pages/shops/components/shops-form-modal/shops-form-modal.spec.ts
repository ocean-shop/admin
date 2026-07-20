import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShopsFormModal } from './shops-form-modal';
import { Shop } from '../../models/shop.model';
import { SHOPS_TEXTS } from '../../constants/shops.constants';

describe('ShopsFormModal', () => {
  let fixture: ComponentFixture<ShopsFormModal>;
  let component: ShopsFormModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopsFormModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopsFormModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders create title and confirm label in create mode', () => {
    expect((component as any).title()).toBe(SHOPS_TEXTS.MODAL_CREATE_TITLE);
    expect((component as any).confirmLabel()).toBe(SHOPS_TEXTS.MODAL_CREATE_CONFIRM_LABEL);
  });

  it('renders update title and confirm label in update mode', async () => {
    fixture.componentRef.setInput('mode', 'update');
    await fixture.whenStable();

    expect((component as any).title()).toBe(SHOPS_TEXTS.MODAL_UPDATE_TITLE);
    expect((component as any).confirmLabel()).toBe(SHOPS_TEXTS.MODAL_UPDATE_CONFIRM_LABEL);
  });

  it('emits payload when form is valid', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).shopFormModel.set({
      name: 'Ocean Shop',
      description: 'Main warehouse shop',
      url: 'https://ocean-shop.example',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({
      name: 'Ocean Shop',
      description: 'Main warehouse shop',
      url: 'https://ocean-shop.example',
    });
  });

  it('does not emit confirmed when form is invalid', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).shopFormModel.set({
      name: '',
      description: '',
      url: '',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('emits payload with only required fields when optional ones are empty', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).shopFormModel.set({
      name: 'Ocean Shop',
      description: '',
      url: '',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({
      name: 'Ocean Shop',
    });
  });

  it('emits closed event when close is requested', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    (component as any).onClose();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('does not emit closed when confirm is loading', async () => {
    fixture.componentRef.setInput('confirmLoading', true);
    await fixture.whenStable();
    fixture.detectChanges();

    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    (component as any).onClose();

    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('prefills form when shop input is provided for update', async () => {
    const shop: Shop = {
      id: 'shop-1',
      name: 'Ocean Shop',
      description: 'Main warehouse shop',
      url: 'https://ocean-shop.example',
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-02T10:00:00Z',
    };
    fixture.componentRef.setInput('mode', 'update');
    fixture.componentRef.setInput('shop', shop);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).shopFormModel().name).toBe('Ocean Shop');
    expect((component as any).shopFormModel().description).toBe('Main warehouse shop');
    expect((component as any).shopFormModel().url).toBe('https://ocean-shop.example');
  });

  it('resets form when shop input is null', async () => {
    fixture.componentRef.setInput('shop', null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).shopFormModel().name).toBe('');
    expect((component as any).shopFormModel().description).toBe('');
    expect((component as any).shopFormModel().url).toBe('');
  });
});
