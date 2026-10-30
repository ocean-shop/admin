import { mapImagesToSortPayload } from '@core/helpers/image-file/image-file.helper';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { parseProductPrice } from '../../../../../helpers/product-price.helper';
import { CreateProductVariationPayload } from '../../../../../pages/products/models/create-product-variation-payload.model';
import { ProductVariationApiItem } from '../../../../../pages/products/models/product-variation.model';
import { UpdateProductVariationPayload } from '../../../../../pages/products/models/update-product-variation-payload.model';
import {
  PRODUCT_FORM_UUID_PATTERN,
  PRODUCT_FORM_VARIATION_PAYLOAD_KIND,
} from '../../../constants/product-form.constants';
import { ProductFormVariation } from '../../../models/product-form-variation.model';
import { ProductVariationFieldsPayload } from './models/product-variation-fields-payload.model';

/** Only persisted attribute types (UUIDs) are sent; local placeholders are dropped. */
const buildVariationFieldsPayload = (
  variation: ProductFormVariation,
): ProductVariationFieldsPayload => {
  const price = parseProductPrice(variation.price);

  return {
    title: variation.title.trim() || undefined,
    name: variation.name.trim() || undefined,
    sku: variation.sku.trim() || undefined,
    ...(price !== null ? { price } : {}),
    oldPrice: parseProductPrice(variation.oldPrice),
    available: variation.available,
    isDefault: variation.isMain,
    attributes: variation.attributes
      .map((attribute) => ({ attributeTypeId: attribute.attributeTypeId.trim() }))
      .filter((attribute) => PRODUCT_FORM_UUID_PATTERN.test(attribute.attributeTypeId)),
    images: mapImagesToSortPayload(variation.images),
  };
};

export const buildCreateVariationPayload = (
  variation: ProductFormVariation,
): CreateProductVariationPayload => ({
  variation: PRODUCT_FORM_VARIATION_PAYLOAD_KIND,
  ...buildVariationFieldsPayload(variation),
});

export const buildUpdateVariationPayload = (
  variation: ProductFormVariation,
): UpdateProductVariationPayload => buildVariationFieldsPayload(variation);

/**
 * Finds the id the API gave the saved variation: by its own id, then by SKU,
 * and for a freshly created one without SKU the last variation of the product.
 */
export const resolveSavedVariationId = (
  apiVariations: (ProductVariationApiItem | string)[],
  variation: ProductFormVariation,
): string | null => {
  const variationObjects = apiVariations.filter(
    (item): item is ProductVariationApiItem => typeof item !== 'string',
  );
  const sku = variation.sku.trim();
  const match =
    (variation.id
      ? variationObjects.find((item) => toTrimmedString(item.id) === variation.id)
      : undefined) ??
    (sku ? variationObjects.find((item) => toTrimmedString(item.sku) === sku) : undefined) ??
    apiVariations.at(-1);

  if (match === undefined) {
    return null;
  }

  return toTrimmedString(typeof match === 'string' ? match : match.id) || null;
};
