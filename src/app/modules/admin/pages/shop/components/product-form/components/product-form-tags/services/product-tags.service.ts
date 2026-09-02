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
  mapTagSearchResults,
  removeAssignedTag,
  upsertAssignedTag,
} from '../../../../../helpers/product-search-results.helper';
import { ProductsService } from '../../../../../pages/products/services/products.service';
import { TagsService } from '../../../../../pages/tags/services/tags.service';
import { ProductFormAssignedTag } from '../../../models/product-form-assigned-tag.model';
import { ProductFormEditorContext } from '../../../models/product-form-editor-context.model';
import { ProductFormTagOption } from '../../../models/product-form-tag-option.model';
import { ProductToggleTagMutationPayload } from '../models/product-toggle-tag-mutation-payload.model';
import { ProductTagsToastTexts } from '../models/product-tags-toast-texts.model';

@Injectable()
export class ProductTagsService {
  private readonly productsService = inject(ProductsService);
  private readonly tagsService = inject(TagsService);
  private readonly queryClient = injectQueryClient();
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly toggleTagMutation = injectMutation(() => ({
    mutationFn: (payload: ProductToggleTagMutationPayload) =>
      lastValueFrom(
        this.productsService.toggleTag(payload.productId, {
          tagId: payload.tagId,
          assign: payload.assign,
        }),
      ),
  }));

  private context: ProductFormEditorContext | null = null;
  private getToastTexts: () => ProductTagsToastTexts = () => {
    throw new Error('ProductTagsService is not configured.');
  };
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private searchRequestId = 0;

  readonly isTagSearchLoading = signal(false);
  readonly isTagToggleLoading = signal(false);
  readonly tagSearchValue = signal('');
  readonly tagSearchResults = signal<ProductFormTagOption[]>([]);
  readonly assignedTags = signal<ProductFormAssignedTag[]>([]);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearSearchDebounce());
  }

  configure(context: ProductFormEditorContext, getToastTexts: () => ProductTagsToastTexts): void {
    this.context = context;
    this.getToastTexts = getToastTexts;
  }

  setAssignedTags(assignedTags: ProductFormAssignedTag[]): void {
    this.assignedTags.set(assignedTags);
    this.tagSearchValue.set('');
    this.tagSearchResults.set([]);
    this.clearSearchDebounce();
    this.searchRequestId = 0;
  }

  onTagSearchChange(value: string): void {
    this.tagSearchValue.set(value);
    if (!this.isSidebarEnabled()) {
      this.tagSearchResults.set([]);
      return;
    }

    this.queueTagSearch();
  }

  onTagAssign(tagId: string): void {
    if (!this.isSidebarEnabled() || this.isTagToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const normalizedTagId = tagId.trim();
    const selectedOption = this.tagSearchResults().find((option) => option.id === normalizedTagId);
    if (!selectedOption) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.toggleTagMutation.mutate(
      { productId, tagId: normalizedTagId, assign: true },
      {
        onSuccess: () => {
          this.invalidateProductQueries(productId);
          this.assignedTags.update((currentValue) =>
            upsertAssignedTag(currentValue, selectedOption),
          );
          this.tagSearchValue.set('');
          this.tagSearchResults.set([]);
          this.toasterService.success(this.getToastTexts().TAG_ASSIGN_SUCCESS_TITLE);
        },
        onError: () => {
          this.toasterService.danger(
            this.getToastTexts().TAG_ASSIGN_ERROR_TITLE,
            this.getToastTexts().TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.isTagToggleLoading.set(false);
        },
      },
    );
  }

  onTagUnassign(tagId: string): void {
    if (!this.isSidebarEnabled() || this.isTagToggleLoading()) {
      return;
    }

    const productId = this.getProductId();
    if (!productId) {
      return;
    }

    const normalizedTagId = tagId.trim();
    if (!normalizedTagId) {
      return;
    }

    this.isTagToggleLoading.set(true);
    this.toggleTagMutation.mutate(
      { productId, tagId: normalizedTagId, assign: false },
      {
        onSuccess: () => {
          this.invalidateProductQueries(productId);
          this.assignedTags.update((currentValue) =>
            removeAssignedTag(currentValue, normalizedTagId),
          );
          this.toasterService.success(this.getToastTexts().TAG_UNASSIGN_SUCCESS_TITLE);
        },
        onError: () => {
          this.toasterService.danger(
            this.getToastTexts().TAG_ASSIGN_ERROR_TITLE,
            this.getToastTexts().TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
        onSettled: () => {
          this.isTagToggleLoading.set(false);
        },
      },
    );
  }

  private queueTagSearch(): void {
    this.clearSearchDebounce();

    const shopId = this.getShopId();
    const searchName = this.tagSearchValue().trim();
    if (!shopId || !searchName) {
      this.isTagSearchLoading.set(false);
      this.tagSearchResults.set([]);
      return;
    }

    this.searchDebounceTimer = setTimeout(() => {
      this.loadTagSearchResults(shopId, searchName);
    }, PRODUCT_FORM_SEARCH_DEBOUNCE_MS);
  }

  private clearSearchDebounce(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
  }

  private loadTagSearchResults(shopId: string, name: string): void {
    const requestId = ++this.searchRequestId;
    this.isTagSearchLoading.set(true);

    this.queryClient
      .fetchQuery({
        queryKey: SHOP_QUERY_KEYS.tagsSearch(shopId, name),
        queryFn: () =>
          lastValueFrom(
            this.tagsService.getTags({
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

        this.tagSearchResults.set(mapTagSearchResults(response.items, this.assignedTags()));
      })
      .catch(() => {
        if (requestId !== this.searchRequestId) {
          return;
        }

        this.tagSearchResults.set([]);
      })
      .finally(() => {
        if (requestId === this.searchRequestId) {
          this.isTagSearchLoading.set(false);
        }
      });
  }

  private getShopId(): string | null {
    return this.requireContext().getShopId()?.trim() || null;
  }

  private getProductId(): string | null {
    return this.requireContext().getProductId()?.trim() || null;
  }

  private invalidateProductQueries(productId: string): void {
    this.queryClient.invalidateQueries({
      queryKey: SHOP_QUERY_KEYS.productById(productId),
    });

    const shopId = this.getShopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'products'],
    });
  }

  private isSidebarEnabled(): boolean {
    return this.requireContext().isSidebarEnabled();
  }

  private requireContext(): ProductFormEditorContext {
    if (!this.context) {
      throw new Error('ProductTagsService is not configured.');
    }

    return this.context;
  }
}
