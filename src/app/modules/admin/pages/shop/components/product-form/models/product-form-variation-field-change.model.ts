import { ProductFormVariationChangeEvent } from './product-form-variation-change-event.model';

export type ProductFormVariationFieldChange = Omit<ProductFormVariationChangeEvent, 'localId'>;
