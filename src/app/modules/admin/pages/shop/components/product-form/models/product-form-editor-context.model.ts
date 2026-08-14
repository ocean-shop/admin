export type ProductFormEditorContext = {
  getShopId: () => string | null;
  getProductId: () => string | null;
  isSidebarEnabled: () => boolean;
};
