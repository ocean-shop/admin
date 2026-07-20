import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CATEGORIES_TEXTS } from '../../constants/categories.constants';
import { Category } from '../../models/category.model';
import { CategoryFormModal } from './category-form-modal';

describe('CategoryFormModal', () => {
  let fixture: ComponentFixture<CategoryFormModal>;
  let component: CategoryFormModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFormModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFormModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders create title and confirm label for root creation', () => {
    expect((component as any).title()).toBe(CATEGORIES_TEXTS.MODAL_CREATE_ROOT_TITLE);
    expect((component as any).confirmLabel()).toBe(CATEGORIES_TEXTS.MODAL_CREATE_CONFIRM_LABEL);
  });

  it('renders child create title when parent category is provided', async () => {
    fixture.componentRef.setInput('parentCategory', {
      id: 'parent-1',
      name: 'Electronics',
      slug: 'electronics',
    } as Category);
    await fixture.whenStable();

    expect((component as any).title()).toBe(CATEGORIES_TEXTS.MODAL_CREATE_CHILD_TITLE);
  });

  it('auto-generates slug from name when slug is empty', () => {
    (component as any).categoryFormModel.set({ name: 'Home Decor', slug: '' });
    fixture.detectChanges();

    expect((component as any).categoryFormModel().slug).toBe('home-decor');
  });

  it('emits create payload with parentId', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);
    fixture.componentRef.setInput('parentCategory', {
      id: 'parent-1',
      name: 'Electronics',
      slug: 'electronics',
    } as Category);

    (component as any).categoryFormModel.set({
      name: 'Laptops',
      slug: 'laptops',
    });
    fixture.detectChanges();

    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({
      name: 'Laptops',
      slug: 'laptops',
      parentId: 'parent-1',
    });
  });

  it('emits update payload preserving parentId from category', async () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    fixture.componentRef.setInput('mode', 'update');
    fixture.componentRef.setInput('category', {
      id: 'category-1',
      parentId: 'parent-1',
      name: 'Old Name',
      slug: 'old-name',
    } as Category);
    await fixture.whenStable();

    (component as any).categoryFormModel.set({
      name: 'New Name',
      slug: 'new-name',
    });
    fixture.detectChanges();
    (component as any).onConfirm();

    expect(confirmedSpy).toHaveBeenCalledWith({
      name: 'New Name',
      slug: 'new-name',
      parentId: 'parent-1',
    });
  });

  it('does not emit confirmed when form is invalid', () => {
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    (component as any).categoryFormModel.set({
      name: '',
      slug: '',
    });
    fixture.detectChanges();
    (component as any).onConfirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });
});
