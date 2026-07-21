import { Category } from './category.model';

export type CategoryTreeNode = {
  category: Category;
  children: CategoryTreeNode[];
};

export type VisibleCategoryNode = {
  category: Category;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
};
