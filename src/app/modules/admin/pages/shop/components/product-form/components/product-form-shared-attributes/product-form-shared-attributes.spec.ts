import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductFormAttributeOption } from '../../models/product-form-attribute-option.model';
import { ProductFormSharedAttributes } from './product-form-shared-attributes';

describe('ProductFormSharedAttributes', () => {
  let fixture: ComponentFixture<ProductFormSharedAttributes>;
  let component: ProductFormSharedAttributes;

  const searchResults: ProductFormAttributeOption[] = [
    { id: 'attr-1', label: 'Color: Blue' },
    { id: 'attr-2', label: 'Size: L' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormSharedAttributes],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormSharedAttributes);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('searchInputId', 'attributes-search');
    fixture.componentRef.setInput('searchLabel', 'Search attributes');
    fixture.componentRef.setInput('searchPlaceholder', 'Search attributes');
    fixture.componentRef.setInput('searchValue', 'col');
    fixture.componentRef.setInput('interactionDisabled', false);
    fixture.componentRef.setInput('isSearchLoading', false);
    fixture.componentRef.setInput('searchLoadingText', 'Loading...');
    fixture.componentRef.setInput('searchEmptyText', 'No results');
    fixture.componentRef.setInput('assignedEmptyText', 'Nothing assigned');
    fixture.componentRef.setInput('removeAriaLabel', 'Remove attribute');
    fixture.componentRef.setInput('searchResults', searchResults);
    fixture.componentRef.setInput('assignedAttributes', [
      { id: 'attr-4', label: 'Material: Linen' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits search changes', () => {
    const emitSpy = vi.spyOn((component as any).searchChange, 'emit');

    (component as any).onSearchChange('new value');

    expect(emitSpy).toHaveBeenCalledWith('new value');
  });

  it('emits assign and unassign events with normalized ids', () => {
    const assignSpy = vi.spyOn((component as any).assign, 'emit');
    const unassignSpy = vi.spyOn((component as any).unassign, 'emit');

    (component as any).onAssign(' attr-1 ');
    (component as any).onUnassign(' attr-4 ');

    expect(assignSpy).toHaveBeenCalledWith('attr-1');
    expect(unassignSpy).toHaveBeenCalledWith('attr-4');
  });

  it('does not emit assign/unassign when interaction is disabled', () => {
    fixture.componentRef.setInput('interactionDisabled', true);
    fixture.detectChanges();

    const assignSpy = vi.spyOn((component as any).assign, 'emit');
    const unassignSpy = vi.spyOn((component as any).unassign, 'emit');

    (component as any).onAssign('attr-1');
    (component as any).onUnassign('attr-4');

    expect(assignSpy).not.toHaveBeenCalled();
    expect(unassignSpy).not.toHaveBeenCalled();
  });
});
