import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
} from './constants/product-form.constants';
import { ProductFormAssignedAttribute } from './models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from './models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from './models/product-form-attribute-option.model';
import { ProductFormTagOption } from './models/product-form-tag-option.model';
import { ProductForm } from './product-form';
import { ProductFormCategoryNode } from './models/product-form-category-node.model';
import { ProductFormModel } from './models/product-form.model';
import { ProductType } from '../../pages/products/models/product-type.enum';

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;
  let component: ProductForm;
  const productTypeOptions: RadioGroupOption[] = [
    {
      id: PRODUCT_FORM_FIELD_IDS.TYPE_SIMPLE,
      value: ProductType.Simple,
      label: PRODUCT_FORM_TEXTS.PRODUCT_TYPE_SIMPLE_LABEL,
    },
    {
      id: PRODUCT_FORM_FIELD_IDS.TYPE_VARIABLE,
      value: ProductType.Variable,
      label: PRODUCT_FORM_TEXTS.PRODUCT_TYPE_VARIABLE_LABEL,
    },
  ];
  const categories: ProductFormCategoryNode[] = [
    {
      id: 'cat-1',
      label: 'Одяг',
      checked: false,
      children: [
        { id: 'cat-2', label: 'Сорочки', checked: true },
        { id: 'cat-3', label: 'Штани', checked: false },
      ],
    },
  ];
  const attributeSearchResults: ProductFormAttributeOption[] = [
    { id: 'attr-1', label: 'Колір: Синій' },
    { id: 'attr-2', label: 'Розмір: L' },
  ];
  const assignedAttributes: ProductFormAssignedAttribute[] = [
    { id: 'attr-5', label: 'Матеріал: Льон' },
  ];
  const tagSearchResults: ProductFormTagOption[] = [
    { id: 'tag-1', label: 'Літо' },
    { id: 'tag-2', label: 'Льон' },
  ];
  const assignedTags: ProductFormAssignedTag[] = [{ id: 'tag-5', label: 'Чоловіче' }];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;

    const formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    const productForm = TestBed.runInInjectionContext(() => form(formModel, () => undefined));
    fixture.componentRef.setInput('productForm', productForm);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.componentRef.setInput('statusOptions', PRODUCT_FORM_STATUS_OPTIONS);
    fixture.componentRef.setInput('productTypeOptions', productTypeOptions);
    fixture.componentRef.setInput('productTypeSimple', ProductType.Simple);
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('attributeSearchValue', 'col');
    fixture.componentRef.setInput('isAttributeSearchLoading', false);
    fixture.componentRef.setInput('attributeSearchResults', attributeSearchResults);
    fixture.componentRef.setInput('assignedAttributes', assignedAttributes);
    fixture.componentRef.setInput('tagSearchValue', 'tag');
    fixture.componentRef.setInput('isTagSearchLoading', false);
    fixture.componentRef.setInput('tagSearchResults', tagSearchResults);
    fixture.componentRef.setInput('assignedTags', assignedTags);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders major section titles', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.BASIC_INFORMATION_TITLE);
    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.PRICING_INVENTORY_TITLE);
    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.CATEGORIES_TITLE);
  });

  it('renders assigned attributes and tags as chips', () => {
    const chipElements = fixture.debugElement.queryAll(By.css('app-chip'));

    expect(chipElements).toHaveLength(assignedAttributes.length + assignedTags.length);
  });

  it('emits unassign events when chip remove buttons are clicked', () => {
    const attributeUnassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');
    const tagUnassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');
    const attributeRemoveButton = fixture.debugElement.query(
      By.css('app-chip button[aria-label="Remove attribute"]'),
    )?.nativeElement as HTMLButtonElement;
    const tagRemoveButton = fixture.debugElement.query(
      By.css('app-chip button[aria-label="Remove tag"]'),
    )?.nativeElement as HTMLButtonElement;

    attributeRemoveButton.click();
    tagRemoveButton.click();

    expect(attributeUnassignSpy).toHaveBeenCalledWith(assignedAttributes[0].id);
    expect(tagUnassignSpy).toHaveBeenCalledWith(assignedTags[0].id);
  });

  it('emits product type changes for supported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange(ProductType.Variable);

    expect(emitSpy).toHaveBeenCalledWith(ProductType.Variable);
  });

  it('emits attribute search changes', () => {
    const emitSpy = vi.spyOn((component as any).attributeSearchChange, 'emit');

    (component as any).onAttributeSearchChange('new search');

    expect(emitSpy).toHaveBeenCalledWith('new search');
  });

  it('emits attribute assignment and unassignment', () => {
    const assignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');

    (component as any).onAttributeAssign('attr-1');
    (component as any).onAttributeUnassign('attr-5');

    expect(assignSpy).toHaveBeenCalledWith('attr-1');
    expect(unassignSpy).toHaveBeenCalledWith('attr-5');
  });

  it('emits tag search, assignment and unassignment', () => {
    const searchSpy = vi.spyOn((component as any).tagSearchChange, 'emit');
    const assignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const unassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onTagSearchChange('summer');
    (component as any).onTagAssign('tag-1');
    (component as any).onTagUnassign('tag-5');

    expect(searchSpy).toHaveBeenCalledWith('summer');
    expect(assignSpy).toHaveBeenCalledWith('tag-1');
    expect(unassignSpy).toHaveBeenCalledWith('tag-5');
  });

  it('does not emit assignments when ids are empty', () => {
    const attributeAssignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const attributeUnassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');
    const tagAssignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const tagUnassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onAttributeAssign('   ');
    (component as any).onAttributeUnassign('   ');
    (component as any).onTagAssign('   ');
    (component as any).onTagUnassign('   ');

    expect(attributeAssignSpy).not.toHaveBeenCalled();
    expect(attributeUnassignSpy).not.toHaveBeenCalled();
    expect(tagAssignSpy).not.toHaveBeenCalled();
    expect(tagUnassignSpy).not.toHaveBeenCalled();
  });

  it('does not emit assignments when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const attributeAssignSpy = vi.spyOn((component as any).attributeAssign, 'emit');
    const attributeUnassignSpy = vi.spyOn((component as any).attributeUnassign, 'emit');
    const tagAssignSpy = vi.spyOn((component as any).tagAssign, 'emit');
    const tagUnassignSpy = vi.spyOn((component as any).tagUnassign, 'emit');

    (component as any).onAttributeAssign('attr-1');
    (component as any).onAttributeUnassign('attr-5');
    (component as any).onTagAssign('tag-1');
    (component as any).onTagUnassign('tag-5');

    expect(attributeAssignSpy).not.toHaveBeenCalled();
    expect(attributeUnassignSpy).not.toHaveBeenCalled();
    expect(tagAssignSpy).not.toHaveBeenCalled();
    expect(tagUnassignSpy).not.toHaveBeenCalled();
  });

  it('disables chip remove buttons when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const chipRemoveButtons = fixture.debugElement.queryAll(By.css('app-chip button'));

    expect(chipRemoveButtons.length).toBeGreaterThan(0);
    expect(
      chipRemoveButtons.every((button) => (button.nativeElement as HTMLButtonElement).disabled),
    ).toBe(true);
  });
});
