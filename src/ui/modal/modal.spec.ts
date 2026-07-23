import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Modal');
    fixture.componentRef.setInput('confirmLabel', 'Confirm');
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render modal when isOpen is true', () => {
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));

    expect(overlay).toBeTruthy();
  });

  it('should not render modal when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const overlay = fixture.debugElement.query(By.css('.modal-overlay'));

    expect(overlay).toBeNull();
  });

  it('should display title and use it as aria-label', () => {
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'))
      .nativeElement as HTMLElement;
    const title = fixture.debugElement.query(By.css('.modal-title')).nativeElement as HTMLElement;

    expect(overlay.getAttribute('aria-label')).toBe('Test Modal');
    expect(title.textContent).toContain('Test Modal');
  });

  it('should emit closed when backdrop is clicked', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'))
      .nativeElement as HTMLElement;

    overlay.click();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not emit closed when modal content is clicked', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const content = fixture.debugElement.query(By.css('.modal-content'))
      .nativeElement as HTMLElement;

    content.click();

    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('should emit closed when close button is clicked', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const closeButton = fixture.debugElement.query(By.css('.modal-close-button'))
      .nativeElement as HTMLButtonElement;

    closeButton.click();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit confirmed when confirm button is clicked', () => {
    const confirmedSpy = vi.spyOn(component.confirmed, 'emit');
    const confirmButton = fixture.debugElement.query(By.css('.modal-confirm-button'))
      .nativeElement as HTMLButtonElement;

    confirmButton.click();

    expect(confirmedSpy).toHaveBeenCalled();
  });

  it('should hide footer when showFooter is false', () => {
    fixture.componentRef.setInput('showFooter', false);
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.css('.modal-footer'));

    expect(footer).toBeNull();
  });

  it('should apply danger class when isDanger is true', () => {
    fixture.componentRef.setInput('isDanger', true);
    fixture.detectChanges();

    const confirmButton = fixture.debugElement.query(By.css('.modal-confirm-button'))
      .nativeElement as HTMLButtonElement;

    expect(confirmButton.classList).toContain('modal-confirm-button-danger');
  });

  it('should disable confirm button when confirmDisabled is true', () => {
    fixture.componentRef.setInput('confirmDisabled', true);
    fixture.detectChanges();

    const confirmButton = fixture.debugElement.query(By.css('.modal-confirm-button'))
      .nativeElement as HTMLButtonElement;

    expect(confirmButton.disabled).toBe(true);
  });

  it('should disable confirm button and show loading text when confirmLoading is true', () => {
    fixture.componentRef.setInput('confirmLoading', true);
    fixture.detectChanges();

    const confirmButton = fixture.debugElement.query(By.css('.modal-confirm-button'))
      .nativeElement as HTMLButtonElement;

    expect(confirmButton.disabled).toBe(true);
    expect(confirmButton.textContent).toContain('Зачекайте...');
  });

  it('should emit closed when Enter is pressed on backdrop', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'))
      .nativeElement as HTMLElement;

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should emit closed when Space is pressed on backdrop', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'))
      .nativeElement as HTMLElement;

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(closedSpy).toHaveBeenCalled();
  });

  it('should not emit closed for unrelated keys on backdrop', () => {
    const closedSpy = vi.spyOn(component.closed, 'emit');
    const overlay = fixture.debugElement.query(By.css('.modal-overlay'))
      .nativeElement as HTMLElement;

    overlay.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closedSpy).not.toHaveBeenCalled();
  });
});
