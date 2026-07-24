import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_FORM_TEXTS } from '../../constants/product-form.constants';
import { ProductFormAssignedAttribute } from '../../models/product-form-assigned-attribute.model';
import { ProductFormAttributeOption } from '../../models/product-form-attribute-option.model';
import { ProductFormAttributes } from './product-form-attributes';

describe('ProductFormAttributes', () => {
  let fixture: ComponentFixture<ProductFormAttributes>;
  let component: ProductFormAttributes;

  const attributeSearchResults: ProductFormAttributeOption[] = [
    { id: 'attr-1', label: 'Колір: Синій' },
    { id: 'attr-2', label: 'Розмір: L' },
  ];
  const assignedAttributes: ProductFormAssignedAttribute[] = [
    { id: 'attr-5', label: 'Матеріал: Льон' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormAttributes],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormAttributes);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('attributeSearchValue', 'col');
    fixture.componentRef.setInput('isAttributeSearchLoading', false);
    fixture.componentRef.setInput('attributeSearchResults', attributeSearchResults);
    fixture.componentRef.setInput('assignedAttributes', assignedAttributes);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders attributes title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.ATTRIBUTES_TITLE);
  });

  it('emits attribute search changes', () => {
    const emitSpy = vi.spyOn((component as any).attributeSearchChange, 'emit');

    (component as any).onAttributeSearchChange('new search');

    expect(emitSpy).toHaveBeenCalledWith('new search');
  });

  it('emits attribute assignment and unassignment', () => {
    const assignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');

    (component as any).onAttributeAssign(' attr-1 ');
    (component as any).onAttributeUnassign(' attr-5 ');

    expect(assignSpy).toHaveBeenCalledWith('attr-1');
    expect(unassignSpy).toHaveBeenCalledWith('attr-5');
  });

  it('does not emit assignment or unassignment when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const assignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');

    (component as any).onAttributeAssign('attr-1');
    (component as any).onAttributeUnassign('attr-5');

    expect(assignSpy).not.toHaveBeenCalled();
    expect(unassignSpy).not.toHaveBeenCalled();
  });

  it('does not emit assignment or unassignment when id is blank', () => {
    const assignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');

    (component as any).onAttributeAssign('   ');
    (component as any).onAttributeUnassign('   ');

    expect(assignSpy).not.toHaveBeenCalled();
    expect(unassignSpy).not.toHaveBeenCalled();
  });
});
