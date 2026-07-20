import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ShopOverviewCardData } from './models/shop-overview-card.model';

@Component({
  selector: 'app-shop-overview-card',
  templateUrl: './shop-overview-card.html',
  styleUrl: './shop-overview-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ShopOverviewCard {
  readonly card = input.required<ShopOverviewCardData>();
  readonly manageStore = output<string>();

  protected onManageStore(): void {
    this.manageStore.emit(this.card().shopId);
  }
}

export type { ShopOverviewCardData, ShopOverviewMetric } from './models/shop-overview-card.model';
