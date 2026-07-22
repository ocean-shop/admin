import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATIC_ATTRIBUTES,
  PRODUCT_FORM_STATIC_TAGS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
} from './constants/product-form.constants';
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
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('staticAttributes', PRODUCT_FORM_STATIC_ATTRIBUTES);
    fixture.componentRef.setInput('staticTags', PRODUCT_FORM_STATIC_TAGS);
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

  it('emits product type changes for supported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange(ProductType.Variable);

    expect(emitSpy).toHaveBeenCalledWith(ProductType.Variable);
  });
});
