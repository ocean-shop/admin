import { ProductFormOption } from '../components/product-form/models/product-form-option.model';
import { PRODUCT_FALLBACK_LABELS } from '../constants/product-fallback-labels.constants';
import { AttributeApiItem } from '../pages/attributes/models/attribute.model';
import { TagApiItem } from '../pages/tags/models/tag.model';
import { formatAttributeLabel } from './attribute-label.helper';

const toOptions = <T>(
  items: T[],
  assigned: ProductFormOption[],
  resolveId: (item: T) => unknown,
  resolveLabel: (item: T) => string,
): ProductFormOption[] => {
  const assignedIds = new Set(assigned.map((option) => option.id));
  return items.reduce<ProductFormOption[]>((options, item) => {
    const id = String(resolveId(item) ?? '').trim();
    return !id || assignedIds.has(id) ? options : [...options, { id, label: resolveLabel(item) }];
  }, []);
};

/** "Name: Value" options for attributes that are not assigned yet. */
export const mapAttributeSearchResults = (
  items: AttributeApiItem[],
  assigned: ProductFormOption[],
): ProductFormOption[] =>
  toOptions(
    items,
    assigned,
    (item) => item.id,
    (item) =>
      formatAttributeLabel(
        item.name?.trim() || PRODUCT_FALLBACK_LABELS.ATTRIBUTE,
        item.value?.trim() ?? '',
      ),
  );

export const mapTagSearchResults = (
  items: TagApiItem[],
  assigned: ProductFormOption[],
): ProductFormOption[] =>
  toOptions(
    items,
    assigned,
    (item) => item.id,
    (item) => item.name?.trim() || PRODUCT_FALLBACK_LABELS.TAG,
  );

export const upsertProductFormOption = (
  options: ProductFormOption[],
  option: ProductFormOption,
): ProductFormOption[] =>
  options.some((current) => current.id === option.id)
    ? options
    : [...options, { id: option.id, label: option.label }];

export const removeProductFormOption = (
  options: ProductFormOption[],
  id: string,
): ProductFormOption[] => options.filter((option) => option.id !== id);
