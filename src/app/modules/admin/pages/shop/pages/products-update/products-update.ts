import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATIC_ATTRIBUTES,
  PRODUCT_FORM_STATIC_CATEGORIES,
  PRODUCT_FORM_STATIC_TAGS,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { ProductApiItem } from '../products/models/product.model';
import { ProductStatus } from '../products/models/product-status.enum';
import { ProductType } from '../products/models/product-type.enum';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductsService } from '../products/services/products.service';
import { PRODUCTS_UPDATE_TEXTS } from './constants/products-update.constants';

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
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
  protected readonly staticCategories = PRODUCT_FORM_STATIC_CATEGORIES;
  protected readonly staticAttributes = PRODUCT_FORM_STATIC_ATTRIBUTES;
  protected readonly staticTags = PRODUCT_FORM_STATIC_TAGS;
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
          this.productFormModel.set(this.mapProductToFormModel(product));
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_TITLE,
            PRODUCTS_UPDATE_TEXTS.PRODUCT_NOT_FOUND_MESSAGE,
          );
        },
      });
  }

  private mapProductToFormModel(product: ProductApiItem): ProductFormModel {
    return {
      name: product.name?.trim() || product.title?.trim() || '',
      type: this.normalizeType(product.type),
      description: product.description?.trim() ?? '',
      price: this.toPriceInput(product.price),
      oldPrice: this.toPriceInput(product.oldPrice),
      sku: product.sku?.trim() ?? '',
      status: this.normalizeStatus(product.status),
      available: product.available ?? true,
    };
  }

  private buildPayload(): UpdateProductPayload | null {
    const name = this.productForm.name().value()?.trim() ?? '';
    if (!name) {
      return null;
    }

    const type = this.productForm.type().value();
    const description = this.productForm.description().value()?.trim() ?? '';
    const sku = this.productForm.sku().value()?.trim() ?? '';
    const price = this.parsePrice(this.productForm.price().value());
    const oldPrice = this.parsePrice(this.productForm.oldPrice().value());

    return {
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

  private toPriceInput(value: number | string | null | undefined): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value.toFixed(2);
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    return '';
  }

  private normalizeType(value: ProductApiItem['type']): ProductType {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();
    if (normalized === ProductType.Variable) {
      return ProductType.Variable;
    }

    return ProductType.Simple;
  }

  private normalizeStatus(value: ProductApiItem['status']): ProductStatus {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();
    if (normalized === ProductStatus.Active) {
      return ProductStatus.Active;
    }

    if (normalized === ProductStatus.Archived) {
      return ProductStatus.Archived;
    }

    return ProductStatus.Draft;
  }
}
