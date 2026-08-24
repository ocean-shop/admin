import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  buildShopBreadcrumb,
  buildShopSectionBreadcrumb,
} from '../../constants/shop-breadcrumbs.constants';
import { PRODUCTS_TYPE_OPTIONS } from '../../constants/products.constants';
import { ProductForm } from '../../components/product-form/product-form';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductFormAssignedAttribute } from '../../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormImageItem } from '../../components/product-form/models/product-form-image-item.model';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductFormVariation } from '../../components/product-form/models/product-form-variation.model';
import { ProductFormValues } from '../../helpers/models/product-form-values.model';
import {
  extractProductAttributes,
  extractProductCategoryIds,
  extractProductImages,
  extractProductTags,
  extractProductVariations,
  mapProductToFormModel,
} from '../../helpers/product-api-mapping.helper';
import { buildUpdateProductPayload } from '../../helpers/product-form-payload.helper';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';
import { PRODUCTS_TEXTS } from '../products/constants/products.constants';
import { ProductType } from '../products/models/product-type.enum';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';

@Component({
  selector: 'app-products-update',
  imports: [Button, ProductForm, Breadcrumbs],
  templateUrl: './products-update.html',
  styleUrl: './products-update.scss',
})
export class ProductsUpdate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
  protected readonly productTypeSimple = ProductType.Simple;
  protected readonly productTypeOptions: RadioGroupOption[] = PRODUCTS_TYPE_OPTIONS;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    buildShopSectionBreadcrumb(this.shopId(), 'products', PRODUCTS_TEXTS.PAGE_TITLE),
    { label: this.textData.PAGE_TITLE },
  ]);

  protected readonly shopId = signal<string | null>(null);
  protected readonly productId = signal<string | null>(null);
  protected readonly selectedCategoryIds = signal<Set<string>>(new Set());
  protected readonly assignedAttributes = signal<ProductFormAssignedAttribute[]>([]);
  protected readonly assignedTags = signal<ProductFormAssignedTag[]>([]);
  protected readonly images = signal<ProductFormImageItem[]>([]);
  protected readonly variations = signal<ProductFormVariation[]>([]);
  protected readonly productFormModel = signal<ProductFormModel>({
    ...PRODUCT_FORM_DEFAULT_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_UPDATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly productQuery = injectQuery(() => {
    const productId = this.productId();
    return {
      queryKey: productId
        ? SHOP_QUERY_KEYS.productById(productId)
        : ['shop', 'products', 'missing-product-id'],
      enabled: Boolean(this.shopId() && productId),
      queryFn: () => lastValueFrom(this.productsService.getProductById(productId ?? '')),
    };
  });

  protected readonly updateProductMutation = injectMutation(() => ({
    mutationFn: ({ productId, payload }: { productId: string; payload: UpdateProductPayload }) =>
      lastValueFrom(this.productsService.updateProduct(productId, payload)),
  }));

  protected readonly isSubmitting = computed(() => this.updateProductMutation.isPending());
  protected readonly isLoadingProduct = computed(
    () => this.productQuery.isPending() || this.productQuery.isFetching(),
  );
  protected readonly isFormValid = computed(() => this.productForm.name().valid());

  constructor() {
    effect(() => {
      const product = this.productQuery.data();
      if (!product) {
        return;
      }

      this.productFormModel.set(mapProductToFormModel(product));
      this.selectedCategoryIds.set(extractProductCategoryIds(product));
      this.images.set(extractProductImages(product));
      this.variations.set(extractProductVariations(product));
      this.assignedAttributes.set(
        extractProductAttributes(product, {
          attributesFallbackLabel: PRODUCTS_UPDATE_TEXTS.ATTRIBUTES_TITLE,
          tagsFallbackLabel: PRODUCTS_UPDATE_TEXTS.TAGS_TITLE,
        }),
      );
      this.assignedTags.set(
        extractProductTags(product, {
          attributesFallbackLabel: PRODUCTS_UPDATE_TEXTS.ATTRIBUTES_TITLE,
          tagsFallbackLabel: PRODUCTS_UPDATE_TEXTS.TAGS_TITLE,
        }),
      );
    });

    effect(() => {
      if (!this.productQuery.isError()) {
        return;
      }

      this.toasterService.danger(
        PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_TITLE,
        PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
      );
    });
  }

  ngOnInit(): void {
    this.watchRouteContext();
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    const currentProductId = this.productId();
    const payload = this.buildPayload();
    if (!currentProductId || !payload) {
      return;
    }

    this.updateProductMutation.mutate(
      { productId: currentProductId, payload },
      {
        onSuccess: () => {
          this.toasterService.success(PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE);
          this.invalidateProductQueries(currentProductId);
        },
        onError: () => {
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_TITLE,
            PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_MESSAGE,
          );
        },
      },
    );
  }

  protected onProductTypeChange(type: ProductType): void {
    this.productFormModel.update((currentValue) => ({
      ...currentValue,
      type,
    }));
  }

  private watchRouteContext(): void {
    this.shopId.set(this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null);
    this.productId.set(this.activatedRoute.snapshot?.paramMap?.get('productId') ?? null);
    this.resetSeeds();

    this.activatedRoute.paramMap
      .pipe(
        map((params) => ({
          shopId: params.get('shopId'),
          productId: params.get('productId'),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ shopId, productId }) => {
        this.shopId.set(shopId);
        this.productId.set(productId);
        this.resetSeeds();
      });
  }

  private invalidateProductQueries(productId: string): void {
    this.queryClient.invalidateQueries({
      queryKey: SHOP_QUERY_KEYS.productById(productId),
    });

    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'products'],
    });
  }

  private resetSeeds(): void {
    this.selectedCategoryIds.set(new Set());
    this.assignedAttributes.set([]);
    this.assignedTags.set([]);
    this.images.set([]);
    this.variations.set([]);
  }

  private buildPayload(): UpdateProductPayload | null {
    return buildUpdateProductPayload(this.getFormValues());
  }

  private getFormValues(): ProductFormValues {
    return {
      name: this.productForm.name().value(),
      type: this.productForm.type().value(),
      description: this.productForm.description().value(),
      sku: this.productForm.sku().value(),
      status: this.productForm.status().value(),
      available: this.productForm.available().value(),
      price: this.productForm.price().value(),
      oldPrice: this.productForm.oldPrice().value(),
    };
  }
}
