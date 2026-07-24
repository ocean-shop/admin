import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormAssignedTag } from '../../models/product-form-assigned-tag.model';
import { ProductFormTagOption } from '../../models/product-form-tag-option.model';
import { ProductFormTags } from './product-form-tags';

describe('ProductFormTags', () => {
  let fixture: ComponentFixture<ProductFormTags>;
  let component: ProductFormTags;

  const tagSearchResults: ProductFormTagOption[] = [
    { id: 'tag-1', label: 'Літо' },
    { id: 'tag-2', label: 'Льон' },
  ];
  const assignedTags: ProductFormAssignedTag[] = [{ id: 'tag-5', label: 'Чоловіче' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormTags],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormTags);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('tagSearchValue', 'tag');
    fixture.componentRef.setInput('isTagSearchLoading', false);
    fixture.componentRef.setInput('tagSearchResults', tagSearchResults);
    fixture.componentRef.setInput('assignedTags', assignedTags);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders tags title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.TAGS_TITLE);
  });

  it('emits tag search changes', () => {
    const emitSpy = vi.spyOn((component as any).tagSearchChange, 'emit');

    (component as any).onTagSearchChange('summer');

    expect(emitSpy).toHaveBeenCalledWith('summer');
  });

  it('emits tag assignment and unassignment', () => {
    const assignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onTagAssign(' tag-1 ');
    (component as any).onTagUnassign(' tag-5 ');

    expect(assignSpy).toHaveBeenCalledWith('tag-1');
    expect(unassignSpy).toHaveBeenCalledWith('tag-5');
  });

  it('does not emit assignment or unassignment when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const assignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onTagAssign('tag-1');
    (component as any).onTagUnassign('tag-5');

    expect(assignSpy).not.toHaveBeenCalled();
    expect(unassignSpy).not.toHaveBeenCalled();
  });

  it('does not emit assignment or unassignment when id is blank', () => {
    const assignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onTagAssign('   ');
    (component as any).onTagUnassign('   ');

    expect(assignSpy).not.toHaveBeenCalled();
    expect(unassignSpy).not.toHaveBeenCalled();
  });
});
