import { ShopColorGroup } from '../models/shop-color-group.model';
import { ShopColorScheme } from '../models/shop-color-scheme.model';
import { ShopColorToken } from '../models/shop-color-token.type';
import { ShopContrastPair } from '../models/shop-contrast-pair.model';
import { ShopFeatureFlags } from '../models/shop-feature-flags.model';
import { ShopFeatureOption } from '../models/shop-feature-option.model';
import { ShopSettingsStatus } from '../models/shop-settings-status.type';
import { ShopSettingsStatusView } from '../models/shop-settings-status-view.model';

export const SHOP_SETTINGS_TEXTS = {
  PAGE_TITLE: 'Налаштування магазину',
  PAGE_DESCRIPTION: 'Вмикайте функції вітрини та налаштовуйте кольори, які бачать покупці.',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/settings), щоб керувати налаштуваннями.',
  LOAD_ERROR_MESSAGE: 'Не вдалося завантажити налаштування магазину. Спробуйте ще раз.',
  LOADING_MESSAGE: 'Завантаження налаштувань...',
  FEATURES_TITLE: 'Функції магазину',
  FEATURES_DESCRIPTION: 'Зміни набудуть чинності на вітрині після збереження.',
  FEATURE_ON: 'Увімкнено',
  FEATURE_OFF: 'Вимкнено',
  COLORS_TITLE: 'Колірна схема вітрини',
  COLORS_DESCRIPTION:
    '18 кольорів сайту. Число біля назви — скільки разів колір використано у вітрині.',
  COLORS_RESET_LABEL: 'Стандартні кольори',
  COLOR_CHANGED_BADGE: 'Змінено',
  COLOR_PICKER_LABEL_PREFIX: 'Вибрати колір',
  COLOR_HEX_LABEL_PREFIX: 'HEX-код кольору',
  COLOR_HEX_INVALID: 'Формат #rrggbb',
  USAGE_FEW: 'використання',
  USAGE_MANY: 'використань',
  PREVIEW_TITLE: 'Попередній перегляд вітрини',
  CONTRAST_TITLE: 'Читабельність',
  CONTRAST_NOTE: 'Норма WCAG AA — 4.5:1 для звичайного тексту.',
  CONTRAST_SAMPLE: 'Аа',
  CONTRAST_AA: 'AA',
  CONTRAST_LARGE_TEXT: 'Великий текст',
  CONTRAST_FAIL: 'Замало',
  DISCARD_LABEL: 'Скасувати',
  SAVE_LABEL: 'Зберегти зміни',
  SAVE_SUCCESS_TITLE: 'Налаштування збережено',
} as const;

export const SHOP_SETTINGS_SECTION_PATH = 'settings';

export const SHOP_SETTINGS_ICONS = {
  FEATURES: 'toggle_on',
  COLORS: 'palette',
  RESET: 'restart_alt',
  PREVIEW: 'visibility',
  CONTRAST: 'contrast',
  SAVE: 'save',
} as const;

export const SHOP_SETTINGS_STATUS_VIEWS: Record<ShopSettingsStatus, ShopSettingsStatusView> = {
  clean: { icon: 'check_circle', message: 'Усі зміни збережено', tone: 'success' },
  dirty: { icon: 'edit_note', message: 'Є незбережені зміни', tone: 'default' },
  invalid: { icon: 'error', message: 'Виправте HEX-коди, позначені червоним', tone: 'error' },
};

/** Mirrors `DEFAULT_COLOR_SCHEME` in the API: the palette every shop starts with. */
export const SHOP_DEFAULT_COLOR_SCHEME: ShopColorScheme = {
  background: '#ffffff',
  foreground: '#111c2d',
  muted: '#3d4947',
  mutedLight: '#5f6c69',
  accent: '#00685f',
  accentDark: '#00473f',
  accentSoft: '#e0efea',
  accentHighlight: '#89f5e7',
  onAccentMuted: '#cdeee5',
  surfaceSoft: '#f4f9f7',
  surface: '#edf5f2',
  surfaceStrong: '#d7e9e3',
  borderSoft: '#dcebe7',
  footerBorder: '#cfe0da',
  footer: '#e6f0ec',
  error: '#e5484d',
  errorDark: '#b42318',
  errorBorder: '#f6d0ce',
};

export const SHOP_COLOR_TOKENS = Object.keys(SHOP_DEFAULT_COLOR_SCHEME) as ShopColorToken[];

export const SHOP_DEFAULT_FEATURE_FLAGS: ShopFeatureFlags = {
  useUkrposhta: false,
  usePhoneLogin: false,
  useAutomaticPayment: false,
  useOneClickPurchase: false,
};

export const SHOP_FEATURE_OPTIONS: ShopFeatureOption[] = [
  {
    key: 'useUkrposhta',
    code: 'use_ukrposhta',
    icon: 'local_shipping',
    title: 'Доставка Укрпоштою',
    description: 'Показувати Укрпошту серед способів доставки під час оформлення замовлення.',
  },
  {
    key: 'usePhoneLogin',
    code: 'use_phone_login',
    icon: 'smartphone',
    title: 'Вхід за номером телефону',
    description: 'Покупці входять за одноразовим кодом з SMS, без пароля.',
  },
  {
    key: 'useAutomaticPayment',
    code: 'use_automatic_payment',
    icon: 'credit_card',
    title: 'Автоматична оплата',
    description: 'Онлайн-оплата карткою під час оформлення; статус оплати оновлюється автоматично.',
  },
  {
    key: 'useOneClickPurchase',
    code: 'use_one_click_purchase',
    icon: 'bolt',
    title: 'Купівля в один клік',
    description:
      'Кнопка «Купити в один клік» на сторінці товару. Заявки потрапляють у «Швидкі замовлення».',
  },
];

