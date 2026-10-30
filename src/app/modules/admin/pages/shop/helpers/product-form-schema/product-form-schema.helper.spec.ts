import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_TEXTS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import {
  applyProductFormValidators,
  applyProductSeoValidators,
} from './product-form-schema.helper';

describe('product-form-schema.helper', () => {
  const createProductForm = (value: Partial<ProductFormModel>) =>
    TestBed.runInInjectionContext(() =>
      form(signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE, ...value }), (schemaPath) =>
        applyProductSeoValidators(schemaPath),
      ),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('accepts empty and valid slug', () => {
    expect(createProductForm({ slug: '' }).slug().valid()).toBe(true);
    expect(createProductForm({ slug: 'wetsuit-5-mm' }).slug().valid()).toBe(true);
  });

  it('rejects slug with invalid characters', () => {
    const productForm = createProductForm({ slug: 'Wetsuit 5mm' });

    expect(productForm.slug().valid()).toBe(false);
    expect(productForm.slug().errors()[0]?.message).toBe(PRODUCT_FORM_TEXTS.SLUG_INVALID);
  });

  it('applies shared SEO validators', () => {
    const productForm = createProductForm({ canonicalUrl: 'not-a-url' });

    expect(productForm.canonicalUrl().valid()).toBe(false);
    expect(productForm.canonicalUrl().errors()[0]?.message).toBe(
      PRODUCT_FORM_TEXTS.CANONICAL_URL_INVALID,
    );
  });

  it('applyProductFormValidators requires the product name', () => {
    const productForm = TestBed.runInInjectionContext(() =>
      form(signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE }), applyProductFormValidators),
    );

    expect(productForm.name().valid()).toBe(false);
    expect(productForm.name().errors()[0]?.message).toBe(PRODUCT_FORM_TEXTS.PRODUCT_NAME_REQUIRED);
  });
});
