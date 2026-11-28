import { ReportGranularity } from '../models/report-granularity.type';
import { ReportGroupBy } from '../models/report-group-by.type';
import { ReportOption } from '../models/report-option.model';

export const REVENUE_REPORT_TEXTS = {
  GROUP_BY_LABEL: 'Групування',
  COMPARE_LABEL: 'Порівнювати з',
  PREVIOUS_PREFIX: 'було',
  KPI_GROSS_SALES: 'Валова виручка',
  KPI_GROSS_SALES_HINT: 'Сума товарів до знижок',
  KPI_DISCOUNTS: 'Знижки',
  KPI_DISCOUNTS_HINT: 'Промокоди та акції',
  KPI_NET_SALES: 'Чиста виручка',
  KPI_NET_SALES_HINT: 'Оплачені й не скасовані',
  KPI_AOV: 'Середній чек',
  KPI_AOV_HINT_PREFIX: 'Чиста виручка /',
  COD_TITLE: 'Гроші в дорозі',
  COD_DESCRIPTION: 'Замовлення з накладеним платежем уже відправлені, але ще не оплачені.',
  COD_LINK: 'Переглянути замовлення',
  CANCELLED_TITLE: 'Втрати від скасувань',
  CANCELLED_DESCRIPTION_SUFFIX: 'усіх замовлень за період',
  CANCELLED_LINK: 'Переглянути замовлення',
  CHART_TITLE: 'Чиста виручка',
  CHART_TOTAL_PREFIX: 'Разом',
  CHART_TOTAL_JOINER: 'за',
  CHART_EMPTY: 'Немає продажів за вибраний період.',
  SERIES_NET_SALES: 'Чиста виручка',
  SERIES_PAID_REVENUE: 'Оплачено',
  BY_PAYMENT_TITLE: 'За способом оплати',
  BY_SHIPPING_TITLE: 'За способом доставки',
  BREAKDOWN_EMPTY: 'Немає даних за період.',
} as const;

export const REVENUE_REPORT_ICONS = {
  COD: 'local_shipping',
  CANCELLED: 'block',
  BY_PAYMENT: 'credit_card',
  BY_SHIPPING: 'local_shipping',
  CHART: 'bar_chart',
  LINK: 'arrow_forward',
} as const;

export const REVENUE_GRANULARITY_TITLES: Record<ReportGranularity, string> = {
  day: 'по днях',
  week: 'по тижнях',
  month: 'по місяцях',
};

export const REVENUE_GROUP_BY_OPTIONS: ReportOption<ReportGroupBy>[] = [
  { value: 'auto', label: 'Авто' },
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Тиждень' },
  { value: 'month', label: 'Місяць' },
];
export const REVENUE_DEFAULT_GROUP_BY: ReportGroupBy = 'auto';
export const REVENUE_DEFAULT_GRANULARITY: ReportGranularity = 'day';
export const REVENUE_GRANULARITIES: readonly ReportGranularity[] = ['day', 'week', 'month'];

export const REVENUE_CHART_TYPE = 'column';
export const REVENUE_CHART_LINE_TYPE = 'spline';
export const REVENUE_CHART_COLUMN_BORDER_RADIUS = 4;
export const REVENUE_CHART_COLUMN_MAX_WIDTH = 32;
export const REVENUE_CHART_SERIES_COLORS = {
  NET_SALES: '#00685f',
  PAID_REVENUE: '#3cddc7',
} as const;
