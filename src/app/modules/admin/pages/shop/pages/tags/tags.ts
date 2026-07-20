import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize, map, Observable } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Button } from '@ui/button/button';
import { Modal } from '@ui/modal/modal';
import { Pagination } from '@ui/pagination/pagination';
import { Table } from '@ui/table/table';
import { TableColumn, TableRowData } from '@ui/table/models/table-column.model';
import { TAGS_CREATE_ICON, TAGS_PAGE_SIZE, TAGS_TEXTS } from './constants/tags.constants';
import { TagFormModal } from './components/tag-form-modal/tag-form-modal';
import { TagModalMode, TagModalModeEnum } from './models/tag-modal-mode.type';
import { CreateTagPayload, TagFormSubmitPayload } from './models/tag-payload.model';
import { Tag, TagApiItem } from './models/tag.model';
import { TagsService } from './services/tags.service';

@Component({
  selector: 'app-tags',
  imports: [Button, Table, Pagination, Modal, TagFormModal],
  templateUrl: './tags.html',
  styleUrl: './tags.scss',
})
export class Tags implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = TAGS_TEXTS;
  protected readonly createTagIcon = TAGS_CREATE_ICON;
  protected readonly pageSize = TAGS_PAGE_SIZE;
  protected readonly tableColumns: TableColumn[] = [
    { key: 'name', header: TAGS_TEXTS.TABLE_NAME_HEADER },
  ];

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly tags = signal<Tag[]>([]);
  protected readonly shopId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly selectedTag = signal<Tag | null>(null);
  protected readonly modalMode = signal<TagModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

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
    this.loadTags();
  }

  protected onSearchReset(): void {
    this.searchInput.set('');
    if (!this.searchName()) {
      return;
    }

    this.searchName.set('');
    this.currentPage.set(1);
    this.loadTags();
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
    this.loadTags();
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

    this.executeMutation(
      this.tagsService.createTag(createPayload),
      TAGS_TEXTS.CREATE_SUCCESS_TITLE,
    );
  }

  protected onConfirmDelete(): void {
    const selectedTag = this.selectedTag();
    if (!selectedTag || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.tagsService.deleteTag(selectedTag.id),
      TAGS_TEXTS.DELETE_SUCCESS_TITLE,
    );
  }

  private watchShopId(): void {
    this.activatedRoute.paramMap
      .pipe(
        map((params) => params.get('shopId')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((shopId) => {
        this.shopId.set(shopId);
        this.currentPage.set(1);
        this.loadTags();
      });
  }

  private loadTags(): void {
    const shopId = this.shopId();
    if (!shopId) {
      this.tags.set([]);
      this.totalItems.set(0);
      this.totalPages.set(1);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.tagsService
      .getTags({
        page: this.currentPage(),
        limit: this.pageSize,
        shopId,
        ...(this.searchName() ? { name: this.searchName() } : {}),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.tags.set(response.items.map((item) => this.mapTag(item, shopId)));
          this.currentPage.set(Math.max(1, response.page));
          this.totalItems.set(Math.max(0, response.total));
          this.totalPages.set(Math.max(1, response.totalPages));
        },
        error: () => {
          this.hasError.set(true);
        },
      });
  }

  private executeMutation(request$: Observable<unknown>, successTitle: string): void {
    this.isActionLoading.set(true);

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isActionLoading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toasterService.success(successTitle);
          this.closeModal();
          this.loadTags();
        },
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

  private formatDate(value?: string): string {
    if (!value) {
      return TAGS_TEXTS.UNKNOWN_DATE;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return TAGS_TEXTS.UNKNOWN_DATE;
    }

    return date.toISOString().split('T')[0];
  }
}
