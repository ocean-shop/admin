import { CustomerSegment } from '../models/customer-segment.type';
import { CustomerSegmentMeta } from '../models/customer-segment-meta.model';

export const CUSTOMER_REPORT_TEXTS = {
  KPI_ACTIVE: 'Покупців за період',
  KPI_ACTIVE_HINT: 'Унікальні клієнти, що купували за період',
  KPI_REPEAT_RATE: 'Частка повторних',
  KPI_REPEAT_RATE_HINT_SUFFIX: 'купили не вперше',
  KPI_LTV: 'Середній LTV',
  KPI_LTV_HINT: 'Усі покупки клієнта за весь час',
  KPI_RETURNING_SHARE: 'Виручка від повторних',
  KPI_RETURNING_SHARE_JOINER: 'з',
  KPI_TOTAL: 'Усього клієнтів',
  KPI_TOTAL_HINT_SUFFIX: 'гостьових',
  KPI_ORDERS_PER_CUSTOMER: 'Замовлень на клієнта',
  KPI_ORDERS_PER_CUSTOMER_HINT: 'У середньому за весь час',
  SPLIT_TITLE: 'Нові та повторні покупці',
  SPLIT_DESCRIPTION_PREFIX: 'Чиста виручка',
  SPLIT_DESCRIPTION_SUFFIX: 'за період',
  SPLIT_NEW: 'Нові покупці',
  SPLIT_RETURNING: 'Повторні покупці',
  SEGMENTS_TITLE: 'RFM-сегменти',
  SEGMENTS_DESCRIPTION_SUFFIX: 'за давністю й частотою покупок.',
  SEGMENT_CUSTOMERS_SHARE_SUFFIX: 'клієнтів',
  SEGMENT_REVENUE_SUFFIX: 'виручки за весь час',
} as const;

export const CUSTOMER_REPORT_ICONS = {
  SPLIT: 'group_add',
  SEGMENTS: 'segment',
} as const;

export const CUSTOMER_SEGMENTS: readonly CustomerSegment[] = [
  'champions',
  'loyal',
  'new',
  'promising',
  'atRisk',
  'hibernating',
  'lost',
];

export const CUSTOMER_SEGMENT_META: Record<CustomerSegment, CustomerSegmentMeta> = {
  champions: {
    title: 'Найкращі',
    icon: 'workspace_premium',
    tone: 'primary',
    description: 'Купували нещодавно й часто. Запропонуйте ранній доступ до новинок.',
  },
  loyal: {
    title: 'Лояльні',
    icon: 'favorite',
    tone: 'secondary',
    description: 'Регулярно повертаються. Добре реагують на бонусну програму.',
  },
  new: {
    title: 'Нові',
    icon: 'person_add',
    tone: 'neutral',
    description: 'Перша покупка зовсім нещодавно. Привітайте й розкажіть про магазин.',
  },
  promising: {
    title: 'Перспективні',
    icon: 'trending_up',
    tone: 'neutral',
    description: 'Одна покупка за останні місяці. Нагадайте про супутні товари.',
  },
  atRisk: {
    title: 'Під загрозою відтоку',
    icon: 'warning',
    tone: 'warning',
    description: 'Раніше купували часто, але давно не повертаються.',
  },
  hibernating: {
    title: 'Сплячі',
    icon: 'bedtime',
    tone: 'muted',
    description: 'Давно не купували. Спробуйте розсилку з промокодом.',
  },
  lost: {
    title: 'Втрачені',
    icon: 'person_off',
    tone: 'muted',
    description: 'Одна давня покупка й понад рік тиші. Низький пріоритет для розсилок.',
  },
};
