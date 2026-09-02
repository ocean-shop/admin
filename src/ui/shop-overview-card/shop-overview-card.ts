import { Component, input, output } from '@angular/core';
import { ShopOverviewCardData } from './models/shop-overview-card.model';

@Component({
  selector: 'app-shop-overview-card',
  templateUrl: './shop-overview-card.html',
  styleUrl: './shop-overview-card.scss',
})
export class ShopOverviewCard {
  public readonly card = input.required<ShopOverviewCardData>();
  public readonly manageStore = output<string>();

  protected onManageStore(): void {
    this.manageStore.emit(this.card().shopId);
  }
}

export type { ShopOverviewCardData, ShopOverviewMetric } from './models/shop-overview-card.model';
