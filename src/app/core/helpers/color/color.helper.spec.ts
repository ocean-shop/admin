import {
  getContrastRatio,
  getRelativeLuminance,
  isHexColor,
  normalizeHexColor,
} from './color.helper';

describe('color helper', () => {
  describe('isHexColor', () => {
    it('accepts 6-digit hex with or without # and surrounding spaces', () => {
      expect(isHexColor('#00685f')).toBe(true);
      expect(isHexColor('00685F')).toBe(true);
      expect(isHexColor(' #ABCDEF ')).toBe(true);
    });

    it('rejects short, long, non-hex and empty values', () => {
      expect(isHexColor('#fff')).toBe(false);
      expect(isHexColor('#00685f0')).toBe(false);
      expect(isHexColor('#00685g')).toBe(false);
      expect(isHexColor('')).toBe(false);
      expect(isHexColor(null)).toBe(false);
      expect(isHexColor(undefined)).toBe(false);
    });
  });

  describe('normalizeHexColor', () => {
    it('trims, lowercases and adds the missing #', () => {
      expect(normalizeHexColor(' 00685F ')).toBe('#00685f');
      expect(normalizeHexColor('#ABCDEF')).toBe('#abcdef');
    });
  });

  describe('getRelativeLuminance', () => {
    it('returns 0 for black and 1 for white', () => {
      expect(getRelativeLuminance('#000000')).toBe(0);
      expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1, 5);
    });

    it('handles channels below the linear threshold', () => {
      expect(getRelativeLuminance('#010101')).toBeCloseTo(0.0003035, 6);
    });
  });

  describe('getContrastRatio', () => {
    it('is 21 for black on white regardless of order', () => {
      expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
      expect(getContrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    });

    it('is 1 for identical colors', () => {
      expect(getContrastRatio('#00685f', '#00685f')).toBe(1);
    });

    it('matches the known ratio of the default accent on white', () => {
      expect(getContrastRatio('#ffffff', '#00685f')).toBeCloseTo(6.68, 2);
    });
  });
});
