import { ShopSettingsUpdatePayload } from './shop-settings-api.model';

export type ShopSettingsSaveVariables = {
  shopId: string;
  payload: ShopSettingsUpdatePayload;
};
