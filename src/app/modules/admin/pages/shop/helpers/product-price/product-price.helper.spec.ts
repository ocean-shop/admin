import { parseProductPrice, toProductPriceInput } from './product-price.helper';

describe('product-price.helper', () => {
  describe('parseProductPrice', () => {
    it('returns null for empty values', () => {
      expect(parseProductPrice(null)).toBeNull();
      expect(parseProductPrice(undefined)).toBeNull();
      expect(parseProductPrice('   ')).toBeNull();
    });

    it('parses comma as decimal separator', () => {
      expect(parseProductPrice('12,5')).toBe(12.5);
    });

    it('rounds to two decimal places', () => {
      expect(parseProductPrice(' 10.456 ')).toBe(10.46);
    });

    it('returns null for invalid or negative values', () => {
      expect(parseProductPrice('abc')).toBeNull();
      expect(parseProductPrice('-1')).toBeNull();
      expect(parseProductPrice('Infinity')).toBeNull();
    });
  });

  describe('toProductPriceInput', () => {
    it('formats finite numbers with two decimals', () => {
      expect(toProductPriceInput(5)).toBe('5.00');
    });

    it('returns empty string for non-finite numbers', () => {
      expect(toProductPriceInput(Number.NaN)).toBe('');
    });

    it('trims string values', () => {
      expect(toProductPriceInput(' 9.99 ')).toBe('9.99');
    });

    it('returns empty string for nullish values', () => {
      expect(toProductPriceInput(null)).toBe('');
      expect(toProductPriceInput(undefined)).toBe('');
    });
  });
});
