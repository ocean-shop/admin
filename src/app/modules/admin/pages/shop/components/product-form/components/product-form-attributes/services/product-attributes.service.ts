import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import {
  mapAttributeSearchResults,
  removeAssignedAttribute,
  upsertAssignedAttribute,
} from '../../../../../helpers/product-search-results.helper';
import { AttributesService } from '../../../../../pages/attributes/services/attributes.service';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { ProductFormAssignedAttribute } from '../../../models/product-form-assigned-attribute.model';
import { ProductFormAttributeOption } from '../../../models/product-form-attribute-option.model';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductAttributesToastTexts } from '../models/product-attributes-toast-texts.model';

const ATTRIBUTE_SEARCH_DEBOUNCE_MS = 300;

@Injectable()
export class ProductAttributesService {
  private readonly productsService = inject(ProductsService);
  private readonly attributesService = inject(AttributesService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private context: ProductFormEditorContext | null = null;
  private getToastTexts: () => ProductAttributesToastTexts = () => {
    throw new Error('ProductAttributesService is not configured.');
  };
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private searchRequestId = 0;

  readonly isAttributeSearchLoading = signal(false);
  readonly isAttributeToggleLoading = signal(false);
  readonly attributeSearchValue = signal('');
  readonly attributeSearchResults = signal<ProductFormAttributeOption[]>([]);
  readonly assignedAttributes = signal<ProductFormAssignedAttribute[]>([]);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSearchDebounce());
  }

  configure(
    context: ProductFormEditorContext,
    getToastTexts: () => ProductAttributesToastTexts,
  ): void {
    this.context = context;
    this.getToastTexts = getToastTexts;
  }

  setAssignedAttributes(assignedAttributes: ProductFormAssignedAttribute[]): void {
    this.assignedAttributes.set(assignedAttributes);
    this.attributeSearchValue.set('');
    this.attributeSearchResults.set([]);
    this.clearSearchDebounce();
    this.searchRequestId = 0;
  }

  onAttributeSearchChange(value: string): void {
    this.attributeSearchValue.set(value);
    if (!this.isSidebarEnabled()) {
      this.attributeSearchResults.set([]);
      return;
    }

    this.queueAttributeSearch();
  }

  onAttributeAssign(attributeId: string): void {
    if (!this.isSidebarEnabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    const selectedOption = this.attributeSearchResults().find(
      (option) => option.id === normalizedAttributeId,
    );
    if (!selectedOption) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(productId, { attributeTypeId: normalizedAttributeId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedAttributes.update((currentValue) =>
            upsertAssignedAttribute(currentValue, selectedOption),
          );
          this.attributeSearchValue.set('');
          this.attributeSearchResults.set([]);
          this.toasterService.success(this.getToastTexts().ATTRIBUTE_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  onAttributeUnassign(attributeId: string): void {
    if (!this.isSidebarEnabled() || this.isAttributeToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const normalizedAttributeId = attributeId.trim();
    if (!normalizedAttributeId) {
      return;
    }

    this.isAttributeToggleLoading.set(true);
    this.productsService
      .toggleAttribute(productId, { attributeTypeId: normalizedAttributeId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isAttributeToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedAttributes.update((currentValue) =>
            removeAssignedAttribute(currentValue, normalizedAttributeId),
          );
          this.toasterService.success(this.getToastTexts().ATTRIBUTE_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
  }

  private queueAttributeSearch(): void {
    this.clearSearchDebounce();

    const shopId = this.getShopId();
    const searchName = this.attributeSearchValue().trim();
    if (!shopId || !searchName) {
      this.isAttributeSearchLoading.set(false);
      this.attributeSearchResults.set([]);
      return;
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.loadAttributeSearchResults(shopId, searchName);
    }, ATTRIBUTE_SEARCH_DEBOUNCE_MS);
  }

  private clearSearchDebounce(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  private loadAttributeSearchResults(shopId: string, name: string): void {
    const requestId = ++this.searchRequestId;
    this.isAttributeSearchLoading.set(true);

    this.attributesService
      .getAttributes({ page: 1, limit: 20, shopId, name })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.searchRequestId) {
            this.isAttributeSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.attributeSearchResults.set(
            mapAttributeSearchResults(response.items, this.assignedAttributes()),
          );
        },
        error: () => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.attributeSearchResults.set([]);
        },
      });
  }

  private getShopId(): string | null {
    return this.requireContext().getShopId()?.trim() || null;
  }

  private getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  private isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error('ProductAttributesService is not configured.');
    }

    return this.context;
  }
}
