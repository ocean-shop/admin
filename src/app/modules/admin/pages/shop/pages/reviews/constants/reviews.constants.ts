import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { ReviewFilters } from '../models/review-filters.model';
import { ReviewStatus } from '../models/review-status.enum';

export const REVIEWS_TEXTS = {
  PAGE_TITLE: 'Відгуки',
  PAGE_DESCRIPTION:
    'Читайте, що покупці пишуть про товари магазину, і знаходьте відгуки за статусом або оцінкою.',
  STATUS_FILTER_LABEL: 'Статус',
  RATING_FILTER_LABEL: 'Оцінка',
  SORT_LABEL: 'Сортування',
  FILTER_APPLY_LABEL: 'Застосувати',
  FILTER_RESET_LABEL: 'Скинути',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/reviews), щоб переглядати відгуки.',
  LIST_LOADING_TEXT: 'Завантаження відгуків...',
  EMPTY_TITLE: 'Відгуків не знайдено',
  EMPTY_TEXT: 'Спробуйте інший статус чи оцінку або скиньте фільтри, щоб побачити всі відгуки.',
  EMPTY_RESET_LABEL: 'Скинути фільтри',
  RATING_LABEL_PREFIX: 'Оцінка',
  RATING_LABEL_SEPARATOR: 'з',
  ADVANTAGES_LABEL: 'Переваги:',
  DRAWBACKS_LABEL: 'Недоліки:',
  APPROVED_PURCHASE_LABEL: 'Підтверджена покупка',
  USEFUL_LABEL: 'Корисно:',
  OPEN_PRODUCT_LABEL: 'Відкрити товар',
  PAGINATION_LABEL: 'відгуків',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити відгуки. Спробуйте ще раз.',
} as const;

export const REVIEWS_SECTION_PATH = 'reviews';
export const REVIEWS_PAGE_SIZE = 20;
export const REVIEWS_ALL_FILTER = 'all';
export const REVIEW_RATING_MAX = 5;
export const REVIEW_RATING_FRACTION_DIGITS = 1;
export const REVIEW_INITIALS_MAX_LENGTH = 2;
export const REVIEW_NAME_SEPARATOR_PATTERN = /\s+/;

export const REVIEWS_ICONS = {
  STATUS: 'fact_check',
  RATING: 'star',
  SORT: 'swap_vert',
  STAR: 'star',
  PRODUCT: 'inventory_2',
  VERIFIED: 'verified',
  USEFUL: 'thumb_up',
  EMPTY: 'search_off',
} as const;

export const REVIEWS_DEFAULT_FILTERS: ReviewFilters = {
  status: REVIEWS_ALL_FILTER,
  rating: REVIEWS_ALL_FILTER,
  sortOrder: 'desc',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  [ReviewStatus.Pending]: 'На модерації',
  [ReviewStatus.Approved]: 'Схвалено',
  [ReviewStatus.Rejected]: 'Відхилено',
};

export const REVIEW_STATUS_BADGE_TONES: Record<ReviewStatus, BadgeTone> = {
  [ReviewStatus.Pending]: 'warning',
  [ReviewStatus.Approved]: 'success',
  [ReviewStatus.Rejected]: 'danger',
};

export const REVIEWS_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Усі статуси', value: REVIEWS_ALL_FILTER },
  { label: 'На модерації', value: ReviewStatus.Pending },
  { label: 'Схвалені', value: ReviewStatus.Approved },
  { label: 'Відхилені', value: ReviewStatus.Rejected },
];

export const REVIEWS_RATING_OPTIONS: DropdownOption[] = [
  { label: 'Будь-яка оцінка', value: REVIEWS_ALL_FILTER },
  { label: '5 зірок', value: '5' },
  { label: '4 зірки', value: '4' },
  { label: '3 зірки', value: '3' },
  { label: '2 зірки', value: '2' },
  { label: '1 зірка', value: '1' },
];

export const REVIEWS_SORT_OPTIONS: DropdownOption[] = [
  { label: 'Спочатку новіші', value: 'desc' },
  { label: 'Спочатку старіші', value: 'asc' },
];

export const REVIEW_DATE_LOCALE = 'uk-UA';
export const REVIEW_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

/** Count heading words by Ukrainian plural category: 1 відгук, 2 відгуки, 5 відгуків. */
export const REVIEWS_PLURAL_LOCALE = 'uk';
export const REVIEWS_COUNT_WORDS: Record<Intl.LDMLPluralRule, string> = {
  zero: 'відгуків',
  one: 'відгук',
  two: 'відгуки',
  few: 'відгуки',
  many: 'відгуків',
  other: 'відгуку',
};
