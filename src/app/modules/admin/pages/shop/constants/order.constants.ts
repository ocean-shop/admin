import { TableColumn } from '@ui/table/models/table-column.model';

export const ITEM_COLUMNS: TableColumn[] = [
  { key: 'name', header: 'Товар' },
  { key: 'sku', header: 'SKU' },
  { key: 'quantity', header: 'Кількість', align: 'right' },
  { key: 'price', header: 'Ціна Товару', align: 'right' },
  { key: 'total', header: 'Загальна Сума', align: 'right' },
];
