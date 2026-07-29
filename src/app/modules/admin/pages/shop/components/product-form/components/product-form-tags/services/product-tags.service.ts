import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
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
import { ProductTagsToastTexts } from '../models/product-tags-toast-texts.model';

const TAG_SEARCH_DEBOUNCE_MS = 300;

@Injectable()
export class ProductTagsService {
  private readonly productsService = inject(ProductsService);
  private readonly tagsService = inject(TagsService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

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
    this.productsService
      .toggleTag(productId, { tagId: normalizedTagId, assign: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedTags.update((currentValue) =>
            upsertAssignedTag(currentValue, selectedOption),
          );
          this.tagSearchValue.set('');
          this.tagSearchResults.set([]);
          this.toasterService.success(this.getToastTexts().TAG_ASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.getToastTexts().TAG_ASSIGN_ERROR_TITLE,
            this.getToastTexts().TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
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
    this.productsService
      .toggleTag(productId, { tagId: normalizedTagId, assign: false })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isTagToggleLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.assignedTags.update((currentValue) =>
            removeAssignedTag(currentValue, normalizedTagId),
          );
          this.toasterService.success(this.getToastTexts().TAG_UNASSIGN_SUCCESS_TITLE);
        },
        error: () => {
          this.toasterService.danger(
            this.getToastTexts().TAG_ASSIGN_ERROR_TITLE,
            this.getToastTexts().TAG_ASSIGN_ERROR_MESSAGE,
          );
        },
      });
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
    }, TAG_SEARCH_DEBOUNCE_MS);
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

    this.tagsService
      .getTags({ page: 1, limit: 20, shopId, name })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.searchRequestId) {
            this.isTagSearchLoading.set(false);
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.tagSearchResults.set(mapTagSearchResults(response.items, this.assignedTags()));
        },
        error: () => {
          if (requestId !== this.searchRequestId) {
            return;
          }

          this.tagSearchResults.set([]);
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
      throw new Error('ProductTagsService is not configured.');
    }

    return this.context;
  }
}
