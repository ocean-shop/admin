import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { PRODUCT_FALLBACK_LABELS } from '../../../../../../constants/product-fallback-labels.constants';
import { mapApiImages } from '../../../../../../helpers/product-api-mapping/product-api-mapping.helper';
import { ProductApiItem } from '../../../../../../pages/products/models/product.model';
import { ProductStatus } from '../../../../../../pages/products/models/product-status.enum';
import {
  PRODUCT_FORM_IMAGE_ID_PREFIX,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../../../constants/product-form.constants';
import { ProductFormRelatedProduct } from '../../../../models/product-form-related-product.model';

/** The product's own first image, or the first image of a variation (variable products). */
const resolveImageUrl = (product: ProductApiItem): string => {
  const ownImage = mapApiImages(product.images, PRODUCT_FORM_IMAGE_ID_PREFIX)[0];
  if (ownImage) {
    return ownImage.imageDataUrl;
  }

  const variationImage = (product.variations ?? [])
    .flatMap((variation) =>
      typeof variation === 'string'
        ? []
        : mapApiImages(variation.images, PRODUCT_FORM_IMAGE_ID_PREFIX),
    )
    .at(0);
  return variationImage?.imageDataUrl ?? '';
};

const resolveHiddenStatusLabel = (status: ProductApiItem['status']): string | null => {
  const normalized = toTrimmedString(status).toLowerCase();
  if (!normalized || normalized === ProductStatus.Active) {
    return null;
  }

  return PRODUCT_FORM_STATUS_OPTIONS.find((option) => option.value === normalized)?.label ?? null;
};

const toRelatedProduct = (product: ProductApiItem): ProductFormRelatedProduct[] => {
  const id = toTrimmedString(product.id);
  if (!id) {
    return [];
  }

  return [
    {
      id,
      name: product.name?.trim() || product.title?.trim() || PRODUCT_FALLBACK_LABELS.PRODUCT,
      sku: product.sku?.trim() ?? '',
      imageUrl: resolveImageUrl(product),
      hiddenStatusLabel: resolveHiddenStatusLabel(product.status),
    },
  ];
};

/** API products → related rows, keeping the API (display) order; items without an id are dropped. */
export const mapRelatedProducts = (
  products: ProductApiItem[] | null | undefined,
): ProductFormRelatedProduct[] => (products ?? []).flatMap(toRelatedProduct);

/** Drops the edited product itself and products that are already related. */
export const excludeRelatedProducts = (
  results: ProductFormRelatedProduct[],
  excludedIds: ReadonlySet<string>,
): ProductFormRelatedProduct[] => results.filter((result) => !excludedIds.has(result.id));
