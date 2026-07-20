export const TagModalModeEnum = {
  Create: 'create',
  Delete: 'delete',
} as const;

export type TagModalMode = (typeof TagModalModeEnum)[keyof typeof TagModalModeEnum] | null;
