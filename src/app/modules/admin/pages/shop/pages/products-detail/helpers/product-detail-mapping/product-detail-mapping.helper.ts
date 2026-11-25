import { APP_ROUTES } from '@core/constants/routes.constants';
import { EMPTY_VALUE_PLACEHOLDER } from '@core/constants/placeholder.constants';
import {
  formatAmount,
  formatBoolean,
  formatDate,
  formatText,
  joinOrPlaceholder,
  toTrimmedString,
} from '@core/helpers/value-format/value-format.helper';
import { BadgeTone } from '@ui/badge/models/badge-tone.type';
import { InfoListRow } from '@ui/info-list/models/info-list-row.model';
import { TableRowData } from '@ui/table/models/table-column.model';
import { ProductFormVariation } from '../../../../components/product-form/models/product-form-variation.model';
import { PRODUCT_FALLBACK_LABELS } from '../../../../constants/product-fallback-labels.constants';
import {
  extractProductAttributes,
  extractProductImages,
  extractProductTags,
} from '../../../../helpers/product-api-mapping/product-api-mapping.helper';
import {
  parseProductPrice,
  toProductPriceInput,
} from '../../../../helpers/product-price/product-price.helper';
import { extractProductVariations } from '../../../../helpers/product-variation-mapping/product-variation-mapping.helper';
import {
  PRODUCT_STATUS_BADGE_TONES,
  PRODUCTS_SECTION_PATH,
} from '../../../products/constants/products.constants';
import {
  resolveProductCategoryNames,
  resolveProductStatusLabel,
  resolveProductTypeLabel,
} from '../../../products/helpers/product-list-mapping/product-list-mapping.helper';
import { ProductType } from '../../../products/models/product-type.enum';
import { ProductApiItem } from '../../../products/models/product.model';
import {
  PRODUCTS_DETAIL_AVAILABILITY_TONES,
  PRODUCTS_DETAIL_HEADER_SEPARATOR,
  PRODUCTS_DETAIL_SEO_META_FIELDS,
  PRODUCTS_DETAIL_TEXTS,
} from '../../constants/products-detail.constants';
import { ProductDetailPrice } from '../../models/product-detail-price.model';
import { ProductDetailRelatedItem } from '../../models/product-detail-related-item.model';

const toPriceNumber = (value: number | string | null | undefined): number | null =>
  parseProductPrice(toProductPriceInput(value));

const formatPrice = (value: number | null): string =>
  value === null ? EMPTY_VALUE_PLACEHOLDER : formatAmount(value);

/** Products are available unless the API explicitly says otherwise (same default as the form). */
const resolveAvailabilityLabel = (available: boolean | null | undefined): string =>
  (available ?? true) ? PRODUCTS_DETAIL_TEXTS.AVAILABLE : PRODUCTS_DETAIL_TEXTS.UNAVAILABLE;

const buildAvailabilityRow = (available: boolean | null | undefined): InfoListRow => {
  const value = resolveAvailabilityLabel(available);
  return {
    label: PRODUCTS_DETAIL_TEXTS.AVAILABILITY_LABEL,
    value,
    tone: PRODUCTS_DETAIL_AVAILABILITY_TONES[value],
  };
};

export const isVariableProduct = (product: ProductApiItem): boolean =>
  toTrimmedString(product.type).toLowerCase() === ProductType.Variable;

export const resolveProductDetailTitle = (product: ProductApiItem): string =>
  product.name?.trim() || product.title?.trim() || PRODUCT_FALLBACK_LABELS.PRODUCT;

export const resolveProductDetailStatusTone = (product: ProductApiItem): BadgeTone =>
  PRODUCT_STATUS_BADGE_TONES[resolveProductStatusLabel(product.status)] ?? 'neutral';

