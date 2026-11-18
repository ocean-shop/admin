import { Component, computed, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { Badge } from '@ui/badge/badge';
import { ColorField } from '@ui/color-field/color-field';
import {
  SHOP_COLOR_FIELD_ID_PREFIX,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { ShopColorRowView } from '../../models/shop-color-row-view.model';

/** One palette token: name, usage, description and its color field. */
@Component({
  selector: 'app-shop-color-row',
  imports: [ColorField, Badge],
  templateUrl: './shop-color-row.html',
  styleUrl: './shop-color-row.scss',
})
export class ShopColorRow {
  public readonly row = input.required<ShopColorRowView>();
  public readonly control = input.required<FieldTree<string>>();

  protected readonly textData = SHOP_SETTINGS_TEXTS;
  protected readonly fieldId = computed(() => `${SHOP_COLOR_FIELD_ID_PREFIX}${this.row().name}`);
}
