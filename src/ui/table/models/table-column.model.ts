export type TableCellAlign = 'left' | 'center' | 'right';

export type TableColumn = {
  key: string;
  header: string;
  align?: TableCellAlign;
  width?: string;
  fallback?: string;
};

export type TableRowData = Record<string, unknown>;
