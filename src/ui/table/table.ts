import { Component, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { TableCellAlign, TableColumn, TableRowData } from './models/table-column.model';
import {
  TABLE_DELETE_ICON,
  TABLE_EMPTY_CELL_FALLBACK,
  TABLE_EMPTY_ICON,
  TABLE_TEXTS,
  TABLE_THUMBNAIL_PLACEHOLDER_ICON,
  TABLE_UPDATE_ICON,
} from './constants/table.constants';

@Component({
  selector: 'app-table',
  imports: [Badge],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class Table {
  public readonly columns = input.required<TableColumn[]>();
  public readonly rows = input.required<TableRowData[]>();
  public readonly loading = input<boolean>(false);
  public readonly loadingText = input<string>(TABLE_TEXTS.LOADING);
  public readonly emptyText = input<string>(TABLE_TEXTS.EMPTY);
  public readonly rowIdKey = input<string>('id');
  public readonly updateEnabled = input<boolean>(false);
  public readonly updateLabel = input<string>(TABLE_TEXTS.UPDATE_LABEL);
  public readonly updateIcon = input<string>(TABLE_UPDATE_ICON);
  public readonly deleteEnabled = input<boolean>(false);
  public readonly deleteLabel = input<string>(TABLE_TEXTS.DELETE_LABEL);
  public readonly actionsLabel = input<string>('');
  /** Renders without its own border/shadow (e.g. nested inside a card). */
  public readonly flat = input<boolean>(false);
  public readonly updateRow = output<TableRowData>();
  public readonly deleteRow = output<TableRowData>();

  protected readonly deleteIcon = TABLE_DELETE_ICON;
  protected readonly emptyIcon = TABLE_EMPTY_ICON;
  protected readonly thumbnailPlaceholderIcon = TABLE_THUMBNAIL_PLACEHOLDER_ICON;

  protected resolveCellValue(row: TableRowData, column: TableColumn): string {
    const value = row[column.key];
    if (value === null || value === undefined || value === '') {
      return column.fallback ?? TABLE_EMPTY_CELL_FALLBACK;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return column.fallback ?? TABLE_EMPTY_CELL_FALLBACK;
  }

  protected resolveBadgeTone(row: TableRowData, column: TableColumn): BadgeTone | null {
    if (!column.badgeTones) {
      return null;
    }

    return column.badgeTones[this.resolveCellValue(row, column)] ?? null;
  }

  protected resolveThumbnail(row: TableRowData, column: TableColumn): string | null {
    const value = column.thumbnailKey ? row[column.thumbnailKey] : null;
    return typeof value === 'string' && value.trim() ? value.trim() : null;
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
      return TABLE_TEXTS.ACTIONS_LABEL;
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
