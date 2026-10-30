import { provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
  PRODUCT_FORM_TYPE_OPTIONS,
} from '../../constants/product-form.constants';
import { ProductFormModel } from '../../models/product-form.model';
import { ProductFormBasicInfo } from './product-form-basic-info';
import { ProductType } from '../../../../pages/products/models/product-type.enum';

describe('ProductFormBasicInfo', () => {
  let fixture: ComponentFixture<ProductFormBasicInfo>;
  let component: ProductFormBasicInfo;
  let formModel: WritableSignal<ProductFormModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormBasicInfo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormBasicInfo);
    component = fixture.componentInstance;

    formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    const productForm = TestBed.runInInjectionContext(() => form(formModel, () => undefined));

    fixture.componentRef.setInput('productForm', productForm);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.componentRef.setInput('statusOptions', PRODUCT_FORM_STATUS_OPTIONS);
    fixture.componentRef.setInput('productTypeOptions', PRODUCT_FORM_TYPE_OPTIONS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders basic information title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.BASIC_INFORMATION_TITLE);
  });

  it('renders the is popular checkbox', () => {
    const pageElement = fixture.nativeElement as HTMLElement;
    const checkboxInput = pageElement.querySelector(
      `#${PRODUCT_FORM_FIELD_IDS.IS_POPULAR}`,
    ) as HTMLInputElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.IS_POPULAR_LABEL);
    expect(checkboxInput).toBeTruthy();
    expect(checkboxInput.type).toBe('checkbox');
  });

  it('renders the is main banner checkbox', () => {
    const pageElement = fixture.nativeElement as HTMLElement;
    const checkboxInput = pageElement.querySelector(
      `#${PRODUCT_FORM_FIELD_IDS.IS_MAIN_BANNER}`,
    ) as HTMLInputElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.IS_MAIN_BANNER_LABEL);
    expect(checkboxInput).toBeTruthy();
    expect(checkboxInput.type).toBe('checkbox');
  });

  it('writes supported product types to the form', () => {
    (component as any).onProductTypeOptionChange(ProductType.Variable);

    expect(formModel().type).toBe(ProductType.Variable);
  });

  it('ignores unsupported product type values', () => {
    (component as any).onProductTypeOptionChange('unsupported');

    expect(formModel().type).toBe(ProductType.Simple);
  });
});
