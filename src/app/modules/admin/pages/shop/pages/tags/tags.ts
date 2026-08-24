import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Button } from '@ui/button/button';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Modal } from '@ui/modal/modal';
import { Pagination } from '@ui/pagination/pagination';
import { Table } from '@ui/table/table';
import { TableColumn, TableRowData } from '@ui/table/models/table-column.model';
import { buildShopBreadcrumb } from '../../constants/shop-breadcrumbs.constants';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { TAGS_CREATE_ICON, TAGS_PAGE_SIZE, TAGS_TEXTS } from './constants/tags.constants';
import { TagFormModal } from './components/tag-form-modal/tag-form-modal';
import { TagModalMode, TagModalModeEnum } from './models/tag-modal-mode.type';
import { CreateTagPayload, TagFormSubmitPayload } from './models/tag-payload.model';
import { Tag, TagApiItem } from './models/tag.model';
import { TagsService } from './services/tags.service';

@Component({
  selector: 'app-tags',
  imports: [Button, Table, Pagination, Modal, TagFormModal, Breadcrumbs],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
})
export class Tags implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = TAGS_TEXTS;
  protected readonly createTagIcon = TAGS_CREATE_ICON;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    { label: this.textData.PAGE_TITLE },
  ]);
  protected readonly pageSize = TAGS_PAGE_SIZE;
  protected readonly tableColumns: TableColumn[] = [
    { key: 'name', header: TAGS_TEXTS.TABLE_NAME_HEADER },
  ];

  protected readonly shopId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly selectedTag = signal<Tag | null>(null);
  protected readonly modalMode = signal<TagModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

  protected readonly tagsQuery = injectQuery(() => {
    const shopId = this.shopId();
    const name = this.searchName();
    const page = this.currentPage();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.tags(shopId, page, this.pageSize, name)
        : ['shop', 'tags', 'missing-shop-id'],
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

  protected readonly isLoading = computed(
    () => this.tagsQuery.isPending() || this.tagsQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.tagsQuery.isError());
  protected readonly isActionLoading = computed(
    () => this.createTagMutation.isPending() || this.deleteTagMutation.isPending(),
  );
  protected readonly tags = computed<Tag[]>(() => {
    const shopId = this.shopId();
    if (!shopId) {
      return [];
    }

    return (this.tagsQuery.data()?.items ?? []).map((item) => this.mapTag(item, shopId));
  });
  protected readonly totalItems = computed(() => Math.max(0, this.tagsQuery.data()?.total ?? 0));
  protected readonly totalPages = computed(() =>
    Math.max(1, this.tagsQuery.data()?.totalPages ?? 1),
  );
  protected readonly hasTags = computed(() => this.tags().length > 0);
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isCreateModalOpen = computed(
    () => this.modalMode() === TagModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === TagModalModeEnum.Delete,
  );
  protected readonly tagRows = computed<TableRowData[]>(() =>
    this.tags().map((tag) => ({
      id: tag.id,
      name: tag.name,
    })),
  );

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchInput.set(target?.value ?? '');
  }

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
    const rowId = row['id'];
    const tagId = typeof rowId === 'string' ? rowId : '';
    const selectedTag = this.tags().find((tag) => tag.id === tagId);

    if (!selectedTag) {
      return;
    }

    this.selectedTag.set(selectedTag);
    this.modalMode.set(TagModalModeEnum.Delete);
  }

  protected onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  protected onCloseModal(): void {
    if (this.isActionLoading()) {
      return;
    }

    this.closeModal();
  }

  protected onConfirmCreate(payload: TagFormSubmitPayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    const createPayload: CreateTagPayload = {
      shopId,
      name: payload.name,
    };

    this.executeMutation(this.createTagMutation, createPayload, TAGS_TEXTS.CREATE_SUCCESS_TITLE);
  }

  protected onConfirmDelete(): void {
    const selectedTag = this.selectedTag();
    if (!selectedTag || this.isActionLoading()) {
      return;
    }

    this.executeMutation(this.deleteTagMutation, selectedTag.id, TAGS_TEXTS.DELETE_SUCCESS_TITLE);
  }

  private watchShopId(): void {
    const initialShopId = this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null;
    this.shopId.set(initialShopId);
    this.currentPage.set(1);

    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.currentPage.set(1);
      });
  }

  private executeMutation<T>(
    mutation: { mutate: (payload: T, options?: { onSuccess?: () => void }) => void },
    payload: T,
    successTitle: string,
  ): void {
    mutation.mutate(payload, {
      onSuccess: () => {
        this.toasterService.success(successTitle);
        this.closeModal();
        this.invalidateTags();
      },
    });
  }

  private invalidateTags(): void {
    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'tags'],
    });
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedTag.set(null);
  }

  private mapTag(tag: TagApiItem, fallbackShopId: string): Tag {
    return {
      id: tag.id?.trim() || crypto.randomUUID(),
      shopId: tag.shopId?.trim() || fallbackShopId,
      name: tag.name?.trim() || 'Untitled tag',
      ...(tag.createdAt?.trim() ? { createdAt: tag.createdAt } : {}),
      ...(tag.updatedAt?.trim() ? { updatedAt: tag.updatedAt } : {}),
    };
  }
}