/** `SKU 17 · /nothing-phone-1 · Оновлено 24.11.2026, 18:20` (missing parts are skipped). */
export const buildProductDetailSubtitle = (product: ProductApiItem): string => {
  const sku = toTrimmedString(product.sku);
  const slug = toTrimmedString(product.slug);
  const updatedAt = toTrimmedString(product.updatedAt);

  return [
    sku ? `${PRODUCTS_DETAIL_TEXTS.SKU_PREFIX} ${sku}` : '',
    slug ? `${PRODUCTS_DETAIL_TEXTS.SLUG_PREFIX}${slug}` : '',
    updatedAt ? `${PRODUCTS_DETAIL_TEXTS.UPDATED_PREFIX} ${formatDate(updatedAt)}` : '',
  ]
    .filter(Boolean)
    .join(PRODUCTS_DETAIL_HEADER_SEPARATOR);
};

/**
 * Variable products show the lowest variation price (`від …` when prices differ);
 * simple products show their own price and the old one when it is set.
 */
export const resolveProductDetailPrice = (product: ProductApiItem): ProductDetailPrice => {
  if (isVariableProduct(product)) {
    const prices = extractProductVariations(product)
      .map((variation) => parseProductPrice(variation.price))
      .filter((price): price is number => price !== null);

    if (prices.length) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return {
        current:
          min === max
            ? formatPrice(min)
            : `${PRODUCTS_DETAIL_TEXTS.PRICE_FROM_PREFIX} ${formatPrice(min)}`,
        old: null,
      };
    }
  }

  const oldPrice = toPriceNumber(product.oldPrice);
  return {
    current: formatPrice(toPriceNumber(product.price)),
    old: oldPrice ? formatPrice(oldPrice) : null,
  };
};

export const buildProductDetailOverviewRows = (product: ProductApiItem): InfoListRow[] => {
  const variations = extractProductVariations(product);
  const availabilityRow: InfoListRow =
    isVariableProduct(product) && variations.length
      ? {
          label: PRODUCTS_DETAIL_TEXTS.VARIATIONS_AVAILABILITY_LABEL,
          value: [
            variations.filter((variation) => variation.available).length,
            PRODUCTS_DETAIL_TEXTS.VARIATIONS_AVAILABILITY_SEPARATOR,
            variations.length,
          ].join(' '),
        }
      : buildAvailabilityRow(product.available);

  return [
    availabilityRow,
    {
      label: PRODUCTS_DETAIL_TEXTS.CATEGORY_LABEL,
      value: joinOrPlaceholder(resolveProductCategoryNames(product.categories)),
    },
    {
      label: PRODUCTS_DETAIL_TEXTS.PHOTOS_LABEL,
      value: String(extractProductImages(product).length),
    },
  ];
};

/** Price, discount, SKU and stock of a simple product. */
export const buildProductDetailPricingRows = (product: ProductApiItem): InfoListRow[] => {
  const price = resolveProductDetailPrice(product);

  return [
    { label: PRODUCTS_DETAIL_TEXTS.PRICE_LABEL, value: price.current, emphasis: true },
    {
      label: PRODUCTS_DETAIL_TEXTS.OLD_PRICE_LABEL,
      value: price.old ?? EMPTY_VALUE_PLACEHOLDER,
    },
    { label: PRODUCTS_DETAIL_TEXTS.SKU_LABEL, value: formatText(product.sku), mono: true },
    buildAvailabilityRow(product.available),
  ];
};

const formatVariationTitle = (variation: ProductFormVariation): string => {
  const title = variation.title || variation.name || EMPTY_VALUE_PLACEHOLDER;
  return variation.isMain ? `${title} ${PRODUCTS_DETAIL_TEXTS.VARIATION_MAIN_SUFFIX}` : title;
};

export const buildProductDetailVariationRows = (product: ProductApiItem): TableRowData[] =>
  extractProductVariations(product).map((variation) => ({
    id: variation.localId,
    title: formatVariationTitle(variation),
    image: variation.images[0]?.imageDataUrl ?? null,
    attributes: joinOrPlaceholder(variation.attributes.map((attribute) => attribute.label)),
    sku: formatText(variation.sku),
    price: formatText(variation.price),
    oldPrice: formatText(variation.oldPrice),
    availability: resolveAvailabilityLabel(variation.available),
  }));

