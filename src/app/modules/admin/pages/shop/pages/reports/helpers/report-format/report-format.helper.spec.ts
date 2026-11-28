import { REPORT_COUNT_WORDS } from '../../constants/report-format.constants';
import {
  buildPercentChange,
  buildPointsChange,
  formatReportCount,
  formatReportCountWithWord,
  formatReportDecimal,
  formatReportMoney,
  formatReportShare,
  toReportNumber,
} from './report-format.helper';

describe('report-format helper', () => {
  it('normalizes missing and non-finite numbers to 0', () => {
    expect(toReportNumber(12.5)).toBe(12.5);
    expect(toReportNumber(null)).toBe(0);
    expect(toReportNumber(undefined)).toBe(0);
    expect(toReportNumber(Number.NaN)).toBe(0);
  });

  it('formats money rounded with grouped thousands', () => {
    expect(formatReportMoney(241600.4)).toBe('241 600 ₴');
    expect(formatReportMoney(null)).toBe('0 ₴');
  });

  it('formats counts and decimals', () => {
    expect(formatReportCount(1284)).toBe('1 284');
    expect(formatReportDecimal(2.345)).toBe('2,3');
    expect(formatReportDecimal(2, 2)).toBe('2,00');
  });

  it('formats ratios as percents', () => {
    expect(formatReportShare(0.6)).toBe('60%');
    expect(formatReportShare(0.0842, 1)).toBe('8,4%');
    expect(formatReportShare(undefined)).toBe('0%');
  });

  it('adds the plural word for a count', () => {
    expect(formatReportCountWithWord(1, REPORT_COUNT_WORDS.PRODUCTS)).toBe('1 товар');
    expect(formatReportCountWithWord(3, REPORT_COUNT_WORDS.PRODUCTS)).toBe('3 товари');
    expect(formatReportCountWithWord(25, REPORT_COUNT_WORDS.ORDERS)).toBe('25 замовлень');
    expect(formatReportCountWithWord(null, REPORT_COUNT_WORDS.CUSTOMERS)).toBe('0 клієнтів');
  });

  describe('buildPercentChange', () => {
    it('returns null without a comparable value', () => {
      expect(buildPercentChange(null)).toBeNull();
      expect(buildPercentChange(undefined)).toBeNull();
      expect(buildPercentChange(Number.POSITIVE_INFINITY)).toBeNull();
    });

    it('marks growth as success by default', () => {
      expect(buildPercentChange(5)).toEqual({ label: '+5,0%', direction: 'up', tone: 'success' });
      expect(buildPercentChange(-12.34)).toEqual({
        label: '−12,3%',
        direction: 'down',
        tone: 'danger',
      });
    });

    it('inverts the tone when lower is better', () => {
      expect(buildPercentChange(35, false)).toEqual({
        label: '+35,0%',
        direction: 'up',
        tone: 'danger',
      });
      expect(buildPercentChange(-3, false)?.tone).toBe('success');
    });

    it('treats changes that round to zero as flat', () => {
      expect(buildPercentChange(0.04)).toEqual({
        label: '0,0%',
        direction: 'flat',
        tone: 'neutral',
      });
    });
  });

  describe('buildPointsChange', () => {
    it('returns the difference in percentage points', () => {
      expect(buildPointsChange(0.084, 0.051, false)).toEqual({
        label: '+3,3 п.п.',
        direction: 'up',
        tone: 'danger',
      });
      expect(buildPointsChange(0.24, 0.29)).toEqual({
        label: '−5,0 п.п.',
        direction: 'down',
        tone: 'danger',
      });
      expect(buildPointsChange(null, undefined).direction).toBe('flat');
    });
  });
});
