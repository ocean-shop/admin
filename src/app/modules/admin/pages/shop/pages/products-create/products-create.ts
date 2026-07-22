import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { catchError, concatMap, finalize, from, map, of, reduce } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { buildTree } from '../../helpers/tree.helper';
import { TreeNode } from '../../models/tree-node.model';
import { ProductFormCategoryNode } from '../../components/product-form/models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import {
  PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  PRODUCTS_CREATE_FIELD_IDS,
  PRODUCTS_CREATE_STATIC_ATTRIBUTES,
  PRODUCTS_CREATE_STATIC_TAGS,
  PRODUCTS_CREATE_STATUS_OPTIONS,
  PRODUCTS_CREATE_TEXTS,
} from './constants/products-create.constants';
import { ProductCreateFormModel } from './models/product-create-form.model';
import { CategoriesApiResponse, CategoryApiItem } from '../categories/models/category.model';
import { CategoriesService } from '../categories/services/categories.service';
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
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = PRODUCTS_CREATE_TEXTS;
  protected readonly fieldIds = PRODUCTS_CREATE_FIELD_IDS;
  protected readonly statusOptions = PRODUCTS_CREATE_STATUS_OPTIONS;
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
  protected readonly isCategoriesLoading = signal(false);
  protected readonly categoryItems = signal<CategoryApiItem[]>([]);
  protected readonly selectedCategoryIds = signal<Set<string>>(new Set());

  protected readonly productFormModel = signal<ProductCreateFormModel>({
    ...PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  });
  protected readonly productForm = form(this.productFormModel, (schemaPath) => {
    required(schemaPath.name, { message: PRODUCTS_CREATE_TEXTS.PRODUCT_NAME_REQUIRED });
  });

  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFormValid = computed(() => this.productForm.name().valid());
  protected readonly categoryNodes = computed(() =>
    this.buildCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), {
      disabled: this.isSubmitting() || this.isCategoriesLoading(),
    }),
  );

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
        next: (product) => {
          const createdProductId = String(product.id ?? '').trim();
          this.assignSelectedCategories(createdProductId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((hasAssignmentFailures) => {
              this.toasterService.success(PRODUCTS_CREATE_TEXTS.CREATE_SUCCESS_TITLE);
              if (hasAssignmentFailures) {
                this.toasterService.danger(
                  PRODUCTS_CREATE_TEXTS.CATEGORY_ASSIGN_ERROR_TITLE,
                  PRODUCTS_CREATE_TEXTS.CATEGORY_ASSIGN_ERROR_MESSAGE,
                );
              }

              this.router.navigate(['/admin/shop', payload.shopId, 'products']);
            });
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

  protected onCategoryToggle(event: ProductFormCategoryToggleEvent): void {
    const categoryId = event.categoryId.trim();
    if (!categoryId) {
      return;
    }

    this.selectedCategoryIds.update((currentValue) => {
      const nextValue = new Set(currentValue);
      if (event.checked) {
        nextValue.add(categoryId);
      } else {
        nextValue.delete(categoryId);
      }

      return nextValue;
    });
  }

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        if (!shopId) {
          this.categoryItems.set([]);
          return;
        }

        this.loadCategories(shopId);
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
            PRODUCTS_CREATE_TEXTS.CATEGORIES_LOAD_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.CATEGORIES_LOAD_ERROR_MESSAGE,
          );
        },
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

  private assignSelectedCategories(productId: string) {
    if (!productId) {
      return of(false);
    }

    const categoryIds = [...this.selectedCategoryIds()];
    if (!categoryIds.length) {
      return of(false);
    }

    return from(categoryIds).pipe(
      concatMap((categoryId) =>
        this.productsService.toggleCategory(productId, { categoryId, assign: true }).pipe(
          map(() => false),
          catchError(() => of(true)),
        ),
      ),
      reduce((hasFailures, requestFailed) => hasFailures || requestFailed, false),
    );
  }

  private extractCategories(
    response: CategoriesApiResponse | CategoryApiItem[],
  ): CategoryApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    return response.items ?? response.categories ?? response.data ?? [];
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

    return tree.map((node) => this.mapCategoryTreeNode(node));
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
    node: TreeNode<ProductFormCategoryNode & { parentId?: string }>,
  ): ProductFormCategoryNode {
    return {
      id: node.value.id,
      label: node.value.label,
      checked: node.value.checked,
      ...(node.value.disabled ? { disabled: node.value.disabled } : {}),
      ...(node.children.length
        ? { children: node.children.map((childNode) => this.mapCategoryTreeNode(childNode)) }
        : {}),
    };
  }
}