export const SHOP_COLOR_GROUPS: ShopColorGroup[] = [
  {
    label: 'Фон і текст',
    options: [
      {
        token: 'background',
        name: 'background',
        usageCount: 88,
        description: 'Фон сторінок і карток, заливка контурних кнопок і полів вводу.',
      },
      {
        token: 'foreground',
        name: 'foreground',
        usageCount: 134,
        description:
          'Основний текст: заголовки, текст сторінок, назви товарів. Темно-синій, не чисто чорний.',
      },
      {
        token: 'muted',
        name: 'muted',
        usageCount: 77,
        description: 'Другорядний текст: описи, підписи полів, допоміжний текст.',
      },
      {
        token: 'mutedLight',
        name: 'muted-light',
        usageCount: 82,
        description:
          'Третинний текст: підписи, хлібні крихти, метадані, плейсхолдери, неактивний текст і вкладки нижнього меню.',
      },
    ],
  },
  {
    label: 'Акцент',
    options: [
      {
        token: 'accent',
        name: 'accent',
        usageCount: 136,
        description:
          'Основний колір бренду: головні кнопки, посилання, активні стани, ціни, іконки. Також theme_color для PWA.',
      },
      {
        token: 'accentDark',
        name: 'accent-dark',
        usageCount: 23,
        description:
          'Наведення на головну кнопку; текст на фоні accent-soft (м’яка кнопка, бейджі статусів, активне меню).',
      },
      {
        token: 'accentSoft',
        name: 'accent-soft',
        usageCount: 30,
        description:
          'Блідо-бірюзовий фон м’якої кнопки, активної категорії чи пункту меню, бейджів; наведення на інверсну кнопку.',
      },
      {
        token: 'accentHighlight',
        name: 'accent-highlight',
        usageCount: 3,
        description:
          'Яскравий аква для виділеного тексту на темно-бірюзових блоках (лише блок лояльності на головній).',
      },
      {
        token: 'onAccentMuted',
        name: 'on-accent-muted',
        usageCount: 2,
        description: 'Другорядний текст на акцентному фоні (лише блок лояльності на головній).',
      },
    ],
  },
  {
    label: 'Поверхні',
    options: [
      {
        token: 'surfaceSoft',
        name: 'surface-soft',
        usageCount: 25,
        description:
          'Найсвітліший відтінок: фон секцій і панелей, підсумок кошика, панель каталогу, вимкнені поля.',
      },
      {
        token: 'surface',
        name: 'surface',
        usageCount: 32,
        description: 'Стандартний відтінок для карток, чипів і блоків.',
      },
      {
        token: 'surfaceStrong',
        name: 'surface-strong',
        usageCount: 19,
        description:
          'Найтемніший відтінок: скелетони, доріжки прогресу, заглушки зображень, фон мапи.',
      },
    ],
  },
  {
    label: 'Межі та футер',
    options: [
      {
        token: 'borderSoft',
        name: 'border-soft',
        usageCount: 41,
        description: 'Стандартний розділювач і рамка картки, тонкі лінії-сепаратори.',
      },
      {
        token: 'footerBorder',
        name: 'footer-border',
        usageCount: 23,
        description:
          'Сильніша рамка, не лише у футері: контурна кнопка, поля, чекбокси, вибір дати, фільтри.',
      },
      {
        token: 'footer',
        name: 'footer',
        usageCount: 8,
        description: 'Фон футера, а також кількох шторок і панелей.',
      },
    ],
  },
  {
    label: 'Помилки',
    options: [
      {
        token: 'error',
        name: 'error',
        usageCount: 6,
        description: 'Іконки й акценти помилок.',
      },
      {
        token: 'errorDark',
        name: 'error-dark',
        usageCount: 22,
        description:
          'Текст помилок валідації, небезпечні дії (видалити, вийти), статус «Скасовано».',
      },
      {
        token: 'errorBorder',
        name: 'error-border',
        usageCount: 2,
        description: 'Рамка toast з помилкою, фон наведення на кнопку видалення товару з кошика.',
      },
    ],
  },
];

/** Text color the storefront puts on accent buttons; not part of the palette. */
export const SHOP_ON_ACCENT_TEXT_COLOR = '#ffffff';

export const SHOP_CONTRAST_PAIRS: ShopContrastPair[] = [
  { label: 'Основний текст', foreground: 'foreground', background: 'background' },
  { label: 'Другорядний текст', foreground: 'muted', background: 'background' },
  { label: 'Третинний текст', foreground: 'mutedLight', background: 'background' },
  { label: 'Головна кнопка', foreground: SHOP_ON_ACCENT_TEXT_COLOR, background: 'accent' },
  { label: 'М’яка кнопка', foreground: 'accentDark', background: 'accentSoft' },
  { label: 'Текст помилки', foreground: 'errorDark', background: 'background' },
];

export const SHOP_CONTRAST_RATIO_FRACTION_DIGITS = 1;
export const SHOP_CONTRAST_RATIO_SUFFIX = ':1';

/** Ukrainian plural rule: 1–4 (except 11–14) → "використання", otherwise "використань". */
export const SHOP_USAGE_PLURAL_RULE = {
  BASE: 10,
  TEENS_BASE: 100,
  FEW_MIN: 1,
  FEW_MAX: 4,
  TEENS_MIN: 11,
  TEENS_MAX: 14,
} as const;

/** CSS custom property prefix the storefront preview reads (`--preview-accent`). */
export const SHOP_PREVIEW_CSS_VAR_PREFIX = '--preview-';
export const SHOP_COLOR_FIELD_ID_PREFIX = 'shop-color-';
export const SHOP_FEATURE_SWITCH_ID_PREFIX = 'shop-feature-';
