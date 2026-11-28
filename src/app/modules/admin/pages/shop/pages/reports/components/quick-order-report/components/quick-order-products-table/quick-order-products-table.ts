import { Component, input, output } from '@angular/core';
import { ShareBar } from '@ui/share-bar/share-bar';
import {
  QUICK_ORDER_REPORT_ICONS,
  QUICK_ORDER_REPORT_TEXTS,
} from '../../../../constants/quick-order-report.constants';
import { QuickOrderProductRow } from '../../../../models/quick-order-report-view.model';

/** Products ranked by the number of «buy in one click» requests. */
@Component({
  selector: 'app-quick-order-products-table',
  imports: [ShareBar],
  templateUrl: './quick-order-products-table.html',
  styleUrl: './quick-order-products-table.scss',
})
export class QuickOrderProductsTable {
  public readonly rows = input.required<QuickOrderProductRow[]>();
  public readonly caption = input<string>('');
  public readonly openProduct = output<string>();

  protected readonly textData = QUICK_ORDER_REPORT_TEXTS;
  protected readonly icon = QUICK_ORDER_REPORT_ICONS.PRODUCTS;

  protected onOpenProduct(productId: string): void {
    if (productId) {
      this.openProduct.emit(productId);
    }
  }
}
