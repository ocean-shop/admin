import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import {
  isPageChangeAllowed,
  prependPageItem,
  removePageItem,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param.helper';
import { matchesSearch } from '@core/helpers/search.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Button } from '@ui/button/button';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterInput } from '@ui/filter-input/filter-input';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { resolveTableRowId } from '@ui/table/helpers/table-row.helper';
import { TableRowData } from '@ui/table/models/table-column.model';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs.helper';
import { TagFormModal } from './components/tag-form-modal/tag-form-modal';
import {
  TAGS_CREATE_ICON,
  TAGS_PAGE_SIZE,
  TAGS_SEARCH_INPUT_ID,
  TAGS_TABLE_COLUMNS,
  TAGS_TEXTS,
} from './constants/tags.constants';
import { mapTag } from './helpers/tag-mapping.helper';
import { TagModalMode, TagModalModeEnum } from './models/tag-modal-mode.type';
import { CreateTagPayload, TagFormSubmitPayload } from './models/tag-payload.model';
import { Tag, TagApiItem, TagListResponse } from './models/tag.model';
import { TagsService } from './services/tags.service';

@Component({
  selector: 'app-tags',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    Button,
    StateMessage,
    FilterBar,
    FilterInput,
    FilterActions,
    Table,
    Pagination,
    TagFormModal,
    ConfirmModal,
  ],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
})
export class Tags {
  private readonly tagsService = inject(TagsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = TAGS_TEXTS;
  protected readonly createTagIcon = TAGS_CREATE_ICON;
  protected readonly searchInputId = TAGS_SEARCH_INPUT_ID;
  protected readonly pageSize = TAGS_PAGE_SIZE;
  protected readonly tableColumns = TAGS_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly currentPage = linkedSignal({ source: this.shopId, computation: () => 1 });
  protected readonly selectedTag = signal<Tag | null>(null);
  protected readonly modalMode = signal<TagModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), TAGS_TEXTS.PAGE_TITLE),
  );

  protected readonly tagsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const name = this.searchName();
    const page = this.currentPage();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.tags(shopId, page, this.pageSize, name)
        : SHOP_QUERY_KEYS.disabled('tags'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.tagsService.getTags({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...(name ? { name } : {}),
          }),
        ),
    };
  });

  protected readonly createTagMutation = injectMutation(() => ({
    mutationFn: (payload: CreateTagPayload) => lastValueFrom(this.tagsService.createTag(payload)),
  }));

  protected readonly deleteTagMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.tagsService.deleteTag(id)),
  }));

  protected readonly isLoading = computed(() => this.tagsQuery.isPending());
  protected readonly hasError = computed(() => this.tagsQuery.isError());
  protected readonly isActionLoading = computed(
    () => this.createTagMutation.isPending() || this.deleteTagMutation.isPending(),
  );
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isSearchDisabled = computed(
    () => !this.isShopContextReady() || this.isLoading(),
  );
  protected readonly tags = computed<Tag[]>(() => {
    const shopId = this.shopId();
    return shopId ? (this.tagsQuery.data()?.items ?? []).map((item) => mapTag(item, shopId)) : [];
  });
  protected readonly tagRows = computed<TableRowData[]>(() =>
    this.tags().map((tag) => ({ id: tag.id, name: tag.name })),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.tagsQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.tagsQuery.data()));
  protected readonly isCreateModalOpen = computed(
    () => this.modalMode() === TagModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === TagModalModeEnum.Delete,
  );

  protected onSearchSubmit(): void {
    const nextSearchName = this.searchInput().trim();
    if (nextSearchName === this.searchName()) {
      return;
    }

    this.searchName.set(nextSearchName);
    this.currentPage.set(1);
  }

  protected onSearchReset(): void {
    this.searchInput.set('');
    if (!this.searchName()) {
      return;
    }

    this.searchName.set('');
    this.currentPage.set(1);
  }

  protected onCreateTag(): void {
    if (!this.isShopContextReady()) {
      return;
    }

    this.selectedTag.set(null);
    this.modalMode.set(TagModalModeEnum.Create);
  }

  protected onDeleteTag(row: TableRowData): void {
    const tagId = resolveTableRowId(row);
    const selectedTag = this.tags().find((tag) => tag.id === tagId);
    if (!selectedTag) {
      return;
    }

    this.selectedTag.set(selectedTag);
    this.modalMode.set(TagModalModeEnum.Delete);
  }

  protected onPageChange(page: number): void {
    if (isPageChangeAllowed(page, this.currentPage(), this.totalPages())) {
      this.currentPage.set(page);
    }
  }

  protected onCloseModal(): void {
    if (!this.isActionLoading()) {
      this.closeModal();
    }
  }

  protected onConfirmCreate(payload: TagFormSubmitPayload): void {
    const shopId = this.shopId();
    if (!shopId || this.isActionLoading()) {
      return;
    }

    this.createTagMutation.mutate(
      { shopId, name: payload.name },
      {
        onSuccess: (createdTag) => {
          this.toasterService.success(TAGS_TEXTS.CREATE_SUCCESS_TITLE);
          this.closeModal();
          this.insertCreatedTag(shopId, createdTag);
          this.invalidateTags(shopId);
        },
      },
    );
  }

  protected onConfirmDelete(): void {
    const selectedTag = this.selectedTag();
    const shopId = this.shopId();
    if (!selectedTag || !shopId || this.isActionLoading()) {
      return;
    }

    this.deleteTagMutation.mutate(selectedTag.id, {
      onSuccess: () => {
        this.toasterService.success(TAGS_TEXTS.DELETE_SUCCESS_TITLE);
        this.closeModal();
        this.queryClient.setQueryData<TagListResponse>(this.currentQueryKey(shopId), (data) =>
          removePageItem(data, selectedTag.id),
        );
        this.currentPage.update((page) => Math.min(page, this.totalPages()));
        this.invalidateTags(shopId);
      },
    });
  }

  private insertCreatedTag(shopId: string, createdTag: TagApiItem): void {
    const mappedTag = mapTag(createdTag, shopId);
    if (!matchesSearch(mappedTag.name, this.searchName())) {
      return;
    }

    this.queryClient.setQueryData<TagListResponse>(this.currentQueryKey(shopId), (data) =>
      prependPageItem<TagApiItem>(data, mappedTag),
    );
  }

  private invalidateTags(shopId: string): void {
    this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.tagsScope(shopId) });
  }

  private currentQueryKey(shopId: string): readonly unknown[] {
    return SHOP_QUERY_KEYS.tags(shopId, this.currentPage(), this.pageSize, this.searchName());
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedTag.set(null);
  }
}
