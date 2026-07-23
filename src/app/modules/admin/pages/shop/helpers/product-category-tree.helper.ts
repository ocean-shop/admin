import { buildTree } from './tree.helper';
import { TreeNode } from '../models/tree-node.model';
import { CategoryApiItem } from '../pages/categories/models/category.model';
import { ProductFormCategoryNode } from '../components/product-form/models/product-form-category-node.model';

type ProductCategoryNodeWithParent = ProductFormCategoryNode & { parentId?: string };

export const buildProductCategoryTreeNodes = (
  categories: CategoryApiItem[],
  selectedCategoryIds: Set<string>,
  options?: { disabled?: boolean },
): ProductFormCategoryNode[] => {
  const normalizedCategories = categories
    .map((category) => normalizeProductCategory(category, selectedCategoryIds, options))
    .filter((category): category is ProductCategoryNodeWithParent => Boolean(category));

  const tree = buildTree(normalizedCategories, {
    getId: (category) => category.id,
    getParentId: (category) => category.parentId?.trim(),
    compareSiblings: (left, right) => left.label.localeCompare(right.label),
  });

  return tree.map((node) => mapProductCategoryTreeNode(node));
};

export const updateSelectedCategoryIds = (
  selectedCategoryIds: Set<string>,
  categoryId: string,
  checked: boolean,
): Set<string> => {
  const nextValue = new Set(selectedCategoryIds);
  if (checked) {
    nextValue.add(categoryId);
  } else {
    nextValue.delete(categoryId);
  }

  return nextValue;
};

const normalizeProductCategory = (
  category: CategoryApiItem,
  selectedCategoryIds: Set<string>,
  options?: { disabled?: boolean },
): ProductCategoryNodeWithParent | null => {
  const id = String(category.id ?? '').trim();
  if (!id) {
    return null;
  }

  const parentId = String(category.parentId ?? '').trim();

  return {
    id,
    label: category.name?.trim() || `Category ${id}`,
    checked: selectedCategoryIds.has(id),
    disabled: Boolean(options?.disabled),
    ...(parentId && parentId !== id ? { parentId } : {}),
  };
};

const mapProductCategoryTreeNode = (
  node: TreeNode<ProductCategoryNodeWithParent>,
): ProductFormCategoryNode => {
  const category = node.value;
  return {
    id: category.id,
    label: category.label,
    checked: category.checked,
    ...(category.disabled ? { disabled: category.disabled } : {}),
    ...(node.children.length
      ? {
          children: node.children.map((childNode) => mapProductCategoryTreeNode(childNode)),
        }
      : {}),
  };
};
