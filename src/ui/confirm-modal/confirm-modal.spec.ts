import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Modal } from '@ui/modal/modal';
import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  let fixture: ComponentFixture<ConfirmModal>;
  let element: HTMLElement;

  const getModal = (): Modal =>
    fixture.debugElement.query(By.directive(Modal)).componentInstance as Modal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('title', 'Delete');
    fixture.componentRef.setInput('confirmLabel', 'Yes');
    fixture.componentRef.setInput('message', 'Delete tag');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a danger modal with the message', () => {
    expect(getModal().isDanger()).toBe(true);
    expect(element.querySelector('.confirm-modal-message')?.textContent).toContain('Delete tag');
    expect(element.querySelector('.confirm-modal-highlight')).toBeNull();
  });

  it('renders the highlighted name and suffix', async () => {
    fixture.componentRef.setInput('highlight', 'Summer');
    fixture.componentRef.setInput('suffix', '?');
    await fixture.whenStable();

    expect(element.querySelector('.confirm-modal-highlight')?.textContent?.trim()).toBe('Summer');
    expect(element.querySelector('.confirm-modal-message')?.textContent?.trim()).toMatch(/\?$/);
  });

  it('locks the confirm button while loading', async () => {
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(getModal().confirmLoading()).toBe(true);
    expect(getModal().confirmDisabled()).toBe(true);
  });

  it('re-emits close and confirm', () => {
    const closed = vi.fn();
    const confirmed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentInstance.confirmed.subscribe(confirmed);

    getModal().closed.emit();
    getModal().confirmed.emit();

    expect(closed).toHaveBeenCalledTimes(1);
    expect(confirmed).toHaveBeenCalledTimes(1);
  });
});
