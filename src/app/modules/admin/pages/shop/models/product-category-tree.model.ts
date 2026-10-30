import { ProductFormCategoryNode } from '../components/product-form/models/product-form-category-node.model';

export type ProductCategoryNodeWithParent = ProductFormCategoryNode & { parentId?: string };

export type ProductCategoryTreeOptions = {
  disabled?: boolean;
};
