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
import { PRODUCTS_CREATE_TEXTS } from '../../pages/products-create/constants/products-create.constants';
import { ProductForm } from './product-form';
import { ProductFormImageItem } from './models/product-form-image-item.model';
import { ProductFormModel } from './models/product-form.model';
import { ProductFormVariation } from './models/product-form-variation.model';
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
  const images: ProductFormImageItem[] = [
    { id: 'img-1', name: 'image-1.jpg', imageDataUrl: 'data:image/jpeg;base64,Zm9v' },
  ];
  const variations: ProductFormVariation[] = [
    {
      localId: 'variation-1',
      id: null,
      title: 'Синій M',
      name: 'Синій / M',
      price: '99.00',
      oldPrice: '120.00',
      sku: 'SKU-1',
      available: true,
      isMain: false,
      attributes: [],
      attributeSearchValue: '',
      attributeSearchResults: [],
      isAttributeSearchLoading: false,
      images: [],
      isSaving: false,
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
    fixture.componentRef.setInput('toastTexts', PRODUCTS_CREATE_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.componentRef.setInput('statusOptions', PRODUCT_FORM_STATUS_OPTIONS);
    fixture.componentRef.setInput('productTypeOptions', productTypeOptions);
    fixture.componentRef.setInput('productTypeSimple', ProductType.Simple);
    fixture.componentRef.setInput('shopId', 'shop-1');
    fixture.componentRef.setInput('productId', 'product-1');
    fixture.componentRef.setInput('sidebarDisabled', false);
    fixture.componentRef.setInput('initialSelectedCategoryIds', new Set(['cat-2']));
    fixture.componentRef.setInput('initialAssignedAttributes', [
      { id: 'attr-5', label: 'Матеріал: Льон' },
    ]);
    fixture.componentRef.setInput('initialAssignedTags', [{ id: 'tag-5', label: 'Чоловіче' }]);
    fixture.componentRef.setInput('initialImages', images);
    fixture.componentRef.setInput('initialVariations', variations);
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
    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.IMAGES_TITLE);
  });

  it('hides pricing and inventory section for variable products', () => {
    const variableFormModel = signal<ProductFormModel>({
      ...PRODUCT_FORM_DEFAULT_VALUE,
      type: ProductType.Variable,
    });
    const variableProductForm = TestBed.runInInjectionContext(() =>
      form(variableFormModel, () => undefined),
    );

    fixture.componentRef.setInput('productForm', variableProductForm);
    fixture.detectChanges();

    const pricingInventorySection = fixture.debugElement.query(
      By.css('app-product-form-pricing-inventory'),
    );
    const variationsSection = fixture.debugElement.query(By.css('app-product-form-variations'));
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pricingInventorySection).toBeNull();
    expect(variationsSection).not.toBeNull();
    expect(pageElement.textContent).not.toContain(PRODUCT_FORM_TEXTS.PRICING_INVENTORY_TITLE);
  });

  it('emits product type changes for supported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange(ProductType.Variable);

    expect(emitSpy).toHaveBeenCalledWith(ProductType.Variable);
  });

  it('ignores product type changes for unsupported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange('unknown');

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('shows sidebar hint when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.SIDEBAR_DISABLED_HINT);
  });
});
