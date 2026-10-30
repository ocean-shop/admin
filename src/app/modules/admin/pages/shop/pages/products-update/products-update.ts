import { Component, computed, inject, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { StateMessage } from '@ui/state-message/state-message';
import { PRODUCT_FORM_DEFAULT_VALUE } from '../../components/product-form/constants/product-form.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductForm } from '../../components/product-form/product-form';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { mapProductToFormModel } from '../../helpers/product-api-mapping.helper';
import { buildUpdateProductPayload } from '../../helpers/product-form-payload.helper';
import { applyProductFormValidators } from '../../helpers/product-form-schema.helper';
import { buildProductFormSeeds } from '../../helpers/product-form-seeds.helper';
import { invalidateProductQueries } from '../../helpers/product-query.helper';
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs.helper';
import { PRODUCTS_SECTION_PATH, PRODUCTS_TEXTS } from '../products/constants/products.constants';
import { UpdateProductVariables } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';

@Component({
  selector: 'app-products-update',
  imports: [PageLayout, PageHeader, Breadcrumbs, Button, StateMessage, ProductForm],
  templateUrl: './products-update.html',
  styleUrl: './products-update.scss',
})
export class ProductsUpdate {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly productId = injectRouteParam('productId');
  protected readonly isRouteContextReady = computed(() =>
    Boolean(this.shopId() && this.productId()),
  );

  protected readonly breadcrumbItems = computed(() =>
    buildShopSectionPageBreadcrumbs(
      this.shopId(),
      PRODUCTS_SECTION_PATH,
      PRODUCTS_TEXTS.PAGE_TITLE,
      PRODUCTS_UPDATE_TEXTS.PAGE_TITLE,
    ),
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

  /** Reset from the server whenever the product (re)loads; edited locally in between. */
  protected readonly productFormModel = linkedSignal<ProductFormModel>(() => {
    const product = this.productQuery.data();
    return product ? mapProductToFormModel(product) : { ...PRODUCT_FORM_DEFAULT_VALUE };
  });
  protected readonly productForm = form(this.productFormModel, applyProductFormValidators);
  protected readonly formSeeds = computed(() => buildProductFormSeeds(this.productQuery.data()));

  private readonly updateProductMutation = injectMutation(() => ({
    mutationFn: ({ productId, payload }: UpdateProductVariables) =>
      lastValueFrom(this.productsService.updateProduct(productId, payload)),
  }));

  protected readonly isSubmitDisabled = computed(
    () =>
      !this.productQuery.isSuccess() ||
      this.productQuery.isFetching() ||
      !this.productForm().valid() ||
      this.updateProductMutation.isPending(),
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const productId = this.productId();
    const payload = buildUpdateProductPayload(this.productFormModel());
    if (this.isSubmitDisabled() || !productId || !payload) {
      return;
    }

    this.updateProductMutation.mutate(
      { productId, payload },
      {
        onSuccess: () => {
          this.toasterService.success(PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE);
          invalidateProductQueries(this.queryClient, productId, this.shopId());
        },
      },
    );
  }
}
