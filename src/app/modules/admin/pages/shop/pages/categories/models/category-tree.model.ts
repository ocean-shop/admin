import { Category } from './category.model';

export interface CategoryTreeNode {
  category: Category;
  children: CategoryTreeNode[];
}

export interface VisibleCategoryNode {
  category: Category;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}
