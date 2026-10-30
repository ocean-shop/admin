import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { SEO_META_TITLE_MAX_LENGTH } from '../../constants/seo.constants';
import { applySeoValidators, toNullableSeoText } from './seo-form.helper';

describe('seo-form.helper', () => {
  const messages = {
    META_TITLE_TOO_LONG: 'title too long',
    META_DESCRIPTION_TOO_LONG: 'description too long',
    CANONICAL_URL_INVALID: 'url invalid',
  };

  const createSeoForm = (value: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
  }) =>
    TestBed.runInInjectionContext(() =>
      form(signal(value), (schemaPath) => applySeoValidators(schemaPath, messages)),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  describe('applySeoValidators', () => {
    it('accepts empty and valid values', () => {
      const seoForm = createSeoForm({
        metaTitle: '',
        metaDescription: 'Description',
        canonicalUrl: 'https://ocean.shop/item',
      });

      expect(seoForm().valid()).toBe(true);
    });

    it('rejects too long meta title', () => {
      const seoForm = createSeoForm({
        metaTitle: 'a'.repeat(SEO_META_TITLE_MAX_LENGTH + 1),
        metaDescription: '',
        canonicalUrl: '',
      });

      expect(seoForm.metaTitle().valid()).toBe(false);
      expect(seoForm.metaTitle().errors()[0]?.message).toBe(messages.META_TITLE_TOO_LONG);
    });

    it('rejects canonical url without http(s) protocol', () => {
      const seoForm = createSeoForm({
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: 'ocean.shop',
      });

      expect(seoForm.canonicalUrl().valid()).toBe(false);
      expect(seoForm.canonicalUrl().errors()[0]?.message).toBe(messages.CANONICAL_URL_INVALID);
    });
  });

  describe('toNullableSeoText', () => {
    it('returns trimmed text', () => {
      expect(toNullableSeoText('  Title ')).toBe('Title');
    });

    it('returns null for empty or nullish values', () => {
      expect(toNullableSeoText('   ')).toBeNull();
      expect(toNullableSeoText(null)).toBeNull();
      expect(toNullableSeoText(undefined)).toBeNull();
    });
  });
});
