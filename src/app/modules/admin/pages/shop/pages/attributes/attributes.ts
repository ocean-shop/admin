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
import { TableRowData } from '@ui/table/models/table-column.model';
import { buildShopBreadcrumb } from '../../constants/shop-breadcrumbs.constants';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import {
  ATTRIBUTES_CREATE_ICON,
  ATTRIBUTES_DEFAULT_NAME,
  ATTRIBUTES_DEFAULT_VALUE,
  ATTRIBUTES_PAGE_SIZE,
  ATTRIBUTES_TABLE_COLUMNS,
  ATTRIBUTES_TEXTS,
} from './constants/attributes.constants';
import { AttributeFormModal } from './components/attribute-form-modal/attribute-form-modal';
import { AttributeModalMode, AttributeModalModeEnum } from './models/attribute-modal-mode.type';
import {
  AttributeFormSubmitPayload,
  CreateAttributePayload,
} from './models/attribute-payload.model';
import { Attribute, AttributeApiItem } from './models/attribute.model';
import { AttributesService } from './services/attributes.service';

@Component({
  selector: 'app-attributes',
  imports: [Button, Table, Pagination, Modal, AttributeFormModal, Breadcrumbs],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss',
})
export class Attributes implements OnInit {
  private readonly attributesService = inject(AttributesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = ATTRIBUTES_TEXTS;
  protected readonly createAttributeIcon = ATTRIBUTES_CREATE_ICON;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    { label: this.textData.PAGE_TITLE },
  ]);
  protected readonly pageSize = ATTRIBUTES_PAGE_SIZE;
  protected readonly tableColumns = ATTRIBUTES_TABLE_COLUMNS;

  protected readonly shopId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly selectedAttribute = signal<Attribute | null>(null);
  protected readonly modalMode = signal<AttributeModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

  protected readonly attributesQuery = injectQuery(() => {
    const shopId = this.shopId();
    const name = this.searchName();
    const page = this.currentPage();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.attributes(shopId, page, this.pageSize, name)
        : ['shop', 'attributes', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.attributesService.getAttributes({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            ...(name ? { name } : {}),
          }),
        ),
    };
  });

  protected readonly createAttributeMutation = injectMutation(() => ({
    mutationFn: (payload: CreateAttributePayload) =>
      lastValueFrom(this.attributesService.createAttribute(payload)),
  }));

  protected readonly deleteAttributeMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.attributesService.deleteAttribute(id)),
  }));

  protected readonly isLoading = computed(
    () => this.attributesQuery.isPending() || this.attributesQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.attributesQuery.isError());
  protected readonly isActionLoading = computed(
    () => this.createAttributeMutation.isPending() || this.deleteAttributeMutation.isPending(),
  );
  protected readonly attributes = computed<Attribute[]>(() => {
    const shopId = this.shopId();
    if (!shopId) {
      return [];
    }

    return (this.attributesQuery.data()?.items ?? []).map((item) =>
      this.mapAttribute(item, shopId),
    );
  });
  protected readonly totalItems = computed(() =>
    Math.max(0, this.attributesQuery.data()?.total ?? 0),
  );
  protected readonly totalPages = computed(() =>
    Math.max(1, this.attributesQuery.data()?.totalPages ?? 1),
  );
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isCreateModalOpen = computed(
    () => this.modalMode() === AttributeModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === AttributeModalModeEnum.Delete,
  );
  protected readonly attributeRows = computed<TableRowData[]>(() =>
    this.attributes().map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      value: attribute.value,
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

  protected onCreateAttribute(): void {
    if (!this.isShopContextReady()) {
      return;
    }

    this.selectedAttribute.set(null);
    this.modalMode.set(AttributeModalModeEnum.Create);
  }

  protected onDeleteAttribute(row: TableRowData): void {
    const rowId = row['id'];
    const attributeId = typeof rowId === 'string' ? rowId : '';
    const selectedAttribute = this.attributes().find((attribute) => attribute.id === attributeId);

    if (!selectedAttribute) {
      return;
    }

    this.selectedAttribute.set(selectedAttribute);
    this.modalMode.set(AttributeModalModeEnum.Delete);
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

  protected onConfirmCreate(payload: AttributeFormSubmitPayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    const createPayload: CreateAttributePayload = {
      shopId,
      name: payload.name,
      value: payload.value,
    };

    this.executeMutation(
      this.createAttributeMutation,
      createPayload,
      ATTRIBUTES_TEXTS.CREATE_SUCCESS_TITLE,
    );
  }

  protected onConfirmDelete(): void {
    const selectedAttribute = this.selectedAttribute();
    if (!selectedAttribute || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.deleteAttributeMutation,
      selectedAttribute.id,
      ATTRIBUTES_TEXTS.DELETE_SUCCESS_TITLE,
    );
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
        this.invalidateAttributes();
      },
    });
  }

  private invalidateAttributes(): void {
    const shopId = this.shopId();
    if (!shopId) {
      return;
    }

    this.queryClient.invalidateQueries({
      queryKey: ['shop', shopId, 'attributes'],
    });
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedAttribute.set(null);
  }

  private mapAttribute(attribute: AttributeApiItem, fallbackShopId: string): Attribute {
    return {
      id: attribute.id?.trim() || crypto.randomUUID(),
      shopId: attribute.shopId?.trim() || fallbackShopId,
      name: attribute.name?.trim() || ATTRIBUTES_DEFAULT_NAME,
      value: attribute.value?.trim() || ATTRIBUTES_DEFAULT_VALUE,
      ...(attribute.createdAt?.trim() ? { createdAt: attribute.createdAt } : {}),
      ...(attribute.updatedAt?.trim() ? { updatedAt: attribute.updatedAt } : {}),
    };
  }
}
