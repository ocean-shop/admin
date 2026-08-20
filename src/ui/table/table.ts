import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableCellAlign, TableColumn, TableRowData } from './models/table-column.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class Table {
  readonly columns = input.required<TableColumn[]>();
  readonly rows = input.required<TableRowData[]>();
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Loading...');
  readonly emptyText = input<string>('No records found.');
  readonly rowIdKey = input<string>('id');
  readonly updateEnabled = input<boolean>(false);
  readonly updateLabel = input<string>('Update');
  readonly updateIcon = input<string>('edit');
  readonly deleteEnabled = input<boolean>(false);
  readonly deleteLabel = input<string>('Delete');
  readonly actionsLabel = input<string>('');

  readonly updateRow = output<TableRowData>();
  readonly deleteRow = output<TableRowData>();

  protected resolveCellValue(row: TableRowData, column: TableColumn): string {
    const value = row[column.key];
    if (value === null || value === undefined || value === '') {
      return column.fallback ?? '—';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return column.fallback ?? '—';
  }

  protected resolveRowKey(row: TableRowData, index: number): string {
    const rowKey = row[this.rowIdKey()];
    if (typeof rowKey === 'string' && rowKey.trim()) {
      return rowKey;
    }

    if (typeof rowKey === 'number') {
      return String(rowKey);
    }

    return `row-${index}`;
  }

  protected resolveAlignment(align?: TableCellAlign): TableCellAlign {
    return align ?? 'left';
  }

  protected hasActions(): boolean {
    return this.updateEnabled() || this.deleteEnabled();
  }

  protected resolveActionsLabel(): string {
    const actionsLabel = this.actionsLabel().trim();
    if (actionsLabel) {
      return actionsLabel;
    }

    if (this.updateEnabled() && this.deleteEnabled()) {
      return 'Actions';
    }

    if (this.updateEnabled()) {
      return this.updateLabel();
    }

    return this.deleteLabel();
  }

  protected onUpdate(row: TableRowData): void {
    this.updateRow.emit(row);
  }

  protected onDelete(row: TableRowData): void {
    this.deleteRow.emit(row);
  }
}
