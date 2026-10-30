import {
  formatAmount,
  formatStatus,
  formatText,
  joinOrPlaceholder,
} from '@core/helpers/value-format/value-format.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { DropdownTreeOption } from '@ui/multi-select-dropdown/models/dropdown-tree-option.type';
import { PRODUCT_FALLBACK_LABELS } from '../../../constants/product-fallback-labels.constants';
import { buildTree, flattenTree } from '../../../helpers/tree.helper';
import { CategoryApiItem } from '../../categories/models/category.model';
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  PRODUCTS_TEXTS,
} from '../constants/products.constants';
import { ProductStatus } from '../models/product-status.enum';
import { ProductSortQuery } from '../models/product-sort-query.model';
import { ProductSortValue } from '../models/product-sort-value.type';
import { ProductType } from '../models/product-type.enum';
import { Product, ProductApiItem } from '../models/product.model';

const normalizeKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const isKnownKey = <T extends string>(labels: Record<T, string>, key: string): key is T =>
  Object.hasOwn(labels, key);

const resolveEnumLabel = <T extends string>(labels: Record<T, string>, value: unknown): string => {
  const key = normalizeKey(value);
  return isKnownKey(labels, key) ? labels[key] : formatStatus(key);
};

export const resolveProductTypeLabel = (type: ProductApiItem['type']): string =>
  resolveEnumLabel<ProductType>(PRODUCT_TYPE_LABELS, type);

export const resolveProductStatusLabel = (status: ProductApiItem['status']): string =>
  resolveEnumLabel<ProductStatus>(PRODUCT_STATUS_LABELS, status);

export const resolveProductCategoryNames = (categories: ProductApiItem['categories']): string[] =>
  (categories ?? [])
    .map((entry) => (typeof entry === 'string' ? entry.trim() : entry.name?.trim() || ''))
    .filter(Boolean);

export const mapProduct = (product: ProductApiItem, fallbackShopId: string): Product => ({
  id: product.id?.trim() || crypto.randomUUID(),
  shopId: product.shopId?.trim() || fallbackShopId,
  title: product.title?.trim() || product.name?.trim() || PRODUCTS_TEXTS.UNTITLED_PRODUCT,
  sku: formatText(product.sku),
  type: resolveProductTypeLabel(product.type),
  status: resolveProductStatusLabel(product.status),
  price: formatAmount(product.price),
  categories: joinOrPlaceholder(resolveProductCategoryNames(product.categories)),
});

export const resolveProductSortQuery = (sort: ProductSortValue): ProductSortQuery => {
  if (sort === 'alphabet') {
    return { sortBy: 'name', sortOrder: 'asc' };
  }

  return { sortBy: 'createdAt', sortOrder: sort === 'older' ? 'asc' : 'desc' };
};

const mapCategoryToOption = (category: CategoryApiItem): DropdownOption | null => {
  const id = String(category.id ?? '').trim();
  if (!id) {
    return null;
  }

  const parentId = String(category.parentId ?? '').trim();
  return {
    value: id,
    label: category.name?.trim() || `${PRODUCT_FALLBACK_LABELS.CATEGORY_PREFIX} ${id}`,
    ...(parentId && parentId !== id ? { parentId } : {}),
  };
};

/** Categories as an indented, alphabetically sorted tree for the multi-select filter. */
export const buildCategoryFilterOptions = (categories: CategoryApiItem[]): DropdownTreeOption[] => {
  const options = categories
    .map(mapCategoryToOption)
    .filter((option): option is DropdownOption => Boolean(option));

  const tree = buildTree(options, {
    getId: (option) => option.value,
    getParentId: (option) => option.parentId,
    compareSiblings: (left, right) => left.label.localeCompare(right.label),
  });

  return flattenTree(
    tree,
    (option) => option.value,
    (option, level) => ({ ...option, level }),
  );
};
