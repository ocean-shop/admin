import { TableColumn } from '@ui/table/models/table-column.model';

export const TAGS_TEXTS = {
  PAGE_TITLE: 'Керування тегами',
  PAGE_DESCRIPTION:
    'Створюйте теги для магазину, знаходьте їх за назвою та видаляйте непотрібні теги.',
  CREATE_LABEL: 'Створити тег',
  SEARCH_LABEL: 'Пошук тега',
  SEARCH_PLACEHOLDER: 'Введіть назву тега',
  SEARCH_BUTTON_LABEL: 'Знайти',
  SEARCH_RESET_LABEL: 'Скинути',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/tags), щоб керувати тегами.',
  EMPTY_STATE: 'Теги не знайдено.',
  PAGINATION_LABEL: 'тегів',
  TABLE_NAME_HEADER: 'Назва',
  TABLE_CREATED_HEADER: 'Створено',
  TABLE_UPDATED_HEADER: 'Оновлено',
  TABLE_DELETE_LABEL: 'Видалити',
  TABLE_LOADING_TEXT: 'Завантаження тегів...',
  MODAL_CREATE_TITLE: 'Створити тег',
  MODAL_CREATE_CONFIRM_LABEL: 'Створити',
  MODAL_DELETE_TITLE: 'Видалити тег',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  MODAL_DELETE_MESSAGE: 'Ви впевнені, що хочете видалити тег',
  MODAL_DELETE_MESSAGE_SUFFIX: '? Цю дію неможливо скасувати.',
  NAME_LABEL: 'Назва тега',
  NAME_PLACEHOLDER: 'Наприклад: Новинка',
  NAME_REQUIRED_MESSAGE: "Назва тега є обов'язковою",
  CREATE_SUCCESS_TITLE: 'Тег створено',
  DELETE_SUCCESS_TITLE: 'Тег видалено',
  UNKNOWN_DATE: '—',
};

export const TAGS_CREATE_ICON = 'add';
export const TAGS_PAGE_SIZE = 20;
export const TAGS_NAME_FIELD_ID = 'tag-name';
export const TAGS_DEFAULT_NAME = 'Untitled tag';
export const TAGS_TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', header: TAGS_TEXTS.TABLE_NAME_HEADER },
];
