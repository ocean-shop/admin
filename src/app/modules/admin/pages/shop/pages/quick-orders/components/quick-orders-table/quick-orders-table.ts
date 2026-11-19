import { Component, input, output } from '@angular/core';
import { Badge } from '@ui/badge/badge';
import { Button } from '@ui/button/button';
import { QUICK_ORDERS_ICONS, QUICK_ORDERS_TEXTS } from '../../constants/quick-orders.constants';
import { QuickOrderStatus } from '../../models/quick-order-status.enum';
import { QuickOrder } from '../../models/quick-order.model';
import { UpdateQuickOrderStatusVariables } from '../../models/update-quick-order-status-variables.model';

/** Quick orders list with per-row status actions; presentational only. */
@Component({
  selector: 'app-quick-orders-table',
  imports: [Badge, Button],
  templateUrl: './quick-orders-table.html',
  styleUrl: './quick-orders-table.scss',
})
export class QuickOrdersTable {
  public readonly orders = input.required<QuickOrder[]>();
  public readonly loading = input<boolean>(false);
  /** Row whose status change is in flight; all row actions are disabled meanwhile. */
  public readonly pendingOrderId = input<string | null>(null);
  public readonly statusChange = output<UpdateQuickOrderStatusVariables>();
  public readonly openProduct = output<string>();

  protected readonly textData = QUICK_ORDERS_TEXTS;
  protected readonly icons = QUICK_ORDERS_ICONS;
  protected readonly statuses = QuickOrderStatus;

  protected onStatusChange(order: QuickOrder, status: QuickOrderStatus): void {
    if (!this.pendingOrderId()) {
      this.statusChange.emit({ id: order.id, status });
    }
  }

  protected onOpenProduct(order: QuickOrder): void {
    if (order.productId) {
      this.openProduct.emit(order.productId);
    }
  }
}
