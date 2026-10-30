import { TableRowData } from '../models/table-column.model';

/** Normalized row identifier (string or number column), `null` when missing or blank. */
export const resolveTableRowId = (row: TableRowData, key = 'id'): string | null => {
  const value = row[key];
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  return typeof value === 'number' ? String(value) : null;
};
