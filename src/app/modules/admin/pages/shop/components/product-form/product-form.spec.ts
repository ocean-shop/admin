import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { By } from '@angular/platform-browser';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { PRODUCT_FORM_DEFAULT_VALUE, PRODUCT_FORM_TEXTS } from './constants/product-form.constants';
import { ProductForm } from './product-form';
import { ProductFormImageItem } from './models/product-form-image-item.model';
import { ProductFormModel } from './models/product-form.model';
import { ProductFormVariation } from './models/product-form-variation.model';
import { ProductType } from '../../pages/products/models/product-type.enum';

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;
  let component: ProductForm;
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
      providers: [provideZonelessChangeDetection(), ...provideTestQueryClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;

    const formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    const productForm = TestBed.runInInjectionContext(() => form(formModel, () => undefined));
    fixture.componentRef.setInput('productForm', productForm);
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

    expect(pricingInventorySection).toBeNull();
    expect(variationsSection).not.toBeNull();
  });

  it('shows sidebar hint when sidebar is disabled', () => {
    fixture.componentRef.setInput('sidebarDisabled', true);
    fixture.detectChanges();
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.SIDEBAR_DISABLED_HINT);
  });
});
