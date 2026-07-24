import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_TEXTS,
} from '../../constants/product-form.constants';
import { ProductFormModel } from '../../models/product-form.model';
import { ProductFormBasicInfo } from './product-form-basic-info';
import { ProductType } from '../../../../pages/products/models/product-type.enum';

describe('ProductFormBasicInfo', () => {
  let fixture: ComponentFixture<ProductFormBasicInfo>;
  let component: ProductFormBasicInfo;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormBasicInfo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormBasicInfo);
    component = fixture.componentInstance;

    const formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    const productForm = TestBed.runInInjectionContext(() => form(formModel, () => undefined));

    fixture.componentRef.setInput('productForm', productForm);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.componentRef.setInput('productTypeOptions', productTypeOptions);
    fixture.componentRef.setInput('productTypeSimple', ProductType.Simple);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders basic information title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.BASIC_INFORMATION_TITLE);
  });

  it('emits product type changes for supported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange(ProductType.Variable);

    expect(emitSpy).toHaveBeenCalledWith(ProductType.Variable);
  });

  it('does not emit product type changes for unsupported values', () => {
    const emitSpy = vi.spyOn((component as any).productTypeChange, 'emit');

    (component as any).onProductTypeOptionChange('unsupported');

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
