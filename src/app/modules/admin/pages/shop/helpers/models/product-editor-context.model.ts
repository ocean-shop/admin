import { ProductEditorToastTexts } from './product-editor-toast-texts.model';

export type ProductEditorContext = {
  getShopId: () => string | null;
  getProductId: () => string | null;
  isSidebarEnabled?: () => boolean;
  texts: ProductEditorToastTexts;
};
