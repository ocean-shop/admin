import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { buildTree } from '../../helpers/tree.helper';
import { TreeNode } from '../../models/tree-node.model';
import { ProductFormCategoryNode } from '../../components/product-form/models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import {
  PRODUCT_FORM_DEFAULT_VALUE,
  PRODUCT_FORM_FIELD_IDS,
  PRODUCT_FORM_STATIC_ATTRIBUTES,
  PRODUCT_FORM_STATIC_TAGS,
  PRODUCT_FORM_STATUS_OPTIONS,
} from '../../components/product-form/constants/product-form.constants';
import { ProductForm } from '../../components/product-form/product-form';
import { ProductFormModel } from '../../components/product-form/models/product-form.model';
import { CategoryApiItem, CategoriesApiResponse } from '../categories/models/category.model';
import { CategoriesService } from '../categories/services/categories.service';
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
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_UPDATE_TEXTS;
  protected readonly fieldIds = PRODUCT_FORM_FIELD_IDS;
  protected readonly statusOptions = PRODUCT_FORM_STATUS_OPTIONS;
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
  protected readonly isCategoriesLoading = signal(false);
  protected readonly isCategoryToggleLoading = signal(false);
  protected readonly categoryItems = signal<CategoryApiItem[]>([]);
  protected readonly selectedCategoryIds = signal<Set<string>>(new Set());
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
    this.buildCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), {
      disabled: this.isCategoryToggleLoading() || this.isCategoriesLoading(),
    }),
  );

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
    const currentProductId = this.productId();
    if (!currentProductId || this.isCategoryToggleLoading()) {
      return;
    }

    const categoryId = event.categoryId.trim();
    if (!categoryId) {
      return;
    }

    this.updateSelectedCategory(categoryId, event.checked);
    this.isCategoryToggleLoading.set(true);
    this.productsService
      .toggleCategory(currentProductId, { categoryId, assign: event.checked })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCategoryToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(
            event.checked
              ? PRODUCTS_UPDATE_TEXTS.CATEGORY_ASSIGN_SUCCESS_TITLE
              : PRODUCTS_UPDATE_TEXTS.CATEGORY_UNASSIGN_SUCCESS_TITLE,
          );
        },
        error: () => {
          this.updateSelectedCategory(categoryId, !event.checked);
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.CATEGORY_ASSIGN_ERROR_TITLE,
            PRODUCTS_UPDATE_TEXTS.CATEGORY_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
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
          this.categoryItems.set([]);
          this.selectedCategoryIds.set(new Set());
          return;
        }

        this.loadCategories(shopId);
        this.loadProduct(productId);
      });
  }

  private loadCategories(shopId: string): void {
    this.isCategoriesLoading.set(true);
    this.categoriesService
      .getCategories(shopId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCategoriesLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.categoryItems.set(this.extractCategories(response));
        },
        error: () => {
          this.categoryItems.set([]);
          this.toasterService.danger(
            PRODUCTS_UPDATE_TEXTS.CATEGORIES_LOAD_ERROR_TITLE,
            PRODUCTS_UPDATE_TEXTS.CATEGORIES_LOAD_ERROR_MESSAGE,
          );
        },
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
          this.selectedCategoryIds.set(this.extractProductCategoryIds(product));
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

  private extractCategories(
    response: CategoriesApiResponse | CategoryApiItem[],
  ): CategoryApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.items ?? response.categories ?? response.data ?? [];
  }

  private extractProductCategoryIds(product: ProductApiItem): Set<string> {
    const categoryIds = (product.categories ?? [])
      .map((category) => {
        if (typeof category === 'string') {
          return category.trim();
        }

        return String(category.id ?? '').trim();
      })
      .filter(Boolean);

    return new Set(categoryIds);
  }

  private buildCategoryTreeNodes(
    categories: CategoryApiItem[],
    selectedCategoryIds: Set<string>,
    options?: { disabled?: boolean },
  ): ProductFormCategoryNode[] {
    const normalizedCategories = categories
      .map((category) => this.normalizeCategory(category, selectedCategoryIds, options))
      .filter((category): category is ProductFormCategoryNode & { parentId?: string } =>
        Boolean(category),
      );

    const tree = buildTree(normalizedCategories, {
      getId: (category) => category.id,
      getParentId: (category) => category.parentId?.trim(),
      compareSiblings: (left, right) => left.label.localeCompare(right.label),
    });

    return tree.map((node) => this.mapCategoryTreeNode(node.value, node.children));
  }

  private normalizeCategory(
    category: CategoryApiItem,
    selectedCategoryIds: Set<string>,
    options?: { disabled?: boolean },
  ): (ProductFormCategoryNode & { parentId?: string }) | null {
    const id = String(category.id ?? '').trim();
    if (!id) {
      return null;
    }

    const parentId = String(category.parentId ?? '').trim();

    return {
      id,
      label: category.name?.trim() || `Category ${id}`,
      checked: selectedCategoryIds.has(id),
      disabled: Boolean(options?.disabled),
      ...(parentId && parentId !== id ? { parentId } : {}),
    };
  }

  private mapCategoryTreeNode(
    category: ProductFormCategoryNode & { parentId?: string },
    children: TreeNode<ProductFormCategoryNode & { parentId?: string }>[],
  ): ProductFormCategoryNode {
    return {
      id: category.id,
      label: category.label,
      checked: category.checked,
      ...(category.disabled ? { disabled: category.disabled } : {}),
      ...(children.length
        ? {
            children: children.map((childNode) =>
              this.mapCategoryTreeNode(childNode.value, childNode.children ?? []),
            ),
          }
        : {}),
    };
  }

  private updateSelectedCategory(categoryId: string, checked: boolean): void {
    this.selectedCategoryIds.update((currentValue) => {
      const nextValue = new Set(currentValue);
      if (checked) {
        nextValue.add(categoryId);
      } else {
        nextValue.delete(categoryId);
      }

      return nextValue;
    });
  }
}
