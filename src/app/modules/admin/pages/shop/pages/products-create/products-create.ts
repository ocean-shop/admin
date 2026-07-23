import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { finalize, map } from 'rxjs';
import { Button } from '@ui/button/button';
import { RadioGroupOption } from '@ui/radio-group/models/radio-group-option.model';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { buildTree } from '../../helpers/tree.helper';
import { TreeNode } from '../../models/tree-node.model';
import { ProductFormAssignedAttribute } from '../../components/product-form/models/product-form-assigned-attribute.model';
import { ProductFormAssignedTag } from '../../components/product-form/models/product-form-assigned-tag.model';
import { ProductFormAttributeOption } from '../../components/product-form/models/product-form-attribute-option.model';
import { ProductFormTagOption } from '../../components/product-form/models/product-form-tag-option.model';
import { ProductFormCategoryNode } from '../../components/product-form/models/product-form-category-node.model';
import { ProductFormCategoryToggleEvent } from '../../components/product-form/models/product-form-category-toggle-event.model';
import {
  PRODUCTS_CREATE_DEFAULT_FORM_VALUE,
  PRODUCTS_CREATE_FIELD_IDS,
  PRODUCTS_CREATE_STATUS_OPTIONS,
  PRODUCTS_CREATE_TEXTS,
} from './constants/products-create.constants';
import { ProductCreateFormModel } from './models/product-create-form.model';
import { AttributeApiItem } from '../attributes/models/attribute.model';
import { AttributesService } from '../attributes/services/attributes.service';
import { CategoriesApiResponse, CategoryApiItem } from '../categories/models/category.model';
import { CategoriesService } from '../categories/services/categories.service';
import { TagApiItem } from '../tags/models/tag.model';
import { TagsService } from '../tags/services/tags.service';
import { CreateProductPayload } from './models/product-create-payload.model';
import { ProductType } from '../products/models/product-type.enum';
import { ProductsService } from '../products/services/products.service';
import { UpdateProductPayload } from '../products/models/update-product-payload.model';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-products-create',
  imports: [Button, ProductForm],
  templateUrl: './products-create.html',
  styleUrl: './products-create.scss',
})
export class ProductsCreate implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly attributesService = inject(AttributesService);
  private readonly tagsService = inject(TagsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private attributeSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private attributeSearchRequestId = 0;
  private tagSearchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private tagSearchRequestId = 0;

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
  protected readonly isCategoriesLoading = signal(false);
  protected readonly isCategoryToggleLoading = signal(false);
  protected readonly isAttributeSearchLoading = signal(false);
  protected readonly isAttributeToggleLoading = signal(false);
  protected readonly isTagSearchLoading = signal(false);
  protected readonly isTagToggleLoading = signal(false);
  protected readonly createdProductId = signal<string | null>(null);
  protected readonly categoryItems = signal<CategoryApiItem[]>([]);
  protected readonly selectedCategoryIds = signal<Set<string>>(new Set());
  protected readonly attributeSearchValue = signal('');
  protected readonly attributeSearchResults = signal<ProductFormAttributeOption[]>([]);
  protected readonly assignedAttributes = signal<ProductFormAssignedAttribute[]>([]);
  protected readonly tagSearchValue = signal('');
  protected readonly tagSearchResults = signal<ProductFormTagOption[]>([]);
  protected readonly assignedTags = signal<ProductFormAssignedTag[]>([]);

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
    this.buildCategoryTreeNodes(this.categoryItems(), this.selectedCategoryIds(), {
      disabled:
        this.isSidebarDisabled() ||
        this.isSubmitting() ||
        this.isCategoriesLoading() ||
        this.isCategoryToggleLoading(),
    }),
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearAttributeSearchDebounce();
      this.clearTagSearchDebounce();
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
    if (this.isSidebarDisabled() || this.isCategoryToggleLoading()) {
      return;
    }

    const currentProductId = this.createdProductId();
    if (!currentProductId) {
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
              ? PRODUCTS_CREATE_TEXTS.CATEGORY_ASSIGN_SUCCESS_TITLE
              : PRODUCTS_CREATE_TEXTS.CATEGORY_UNASSIGN_SUCCESS_TITLE,
          );
        },
        error: () => {
          this.updateSelectedCategory(categoryId, !event.checked);
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.CATEGORY_ASSIGN_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.CATEGORY_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  protected onAttributeSearchChange(value: string): void {
    this.attributeSearchValue.set(value);
    if (this.isSidebarDisabled()) {
      this.attributeSearchResults.set([]);
      return;
    }

    this.queueAttributeSearch();
  }

  protected onAttributeAssign(attributeId: string): void {
    if (this.isSidebarDisabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const currentProductId = this.createdProductId();
    if (!currentProductId) {
      return;
    }

    const selectedOption = this.attributeSearchResults().find(
      (option) => option.id === attributeId,
    );
    if (!selectedOption) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(currentProductId, { attributeTypeId: attributeId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.upsertAssignedAttribute(selectedOption);
          this.attributeSearchValue.set('');
          this.attributeSearchResults.set([]);
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.ATTRIBUTE_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.ATTRIBUTE_ASSIGN_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  protected onAttributeUnassign(attributeId: string): void {
    if (this.isSidebarDisabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const currentProductId = this.createdProductId();
    if (!currentProductId) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(currentProductId, { attributeTypeId: attributeId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedAttributes.update((currentValue) =>
            currentValue.filter((attribute) => attribute.id !== attributeId),
          );
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.ATTRIBUTE_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.ATTRIBUTE_ASSIGN_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  protected onTagSearchChange(value: string): void {
    this.tagSearchValue.set(value);
    if (this.isSidebarDisabled()) {
      this.tagSearchResults.set([]);
      return;
    }

    this.queueTagSearch();
  }

  protected onTagAssign(tagId: string): void {
    if (this.isSidebarDisabled() || this.isTagToggleLoading()) {
      return;
    }

    const currentProductId = this.createdProductId();
    if (!currentProductId) {
      return;
    }

    const selectedOption = this.tagSearchResults().find((option) => option.id === tagId);
    if (!selectedOption) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.productsService
      .toggleTag(currentProductId, { tagId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.upsertAssignedTag(selectedOption);
          this.tagSearchValue.set('');
          this.tagSearchResults.set([]);
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  protected onTagUnassign(tagId: string): void {
    if (this.isSidebarDisabled() || this.isTagToggleLoading()) {
      return;
    }

    const currentProductId = this.createdProductId();
    if (!currentProductId) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.productsService
      .toggleTag(currentProductId, { tagId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedTags.update((currentValue) =>
            currentValue.filter((currentTag) => currentTag.id !== tagId),
          );
          this.toasterService.success(PRODUCTS_CREATE_TEXTS.TAG_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_TITLE,
            PRODUCTS_CREATE_TEXTS.TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
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
        this.createdProductId.set(null);
        this.selectedCategoryIds.set(new Set());
        this.assignedAttributes.set([]);
        this.assignedTags.set([]);
        this.attributeSearchValue.set('');
        this.attributeSearchResults.set([]);
        this.tagSearchValue.set('');
        this.tagSearchResults.set([]);
        this.clearAttributeSearchDebounce();
        this.clearTagSearchDebounce();

        if (!shopId) {
          this.categoryItems.set([]);
          return;
        }

        this.loadCategories(shopId);
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

  private buildCreatePayload(): CreateProductPayload | null {
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

  private buildUpdatePayload(): UpdateProductPayload | null {
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

  private queueAttributeSearch(): void {
    this.clearAttributeSearchDebounce();

    const shopId = this.shopId();
    const searchName = this.attributeSearchValue().trim();
    if (!shopId || !searchName) {
      this.isAttributeSearchLoading.set(false);
      this.attributeSearchResults.set([]);
      return;
    }

    this.attributeSearchDebounceTimer = setTimeout(() => {
      this.loadAttributeSearchResults(shopId, searchName);
    }, 300);
  }

  private clearAttributeSearchDebounce(): void {
    if (this.attributeSearchDebounceTimer) {
      clearTimeout(this.attributeSearchDebounceTimer);
      this.attributeSearchDebounceTimer = null;
    }
  }

  private queueTagSearch(): void {
    this.clearTagSearchDebounce();

    const shopId = this.shopId();
    const searchName = this.tagSearchValue().trim();
    if (!shopId || !searchName) {
      this.isTagSearchLoading.set(false);
      this.tagSearchResults.set([]);
      return;
    }

    this.tagSearchDebounceTimer = setTimeout(() => {
      this.loadTagSearchResults(shopId, searchName);
    }, 300);
  }

  private clearTagSearchDebounce(): void {
    if (this.tagSearchDebounceTimer) {
      clearTimeout(this.tagSearchDebounceTimer);
      this.tagSearchDebounceTimer = null;
    }
  }

  private loadAttributeSearchResults(shopId: string, name: string): void {
    const requestId = ++this.attributeSearchRequestId;
    this.isAttributeSearchLoading.set(true);

    this.attributesService
      .getAttributes({
        page: 1,
        limit: 20,
        shopId,
        name,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.attributeSearchRequestId) {
            this.isAttributeSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.attributeSearchRequestId) {
            return;
          }

          this.attributeSearchResults.set(this.mapAttributeSearchResults(response.items));
        },
        error: () => {
          if (requestId !== this.attributeSearchRequestId) {
            return;
          }

          this.attributeSearchResults.set([]);
        },
      });
  }

  private mapAttributeSearchResults(items: AttributeApiItem[]): ProductFormAttributeOption[] {
    const assignedIds = new Set(this.assignedAttributes().map((attribute) => attribute.id));
    const options: ProductFormAttributeOption[] = [];
    for (const item of items) {
      const id = String(item.id ?? '').trim();
      if (!id || assignedIds.has(id)) {
        continue;
      }

      const name = item.name?.trim() ?? '';
      const value = item.value?.trim() ?? '';
      const label = value ? `${name || 'Атрибут'}: ${value}` : name || 'Атрибут';
      options.push({ id, label });
    }

    return options;
  }

  private loadTagSearchResults(shopId: string, name: string): void {
    const requestId = ++this.tagSearchRequestId;
    this.isTagSearchLoading.set(true);

    this.tagsService
      .getTags({
        page: 1,
        limit: 20,
        shopId,
        name,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.tagSearchRequestId) {
            this.isTagSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.tagSearchRequestId) {
            return;
          }

          this.tagSearchResults.set(this.mapTagSearchResults(response.items));
        },
        error: () => {
          if (requestId !== this.tagSearchRequestId) {
            return;
          }

          this.tagSearchResults.set([]);
        },
      });
  }

  private upsertAssignedAttribute(attribute: ProductFormAttributeOption): void {
    this.assignedAttributes.update((currentValue) => {
      if (currentValue.some((currentAttribute) => currentAttribute.id === attribute.id)) {
        return currentValue;
      }

      return [...currentValue, { id: attribute.id, label: attribute.label }];
    });
  }

  private mapTagSearchResults(items: TagApiItem[]): ProductFormTagOption[] {
    const assignedIds = new Set(this.assignedTags().map((tag) => tag.id));
    const options: ProductFormTagOption[] = [];
    for (const item of items) {
      const id = String(item.id ?? '').trim();
      if (!id || assignedIds.has(id)) {
        continue;
      }

      const label = item.name?.trim() || 'Тег';
      options.push({ id, label });
    }

    return options;
  }

  private upsertAssignedTag(tag: ProductFormTagOption): void {
    this.assignedTags.update((currentValue) => {
      if (currentValue.some((currentTag) => currentTag.id === tag.id)) {
        return currentValue;
      }

      return [...currentValue, { id: tag.id, label: tag.label }];
    });
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
