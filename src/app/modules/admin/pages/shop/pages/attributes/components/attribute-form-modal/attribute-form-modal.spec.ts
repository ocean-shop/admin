import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ATTRIBUTES_TEXTS } from '../../constants/attributes.constants';
import { AttributeFormModal } from './attribute-form-modal';

describe('AttributeFormModal', () => {
  let fixture: ComponentFixture<AttributeFormModal>;
  let component: AttributeFormModal;
  let confirmedSpy: ReturnType<typeof vi.spyOn>;
  let closedSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttributeFormModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AttributeFormModal);
    component = fixture.componentInstance;
    confirmedSpy = vi.spyOn(component.confirmed, 'emit');
    closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();
  });

  it('renders create title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      ATTRIBUTES_TEXTS.MODAL_CREATE_TITLE,
    );
  });

  it('emits trimmed name and value on confirm', () => {
    (component as any).attributeFormModel.set({ name: ' Color ', value: ' Blue ' });

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ name: 'Color', value: 'Blue' });
  });

  it('does not emit when a required field is empty', () => {
    (component as any).attributeFormModel.set({ name: 'Color', value: '' });

    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('does not emit when fields contain only spaces', () => {
    (component as any).attributeFormModel.set({ name: '  ', value: '  ' });

    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('does not confirm or close while loading', async () => {
    fixture.componentRef.setInput('confirmLoading', true);
    await fixture.whenStable();
    (component as any).attributeFormModel.set({ name: 'Color', value: 'Blue' });

    (component as any).onConfirm();
    (component as any).onClose();

    expect(confirmedSpy).not.toHaveBeenCalled();
    expect(closedSpy).not.toHaveBeenCalled();
  });

  it('emits closed when not loading', () => {
    (component as any).onClose();

    expect(closedSpy).toHaveBeenCalled();
  });

  it('resets form when modal closes', async () => {
    (component as any).attributeFormModel.set({ name: 'Color', value: 'Blue' });

    fixture.componentRef.setInput('isOpen', false);
    await fixture.whenStable();

    expect((component as any).attributeFormModel()).toEqual({ name: '', value: '' });
  });
});
