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
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductForm } from '../../components/product-form/product-form';
import {
  buildCreateProductPayload,
  buildUpdateProductPayload,
} from '../../helpers/product-form-payload.helper';
import { ProductFormValues } from '../../helpers/models/product-form-values.model';
import { PRODUCTS_TYPE_OPTIONS } from '../../constants/products.constants';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { CreateProductPayload } from '../products/models/create-product-payload.model';

@Component({
  selector: 'app-products-create',
  imports: [Button, ProductForm],
  templateUrl: './products-create.html',
  styleUrl: './products-create.scss',
})
export class ProductsCreate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_CREATE_TEXTS;
  protected readonly fieldIds = PRODUCTS_CREATE_FIELD_IDS;
  protected readonly statusOptions = PRODUCTS_CREATE_STATUS_OPTIONS;
  protected readonly productTypeSimple = ProductType.Simple;
  protected readonly productTypeOptions: RadioGroupOption[] = PRODUCTS_TYPE_OPTIONS;
  protected readonly shopId = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly createdProductId = signal<string | null>(null);

  protected readonly productFormModel = signal<ProductFormModel>({
    ...PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_CREATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly isFormValid = computed(() => this.productForm.name().valid());
  protected readonly isSidebarDisabled = computed(() => !this.createdProductId());

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

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.createdProductId.set(null);
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
