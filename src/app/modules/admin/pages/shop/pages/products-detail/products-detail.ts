import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { Badge } from '@ui/badge/badge';
import { BadgeList } from '@ui/badge-list/badge-list';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { InfoList } from '@ui/info-list/info-list';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { SectionCard } from '@ui/section-card/section-card';
import { StateMessage } from '@ui/state-message/state-message';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { extractProductImages } from '../../helpers/product-api-mapping/product-api-mapping.helper';
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  PRODUCTS_SECTION_PATH,
  PRODUCTS_TEXTS,
  PRODUCTS_UPDATE_PATH,
} from '../products/constants/products.constants';
import {
  resolveProductCategoryNames,
  resolveProductStatusLabel,
  resolveProductTypeLabel,
} from '../products/helpers/product-list-mapping/product-list-mapping.helper';
import { ProductsService } from '../products/services/products/products.service';
import { ProductDetailGallery } from './components/product-detail-gallery/product-detail-gallery';
import { ProductDetailRelatedList } from './components/product-detail-related-list/product-detail-related-list';
import {
  PRODUCTS_DETAIL_ICONS,
  PRODUCTS_DETAIL_TEXTS,
  PRODUCTS_DETAIL_VARIATION_COLUMNS,
} from './constants/products-detail.constants';
import {
  buildProductDetailAttributeLabels,
  buildProductDetailOverviewRows,
  buildProductDetailPricingRows,
  buildProductDetailRelatedItems,
  buildProductDetailSeoRows,
  buildProductDetailStatusRows,
  buildProductDetailSubtitle,
  buildProductDetailTagLabels,
  buildProductDetailVariationRows,
  countProductDetailMissingSeoFields,
  isVariableProduct,
  resolveProductDetailPrice,
  resolveProductDetailStatusTone,
  resolveProductDetailTitle,
} from './helpers/product-detail-mapping/product-detail-mapping.helper';

@Component({
  selector: 'app-products-detail',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    Button,
    Badge,
    BadgeList,
    StateMessage,
    SectionCard,
    InfoList,
    Table,
    ProductDetailGallery,
    ProductDetailRelatedList,
  ],
  templateUrl: './products-detail.html',
  styleUrl: './products-detail.scss',
})
export class ProductsDetail {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  protected readonly textData = PRODUCTS_DETAIL_TEXTS;
  protected readonly icons = PRODUCTS_DETAIL_ICONS;
  protected readonly variationColumns = PRODUCTS_DETAIL_VARIATION_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly productId = injectRouteParam('productId');
  protected readonly isRouteContextReady = computed(() =>
    Boolean(this.shopId() && this.productId()),
  );

  protected readonly productQuery = injectQuery(() => {
    const productId = this.productId();
    return {
      queryKey: productId
        ? SHOP_QUERY_KEYS.productById(productId)
        : SHOP_QUERY_KEYS.disabled('product'),
      enabled: this.isRouteContextReady(),
      queryFn: () => lastValueFrom(this.productsService.getProductById(productId ?? '')),
    };
  });

  protected readonly relatedProductsQuery = injectQuery(() => {
    const productId = this.productId();
    return {
      queryKey: productId
        ? SHOP_QUERY_KEYS.relatedProducts(productId)
        : SHOP_QUERY_KEYS.disabled('related-products'),
      enabled: this.isRouteContextReady(),
      queryFn: () => lastValueFrom(this.productsService.getRelatedProducts(productId ?? '')),
    };
  });

  protected readonly product = computed(() => this.productQuery.data() ?? null);
  protected readonly isLoading = computed(
    () => this.isRouteContextReady() && this.productQuery.isPending(),
  );
  protected readonly hasError = computed(() => this.productQuery.isError());

  protected readonly pageTitle = computed(() => {
    const product = this.product();
    return product ? resolveProductDetailTitle(product) : PRODUCTS_DETAIL_TEXTS.PAGE_TITLE;
  });
  protected readonly pageSubtitle = computed(() => {
    const product = this.product();
    return product ? buildProductDetailSubtitle(product) : '';
  });
  protected readonly breadcrumbItems = computed(() =>
    buildShopSectionPageBreadcrumbs(
      this.shopId(),
      PRODUCTS_SECTION_PATH,
      PRODUCTS_TEXTS.PAGE_TITLE,
      this.pageTitle(),
    ),
  );

  protected readonly statusLabel = computed(() =>
    resolveProductStatusLabel(this.product()?.status),
  );
  protected readonly statusTone = computed(() => {
    const product = this.product();
    return product ? resolveProductDetailStatusTone(product) : 'neutral';
  });
  protected readonly typeLabel = computed(() => resolveProductTypeLabel(this.product()?.type));
  protected readonly isPopular = computed(() => Boolean(this.product()?.isPopular));
  protected readonly isVariable = computed(() => {
    const product = this.product();
    return product ? isVariableProduct(product) : false;
  });

  protected readonly images = computed(() => {
    const product = this.product();
    return product ? extractProductImages(product) : [];
  });
  protected readonly price = computed(() => {
    const product = this.product();
    return product ? resolveProductDetailPrice(product) : null;
  });
  protected readonly overviewRows = computed(() => {
    const product = this.product();
    return product ? buildProductDetailOverviewRows(product) : [];
  });
  protected readonly description = computed(() => toTrimmedString(this.product()?.description));

  protected readonly variationRows = computed(() => {
    const product = this.product();
    return product ? buildProductDetailVariationRows(product) : [];
  });
  protected readonly variationsCount = computed(() => String(this.variationRows().length));
  protected readonly pricingRows = computed(() => {
    const product = this.product();
    return product ? buildProductDetailPricingRows(product) : [];
  });

  protected readonly seoRows = computed(() => {
    const product = this.product();
    return product ? buildProductDetailSeoRows(product) : [];
  });
  protected readonly missingSeoFieldsLabel = computed(() => {
    const product = this.product();
    const missingCount = product ? countProductDetailMissingSeoFields(product) : 0;
    return missingCount ? `${PRODUCTS_DETAIL_TEXTS.SEO_MISSING_PREFIX} ${missingCount}` : '';
  });

  protected readonly statusRows = computed(() => {
    const product = this.product();
    return product ? buildProductDetailStatusRows(product) : [];
  });
  protected readonly categoryLabels = computed(() =>
    resolveProductCategoryNames(this.product()?.categories),
  );
  protected readonly tagLabels = computed(() => {
    const product = this.product();
    return product ? buildProductDetailTagLabels(product) : [];
  });
  protected readonly attributeLabels = computed(() => {
    const product = this.product();
    return product ? buildProductDetailAttributeLabels(product) : [];
  });
  protected readonly relatedItems = computed(() =>
    buildProductDetailRelatedItems(this.relatedProductsQuery.data() ?? [], this.shopId() ?? ''),
  );
  protected readonly relatedCount = computed(() => String(this.relatedItems().length));

  protected onEdit(): void {
    const shopId = this.shopId();
    const productId = this.productId();
    if (shopId && productId) {
      this.router.navigate([
        APP_ROUTES.ADMIN_SHOP,
        shopId,
        PRODUCTS_SECTION_PATH,
        productId,
        PRODUCTS_UPDATE_PATH,
      ]);
    }
  }
}
