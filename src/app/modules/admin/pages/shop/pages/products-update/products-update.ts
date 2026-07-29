import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductFormAssignedAttribute } from '../../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormImageItem } from '../../components/product-form/models/product-form-image-item.model';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductFormVariation } from '../../components/product-form/models/product-form-variation.model';
import { ProductType } from '../products/models/product-type.enum';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';
import { buildUpdateProductPayload } from '../../helpers/product-form-payload.helper';
import {
  extractProductAttributes,
  extractProductCategoryIds,
  extractProductImages,
  extractProductTags,
  extractProductVariations,
  mapProductToFormModel,
} from '../../helpers/product-api-mapping.helper';
import { ProductFormValues } from '../../helpers/models/product-form-values.model';
import { PRODUCTS_TYPE_OPTIONS } from '../../constants/products.constants';

@Component({
  selector: 'app-products-update',
  imports: [Button, ProductForm],
  templateUrl: './products-update.html',
  styleUrl: './products-update.scss',
})
export class ProductsUpdate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
  protected readonly productTypeSimple = ProductType.Simple;
  protected readonly productTypeOptions: RadioGroupOption[] = PRODUCTS_TYPE_OPTIONS;

  protected readonly shopId = signal<string | null>(null);
  protected readonly productId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingProduct = signal(false);
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

  protected readonly isFormValid = computed(() => this.productForm.name().valid());

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

    this.isSubmitting.set(true);
    this.productsService
      .updateProduct(currentProductId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(PRODUCTS_UPDATE_TEXTS.UPDATE_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_TITLE,
            PRODUCTS_UPDATE_TEXTS.UPDATE_ERROR_MESSAGE,
          );
        },
      });
  }

  protected onProductTypeChange(type: ProductType): void {
    this.productFormModel.update((currentValue) => ({
      ...currentValue,
      type,
    }));
  }

  private watchRouteContext(): void {
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

        if (!shopId || !productId) {
          return;
        }

        this.loadProduct(productId);
      });
  }

  private loadProduct(productId: string): void {
    this.isLoadingProduct.set(true);
    this.productsService
      .getProductById(productId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingProduct.set(false)),
      )
      .subscribe({
        next: (product) => {
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
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_TITLE,
            PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
          );
        },
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
