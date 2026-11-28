import {
  buildPresetPeriod,
  daysSince,
  formatReportDate,
  formatReportDateTime,
  formatReportMonth,
  formatReportPeriodRange,
  formatReportShortDate,
  isIsoDate,
  isValidReportPeriod,
  resolveReportTab,
  toIsoDate,
} from './report-period.helper';

describe('report-period helper', () => {
  const today = new Date(2026, 10, 27, 23, 30);

  it('formats a local date as ISO', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it.each([
    ['last7Days', { from: '2026-11-21', to: '2026-11-27' }],
    ['last30Days', { from: '2026-10-29', to: '2026-11-27' }],
    ['thisMonth', { from: '2026-11-01', to: '2026-11-27' }],
    ['previousMonth', { from: '2026-10-01', to: '2026-10-31' }],
  ] as const)('builds the %s preset', (preset, expected) => {
    expect(buildPresetPeriod(preset, today)).toEqual(expected);
  });

  it('handles the previous month across a year boundary', () => {
    expect(buildPresetPeriod('previousMonth', new Date(2026, 0, 10))).toEqual({
      from: '2025-12-01',
      to: '2025-12-31',
    });
  });

  it('uses the current date by default', () => {
    expect(buildPresetPeriod('thisMonth').to).toBe(toIsoDate(new Date()));
  });

  it('validates ISO dates and period order', () => {
    expect(isIsoDate('2026-11-01')).toBe(true);
    expect(isIsoDate('01.11.2026')).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isValidReportPeriod({ from: '2026-11-01', to: '2026-11-01' })).toBe(true);
    expect(isValidReportPeriod({ from: '2026-11-02', to: '2026-11-01' })).toBe(false);
    expect(isValidReportPeriod({ from: '', to: '2026-11-01' })).toBe(false);
  });

  it('formats dates and keeps unknown values', () => {
    expect(formatReportDate('2026-11-01')).toBe('01.11.2026');
    expect(formatReportShortDate('2026-11-01')).toBe('01.11');
    expect(formatReportMonth('2026-11-01')).toBe('11.2026');
    expect(formatReportDate('later')).toBe('later');
    expect(formatReportShortDate('later')).toBe('later');
    expect(formatReportMonth('later')).toBe('later');
  });

  it('formats a period range', () => {
    expect(formatReportPeriodRange({ from: '2026-11-01', to: '2026-11-27' })).toBe(
      '01.11 – 27.11.2026',
    );
    expect(formatReportPeriodRange({ from: '2025-12-15', to: '2026-01-14' })).toBe(
      '15.12.2025 – 14.01.2026',
    );
    expect(formatReportPeriodRange({ from: '2026-11-01' })).toBe('');
    expect(formatReportPeriodRange(null)).toBe('');
  });

  it('formats a date-time in the shop time zone', () => {
    expect(formatReportDateTime('2026-10-31T23:30:00.000Z')).toBe('01.11.2026');
    expect(formatReportDateTime('nope')).toBeNull();
    expect(formatReportDateTime(null)).toBeNull();
  });

  it('counts whole days since a date-time', () => {
    const now = new Date('2026-11-27T12:00:00.000Z');

    expect(daysSince('2026-11-20T13:00:00.000Z', now)).toBe(6);
    expect(daysSince('2026-12-01T00:00:00.000Z', now)).toBe(0);
    expect(daysSince(null, now)).toBeNull();
    expect(daysSince('not-a-date', now)).toBeNull();
    expect(daysSince(new Date().toISOString())).toBe(0);
  });

  it('resolves the tab with a fallback', () => {
    expect(resolveReportTab('products')).toBe('products');
    expect(resolveReportTab('customers')).toBe('customers');
    expect(resolveReportTab('unknown')).toBe('revenue');
    expect(resolveReportTab(null)).toBe('revenue');
  });
});
