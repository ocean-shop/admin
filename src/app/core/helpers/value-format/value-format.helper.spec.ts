import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import { VALUE_FORMAT_TEXTS } from '@core/constants/value-format.constants';
import {
  formatAmount,
  formatBoolean,
  formatDate,
  formatNumber,
  formatNumberOrText,
  formatStatus,
  formatText,
  joinOrPlaceholder,
  stringifyValue,
  toTrimmedString,
} from './value-format.helper';

describe('value-format.helper', () => {
  it('toTrimmedString stringifies and trims, mapping missing values to empty', () => {
    expect(toTrimmedString(' a ')).toBe('a');
    expect(toTrimmedString(42)).toBe('42');
    expect(toTrimmedString(null)).toBe('');
    expect(toTrimmedString(undefined)).toBe('');
  });

  it('formatText trims strings and falls back for empty or non-string values', () => {
    expect(formatText('  a ')).toBe('a');
    expect(formatText('   ')).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(formatText(5)).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(formatText(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatNumber accepts only finite numbers', () => {
    expect(formatNumber(3)).toBe('3');
    expect(formatNumber(Number.NaN)).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(formatNumber('3')).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatNumberOrText handles both shapes', () => {
    expect(formatNumberOrText(1001)).toBe('1001');
    expect(formatNumberOrText(' A-1 ')).toBe('A-1');
    expect(formatNumberOrText(undefined)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatAmount fixes two decimals for numbers and trims strings', () => {
    expect(formatAmount(12)).toBe('12.00');
    expect(formatAmount(' 9.5 ')).toBe('9.5');
    expect(formatAmount(Number.POSITIVE_INFINITY)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatDate localizes valid dates and keeps unparsable text', () => {
    const iso = '2026-01-02T03:04:05.000Z';

    expect(formatDate(iso)).toBe(new Date(iso).toLocaleString());
    expect(formatDate(' not a date ')).toBe('not a date');
    expect(formatDate('')).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(formatDate(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatStatus capitalizes separated words', () => {
    expect(formatStatus('IN_progress-now')).toBe('In Progress Now');
    expect(formatStatus('  ')).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(formatStatus(undefined)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('formatBoolean maps to localized yes/no', () => {
    expect(formatBoolean(true)).toBe(VALUE_FORMAT_TEXTS.YES);
    expect(formatBoolean(false)).toBe(VALUE_FORMAT_TEXTS.NO);
    expect(formatBoolean('true')).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('stringifyValue covers primitives, objects and failures', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;

    expect(stringifyValue(null)).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(stringifyValue(' x ')).toBe('x');
    expect(stringifyValue(0)).toBe('0');
    expect(stringifyValue(false)).toBe('false');
    expect(stringifyValue({ a: 1 })).toBe('{"a":1}');
    expect(stringifyValue(circular)).toBe(EMPTY_VALUE_PLACEHOLDER);
    expect(stringifyValue(() => undefined)).toBe(EMPTY_VALUE_PLACEHOLDER);
  });

  it('joinOrPlaceholder joins values or falls back', () => {
    expect(joinOrPlaceholder(['a', 'b'])).toBe('a, b');
    expect(joinOrPlaceholder(['a', 'b'], ' / ')).toBe('a / b');
    expect(joinOrPlaceholder([])).toBe(EMPTY_VALUE_PLACEHOLDER);
  });
});
