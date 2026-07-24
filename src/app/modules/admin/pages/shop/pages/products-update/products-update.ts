import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductType } from '../products/models/product-type.enum';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';
import { ProductEditorFacade } from '../../facades/product-editor.facade';
import { buildUpdateProductPayload } from '../../helpers/product-form-payload.helper';
import {
  extractProductAttributes,
  extractProductCategoryIds,
  extractProductTags,
  mapProductToFormModel,
} from '../../helpers/product-api-mapping.helper';
import { ProductFormValues } from '../../helpers/models/product-form-values.model';

@Component({
  selector: 'app-products-update',
  imports: [Button, ProductForm],
  providers: [ProductEditorFacade],
  templateUrl: './products-update.html',
  styleUrl: './products-update.scss',
})
export class ProductsUpdate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly productEditorFacade = inject(ProductEditorFacade);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
  protected readonly productTypeSimple = ProductType.Simple;
  protected readonly productTypeOptions: RadioGroupOption[] = [
    {
      id: PRODUCT_FORM_FIELD_IDS.TYPE_SIMPLE,
      value: ProductType.Simple,
      label: PRODUCTS_UPDATE_TEXTS.PRODUCT_TYPE_SIMPLE_LABEL,
    },
    {
      id: PRODUCT_FORM_FIELD_IDS.TYPE_VARIABLE,
      value: ProductType.Variable,
      label: PRODUCTS_UPDATE_TEXTS.PRODUCT_TYPE_VARIABLE_LABEL,
    },
  ];

  protected readonly shopId = signal<string | null>(null);
  protected readonly productId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isLoadingProduct = signal(false);
  protected readonly isCategoriesLoading = this.productEditorFacade.isCategoriesLoading;
  protected readonly isCategoryToggleLoading = this.productEditorFacade.isCategoryToggleLoading;
  protected readonly isAttributeSearchLoading = this.productEditorFacade.isAttributeSearchLoading;
  protected readonly isAttributeToggleLoading = this.productEditorFacade.isAttributeToggleLoading;
  protected readonly isTagSearchLoading = this.productEditorFacade.isTagSearchLoading;
  protected readonly isTagToggleLoading = this.productEditorFacade.isTagToggleLoading;
  protected readonly attributeSearchValue = this.productEditorFacade.attributeSearchValue;
  protected readonly attributeSearchResults = this.productEditorFacade.attributeSearchResults;
  protected readonly assignedAttributes = this.productEditorFacade.assignedAttributes;
  protected readonly tagSearchValue = this.productEditorFacade.tagSearchValue;
  protected readonly tagSearchResults = this.productEditorFacade.tagSearchResults;
  protected readonly assignedTags = this.productEditorFacade.assignedTags;
  protected readonly images = this.productEditorFacade.images;
  protected readonly isImageUploadLoading = this.productEditorFacade.isImageUploadLoading;
  protected readonly productFormModel = signal<ProductFormModel>({
    ...PRODUCT_FORM_DEFAULT_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_UPDATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly isRouteContextReady = computed(
    () => Boolean(this.shopId()) && Boolean(this.productId()),
  );
  protected readonly isFormValid = computed(() => this.productForm.name().valid());
  protected readonly categoryNodes = computed(() =>
    this.productEditorFacade.buildCategoryNodes({
      disabled: this.isCategoryToggleLoading() || this.isCategoriesLoading(),
    }),
  );

  constructor() {
    this.productEditorFacade.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.productId(),
      texts: PRODUCTS_UPDATE_TEXTS,
    });
  }

  ngOnInit(): void {
    this.watchRouteContext();
  }

  protected onSubmit(): void {
    if (!this.isRouteContextReady() || !this.isFormValid() || this.isSubmitting()) {
      return;
    }

    const currentProductId = this.productId();
    const currentShopId = this.shopId();
    const payload = this.buildPayload();
    if (!currentProductId || !currentShopId || !payload) {
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
          this.router.navigate(['/admin/shop', currentShopId, 'products']);
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

  protected onCategoryToggle(event: ProductFormCategoryToggleEvent): void {
    this.productEditorFacade.onCategoryToggle(event);
  }

  protected onAttributeSearchChange(value: string): void {
    this.productEditorFacade.onAttributeSearchChange(value);
  }

  protected onAttributeAssign(attributeId: string): void {
    this.productEditorFacade.onAttributeAssign(attributeId);
  }

  protected onAttributeUnassign(attributeId: string): void {
    this.productEditorFacade.onAttributeUnassign(attributeId);
  }

  protected onTagSearchChange(value: string): void {
    this.productEditorFacade.onTagSearchChange(value);
  }

  protected onTagAssign(tagId: string): void {
    this.productEditorFacade.onTagAssign(tagId);
  }

  protected onTagUnassign(tagId: string): void {
    this.productEditorFacade.onTagUnassign(tagId);
  }

  protected onImageFilesSelected(files: File[]): void {
    this.productEditorFacade.onImageFilesSelected(files);
  }

  protected onImageMoveUp(imageId: string): void {
    this.productEditorFacade.onImageMoveUp(imageId);
  }

  protected onImageMoveDown(imageId: string): void {
    this.productEditorFacade.onImageMoveDown(imageId);
  }

  protected onImageRemove(imageId: string): void {
    this.productEditorFacade.onImageRemove(imageId);
  }

  protected onImageUpload(): void {
    this.productEditorFacade.uploadImages();
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
        this.productEditorFacade.resetState({ clearCategories: !shopId || !productId });

        if (!shopId || !productId) {
          return;
        }

        this.productEditorFacade.loadCategories();
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
          this.productEditorFacade.selectedCategoryIds.set(extractProductCategoryIds(product));
          this.productEditorFacade.assignedAttributes.set(
            extractProductAttributes(product, {
              attributesFallbackLabel: PRODUCTS_UPDATE_TEXTS.ATTRIBUTES_TITLE,
              tagsFallbackLabel: PRODUCTS_UPDATE_TEXTS.TAGS_TITLE,
            }),
          );
          this.productEditorFacade.assignedTags.set(
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
