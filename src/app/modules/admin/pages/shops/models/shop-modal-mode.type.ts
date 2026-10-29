export enum ShopModalModeEnum {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export type ShopModalMode = `${ShopModalModeEnum}` | null;
