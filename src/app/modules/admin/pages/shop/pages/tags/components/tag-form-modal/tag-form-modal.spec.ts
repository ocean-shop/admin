import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TAGS_TEXTS } from '../../constants/tags.constants';
import { TagFormModal } from './tag-form-modal';

describe('TagFormModal', () => {
  let fixture: ComponentFixture<TagFormModal>;
  let component: TagFormModal;
  let confirmedSpy: ReturnType<typeof vi.spyOn>;
  let closedSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagFormModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TagFormModal);
    component = fixture.componentInstance;
    confirmedSpy = vi.spyOn(component.confirmed, 'emit');
    closedSpy = vi.spyOn(component.closed, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    await fixture.whenStable();
  });

  it('renders create title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      TAGS_TEXTS.MODAL_CREATE_TITLE,
    );
  });

  it('emits trimmed name on confirm', () => {
    (component as any).tagFormModel.set({ name: '  Summer  ' });

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ name: 'Summer' });
  });

  it('does not emit when name is empty', () => {
    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('does not emit when name contains only spaces', () => {
    (component as any).tagFormModel.set({ name: '   ' });

    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('does not confirm or close while loading', async () => {
    fixture.componentRef.setInput('confirmLoading', true);
    await fixture.whenStable();
    (component as any).tagFormModel.set({ name: 'Summer' });

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
    (component as any).tagFormModel.set({ name: 'Summer' });

    fixture.componentRef.setInput('isOpen', false);
    await fixture.whenStable();

    expect((component as any).tagFormModel()).toEqual({ name: '' });
  });
});
