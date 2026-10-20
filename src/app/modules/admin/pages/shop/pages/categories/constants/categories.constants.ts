import {
  SEO_META_DESCRIPTION_MAX_LENGTH,
  SEO_META_TITLE_MAX_LENGTH,
} from '../../../constants/seo.constants';
import { CategoryFormData } from '../models/category-form.model';

export const CATEGORIES_TEXTS = {
  PAGE_TITLE: 'Керування категоріями',
  PAGE_DESCRIPTION:
    'Організуйте ієрархію товарів вашого магазину. Додавайте, редагуйте або видаляйте категорії, щоб клієнти могли легко знаходити потрібні товари.',
  CREATE_ROOT_LABEL: 'Створити кореневу категорію',
  EMPTY_STATE: 'Категорії не знайдено.',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте цю сторінку з коректним шляхом магазину (/shop/:shopId/categories), щоб створювати категорії.',
  TOTAL_CATEGORIES_LABEL: 'Всього категорій',
  DEEPEST_LEVEL_LABEL: 'Найглибший рівень',
  LEVEL_SUFFIX: 'Рівні',
  MODAL_CREATE_ROOT_TITLE: 'Створити кореневу категорію',
  MODAL_CREATE_CHILD_TITLE: 'Створити підкатегорію',
  MODAL_UPDATE_TITLE: 'Оновити категорію',
  MODAL_DELETE_TITLE: 'Видалити категорію',
  MODAL_CREATE_CONFIRM_LABEL: 'Створити',
  MODAL_UPDATE_CONFIRM_LABEL: 'Оновити',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  MODAL_DELETE_MESSAGE: 'Ви впевнені, що хочете видалити цю категорію? Цю дію неможливо скасувати.',
  NAME_LABEL: 'Назва',
  NAME_PLACEHOLDER: 'Введіть назву категорії',
  NAME_REQUIRED_MESSAGE: "Назва категорії є обов'язковою",
  SLUG_LABEL: 'Слаг',
  SLUG_PLACEHOLDER: 'category-slug',
  SLUG_REQUIRED_MESSAGE: "Слаг категорії є обов'язковим",
  SEO_TITLE: 'SEO',
  META_TITLE_LABEL: 'Meta title',
  META_TITLE_PLACEHOLDER: 'Заголовок для пошукових систем',
  META_TITLE_TOO_LONG: `Максимум ${SEO_META_TITLE_MAX_LENGTH} символів.`,
  META_DESCRIPTION_LABEL: 'Meta description',
  META_DESCRIPTION_PLACEHOLDER: 'Короткий опис для пошукових систем',
  META_DESCRIPTION_TOO_LONG: `Максимум ${SEO_META_DESCRIPTION_MAX_LENGTH} символів.`,
  CANONICAL_URL_LABEL: 'Canonical URL',
  CANONICAL_URL_PLACEHOLDER: 'https://...',
  CANONICAL_URL_INVALID: 'Введіть коректний URL (http:// або https://).',
  NO_INDEX_LABEL: 'Не індексувати (noindex)',
  PARENT_HINT_PREFIX: 'Батьківська категорія:',
  CREATE_SUCCESS_TITLE: 'Категорію створено',
  UPDATE_SUCCESS_TITLE: 'Категорію оновлено',
  DELETE_SUCCESS_TITLE: 'Категорію видалено',
  SORT_SUCCESS_TITLE: 'Порядок категорії оновлено',
  PRODUCT_COUNT_FALLBACK: '-',
};

export const CATEGORIES_CREATE_ICON = 'add_circle';
export const CATEGORIES_NAME_FIELD_ID = 'category-name';
export const CATEGORIES_SLUG_FIELD_ID = 'category-slug';
export const CATEGORIES_META_TITLE_FIELD_ID = 'category-meta-title';
export const CATEGORIES_META_DESCRIPTION_FIELD_ID = 'category-meta-description';
export const CATEGORIES_CANONICAL_URL_FIELD_ID = 'category-canonical-url';
export const CATEGORIES_NO_INDEX_FIELD_ID = 'category-no-index';

export const CATEGORIES_EMPTY_FORM: CategoryFormData = {
  name: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  noIndex: false,
};
