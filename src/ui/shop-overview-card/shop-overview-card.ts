import { Component, input, output } from '@angular/core';
import {
  SHOP_OVERVIEW_CARD_ICONS,
  SHOP_OVERVIEW_CARD_TEXTS,
} from './constants/shop-overview-card.constants';
import { ShopOverviewCardData } from './models/shop-overview-card.model';

@Component({
  selector: 'app-shop-overview-card',
  templateUrl: './shop-overview-card.html',
  styleUrl: './shop-overview-card.scss',
})
export class ShopOverviewCard {
  public readonly card = input.required<ShopOverviewCardData>();
  public readonly manageStore = output<string>();

  protected readonly textData = SHOP_OVERVIEW_CARD_TEXTS;
  protected readonly icons = SHOP_OVERVIEW_CARD_ICONS;

  protected onManageStore(): void {
    this.manageStore.emit(this.card().shopId);
  }
}
