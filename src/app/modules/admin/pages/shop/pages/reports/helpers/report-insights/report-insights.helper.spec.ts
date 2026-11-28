import {
  REPORT_INSIGHT_CODE_ICONS,
  REPORT_INSIGHT_SEVERITY_META,
} from '../../constants/report-insights.constants';
import { mapReportInsights } from './report-insights.helper';

describe('mapReportInsights', () => {
  it('returns an empty list without insights', () => {
    expect(mapReportInsights(null)).toEqual([]);
    expect(mapReportInsights(undefined)).toEqual([]);
  });

  it('uses the code icon and severity tone', () => {
    expect(
      mapReportInsights([
        { code: 'net_sales_growth', severity: 'positive', message: ' Продажі зросли ' },
      ]),
    ).toEqual([
      {
        id: 'net_sales_growth-0',
        icon: REPORT_INSIGHT_CODE_ICONS['net_sales_growth'],
        tone: 'positive',
        message: 'Продажі зросли',
      },
    ]);
  });

  it('uses a stronger tone for critical codes', () => {
    expect(
      mapReportInsights([
        { code: 'high_cancellation_rate', severity: 'warning', message: 'Скасування' },
      ])[0].tone,
    ).toBe('danger');
  });

  it('falls back to the info severity and its icon for unknown values', () => {
    expect(mapReportInsights([{ code: 'other', severity: 'weird', message: 'Текст' }])).toEqual([
      {
        id: 'other-0',
        icon: REPORT_INSIGHT_SEVERITY_META.info.icon,
        tone: 'info',
        message: 'Текст',
      },
    ]);
    expect(mapReportInsights([{ message: 'Без коду' }])[0]).toEqual(
      expect.objectContaining({ id: '0', tone: 'info' }),
    );
  });

  it('drops insights without a message', () => {
    expect(
      mapReportInsights([
        { code: 'a', severity: 'info', message: '  ' },
        { code: 'b', severity: 'info', message: null },
        { code: 'c', severity: 'warning', message: 'Ок' },
      ]).map((insight) => insight.id),
    ).toEqual(['c-2']);
  });
});
