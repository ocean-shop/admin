import { TableColumn } from '@ui/table/models/table-column.model';

export const ATTRIBUTES_TEXTS = {
  PAGE_TITLE: 'Керування атрибутами',
  PAGE_DESCRIPTION:
    'Створюйте атрибути для магазину, знаходьте їх за назвою та видаляйте непотрібні атрибути.',
  CREATE_LABEL: 'Створити атрибут',
  SEARCH_LABEL: 'Пошук атрибута',
  SEARCH_PLACEHOLDER: 'Введіть назву атрибута',
  SEARCH_BUTTON_LABEL: 'Знайти',
  SEARCH_RESET_LABEL: 'Скинути',
  SHOP_ID_REQUIRED_MESSAGE:
    'Відкрийте сторінку з коректним шляхом магазину (/shop/:shopId/attributes), щоб керувати атрибутами.',
  EMPTY_STATE: 'Атрибути не знайдено.',
  PAGINATION_LABEL: 'атрибутів',
  TABLE_NAME_HEADER: 'Назва',
  TABLE_VALUE_HEADER: 'Значення',
  TABLE_DELETE_LABEL: 'Видалити',
  TABLE_LOADING_TEXT: 'Завантаження атрибутів...',
  MODAL_CREATE_TITLE: 'Створити атрибут',
  MODAL_CREATE_CONFIRM_LABEL: 'Створити',
  MODAL_DELETE_TITLE: 'Видалити атрибут',
  MODAL_DELETE_CONFIRM_LABEL: 'Видалити',
  MODAL_DELETE_MESSAGE: 'Ви впевнені, що хочете видалити атрибут',
  MODAL_DELETE_MESSAGE_SUFFIX: '? Цю дію неможливо скасувати.',
  NAME_LABEL: 'Назва атрибута',
  NAME_PLACEHOLDER: 'Наприклад: Розмір',
  NAME_REQUIRED_MESSAGE: "Назва атрибута є обов'язковою",
  VALUE_LABEL: 'Значення атрибута',
  VALUE_PLACEHOLDER: 'Наприклад: XL',
  VALUE_REQUIRED_MESSAGE: "Значення атрибута є обов'язковим",
  CREATE_SUCCESS_TITLE: 'Атрибут створено',
  DELETE_SUCCESS_TITLE: 'Атрибут видалено',
};

export const ATTRIBUTES_CREATE_ICON = 'add';
export const ATTRIBUTES_PAGE_SIZE = 20;
export const ATTRIBUTES_NAME_FIELD_ID = 'attribute-name';
export const ATTRIBUTES_VALUE_FIELD_ID = 'attribute-value';
export const ATTRIBUTES_DEFAULT_NAME = 'Untitled attribute';
export const ATTRIBUTES_DEFAULT_VALUE = 'No value';
export const ATTRIBUTES_TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', header: ATTRIBUTES_TEXTS.TABLE_NAME_HEADER },
  { key: 'value', header: ATTRIBUTES_TEXTS.TABLE_VALUE_HEADER },
];
