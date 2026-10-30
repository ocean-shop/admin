import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { applyProductSeoValidators } from '../../../../helpers/product-form-schema/product-form-schema.helper';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_TEXTS,
} from '../../constants/product-form.constants';
import { ProductFormModel } from '../../models/product-form.model';
import { ProductFormSeo } from './product-form-seo';

describe('ProductFormSeo', () => {
  let fixture: ComponentFixture<ProductFormSeo>;
  let formModel: ReturnType<typeof signal<ProductFormModel>>;
  let productForm: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormSeo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormSeo);

    formModel = signal<ProductFormModel>({ ...PRODUCT_FORM_DEFAULT_VALUE });
    productForm = TestBed.runInInjectionContext(() =>
      form(formModel, (schemaPath) => applyProductSeoValidators(schemaPath)),
    );

    fixture.componentRef.setInput('productForm', productForm);
    fixture.componentRef.setInput('texts', PRODUCT_FORM_TEXTS);
    fixture.componentRef.setInput('fieldIds', PRODUCT_FORM_FIELD_IDS);
    fixture.detectChanges();
  });

  it('renders SEO fields', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(PRODUCT_FORM_TEXTS.SEO_TITLE);
    expect(element.querySelector(`#${PRODUCT_FORM_FIELD_IDS.SLUG}`)).toBeTruthy();
    expect(element.querySelector(`#${PRODUCT_FORM_FIELD_IDS.META_TITLE}`)).toBeTruthy();
    expect(element.querySelector(`#${PRODUCT_FORM_FIELD_IDS.META_DESCRIPTION}`)).toBeTruthy();
    expect(element.querySelector(`#${PRODUCT_FORM_FIELD_IDS.CANONICAL_URL}`)).toBeTruthy();
    expect(element.querySelector(`#${PRODUCT_FORM_FIELD_IDS.NO_INDEX}`)).toBeTruthy();
  });

  it('accepts empty SEO fields', () => {
    expect(productForm().valid()).toBe(true);
  });

  it('rejects a slug with uppercase or cyrillic characters', () => {
    formModel.update((value) => ({ ...value, slug: 'Гідрокостюм-5mm' }));

    expect(productForm.slug().valid()).toBe(false);
  });

  it('accepts a hyphenated latin slug', () => {
    formModel.update((value) => ({ ...value, slug: 'hidrokostium-5-mm' }));

    expect(productForm.slug().valid()).toBe(true);
  });

  it('rejects a canonical URL without http(s) protocol', () => {
    formModel.update((value) => ({ ...value, canonicalUrl: 'ocean.shop/product' }));

    expect(productForm.canonicalUrl().valid()).toBe(false);
  });

  it('rejects a meta title over the API limit', () => {
    formModel.update((value) => ({ ...value, metaTitle: 'a'.repeat(256) }));

    expect(productForm.metaTitle().valid()).toBe(false);
  });
});
