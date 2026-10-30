import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { ProductFormVariationAttribute } from '../../components/product-form/models/product-form-variation-attribute.model';
import { ProductFormVariation } from '../../components/product-form/models/product-form-variation.model';
import {
  PRODUCT_VARIATION_ATTRIBUTE_ID_PREFIX,
  PRODUCT_VARIATION_ID_PREFIX,
  PRODUCT_VARIATION_IMAGE_ID_PREFIX,
} from '../../constants/product-api-mapping.constants';
import { ProductApiItem } from '../../pages/products/models/product.model';
import {
  ProductVariationApiItem,
  ProductVariationAttributeApiItem,
} from '../../pages/products/models/product-variation.model';
import { formatAttributeLabel } from '../attribute-label/attribute-label.helper';
import { mapApiImages } from '../product-api-mapping/product-api-mapping.helper';
import { toProductPriceInput } from '../product-price/product-price.helper';

export const createEmptyProductFormVariation = (
  localId: string,
  id: string | null = null,
): ProductFormVariation => ({
  localId,
  id,
  title: '',
  name: '',
  price: '',
  oldPrice: '',
  sku: '',
  available: true,
  isMain: false,
  attributes: [],
  attributeSearchValue: '',
  attributeSearchResults: [],
  isAttributeSearchLoading: false,
  images: [],
  isSaving: false,
});

const mapVariationAttribute = (
  attribute: ProductVariationAttributeApiItem | string,
  index: number,
  localId: string,
): ProductFormVariationAttribute[] => {
  if (typeof attribute === 'string') {
    const id = attribute.trim();
    return id ? [{ id, attributeTypeId: id, name: id, value: '', label: id }] : [];
  }

  const nested = attribute.attributeType;
  const name = attribute.name?.trim() || nested?.name?.trim() || '';
  const value = attribute.value?.trim() || nested?.value?.trim() || '';
  if (!name && !value) {
    return [];
  }

  const attributeTypeId =
    toTrimmedString(attribute.attributeTypeId) ||
    toTrimmedString(nested?.id) ||
    toTrimmedString(attribute.id);
  return [
    {
      id: attributeTypeId || `${PRODUCT_VARIATION_ATTRIBUTE_ID_PREFIX}-${localId}-${index}`,
      attributeTypeId,
      name,
      value,
      label: formatAttributeLabel(name, value),
    },
  ];
};

const mapVariation = (
  variation: ProductVariationApiItem | string,
  index: number,
): ProductFormVariation[] => {
  if (typeof variation === 'string') {
    const id = variation.trim();
    return id ? [createEmptyProductFormVariation(`${PRODUCT_VARIATION_ID_PREFIX}-${id}`, id)] : [];
  }

  const id = toTrimmedString(variation.id);
  const localId = id || `${PRODUCT_VARIATION_ID_PREFIX}-${index}`;
  return [
    {
      ...createEmptyProductFormVariation(localId, id || null),
      title: variation.title?.trim() ?? '',
      name: variation.name?.trim() ?? '',
      price: toProductPriceInput(variation.price),
      oldPrice: toProductPriceInput(variation.oldPrice),
      sku: variation.sku?.trim() ?? '',
      available: variation.available ?? true,
      isMain: variation.isDefault ?? false,
      attributes: (variation.attributes ?? []).flatMap((attribute, attributeIndex) =>
        mapVariationAttribute(attribute, attributeIndex, localId),
      ),
      images: mapApiImages(variation.images, `${PRODUCT_VARIATION_IMAGE_ID_PREFIX}-${localId}`),
    },
  ];
};

export const extractProductVariations = (product: ProductApiItem): ProductFormVariation[] =>
  (product.variations ?? []).flatMap(mapVariation);
