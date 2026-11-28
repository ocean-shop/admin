import { AbcClass } from '../models/abc-class.type';
import { AbcClassMeta } from '../models/abc-class-meta.model';
import { ReportOption } from '../models/report-option.model';

export const PRODUCT_REPORT_TEXTS = {
  LIMIT_LABEL: 'Показати в рейтингу',
  DEAD_STOCK_DAYS_LABEL: '«Мертвий» товар — без продажів понад',
  ABC_TITLE: 'ABC-аналіз за виручкою',
  ABC_DESCRIPTION: 'A — товари, що дають 80% виручки, B — наступні 15%, C — решта 5%.',
  ABC_REVENUE_SUFFIX: 'виручки',
  ABC_ARIA_PREFIX: 'Частка виручки:',
  TOP_TITLE: 'Рейтинг товарів',
  TOP_SHOWN_PREFIX: 'Показано',
  TOP_SHOWN_JOINER: 'з',
  TOP_SHOWN_SUFFIX: 'проданих товарів',
  TOP_FILTER_LABEL: 'Клас товарів',
  TOP_FILTER_ALL: 'Усі',
  TOP_FILTER_CLASS_PREFIX: 'Клас',
  TOP_EMPTY: 'За період не продано жодного товару.',
  COLUMN_RANK: '#',
  COLUMN_PRODUCT: 'Товар',
  COLUMN_CLASS: 'Клас',
  COLUMN_REVENUE: 'Виручка',
  COLUMN_SHARE: 'Частка',
  COLUMN_CUMULATIVE: 'Накопичено',
  COLUMN_UNITS: 'Продано',
  COLUMN_ORDERS: 'Замовлень',
  UNITS_SUFFIX: 'шт.',
  GROWING_TITLE: 'Зростають',
  GROWING_EMPTY: 'Немає товарів із зростанням продажів.',
  DECLINING_TITLE: 'Падають',
  DECLINING_EMPTY: 'Немає товарів зі спадом продажів.',
  NEW_PRODUCT_LABEL: 'Новий',
  DEAD_STOCK_TITLE: '«Мертві» товари',
  DEAD_STOCK_DESCRIPTION_PREFIX: 'Активні товари без жодного продажу понад',
  DEAD_STOCK_EMPTY_TITLE: 'Усі товари продаються',
  DEAD_STOCK_EMPTY_PREFIX: 'Немає активних товарів без продажів понад',
  DEAD_STOCK_NEVER_SOLD: 'Жодного продажу',
  COLUMN_PRICE: 'Ціна',
  COLUMN_LAST_SOLD: 'Останній продаж',
  COLUMN_DAYS_WITHOUT_SALES: 'Днів без продажів',
  COLUMN_ACTIONS: 'Дії',
  OPEN_PRODUCT: 'Відкрити товар',
} as const;

export const PRODUCT_REPORT_ICONS = {
  ABC: 'stacked_bar_chart',
  TOP: 'leaderboard',
  GROWING: 'trending_up',
  DECLINING: 'trending_down',
  DEAD_STOCK: 'hourglass_empty',
  DEAD_STOCK_EMPTY: 'check_circle',
} as const;

export const PRODUCT_REPORT_LIMIT_OPTIONS: ReportOption<number>[] = [
  { value: 5, label: 'Топ 5' },
  { value: 10, label: 'Топ 10' },
  { value: 20, label: 'Топ 20' },
];
export const PRODUCT_REPORT_DEFAULT_LIMIT = 10;

export const PRODUCT_REPORT_DEAD_STOCK_DAYS_OPTIONS: ReportOption<number>[] = [
  { value: 30, label: '30 днів' },
  { value: 60, label: '60 днів' },
  { value: 90, label: '90 днів' },
];
export const PRODUCT_REPORT_DEFAULT_DEAD_STOCK_DAYS = 60;

export const ABC_CLASSES: readonly AbcClass[] = ['A', 'B', 'C'];

export const ABC_CLASS_META: Record<AbcClass, AbcClassMeta> = {
  A: { title: 'Основа виручки', tone: 'primary' },
  B: { title: 'Середня група', tone: 'secondary' },
  C: { title: 'Хвіст асортименту', tone: 'muted' },
};

/** Fallback when the API sends an unknown class. */
export const ABC_DEFAULT_CLASS: AbcClass = 'C';
