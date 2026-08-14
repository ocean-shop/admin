export type ProductVariationAttributeApiItem = {
  id?: string | null;
  attributeTypeId?: string | null;
  name?: string | null;
  value?: string | null;
  attributeType?: {
    id?: string | null;
    name?: string | null;
    value?: string | null;
  } | null;
};

export type ProductVariationImageApiItem = {
  id?: string | null;
  image?: string | null;
  url?: string | null;
  src?: string | null;
  name?: string | null;
  title?: string | null;
};

export type ProductVariationApiItem = {
  id?: string | null;
  productId?: string | null;
  title?: string | null;
  name?: string | null;
  sku?: string | null;
  price?: number | string | null;
  oldPrice?: number | string | null;
  available?: boolean | null;
  isDefault?: boolean | null;
  attributes?: (ProductVariationAttributeApiItem | string)[] | null;
  images?: (ProductVariationImageApiItem | string)[] | null;
};
