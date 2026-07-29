import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import {
  PRODUCTS_CREATE_FIELD_IDS,
  PRODUCTS_CREATE_TEXTS,
} from '../pages/products-create/constants/products-create.constants';
import { ProductType } from '../pages/products/models/product-type.enum';

export const PRODUCTS_TYPE_OPTIONS: RadioGroupOption[] = [
  {
    id: PRODUCTS_CREATE_FIELD_IDS.TYPE_SIMPLE,
    value: ProductType.Simple,
    label: PRODUCTS_CREATE_TEXTS.PRODUCT_TYPE_SIMPLE_LABEL,
  },
  {
    id: PRODUCTS_CREATE_FIELD_IDS.TYPE_VARIABLE,
    value: ProductType.Variable,
    label: PRODUCTS_CREATE_TEXTS.PRODUCT_TYPE_VARIABLE_LABEL,
  },
];
