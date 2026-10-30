import { buildTree } from '../../../../helpers/tree/tree.helper';
import { TreeNode } from '../../../../models/tree-node.model';
import {
  CATEGORIES_DEFAULT_NAME,
  CATEGORIES_DEFAULT_SLUG,
} from '../../constants/categories.constants';
import {
  CategoriesApiResponse,
  CategoriesStats,
  Category,
  CategoryApiItem,
} from '../../models/category.model';
import { CategoryTreeNode, VisibleCategoryNode } from '../../models/category-tree.model';

export const mapCategory = (category: CategoryApiItem): Category => {
  const productCount = category.productCount ?? category.productsCount ?? category.itemsCount;

  return {
    id: String(category.id ?? crypto.randomUUID()),
    ...(category.parentId ? { parentId: String(category.parentId) } : {}),
    name: category.name?.trim() || CATEGORIES_DEFAULT_NAME,
    slug: category.slug?.trim() || CATEGORIES_DEFAULT_SLUG,
    sort: typeof category.sort === 'number' ? category.sort : 0,
    ...(typeof productCount === 'number' ? { productCount } : {}),
    ...(category.metaTitle ? { metaTitle: category.metaTitle } : {}),
    ...(category.metaDescription ? { metaDescription: category.metaDescription } : {}),
    ...(category.canonicalUrl ? { canonicalUrl: category.canonicalUrl } : {}),
    ...(category.noIndex ? { noIndex: true } : {}),
  };
};

export const resolveCategoriesStats = (
  response: CategoriesApiResponse | CategoryApiItem[] | undefined,
): CategoriesStats => {
  if (!response || Array.isArray(response)) {
    return {};
  }

  return {
    ...(typeof response.totalCategories === 'number'
      ? { totalCategories: response.totalCategories }
      : {}),
    ...(typeof response.deepestLevel === 'number' ? { deepestLevel: response.deepestLevel } : {}),
  };
};

const mapCategoryTreeNode = (node: TreeNode<Category>): CategoryTreeNode => ({
  category: node.value,
  children: node.children.map(mapCategoryTreeNode),
});

/** Siblings ordered by `sort`, ties broken by id for a stable order. */
export const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] =>
  buildTree(categories, {
    getId: (category) => category.id,
    getParentId: (category) => category.parentId?.trim(),
    compareSiblings: (left, right) => left.sort - right.sort || left.id.localeCompare(right.id),
  }).map(mapCategoryTreeNode);

const appendVisibleNodes = (
  output: VisibleCategoryNode[],
  nodes: CategoryTreeNode[],
  depth: number,
  collapsedIds: Set<string>,
  visited: Set<string>,
): void => {
  nodes.forEach((node, index) => {
    const id = node.category.id;
    if (visited.has(id)) {
      return;
    }

    visited.add(id);
    const hasChildren = node.children.length > 0;
    const isExpanded = !collapsedIds.has(id);
    output.push({
      category: node.category,
      depth,
      hasChildren,
      isExpanded,
      canMoveUp: index > 0,
      canMoveDown: index < nodes.length - 1,
    });

    if (hasChildren && isExpanded) {
      appendVisibleNodes(output, node.children, depth + 1, collapsedIds, visited);
    }
  });
};

/**
 * Depth-first list of rows the user can currently see. Nodes are expanded by default;
 * children of nodes listed in `collapsedIds` are skipped.
 */
export const flattenVisibleCategoryNodes = (
  tree: CategoryTreeNode[],
  collapsedIds: Set<string>,
): VisibleCategoryNode[] => {
  const output: VisibleCategoryNode[] = [];
  appendVisibleNodes(output, tree, 0, collapsedIds, new Set());
  return output;
};
