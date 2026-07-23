import { CreateProductPayload } from '../pages/products/models/create-product-payload.model';
import { UpdateProductPayload } from '../pages/products/models/update-product-payload.model';
import { ProductFormValues } from './models/product-form-values.model';
import { parseProductPrice } from './product-price.helper';

export const buildCreateProductPayload = (
  shopId: string | null,
  formValues: ProductFormValues,
): CreateProductPayload | null => {
  const normalizedShopId = shopId?.trim() ?? '';
  const basePayload = buildBaseProductPayload(formValues);
  if (!normalizedShopId || !basePayload) {
    return null;
  }

  return {
    shopId: normalizedShopId,
    ...basePayload,
  };
};

export const buildUpdateProductPayload = (
  formValues: ProductFormValues,
): UpdateProductPayload | null => {
  return buildBaseProductPayload(formValues);
};

const buildBaseProductPayload = (
  formValues: ProductFormValues,
): Omit<CreateProductPayload, 'shopId'> | null => {
  const name = formValues.name?.trim() ?? '';
  if (!name) {
    return null;
  }

  const description = formValues.description?.trim() ?? '';
  const sku = formValues.sku?.trim() ?? '';
  const price = parseProductPrice(formValues.price);
  const oldPrice = parseProductPrice(formValues.oldPrice);

  return {
    name,
    ...(formValues.type ? { type: formValues.type } : {}),
    ...(description ? { description } : {}),
    ...(sku ? { sku } : {}),
    ...(formValues.status ? { status: formValues.status } : {}),
    available: formValues.available ?? true,
    ...(price !== null ? { price } : {}),
    ...(oldPrice !== null ? { oldPrice } : {}),
  };
};
