export enum AdminModalModeEnum {
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
}

export type AdminModalMode = `${AdminModalModeEnum}` | null;
