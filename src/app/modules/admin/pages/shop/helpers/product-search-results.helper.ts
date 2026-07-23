import { ProductFormAssignedAttribute } from '../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from '../components/product-form/models/product-form-attribute-option.model';
import { ProductFormTagOption } from '../components/product-form/models/product-form-tag-option.model';
import { AttributeApiItem } from '../pages/attributes/models/attribute.model';
import { TagApiItem } from '../pages/tags/models/tag.model';

export const mapAttributeSearchResults = (
  items: AttributeApiItem[],
  assignedAttributes: ProductFormAssignedAttribute[],
): ProductFormAttributeOption[] => {
  const assignedIds = new Set(assignedAttributes.map((attribute) => attribute.id));
  const options: ProductFormAttributeOption[] = [];
  for (const item of items) {
    const id = String(item.id ?? '').trim();
    if (!id || assignedIds.has(id)) {
      continue;
    }

    const name = item.name?.trim() ?? '';
    const value = item.value?.trim() ?? '';
    const label = value ? `${name || 'Атрибут'}: ${value}` : name || 'Атрибут';
    options.push({ id, label });
  }

  return options;
};

export const mapTagSearchResults = (
  items: TagApiItem[],
  assignedTags: ProductFormAssignedTag[],
): ProductFormTagOption[] => {
  const assignedIds = new Set(assignedTags.map((tag) => tag.id));
  const options: ProductFormTagOption[] = [];
  for (const item of items) {
    const id = String(item.id ?? '').trim();
    if (!id || assignedIds.has(id)) {
      continue;
    }

    const label = item.name?.trim() || 'Тег';
    options.push({ id, label });
  }

  return options;
};

export const upsertAssignedAttribute = (
  assignedAttributes: ProductFormAssignedAttribute[],
  attribute: ProductFormAttributeOption,
): ProductFormAssignedAttribute[] => {
  if (assignedAttributes.some((currentAttribute) => currentAttribute.id === attribute.id)) {
    return assignedAttributes;
  }

  return [...assignedAttributes, { id: attribute.id, label: attribute.label }];
};

export const upsertAssignedTag = (
  assignedTags: ProductFormAssignedTag[],
  tag: ProductFormTagOption,
): ProductFormAssignedTag[] => {
  if (assignedTags.some((currentTag) => currentTag.id === tag.id)) {
    return assignedTags;
  }

  return [...assignedTags, { id: tag.id, label: tag.label }];
};

export const removeAssignedAttribute = (
  assignedAttributes: ProductFormAssignedAttribute[],
  attributeId: string,
): ProductFormAssignedAttribute[] => {
  return assignedAttributes.filter((attribute) => attribute.id !== attributeId);
};

export const removeAssignedTag = (
  assignedTags: ProductFormAssignedTag[],
  tagId: string,
): ProductFormAssignedTag[] => {
  return assignedTags.filter((tag) => tag.id !== tagId);
};
