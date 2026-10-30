import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { toTrimmedString } from '@core/helpers/value-format/value-format.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { StateMessage } from '@ui/state-message/state-message';
import { PRODUCT_FORM_DEFAULT_VALUE } from '../../components/product-form/constants/product-form.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductForm } from '../../components/product-form/product-form';
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
} from '../../helpers/product-form-payload.helper';
import { applyProductFormValidators } from '../../helpers/product-form-schema.helper';
import { invalidateProductQueries } from '../../helpers/product-query.helper';
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs.helper';
import { PRODUCTS_SECTION_PATH, PRODUCTS_TEXTS } from '../products/constants/products.constants';
import { CreateProductPayload } from '../products/models/create-product-payload.model';
import { ProductApiItem } from '../products/models/product.model';
import { UpdateProductVariables } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_CREATE_TEXTS } from './constants/products-create.constants';

/**
 * The first submit creates the product and unlocks the sidebar sections;
 * later submits update the same product.
 */
@Component({
  selector: 'app-products-create',
  imports: [PageLayout, PageHeader, Breadcrumbs, Button, StateMessage, ProductForm],
  templateUrl: './products-create.html',
  styleUrl: './products-create.scss',
})
export class ProductsCreate {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = PRODUCTS_CREATE_TEXTS;

  protected readonly shopId = injectRouteParam('shopId');
  /** Id of the product created on this page; reset when the shop changes. */
  protected readonly createdProductId = linkedSignal<string | null, string | null>({
    source: this.shopId,
    computation: () => null,
  });
  protected readonly productFormModel = signal<ProductFormModel>({
    ...PRODUCT_FORM_DEFAULT_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, applyProductFormValidators);

  protected readonly breadcrumbItems = computed(() =>
    buildShopSectionPageBreadcrumbs(
      this.shopId(),
      PRODUCTS_SECTION_PATH,
      PRODUCTS_TEXTS.PAGE_TITLE,
      PRODUCTS_CREATE_TEXTS.PAGE_TITLE,
    ),
  );

  private readonly createProductMutation = injectMutation(() => ({
    mutationFn: (payload: CreateProductPayload) =>
      lastValueFrom(this.productsService.createProduct(payload)),
  }));

  private readonly updateProductMutation = injectMutation(() => ({
    mutationFn: ({ productId, payload }: UpdateProductVariables) =>
      lastValueFrom(this.productsService.updateProduct(productId, payload)),
  }));

  protected readonly isSubmitting = computed(
    () => this.createProductMutation.isPending() || this.updateProductMutation.isPending(),
  );
  protected readonly isSubmitDisabled = computed(
    () => !this.shopId() || !this.productForm().valid() || this.isSubmitting(),
  );
  protected readonly isSidebarDisabled = computed(() => !this.createdProductId());

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.isSubmitDisabled()) {
      return;
    }

    const productId = this.createdProductId();
    if (productId) {
      this.submitUpdate(productId);
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    const shopId = this.shopId();
    const payload = buildCreateProductPayload(shopId, this.productFormModel());
    if (!shopId || !payload) {
      return;
    }

    this.createProductMutation.mutate(payload, {
      onSuccess: (product) => this.onProductCreated(shopId, product),
    });
  }

  private onProductCreated(shopId: string, product: ProductApiItem): void {
    const productId = toTrimmedString(product.id);
    if (!productId) {
      this.toasterService.danger(
        PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
        PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
      );
      return;
    }

    this.createdProductId.set(productId);
    this.syncGeneratedSlug(product.slug);
    this.toasterService.success(PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE);
    invalidateProductQueries(this.queryClient, productId, shopId);
  }

  private submitUpdate(productId: string): void {
    const payload = buildUpdateProductPayload(this.productFormModel());
    if (!payload) {
      return;
    }

    this.updateProductMutation.mutate(
      { productId, payload },
      {
        onSuccess: () => {
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.UPDATE_SUCCESS_TITLE);
          invalidateProductQueries(this.queryClient, productId, this.shopId());
        },
      },
    );
  }

  /** The API generates a slug from the name when none is given; keep it so later saves send it. */
  private syncGeneratedSlug(slug: string | null | undefined): void {
    const generatedSlug = slug?.trim();
    if (generatedSlug) {
      this.productFormModel.update((value) => ({ ...value, slug: generatedSlug }));
    }
  }
}
