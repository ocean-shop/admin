import { uniqueBy } from '@core/helpers/array/array.helper';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { ImageFileItem } from '@core/models/image-file-item.model';
import { ProductFormAssignedAttribute } from '../../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormImageItem } from '../../components/product-form/models/product-form-image-item.model';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { PRODUCT_IMAGE_ID_PREFIX } from '../../constants/product-api-mapping.constants';
import { PRODUCT_FALLBACK_LABELS } from '../../constants/product-fallback-labels.constants';
import {
  ProductApiItem,
  ProductAttributeApiItem,
  ProductImageApiItem,
  ProductTagApiItem,
} from '../../pages/products/models/product.model';
import { ProductStatus } from '../../pages/products/models/product-status.enum';
import { ProductType } from '../../pages/products/models/product-type.enum';
import { formatAttributeLabel } from '../attribute-label/attribute-label.helper';
import { toProductPriceInput } from '../product-price/product-price.helper';

const normalizeEnumValue = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = toTrimmedString(value).toLowerCase();
  return allowed.find((item) => item === normalized) ?? fallback;
};

export const mapProductToFormModel = (product: ProductApiItem): ProductFormModel => ({
  name: product.name?.trim() || product.title?.trim() || '',
  type: normalizeEnumValue(product.type, Object.values(ProductType), ProductType.Simple),
  description: product.description?.trim() ?? '',
  price: toProductPriceInput(product.price),
  oldPrice: toProductPriceInput(product.oldPrice),
  sku: product.sku?.trim() ?? '',
  status: normalizeEnumValue(product.status, Object.values(ProductStatus), ProductStatus.Draft),
  available: product.available ?? true,
  isPopular: product.isPopular ?? false,
  isMainBanner: product.isMainBanner ?? false,
  slug: product.slug?.trim() ?? '',
  metaTitle: product.metaTitle?.trim() ?? '',
  metaDescription: product.metaDescription?.trim() ?? '',
  canonicalUrl: product.canonicalUrl?.trim() ?? '',
  noIndex: product.noIndex ?? false,
});

export const extractProductCategoryIds = (product: ProductApiItem): Set<string> =>
  new Set(
    (product.categories ?? [])
      .map((category) => toTrimmedString(typeof category === 'string' ? category : category.id))
      .filter(Boolean),
  );

const mapProductAttribute = (
  attribute: ProductAttributeApiItem | string,
): ProductFormAssignedAttribute[] => {
  if (typeof attribute === 'string') {
    const id = attribute.trim();
    return id ? [{ id, label: id }] : [];
  }

  const nested = attribute.attributeType;
  const id =
    toTrimmedString(attribute.id) ||
    toTrimmedString(attribute.attributeTypeId) ||
    toTrimmedString(nested?.id);
  if (!id) {
    return [];
  }

  const name = attribute.name?.trim() || nested?.name?.trim() || PRODUCT_FALLBACK_LABELS.ATTRIBUTE;
  const value = attribute.value?.trim() || nested?.value?.trim() || '';
  return [{ id, label: formatAttributeLabel(name, value) }];
};

export const extractProductAttributes = (product: ProductApiItem): ProductFormAssignedAttribute[] =>
  uniqueBy(
    (product.attributes ?? product.attributeTypes ?? []).flatMap(mapProductAttribute),
    (attribute) => attribute.id,
  );

const mapProductTag = (tag: ProductTagApiItem | string): ProductFormAssignedTag[] => {
  if (typeof tag === 'string') {
    const id = tag.trim();
    return id ? [{ id, label: id }] : [];
  }

  const id = toTrimmedString(tag.id) || toTrimmedString(tag.tagId) || toTrimmedString(tag.tag?.id);
  if (!id) {
    return [];
  }

  return [{ id, label: tag.name?.trim() || tag.tag?.name?.trim() || PRODUCT_FALLBACK_LABELS.TAG }];
};

export const extractProductTags = (product: ProductApiItem): ProductFormAssignedTag[] =>
  uniqueBy((product.tags ?? []).flatMap(mapProductTag), (tag) => tag.id);

/** Normalizes API images (bare URLs or objects); entries without a URL are dropped. */
export const mapApiImages = (
  images: (ProductImageApiItem | string)[] | null | undefined,
  idPrefix: string,
): ImageFileItem[] =>
  (images ?? []).flatMap((rawImage, index) => {
    const image: ProductImageApiItem =
      typeof rawImage === 'string' ? { image: rawImage } : rawImage;
    const imageUrl = image.image?.trim() || image.url?.trim() || image.src?.trim() || '';
    if (!imageUrl) {
      return [];
    }

    return [
      {
        id: image.id?.trim() || `${idPrefix}-${index}-${imageUrl}`,
        name:
          image.name?.trim() ||
          image.title?.trim() ||
          `${PRODUCT_FALLBACK_LABELS.IMAGE_PREFIX} ${index + 1}`,
        imageDataUrl: imageUrl,
      },
    ];
  });

export const extractProductImages = (product: ProductApiItem): ProductFormImageItem[] =>
  mapApiImages(product.images, PRODUCT_IMAGE_ID_PREFIX);
