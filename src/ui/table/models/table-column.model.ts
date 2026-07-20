export type TableCellAlign = 'left' | 'center' | 'right';

export interface TableColumn {
  key: string;
  header: string;
  align?: TableCellAlign;
  width?: string;
  fallback?: string;
}

export type TableRowData = Record<string, unknown>;
