import { ProductFormAssignedAttribute } from '../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormImageItem } from '../components/product-form/models/product-form-image-item.model';
import { ProductFormModel } from '../components/product-form/models/product-form.model';
import { ProductApiItem } from '../pages/products/models/product.model';
import { ProductStatus } from '../pages/products/models/product-status.enum';
import { ProductType } from '../pages/products/models/product-type.enum';
import { ProductApiMappingOptions } from './models/product-api-mapping-options.model';
import { toProductPriceInput } from './product-price.helper';

export const mapProductToFormModel = (product: ProductApiItem): ProductFormModel => {
  return {
    name: product.name?.trim() || product.title?.trim() || '',
    type: normalizeProductType(product.type),
    description: product.description?.trim() ?? '',
    price: toProductPriceInput(product.price),
    oldPrice: toProductPriceInput(product.oldPrice),
    sku: product.sku?.trim() ?? '',
    status: normalizeProductStatus(product.status),
    available: product.available ?? true,
  };
};

export const extractProductCategoryIds = (product: ProductApiItem): Set<string> => {
  const categoryIds = (product.categories ?? [])
    .map((category) => {
      if (typeof category === 'string') {
        return category.trim();
      }

      return String(category.id ?? '').trim();
    })
    .filter(Boolean);

  return new Set(categoryIds);
};

export const extractProductAttributes = (
  product: ProductApiItem,
  options: ProductApiMappingOptions,
): ProductFormAssignedAttribute[] => {
  const productAttributes = product.attributes ?? product.attributeTypes ?? [];
  const assignedAttributes: ProductFormAssignedAttribute[] = [];

  for (const productAttribute of productAttributes) {
    if (typeof productAttribute === 'string') {
      const id = productAttribute.trim();
      if (!id) {
        continue;
      }

      assignedAttributes.push({ id, label: id });
      continue;
    }

    const directId = String(productAttribute.id ?? '').trim();
    const attributeTypeId = String(productAttribute.attributeTypeId ?? '').trim();
    const nestedAttributeType = productAttribute.attributeType;
    const nestedId = String(nestedAttributeType?.id ?? '').trim();
    const id = directId || attributeTypeId || nestedId;
    if (!id) {
      continue;
    }

    const name =
      productAttribute.name?.trim() ||
      nestedAttributeType?.name?.trim() ||
      options.attributesFallbackLabel;
    const value = productAttribute.value?.trim() || nestedAttributeType?.value?.trim() || '';
    const label = value ? `${name}: ${value}` : name;
    assignedAttributes.push({ id, label });
  }

  return assignedAttributes.reduce<ProductFormAssignedAttribute[]>(
    (accumulator, currentAttribute) => {
      if (accumulator.some((attribute) => attribute.id === currentAttribute.id)) {
        return accumulator;
      }

      return [...accumulator, currentAttribute];
    },
    [],
  );
};

export const extractProductTags = (
  product: ProductApiItem,
  options: ProductApiMappingOptions,
): ProductFormAssignedTag[] => {
  const productTags = product.tags ?? [];
  const assignedTags: ProductFormAssignedTag[] = [];

  for (const productTag of productTags) {
    if (typeof productTag === 'string') {
      const id = productTag.trim();
      if (!id) {
        continue;
      }

      assignedTags.push({ id, label: id });
      continue;
    }

    const directId = String(productTag.id ?? '').trim();
    const tagId = String(productTag.tagId ?? '').trim();
    const nestedTag = productTag.tag;
    const nestedId = String(nestedTag?.id ?? '').trim();
    const id = directId || tagId || nestedId;
    if (!id) {
      continue;
    }

    const label = productTag.name?.trim() || nestedTag?.name?.trim() || options.tagsFallbackLabel;
    assignedTags.push({ id, label });
  }

  return assignedTags.reduce<ProductFormAssignedTag[]>((accumulator, currentTag) => {
    if (accumulator.some((tag) => tag.id === currentTag.id)) {
      return accumulator;
    }

    return [...accumulator, currentTag];
  }, []);
};

export const extractProductImages = (product: ProductApiItem): ProductFormImageItem[] => {
  const productImages = product.images ?? [];

  return productImages.reduce<ProductFormImageItem[]>((accumulator, productImage, index) => {
    if (typeof productImage === 'string') {
      const imageUrl = productImage.trim();
      if (!imageUrl) {
        return accumulator;
      }

      return [
        ...accumulator,
        {
          id: `product-image-${index}-${imageUrl}`,
          name: `Image ${index + 1}`,
          imageDataUrl: imageUrl,
        },
      ];
    }

    const imageUrl =
      productImage.image?.trim() || productImage.url?.trim() || productImage.src?.trim() || '';
    if (!imageUrl) {
      return accumulator;
    }

    const imageId = productImage.id?.trim() || `product-image-${index}-${imageUrl}`;
    const imageName =
      productImage.name?.trim() || productImage.title?.trim() || `Image ${index + 1}`;
    return [
      ...accumulator,
      {
        id: imageId,
        name: imageName,
        imageDataUrl: imageUrl,
      },
    ];
  }, []);
};

const normalizeProductType = (value: ProductApiItem['type']): ProductType => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (normalized === ProductType.Variable) {
    return ProductType.Variable;
  }

  return ProductType.Simple;
};

const normalizeProductStatus = (value: ProductApiItem['status']): ProductStatus => {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();
  if (normalized === ProductStatus.Active) {
    return ProductStatus.Active;
  }

  if (normalized === ProductStatus.Archived) {
    return ProductStatus.Archived;
  }

  return ProductStatus.Draft;
};
