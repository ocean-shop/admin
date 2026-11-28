import Highcharts from 'highcharts';
import {
  REVENUE_CHART_SERIES_COLORS,
  REVENUE_REPORT_TEXTS,
} from '../../constants/revenue-report.constants';
import { buildRevenueChartOptions } from './revenue-chart.helper';

describe('buildRevenueChartOptions', () => {
  const options = buildRevenueChartOptions({
    categories: ['01.11', '02.11'],
    netSales: [6100, 0],
    paidRevenue: [5000, 0],
  });

  it('uses categories and both series', () => {
    expect((options.xAxis as Highcharts.XAxisOptions).categories).toEqual(['01.11', '02.11']);
    expect(options.series).toEqual([
      expect.objectContaining({
        type: 'column',
        name: REVENUE_REPORT_TEXTS.SERIES_NET_SALES,
        color: REVENUE_CHART_SERIES_COLORS.NET_SALES,
        data: [6100, 0],
      }),
      expect.objectContaining({
        type: 'spline',
        name: REVENUE_REPORT_TEXTS.SERIES_PAID_REVENUE,
        data: [5000, 0],
      }),
    ]);
  });

  it('formats axis labels and tooltip points as money', () => {
    const axis = options.yAxis as Highcharts.YAxisOptions;
    const axisFormatter = axis.labels?.formatter as unknown as (this: { value: number }) => string;
    const pointFormatter = options.tooltip?.pointFormatter as unknown as (this: {
      y: number;
      series: { name: string };
    }) => string;

    expect(axisFormatter.call({ value: 20000 })).toBe('20 000 ₴');
    expect(pointFormatter.call({ y: 6100, series: { name: 'Чиста виручка' } })).toBe(
      'Чиста виручка: <b>6 100 ₴</b><br/>',
    );
  });
});
