export type ProductFormVariationChangeEvent = {
  localId: string;
  field: 'title' | 'name' | 'price' | 'oldPrice' | 'sku' | 'available' | 'isMain';
  value: string | boolean;
};
