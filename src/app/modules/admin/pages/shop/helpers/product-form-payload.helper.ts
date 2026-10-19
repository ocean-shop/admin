import { CreateProductPayload } from '../pages/products/models/create-product-payload.model';
import { UpdateProductPayload } from '../pages/products/models/update-product-payload.model';
import { ProductFormValues } from './models/product-form-values.model';
import { parseProductPrice } from './product-price.helper';
import { toNullableSeoText } from './seo-form.helper';

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
  // An empty slug is left out so the API generates one on create and keeps the
  // current one on update.
  const slug = formValues.slug?.trim() ?? '';

  return {
    name,
    ...(formValues.type ? { type: formValues.type } : {}),
    ...(description ? { description } : {}),
    ...(sku ? { sku } : {}),
    ...(formValues.status ? { status: formValues.status } : {}),
    available: formValues.available ?? true,
    ...(formValues.isPopular ? { isPopular: true } : {}),
    isMainBanner: formValues.isMainBanner ?? false,
    ...(price !== null ? { price } : {}),
    ...(oldPrice !== null ? { oldPrice } : {}),
    ...(slug ? { slug } : {}),
    metaTitle: toNullableSeoText(formValues.metaTitle),
    metaDescription: toNullableSeoText(formValues.metaDescription),
    canonicalUrl: toNullableSeoText(formValues.canonicalUrl),
    noIndex: formValues.noIndex ?? false,
  };
};
