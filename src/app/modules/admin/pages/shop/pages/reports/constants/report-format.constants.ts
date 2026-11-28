export const REPORT_LOCALE = 'uk-UA';
export const REPORT_PLURAL_LOCALE = 'uk';
/** Reports group days in the shop's local time. */
export const REPORT_TIME_ZONE = 'Europe/Kyiv';
export const REPORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: REPORT_TIME_ZONE,
};
export const REPORT_CURRENCY_SIGN = '₴';
export const REPORT_PERCENT = 100;
export const REPORT_PLUS_SIGN = '+';
export const REPORT_MINUS_SIGN = '−';
export const REPORT_PERCENT_SIGN = '%';
export const REPORT_POINTS_SUFFIX = 'п.п.';
export const REPORT_DATE_SEPARATOR = '.';
export const REPORT_RANGE_SEPARATOR = ' – ';
export const REPORT_LIST_SEPARATOR = ' · ';
export const REPORT_ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
export const REPORT_DATE_PART_LENGTH = 2;
export const REPORT_MS_IN_DAY = 24 * 60 * 60 * 1000;

export const REPORT_DIGITS = {
  /** `+5,0%` */
  CHANGE: 1,
  /** `60%` */
  SHARE: 0,
  /** `8,4%` */
  PRECISE_SHARE: 1,
  /** `2,3 замовлення` */
  AVERAGE: 1,
} as const;

/** Ukrainian plural forms keyed by `Intl.PluralRules` categories. */
export const REPORT_COUNT_WORDS = {
  ORDERS: {
    zero: 'замовлень',
    one: 'замовлення',
    two: 'замовлення',
    few: 'замовлення',
    many: 'замовлень',
    other: 'замовлення',
  },
  PRODUCTS: {
    zero: 'товарів',
    one: 'товар',
    two: 'товари',
    few: 'товари',
    many: 'товарів',
    other: 'товару',
  },
  CUSTOMERS: {
    zero: 'клієнтів',
    one: 'клієнт',
    two: 'клієнти',
    few: 'клієнти',
    many: 'клієнтів',
    other: 'клієнта',
  },
  REQUESTS: {
    zero: 'заявок',
    one: 'заявка',
    two: 'заявки',
    few: 'заявки',
    many: 'заявок',
    other: 'заявки',
  },
  DAYS: {
    zero: 'днів',
    one: 'день',
    two: 'дні',
    few: 'дні',
    many: 'днів',
    other: 'дня',
  },
} as const satisfies Record<string, Record<Intl.LDMLPluralRule, string>>;
