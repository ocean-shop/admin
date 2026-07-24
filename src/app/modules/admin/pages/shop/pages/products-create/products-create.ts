import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  PRODUCTS_CREATE_FIELD_IDS,
  PRODUCTS_CREATE_STATUS_OPTIONS,
  PRODUCTS_CREATE_TEXTS,
} from './constants/products-create.constants';
import { ProductCreateFormModel } from './models/product-create-form.model';
import { CreateProductPayload } from '../products/models/create-product-payload.model';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import { ProductEditorFacade } from '../../facades/product-editor.facade';
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
} from '../../helpers/product-form-payload.helper';
import { ProductFormValues } from '../../helpers/models/product-form-values.model';

@Component({
  selector: 'app-products-create',
  imports: [Button, ProductForm],
  providers: [ProductEditorFacade],
  templateUrl: './products-create.html',
  styleUrl: './products-create.scss',
})
export class ProductsCreate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly productEditorFacade = inject(ProductEditorFacade);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_CREATE_TEXTS;
  protected readonly fieldIds = PRODUCTS_CREATE_FIELD_IDS;
  protected readonly statusOptions = PRODUCTS_CREATE_STATUS_OPTIONS;
  protected readonly productTypeSimple = ProductType.Simple;
  protected readonly productTypeOptions: RadioGroupOption[] = [
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
  protected readonly shopId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly isCategoriesLoading = this.productEditorFacade.isCategoriesLoading;
  protected readonly isCategoryToggleLoading = this.productEditorFacade.isCategoryToggleLoading;
  protected readonly isAttributeSearchLoading = this.productEditorFacade.isAttributeSearchLoading;
  protected readonly isAttributeToggleLoading = this.productEditorFacade.isAttributeToggleLoading;
  protected readonly isTagSearchLoading = this.productEditorFacade.isTagSearchLoading;
  protected readonly isTagToggleLoading = this.productEditorFacade.isTagToggleLoading;
  protected readonly createdProductId = signal<string | null>(null);
  protected readonly attributeSearchValue = this.productEditorFacade.attributeSearchValue;
  protected readonly attributeSearchResults = this.productEditorFacade.attributeSearchResults;
  protected readonly assignedAttributes = this.productEditorFacade.assignedAttributes;
  protected readonly tagSearchValue = this.productEditorFacade.tagSearchValue;
  protected readonly tagSearchResults = this.productEditorFacade.tagSearchResults;
  protected readonly assignedTags = this.productEditorFacade.assignedTags;
  protected readonly images = this.productEditorFacade.images;
  protected readonly isImageUploadLoading = this.productEditorFacade.isImageUploadLoading;

  protected readonly productFormModel = signal<ProductCreateFormModel>({
    ...PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_CREATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFormValid = computed(() => this.productForm.name().valid());
  protected readonly isSidebarDisabled = computed(() => !this.createdProductId());
  protected readonly categoryNodes = computed(() =>
    this.productEditorFacade.buildCategoryNodes({
      disabled:
        this.isSidebarDisabled() ||
        this.isSubmitting() ||
        this.isCategoriesLoading() ||
        this.isCategoryToggleLoading(),
    }),
  );

  constructor() {
    this.productEditorFacade.configure({
      getShopId: () => this.shopId(),
      getProductId: () => this.createdProductId(),
      isSidebarEnabled: () => !this.isSidebarDisabled(),
      texts: PRODUCTS_CREATE_TEXTS,
    });
  }

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    const existingProductId = this.createdProductId();
    if (existingProductId) {
      this.submitProductUpdate(existingProductId);
      return;
    }

    this.submitProductCreate();
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

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.createdProductId.set(null);
        this.productEditorFacade.resetState({ clearCategories: !shopId });

        if (!shopId) {
          return;
        }

        this.productEditorFacade.loadCategories();
      });
  }

  private submitProductCreate(): void {
    const payload = this.buildCreatePayload();
    if (!payload) {
      return;
    }

    this.isSubmitting.set(true);
    this.productsService
      .createProduct(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (product) => {
          const normalizedProductId = String(product.id ?? '').trim();
          if (!normalizedProductId) {
            this.toasterService.danger(
              PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
              PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
            );
            return;
          }

          this.createdProductId.set(normalizedProductId);
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
          );
        },
      });
  }

  private submitProductUpdate(productId: string): void {
    const payload = this.buildUpdatePayload();
    if (!payload) {
      return;
    }

    this.isSubmitting.set(true);
    this.productsService
      .updateProduct(productId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.UPDATE_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.UPDATE_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.UPDATE_ERROR_MESSAGE,
          );
        },
      });
  }

  private buildCreatePayload(): CreateProductPayload | null {
    return buildCreateProductPayload(this.shopId(), this.getFormValues());
  }

  private buildUpdatePayload(): UpdateProductPayload | null {
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
