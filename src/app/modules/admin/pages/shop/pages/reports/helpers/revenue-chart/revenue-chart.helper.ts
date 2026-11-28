import Highcharts from 'highcharts';
import {
  SHOP_STATISTICS_AXIS_LABEL_STYLE,
  SHOP_STATISTICS_CHART_THEME,
} from '../../../../constants/shop-statistics.constants';
import {
  REVENUE_CHART_COLUMN_BORDER_RADIUS,
  REVENUE_CHART_COLUMN_MAX_WIDTH,
  REVENUE_CHART_LINE_TYPE,
  REVENUE_CHART_SERIES_COLORS,
  REVENUE_CHART_TYPE,
  REVENUE_REPORT_TEXTS,
} from '../../constants/revenue-report.constants';
import { RevenueChartData } from '../../models/revenue-report-view.model';
import { formatReportMoney } from '../report-format/report-format.helper';

function formatAxisLabel(this: Highcharts.AxisLabelsFormatterContextObject): string {
  return formatReportMoney(Number(this.value));
}

function formatTooltipPoint(this: Highcharts.Point): string {
  return `${this.series.name}: <b>${formatReportMoney(this.y)}</b><br/>`;
}

/** Net sales columns + paid revenue line; chart chrome shared with the shop statistics. */
export const buildRevenueChartOptions = (data: RevenueChartData): Highcharts.Options => ({
  chart: {
    type: REVENUE_CHART_TYPE,
    backgroundColor: 'transparent',
    style: { fontFamily: SHOP_STATISTICS_CHART_THEME.FONT_FAMILY },
  },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    categories: data.categories,
    lineColor: SHOP_STATISTICS_CHART_THEME.GRID_COLOR,
    labels: { style: SHOP_STATISTICS_AXIS_LABEL_STYLE },
  },
  yAxis: {
    min: 0,
    title: { text: undefined },
    gridLineColor: SHOP_STATISTICS_CHART_THEME.GRID_COLOR,
    labels: { style: SHOP_STATISTICS_AXIS_LABEL_STYLE, formatter: formatAxisLabel },
  },
  tooltip: { shared: true, pointFormatter: formatTooltipPoint },
  legend: {
    enabled: true,
    itemStyle: { color: SHOP_STATISTICS_CHART_THEME.LABEL_COLOR, fontWeight: '500' },
  },
  plotOptions: {
    column: {
      borderRadius: REVENUE_CHART_COLUMN_BORDER_RADIUS,
      maxPointWidth: REVENUE_CHART_COLUMN_MAX_WIDTH,
      borderWidth: 0,
    },
  },
  series: [
    {
      type: REVENUE_CHART_TYPE,
      name: REVENUE_REPORT_TEXTS.SERIES_NET_SALES,
      color: REVENUE_CHART_SERIES_COLORS.NET_SALES,
      data: data.netSales,
    },
    {
      type: REVENUE_CHART_LINE_TYPE,
      name: REVENUE_REPORT_TEXTS.SERIES_PAID_REVENUE,
      color: REVENUE_CHART_SERIES_COLORS.PAID_REVENUE,
      data: data.paidRevenue,
    },
  ],
});
