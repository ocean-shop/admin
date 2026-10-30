import Highcharts from 'highcharts';
import {
  SHOP_STATISTICS_CHART_TYPE,
  SHOP_STATISTICS_COLUMN_BORDER_RADIUS,
  SHOP_STATISTICS_SERIES_COLORS,
  SHOP_STATISTICS_TEXTS,
} from '../../constants/shop-statistics.constants';
import {
  ChartData,
  MonthlyStatistic,
  ShopStatistic,
  StatisticMonthKey,
} from '../../models/shop-statistic.model';

const toMonthId = (entry: MonthlyStatistic): string => `${entry.year}-${entry.monthNumber}`;

/** Every month present in any series, in chronological order. */
const buildOrderedMonthKeys = (statistic: ShopStatistic): StatisticMonthKey[] => {
  const months = new Map<string, StatisticMonthKey>();
  [...statistic.orders, ...statistic.products, ...statistic.users].forEach((entry) => {
    const id = toMonthId(entry);
    if (!months.has(id)) {
      months.set(id, {
        id,
        label: `${entry.month} ${entry.year}`,
        year: entry.year,
        monthNumber: entry.monthNumber,
      });
    }
  });

  return [...months.values()].sort(
    (left, right) => left.year - right.year || left.monthNumber - right.monthNumber,
  );
};

/** Counts aligned to the month keys; months missing from the series count as 0. */
const mapSeries = (keys: StatisticMonthKey[], entries: MonthlyStatistic[]): number[] => {
  const counts = new Map(entries.map((entry) => [toMonthId(entry), entry.count]));
  return keys.map((key) => counts.get(key.id) ?? 0);
};

export const buildStatisticChartData = (statistic: ShopStatistic | undefined): ChartData => {
  if (!statistic) {
    return { categories: [], orders: [], products: [], users: [] };
  }

  const keys = buildOrderedMonthKeys(statistic);
  return {
    categories: keys.map((key) => key.label),
    orders: mapSeries(keys, statistic.orders),
    products: mapSeries(keys, statistic.products),
    users: mapSeries(keys, statistic.users),
  };
};

export const buildStatisticChartOptions = (data: ChartData): Highcharts.Options => ({
  chart: { type: SHOP_STATISTICS_CHART_TYPE, backgroundColor: 'transparent' },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: { categories: data.categories },
  yAxis: {
    allowDecimals: false,
    min: 0,
    title: { text: SHOP_STATISTICS_TEXTS.Y_AXIS_TITLE },
  },
  tooltip: { shared: true },
  legend: { enabled: true },
  plotOptions: { column: { borderRadius: SHOP_STATISTICS_COLUMN_BORDER_RADIUS } },
  series: [
    {
      type: SHOP_STATISTICS_CHART_TYPE,
      name: SHOP_STATISTICS_TEXTS.SERIES_ORDERS,
      color: SHOP_STATISTICS_SERIES_COLORS.ORDERS,
      data: data.orders,
    },
    {
      type: SHOP_STATISTICS_CHART_TYPE,
      name: SHOP_STATISTICS_TEXTS.SERIES_PRODUCTS,
      color: SHOP_STATISTICS_SERIES_COLORS.PRODUCTS,
      data: data.products,
    },
    {
      type: SHOP_STATISTICS_CHART_TYPE,
      name: SHOP_STATISTICS_TEXTS.SERIES_USERS,
      color: SHOP_STATISTICS_SERIES_COLORS.USERS,
      data: data.users,
    },
  ],
});
