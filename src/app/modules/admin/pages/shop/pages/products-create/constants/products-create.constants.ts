import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { ProductStatus } from '../../products/models/product-status.enum';
import { ProductType } from '../../products/models/product-type.enum';

export const PRODUCTS_CREATE_TEXTS = {
  PAGE_TITLE: 'Create New Product',
  PAGE_DESCRIPTION: 'Add a new item to the coastal inventory.',
  CREATE_LABEL: 'Create Product',
  SHOP_ID_REQUIRED_MESSAGE:
    'Open a valid shop route (/admin/shop/:shopId/products/create) to create a product.',
  BASIC_INFORMATION_TITLE: 'Basic Information',
  PRICING_INVENTORY_TITLE: 'Pricing & Inventory',
  PRODUCT_NAME_LABEL: 'Product Name',
  PRODUCT_NAME_PLACEHOLDER: 'e.g. Coastal Linen Shirt',
  PRODUCT_NAME_REQUIRED: 'Product name is required.',
  PRODUCT_TYPE_LABEL: 'Product Type',
  PRODUCT_TYPE_SIMPLE_LABEL: 'Simple',
  PRODUCT_TYPE_VARIABLE_LABEL: 'Variable',
  DESCRIPTION_LABEL: 'Description',
  DESCRIPTION_PLACEHOLDER: 'Enter product description...',
  PRICE_LABEL: 'Price ($)',
  PRICE_PLACEHOLDER: '0.00',
  OLD_PRICE_LABEL: 'Old Price (Sale)',
  OLD_PRICE_PLACEHOLDER: '0.00',
  SKU_LABEL: 'SKU',
  SKU_PLACEHOLDER: 'e.g. CSTL-SHRT-01',
  STATUS_LABEL: 'Status',
  AVAILABLE_LABEL: 'Is available',
  CATEGORIES_TITLE: 'Categories',
  ATTRIBUTES_TITLE: 'Attributes',
  TAGS_TITLE: 'Tags',
  CATEGORIES_SEARCH_PLACEHOLDER: 'Search categories...',
  ATTRIBUTES_SEARCH_PLACEHOLDER: 'Search attributes...',
  TAGS_INPUT_PLACEHOLDER: 'Add tags...',
  CREATE_SUCCESS_TITLE: 'Product created',
  CREATE_ERROR_TITLE: 'Product was not created',
  CREATE_ERROR_MESSAGE: 'Please check the form and try again.',
};

export const PRODUCTS_CREATE_FIELD_IDS = {
  PRODUCT_NAME: 'product-name',
  PRODUCT_DESCRIPTION: 'product-description',
  PRICE: 'product-price',
  OLD_PRICE: 'product-old-price',
  SKU: 'product-sku',
  STATUS: 'product-status',
  TYPE_SIMPLE: 'product-type-simple',
  TYPE_VARIABLE: 'product-type-variable',
  AVAILABLE: 'product-available',
};

export const PRODUCTS_CREATE_STATUS_OPTIONS: DropdownOption[] = [
  { label: 'Draft', value: ProductStatus.Draft },
  { label: 'Active', value: ProductStatus.Active },
  { label: 'Archived', value: ProductStatus.Archived },
];

export const PRODUCTS_CREATE_STATIC_CATEGORIES = [
  {
    label: 'Apparel',
    checked: false,
    children: [
      { label: 'Shirts', checked: true },
      { label: 'Pants', checked: false },
    ],
  },
  { label: 'Accessories', checked: false },
  { label: 'Footwear', checked: false },
];

export const PRODUCTS_CREATE_STATIC_ATTRIBUTES = ['Color: Ocean Blue', 'Size: Large'];
export const PRODUCTS_CREATE_STATIC_TAGS = ['Summer', 'Linen', 'Men'];

export const PRODUCTS_CREATE_DEFAULT_FORM_VALUE = {
  name: '',
  type: ProductType.Simple,
  description: '',
  price: '',
  oldPrice: '',
  sku: '',
  status: ProductStatus.Draft,
  available: true,
};
