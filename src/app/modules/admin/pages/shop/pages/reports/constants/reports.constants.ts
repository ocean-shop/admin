import { TabItem } from '@ui/tabs/models/tab-item.model';
import { ReportOption } from '../models/report-option.model';
import { ReportPeriodPreset } from '../models/report-period-preset.type';
import { ReportTab } from '../models/report-tab.type';

export const REPORTS_SECTION_PATH = 'reports';
export const REPORTS_TAB_QUERY_PARAM = 'tab';

export const REPORTS_TEXTS = {
  PAGE_TITLE: 'Звіти',
  PAGE_DESCRIPTION:
    'Виручка, товари й клієнти магазину з порівнянням із попереднім таким самим періодом.',
  TABS_LABEL: 'Звіти',
  SHOP_ID_REQUIRED_MESSAGE: 'Не вдалося визначити магазин. Відкрийте звіти зі сторінки магазину.',
  PERIOD_SECTION_LABEL: 'Параметри звіту',
  PERIOD_FROM_LABEL: 'З',
  PERIOD_TO_LABEL: 'По',
  PERIOD_SEPARATOR: '—',
  PERIOD_PRESETS_LABEL: 'Швидкий вибір',
  PERIOD_INVALID_MESSAGE: 'Дата початку не може бути пізніше дати завершення.',
  TIME_ZONE_NOTE:
    'Дні рахуються за часовим поясом магазину (Київ). Чиста виручка — оплачені й не скасовані замовлення.',
  INSIGHTS_TITLE: 'Що варто знати',
  INSIGHTS_DESCRIPTION: 'Автоматичні висновки за правилами',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити звіт. Спробуйте ще раз.',
  LOADING_MESSAGE: 'Завантаження звіту...',
} as const;

/** Bound with `[id]`, so the id lands on the inner control only, not on the host too. */
export const REPORTS_FIELD_IDS = {
  PERIOD_FROM: 'report-period-from',
  PERIOD_TO: 'report-period-to',
  REVENUE_COMPARE: 'revenue-compare',
} as const;

export const REPORTS_ICONS = {
  INSIGHTS: 'lightbulb',
  TIME_ZONE: 'schedule',
} as const;

export const REPORT_TAB_VALUES: readonly ReportTab[] = ['revenue', 'products', 'customers'];
export const REPORTS_DEFAULT_TAB: ReportTab = 'revenue';

export const REPORTS_TABS: TabItem[] = [
  { value: 'revenue', label: 'Виручка', icon: 'payments' },
  { value: 'products', label: 'Товари', icon: 'inventory_2' },
  { value: 'customers', label: 'Клієнти', icon: 'group' },
];

export const REPORTS_PERIOD_PRESET_OPTIONS: ReportOption<ReportPeriodPreset>[] = [
  { value: 'last7Days', label: '7 днів' },
  { value: 'last30Days', label: '30 днів' },
  { value: 'thisMonth', label: 'Цей місяць' },
  { value: 'previousMonth', label: 'Минулий місяць' },
];
export const REPORTS_DEFAULT_PRESET: ReportPeriodPreset = 'thisMonth';

/** Length of rolling presets, today included. */
export const REPORTS_PRESET_DAYS = {
  LAST_7_DAYS: 7,
  LAST_30_DAYS: 30,
} as const;
