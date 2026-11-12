import type Highcharts from 'highcharts';

export const SHOP_STATISTICS_TEXTS = {
  TITLE: 'Статистика магазину',
  DESCRIPTION: 'Динаміка нових замовлень, продуктів і користувачів за місяцями.',
  SERIES_ORDERS: 'Нові замовлення',
  SERIES_PRODUCTS: 'Нові продукти',
  SERIES_USERS: 'Нові користувачі',
  Y_AXIS_TITLE: 'Кількість',
  LOADING: 'Завантаження статистики...',
  LOAD_ERROR: 'Не вдалося завантажити статистику. Спробуйте ще раз.',
  EMPTY: 'Немає даних для відображення статистики.',
} as const;

export const SHOP_STATISTICS_SERIES_COLORS = {
  ORDERS: '#2563eb',
  PRODUCTS: '#16a34a',
  USERS: '#d97706',
} as const;

export const SHOP_STATISTICS_CHART_TYPE = 'column';
export const SHOP_STATISTICS_COLUMN_BORDER_RADIUS = 6;
export const SHOP_STATISTICS_COLUMN_POINT_WIDTH = 20;

/** Chart chrome aligned with the design system (Inter, outline-variant grid, caption labels). */
export const SHOP_STATISTICS_CHART_THEME = {
  FONT_FAMILY: "'Inter', 'Noto Sans', Roboto, sans-serif",
  GRID_COLOR: '#bcc9c6',
  LABEL_COLOR: '#3d4947',
  LABEL_FONT_SIZE: '13px',
  DATA_LABEL_FONT_SIZE: '12px',
} as const;

export const SHOP_STATISTICS_AXIS_LABEL_STYLE: Highcharts.CSSObject = {
  color: SHOP_STATISTICS_CHART_THEME.LABEL_COLOR,
  fontSize: SHOP_STATISTICS_CHART_THEME.LABEL_FONT_SIZE,
};
