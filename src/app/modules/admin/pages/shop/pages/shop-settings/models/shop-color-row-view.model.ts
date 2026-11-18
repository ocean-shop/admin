import { ShopColorOption } from './shop-color-option.model';

export type ShopColorRowView = ShopColorOption & {
  usageLabel: string;
  pickerLabel: string;
  hexLabel: string;
  /** Last saved color, shown in the swatch while the typed hex is invalid. */
  savedColor: string;
  changed: boolean;
};
