import { Component, computed, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { Button } from '@ui/button/button';
import { EmptyState } from '@ui/empty-state/empty-state';
import {
  PRODUCT_REPORT_ICONS,
  PRODUCT_REPORT_TEXTS,
} from '../../../../constants/product-report.constants';
import { REPORT_COUNT_WORDS } from '../../../../constants/report-format.constants';
import {
  formatReportCount,
  formatReportCountWithWord,
} from '../../../../helpers/report-format/report-format.helper';
import { DeadStockView } from '../../../../models/product-report-view.model';

/** Active products without sales for the chosen number of days. */
@Component({
  selector: 'app-dead-stock-table',
  imports: [Badge, Button, EmptyState],
  templateUrl: './dead-stock-table.html',
  styleUrl: './dead-stock-table.scss',
})
export class DeadStockTable {
  public readonly deadStock = input.required<DeadStockView>();
  public readonly openProduct = output<string>();

  protected readonly textData = PRODUCT_REPORT_TEXTS;
  protected readonly icons = PRODUCT_REPORT_ICONS;

  protected readonly totalLabel = computed(() => formatReportCount(this.deadStock().total));
  private readonly daysLabel = computed(() =>
    formatReportCountWithWord(this.deadStock().days, REPORT_COUNT_WORDS.DAYS),
  );
  protected readonly description = computed(
    () => `${this.textData.DEAD_STOCK_DESCRIPTION_PREFIX} ${this.daysLabel()}.`,
  );
  protected readonly emptyText = computed(
    () => `${this.textData.DEAD_STOCK_EMPTY_PREFIX} ${this.daysLabel()}.`,
  );

  protected onOpenProduct(productId: string): void {
    if (productId) {
      this.openProduct.emit(productId);
    }
  }
}
