export const AttributeModalModeEnum = {
  Create: 'create',
  Delete: 'delete',
} as const;

export type AttributeModalMode =
  | (typeof AttributeModalModeEnum)[keyof typeof AttributeModalModeEnum]
  | null;
