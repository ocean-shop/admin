import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  PRODUCTS_CREATE_FIELD_IDS,
  PRODUCTS_CREATE_STATIC_ATTRIBUTES,
  PRODUCTS_CREATE_STATIC_CATEGORIES,
  PRODUCTS_CREATE_STATIC_TAGS,
  PRODUCTS_CREATE_STATUS_OPTIONS,
  PRODUCTS_CREATE_TEXTS,
} from './constants/products-create.constants';
import { ProductCreateFormModel } from './models/product-create-form.model';
import { CreateProductPayload } from './models/product-create-payload.model';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { ProductForm } from '../../components/product-form/product-form';

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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_CREATE_TEXTS;
  protected readonly fieldIds = PRODUCTS_CREATE_FIELD_IDS;
  protected readonly statusOptions = PRODUCTS_CREATE_STATUS_OPTIONS;
  protected readonly staticCategories = PRODUCTS_CREATE_STATIC_CATEGORIES;
  protected readonly staticAttributes = PRODUCTS_CREATE_STATIC_ATTRIBUTES;
  protected readonly staticTags = PRODUCTS_CREATE_STATIC_TAGS;
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

  protected readonly productFormModel = signal<ProductCreateFormModel>({
    ...PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_CREATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFormValid = computed(() => this.productForm.name().valid());

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting()) {
      return;
    }

    const payload = this.buildPayload();
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
        next: () => {
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE);
          this.router.navigate(['/admin/shop', payload.shopId, 'products']);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.CREATE_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.CREATE_ERROR_MESSAGE,
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

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
      });
  }

  private buildPayload(): CreateProductPayload | null {
    const currentShopId = this.shopId();
    const name = this.productForm.name().value()?.trim() ?? '';
    if (!currentShopId || !name) {
      return null;
    }

    const type = this.productForm.type().value();
    const description = this.productForm.description().value()?.trim() ?? '';
    const sku = this.productForm.sku().value()?.trim() ?? '';
    const price = this.parsePrice(this.productForm.price().value());
    const oldPrice = this.parsePrice(this.productForm.oldPrice().value());

    return {
      shopId: currentShopId,
      name,
      ...(type ? { type } : {}),
      ...(description ? { description } : {}),
      ...(sku ? { sku } : {}),
      ...(this.productForm.status().value() ? { status: this.productForm.status().value() } : {}),
      available: this.productForm.available().value() ?? true,
      ...(price !== null ? { price } : {}),
      ...(oldPrice !== null ? { oldPrice } : {}),
    };
  }

  private parsePrice(value: string | null | undefined): number | null {
    const normalized = String(value ?? '')
      .trim()
      .replace(',', '.');
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }

    return Math.round(parsed * 100) / 100;
  }
}
