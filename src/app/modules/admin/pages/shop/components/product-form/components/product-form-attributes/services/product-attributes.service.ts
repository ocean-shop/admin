import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { SHOP_QUERY_KEYS } from '../../../../../constants/shop-query-keys.constants';
import {
  PRODUCT_FORM_SEARCH_DEBOUNCE_MS,
  PRODUCT_FORM_SEARCH_QUERY_LIMIT,
  PRODUCT_FORM_SEARCH_QUERY_PAGE,
} from '../../../constants/product-form.constants';
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
import { ProductToggleAttributeMutationPayload } from '../models/product-toggle-attribute-mutation-payload.model';
import { ProductAttributesToastTexts } from '../models/product-attributes-toast-texts.model';

@Injectable()
export class ProductAttributesService {
  private readonly productsService = inject(ProductsService);
  private readonly attributesService = inject(AttributesService);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly toggleAttributeMutation = injectMutation(() => ({
    mutationFn: (payload: ProductToggleAttributeMutationPayload) =>
      lastValueFrom(
        this.productsService.toggleAttribute(payload.productId, {
          attributeTypeId: payload.attributeTypeId,
          assign: payload.assign,
        }),
      ),
  }));

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
    this.toggleAttributeMutation.mutate(
      { productId, attributeTypeId: normalizedAttributeId, assign: true },
      {
        onSuccess: () => {
          this.assignedAttributes.update((currentValue) =>
            upsertAssignedAttribute(currentValue, selectedOption),
          );
          this.attributeSearchValue.set('');
          this.attributeSearchResults.set([]);
          this.toasterService.success(this.getToastTexts().ATTRIBUTE_ASSIGN_SUCCESS_TITLE);
        },
        onError: () => {
          this.toasterService.danger(
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.isAttributeToggleLoading.set(false);
        },
      },
    );
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
    this.toggleAttributeMutation.mutate(
      { productId, attributeTypeId: normalizedAttributeId, assign: false },
      {
        onSuccess: () => {
          this.assignedAttributes.update((currentValue) =>
            removeAssignedAttribute(currentValue, normalizedAttributeId),
          );
          this.toasterService.success(this.getToastTexts().ATTRIBUTE_UNASSIGN_SUCCESS_TITLE);
        },
        onError: () => {
          this.toasterService.danger(
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_TITLE,
            this.getToastTexts().ATTRIBUTE_ASSIGN_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.isAttributeToggleLoading.set(false);
        },
      },
    );
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
    }, PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
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

    this.queryClient
      .fetchQuery({
        queryKey: SHOP_QUERY_KEYS.attributesSearch(shopId, name),
        queryFn: () =>
          lastValueFrom(
            this.attributesService.getAttributes({
              page: PRODUCT_FORM_SEARCH_QUERY_PAGE,
              limit: PRODUCT_FORM_SEARCH_QUERY_LIMIT,
              shopId,
              name,
            }),
          ),
      })
      .then((response) => {
        if (requestId !== this.searchRequestId) {
          return;
        }

        this.attributeSearchResults.set(
          mapAttributeSearchResults(response.items, this.assignedAttributes()),
        );
      })
      .catch(() => {
        if (requestId !== this.searchRequestId) {
          return;
        }

        this.attributeSearchResults.set([]);
      })
      .finally(() => {
        if (requestId === this.searchRequestId) {
          this.isAttributeSearchLoading.set(false);
        }
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
