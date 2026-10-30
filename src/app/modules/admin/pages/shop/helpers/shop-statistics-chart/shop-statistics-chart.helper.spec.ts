import {
  SHOP_STATISTICS_SERIES_COLORS,
  SHOP_STATISTICS_TEXTS,
} from '../../constants/shop-statistics.constants';
import {
  buildStatisticChartData,
  buildStatisticChartOptions,
} from './shop-statistics-chart.helper';

describe('shop-statistics-chart.helper', () => {
  it('returns empty chart data without a statistic', () => {
    expect(buildStatisticChartData(undefined)).toEqual({
      categories: [],
      orders: [],
      products: [],
      users: [],
    });
  });

  it('merges months of every series chronologically and fills gaps with 0', () => {
    expect(
      buildStatisticChartData({
        orders: [
          { year: 2026, month: 'Feb', monthNumber: 2, count: 4 },
          { year: 2025, month: 'Dec', monthNumber: 12, count: 1 },
        ],
        products: [{ year: 2026, month: 'Jan', monthNumber: 1, count: 7 }],
        users: [{ year: 2026, month: 'Feb', monthNumber: 2, count: 2 }],
      }),
    ).toEqual({
      categories: ['Dec 2025', 'Jan 2026', 'Feb 2026'],
      orders: [1, 0, 4],
      products: [0, 7, 0],
      users: [0, 0, 2],
    });
  });

  it('builds one colored series per metric', () => {
    const options = buildStatisticChartOptions({
      categories: ['Jan 2026'],
      orders: [1],
      products: [2],
      users: [3],
    });

    expect(options.series?.map((series) => series.name)).toEqual([
      SHOP_STATISTICS_TEXTS.SERIES_ORDERS,
      SHOP_STATISTICS_TEXTS.SERIES_PRODUCTS,
      SHOP_STATISTICS_TEXTS.SERIES_USERS,
    ]);
    expect(options.series?.[0]).toMatchObject({
      color: SHOP_STATISTICS_SERIES_COLORS.ORDERS,
      data: [1],
    });
    expect(options.xAxis).toEqual({ categories: ['Jan 2026'] });
  });
});
