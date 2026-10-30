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
export const SHOP_STATISTICS_COLUMN_BORDER_RADIUS = 4;
