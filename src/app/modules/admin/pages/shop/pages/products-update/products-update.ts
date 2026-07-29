import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import { ProductFormVariationAttributeSearchEvent } from '../../components/product-form/models/product-form-variation-attribute-search-event.model';
import { ProductFormVariationAttributeToggleEvent } from '../../components/product-form/models/product-form-variation-attribute-toggle-event.model';
import { ProductFormVariationChangeEvent } from '../../components/product-form/models/product-form-variation-change-event.model';
import { ProductFormVariationCreateEvent } from '../../components/product-form/models/product-form-variation-create-event.model';
import { ProductFormVariationImageFilesEvent } from '../../components/product-form/models/product-form-variation-image-files-event.model';
import { ProductFormVariationImageToggleEvent } from '../../components/product-form/models/product-form-variation-image-toggle-event.model';
import { ProductFormVariationRemoveEvent } from '../../components/product-form/models/product-form-variation-remove-event.model';
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
  providers: [ProductEditorFacade],
  templateUrl: './products-update.html',
  styleUrl: './products-update.scss',
})
export class ProductsUpdate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly productEditorFacade = inject(ProductEditorFacade);
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
  protected readonly isCategoriesLoading = this.productEditorFacade.isCategoriesLoading;
  protected readonly isCategoryToggleLoading = this.productEditorFacade.isCategoryToggleLoading;
  protected readonly isAttributeSearchLoading = this.productEditorFacade.isAttributeSearchLoading;
  protected readonly isTagSearchLoading = this.productEditorFacade.isTagSearchLoading;
  protected readonly attributeSearchValue = this.productEditorFacade.attributeSearchValue;
  protected readonly attributeSearchResults = this.productEditorFacade.attributeSearchResults;
  protected readonly assignedAttributes = this.productEditorFacade.assignedAttributes;
  protected readonly tagSearchValue = this.productEditorFacade.tagSearchValue;
  protected readonly tagSearchResults = this.productEditorFacade.tagSearchResults;
  protected readonly assignedTags = this.productEditorFacade.assignedTags;
  protected readonly images = this.productEditorFacade.images;
  protected readonly isImageUploadLoading = this.productEditorFacade.isImageUploadLoading;
  protected readonly variations = this.productEditorFacade.variations;
  protected readonly productFormModel = signal<ProductFormModel>({
    ...PRODUCT_FORM_DEFAULT_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_UPDATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

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

  protected onVariationAdd(): void {
    this.productEditorFacade.onVariationAdd();
  }

  protected onVariationCreate(event: ProductFormVariationCreateEvent): void {
    this.productEditorFacade.saveVariation(event);
  }

  protected onVariationRemove(event: ProductFormVariationRemoveEvent): void {
    this.productEditorFacade.onVariationRemove(event);
  }

  protected onVariationChange(event: ProductFormVariationChangeEvent): void {
    this.productEditorFacade.onVariationChange(event);
  }

  protected onVariationAttributeSearchChange(
    event: ProductFormVariationAttributeSearchEvent,
  ): void {
    this.productEditorFacade.onVariationAttributeSearchChange(event);
  }

  protected onVariationAttributeAssign(event: ProductFormVariationAttributeToggleEvent): void {
    this.productEditorFacade.onVariationAttributeAssign(event);
  }

  protected onVariationAttributeUnassign(event: ProductFormVariationAttributeToggleEvent): void {
    this.productEditorFacade.onVariationAttributeUnassign(event);
  }

  protected onVariationImageFilesSelected(event: ProductFormVariationImageFilesEvent): void {
    this.productEditorFacade.onVariationImageFilesSelected(event);
  }

  protected onVariationImageMoveUp(event: ProductFormVariationImageToggleEvent): void {
    this.productEditorFacade.onVariationImageMoveUp(event);
  }

  protected onVariationImageMoveDown(event: ProductFormVariationImageToggleEvent): void {
    this.productEditorFacade.onVariationImageMoveDown(event);
  }

  protected onVariationImageRemove(event: ProductFormVariationImageToggleEvent): void {
    this.productEditorFacade.onVariationImageRemove(event);
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
          this.productEditorFacade.images.set(extractProductImages(product));
          this.productEditorFacade.variations.set(extractProductVariations(product));
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
