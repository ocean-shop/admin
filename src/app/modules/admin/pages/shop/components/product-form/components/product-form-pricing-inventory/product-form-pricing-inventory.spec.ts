import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
  PRODUCT_FORM_TEXTS,
} from '../../constants/product-form.constants';
import { ProductFormModel } from '../../models/product-form.model';
import { ProductFormPricingInventory } from './product-form-pricing-inventory';

describe('ProductFormPricingInventory', () => {
  let fixture: ComponentFixture<ProductFormPricingInventory>;
  let component: ProductFormPricingInventory;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormPricingInventory],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPricingInventory);
    component = fixture.componentInstance;

    const formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    const productForm = TestBed.runInInjectionContext(() => form(formModel, () => undefined));

    fixture.componentRef.setInput('productForm', productForm);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.componentRef.setInput('statusOptions', PRODUCT_FORM_STATUS_OPTIONS);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders pricing and inventory title', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.PRICING_INVENTORY_TITLE);
  });

  it('renders availability label', () => {
    const pageElement = fixture.nativeElement as HTMLElement;

    expect(pageElement.textContent).toContain(PRODUCT_FORM_TEXTS.AVAILABLE_LABEL);
  });
});
