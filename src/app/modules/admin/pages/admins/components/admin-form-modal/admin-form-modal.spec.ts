import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AdminFormModal } from './admin-form-modal';
import { Admin } from '../../models/admin.model';
import { ADMINS_TEXTS } from '../../constants/admins.constants';

describe('AdminFormModal', () => {
  let fixture: ComponentFixture<AdminFormModal>;
  let component: AdminFormModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminFormModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFormModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('roleOptions', [
      { label: 'Admin', value: 'admin' },
      { label: 'Super', value: 'super' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders create title and confirm label in create mode', () => {
    expect((component as any).title()).toBe(ADMINS_TEXTS.MODAL_CREATE_TITLE);
    expect((component as any).confirmLabel()).toBe(ADMINS_TEXTS.MODAL_CREATE_CONFIRM_LABEL);
  });

  it('renders update title and confirm label in update mode', async () => {
    fixture.componentRef.setInput('mode', 'update');
    await fixture.whenStable();

    expect((component as any).title()).toBe(ADMINS_TEXTS.MODAL_UPDATE_TITLE);
    expect((component as any).confirmLabel()).toBe(ADMINS_TEXTS.MODAL_UPDATE_CONFIRM_LABEL);
  });

  it('emits payload with email when form is valid and identity is an email', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).adminFormModel.set({
      identity: 'new.admin@ocean-shop.com',
      role: 'admin',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ email: 'new.admin@ocean-shop.com', role: 'admin' });
  });

  it('emits payload with phone when form is valid and identity is a phone number', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).adminFormModel.set({
      identity: '1234567890',
      role: 'super',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ phone: '1234567890', role: 'super' });
  });

  it('does not emit confirmed when form is invalid', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).adminFormModel.set({
      identity: '',
      role: 'admin',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
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

  it('prefills form when admin input is provided for update', async () => {
    const admin: Admin = {
      id: 'admin-1',
      name: 'Admin One',
      email: 'admin.one@ocean-shop.com',
      phone: 'No phone',
      role: 'super',
    };
    fixture.componentRef.setInput('mode', 'update');
    fixture.componentRef.setInput('admin', admin);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).adminFormModel().identity).toBe('admin.one@ocean-shop.com');
    expect((component as any).adminFormModel().role).toBe('super');
  });

  it('resets form when admin input is null', async () => {
    fixture.componentRef.setInput('admin', null);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((component as any).adminFormModel().identity).toBe('');
    expect((component as any).adminFormModel().role).toBe('admin');
  });
});