export const countProductDetailMissingSeoFields = (product: ProductApiItem): number =>
  PRODUCTS_DETAIL_SEO_META_FIELDS.filter((field) => !toTrimmedString(product[field])).length;

const buildSeoMetaRow = (label: string, value: string | null | undefined): InfoListRow => {
  const text = toTrimmedString(value);
  return text
    ? { label, value: text }
    : { label, value: PRODUCTS_DETAIL_TEXTS.SEO_NOT_FILLED, tone: 'warning' };
};

export const buildProductDetailSeoRows = (product: ProductApiItem): InfoListRow[] => [
  { label: PRODUCTS_DETAIL_TEXTS.SEO_SLUG_LABEL, value: formatText(product.slug), mono: true },
  buildSeoMetaRow(PRODUCTS_DETAIL_TEXTS.SEO_META_TITLE_LABEL, product.metaTitle),
  buildSeoMetaRow(PRODUCTS_DETAIL_TEXTS.SEO_META_DESCRIPTION_LABEL, product.metaDescription),
  { label: PRODUCTS_DETAIL_TEXTS.SEO_CANONICAL_LABEL, value: formatText(product.canonicalUrl) },
  product.noIndex
    ? {
        label: PRODUCTS_DETAIL_TEXTS.SEO_INDEXING_LABEL,
        value: PRODUCTS_DETAIL_TEXTS.SEO_NOT_INDEXED,
        tone: 'neutral',
      }
    : {
        label: PRODUCTS_DETAIL_TEXTS.SEO_INDEXING_LABEL,
        value: PRODUCTS_DETAIL_TEXTS.SEO_INDEXED,
        tone: 'success',
      },
];

export const buildProductDetailStatusRows = (product: ProductApiItem): InfoListRow[] => [
  {
    label: PRODUCTS_DETAIL_TEXTS.STATUS_LABEL,
    value: resolveProductStatusLabel(product.status),
    tone: resolveProductDetailStatusTone(product),
  },
  { label: PRODUCTS_DETAIL_TEXTS.TYPE_LABEL, value: resolveProductTypeLabel(product.type) },
  {
    label: PRODUCTS_DETAIL_TEXTS.POPULAR_LABEL,
    value: formatBoolean(product.isPopular ?? false),
  },
  {
    label: PRODUCTS_DETAIL_TEXTS.MAIN_BANNER_LABEL,
    value: formatBoolean(product.isMainBanner ?? false),
  },
  { label: PRODUCTS_DETAIL_TEXTS.CREATED_LABEL, value: formatDate(product.createdAt) },
  { label: PRODUCTS_DETAIL_TEXTS.UPDATED_LABEL, value: formatDate(product.updatedAt) },
];

export const buildProductDetailTagLabels = (product: ProductApiItem): string[] =>
  extractProductTags(product).map((tag) => tag.label);

export const buildProductDetailAttributeLabels = (product: ProductApiItem): string[] =>
  extractProductAttributes(product).map((attribute) => attribute.label);

/** Related products in the server order; entries without an id can't be linked and are skipped. */
export const buildProductDetailRelatedItems = (
  products: ProductApiItem[],
  shopId: string,
): ProductDetailRelatedItem[] =>
  products.flatMap((product) => {
    const id = toTrimmedString(product.id);
    if (!id) {
      return [];
    }

    return [
      {
        id,
        title: resolveProductDetailTitle(product),
        price: resolveProductDetailPrice(product).current,
        image: extractProductImages(product)[0]?.imageDataUrl ?? null,
        href: `${APP_ROUTES.ADMIN_SHOP}/${shopId}/${PRODUCTS_SECTION_PATH}/${id}`,
      },
    ];
  });
