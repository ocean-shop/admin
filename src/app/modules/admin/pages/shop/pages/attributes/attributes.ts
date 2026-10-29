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
import { AttributeFormModal } from './components/attribute-form-modal/attribute-form-modal';
import {
  ATTRIBUTES_CREATE_ICON,
  ATTRIBUTES_PAGE_SIZE,
  ATTRIBUTES_SEARCH_INPUT_ID,
  ATTRIBUTES_TABLE_COLUMNS,
  ATTRIBUTES_TEXTS,
} from './constants/attributes.constants';
import { mapAttribute } from './helpers/attribute-mapping.helper';
import { AttributeModalMode, AttributeModalModeEnum } from './models/attribute-modal-mode.type';
import {
  AttributeFormSubmitPayload,
  CreateAttributePayload,
} from './models/attribute-payload.model';
import { Attribute, AttributeApiItem, AttributeListResponse } from './models/attribute.model';
import { AttributesService } from './services/attributes.service';

@Component({
  selector: 'app-attributes',
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
    AttributeFormModal,
    ConfirmModal,
  ],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss',
})
export class Attributes {
  private readonly attributesService = inject(AttributesService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = ATTRIBUTES_TEXTS;
  protected readonly createAttributeIcon = ATTRIBUTES_CREATE_ICON;
  protected readonly searchInputId = ATTRIBUTES_SEARCH_INPUT_ID;
  protected readonly pageSize = ATTRIBUTES_PAGE_SIZE;
  protected readonly tableColumns = ATTRIBUTES_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly currentPage = linkedSignal({ source: this.shopId, computation: () => 1 });
  protected readonly selectedAttribute = signal<Attribute | null>(null);
  protected readonly modalMode = signal<AttributeModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), ATTRIBUTES_TEXTS.PAGE_TITLE),
  );

  protected readonly attributesQuery = injectQuery(() => {
    const shopId = this.shopId();
    const name = this.searchName();
    const page = this.currentPage();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.attributes(shopId, page, this.pageSize, name)
        : SHOP_QUERY_KEYS.disabled('attributes'),
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

  protected readonly isLoading = computed(() => this.attributesQuery.isPending());
  protected readonly hasError = computed(() => this.attributesQuery.isError());
  protected readonly isActionLoading = computed(
    () => this.createAttributeMutation.isPending() || this.deleteAttributeMutation.isPending(),
  );
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isSearchDisabled = computed(
    () => !this.isShopContextReady() || this.isLoading(),
  );
  protected readonly attributes = computed<Attribute[]>(() => {
    const shopId = this.shopId();
    return shopId
      ? (this.attributesQuery.data()?.items ?? []).map((item) => mapAttribute(item, shopId))
      : [];
  });
  protected readonly attributeRows = computed<TableRowData[]>(() =>
    this.attributes().map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      value: attribute.value,
    })),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.attributesQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.attributesQuery.data()));
  protected readonly isCreateModalOpen = computed(
    () => this.modalMode() === AttributeModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === AttributeModalModeEnum.Delete,
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

  protected onCreateAttribute(): void {
    if (!this.isShopContextReady()) {
      return;
    }

    this.selectedAttribute.set(null);
    this.modalMode.set(AttributeModalModeEnum.Create);
  }

  protected onDeleteAttribute(row: TableRowData): void {
    const attributeId = resolveTableRowId(row);
    const selectedAttribute = this.attributes().find((attribute) => attribute.id === attributeId);
    if (!selectedAttribute) {
      return;
    }

    this.selectedAttribute.set(selectedAttribute);
    this.modalMode.set(AttributeModalModeEnum.Delete);
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

  protected onConfirmCreate(payload: AttributeFormSubmitPayload): void {
    const shopId = this.shopId();
    if (!shopId || this.isActionLoading()) {
      return;
    }

    this.createAttributeMutation.mutate(
      { shopId, name: payload.name, value: payload.value },
      {
        onSuccess: (createdAttribute) => {
          this.toasterService.success(ATTRIBUTES_TEXTS.CREATE_SUCCESS_TITLE);
          this.closeModal();
          this.insertCreatedAttribute(shopId, createdAttribute);
          this.invalidateAttributes(shopId);
        },
      },
    );
  }

  protected onConfirmDelete(): void {
    const selectedAttribute = this.selectedAttribute();
    const shopId = this.shopId();
    if (!selectedAttribute || !shopId || this.isActionLoading()) {
      return;
    }

    this.deleteAttributeMutation.mutate(selectedAttribute.id, {
      onSuccess: () => {
        this.toasterService.success(ATTRIBUTES_TEXTS.DELETE_SUCCESS_TITLE);
        this.closeModal();
        this.queryClient.setQueryData<AttributeListResponse>(this.currentQueryKey(shopId), (data) =>
          removePageItem(data, selectedAttribute.id),
        );
        this.currentPage.update((page) => Math.min(page, this.totalPages()));
        this.invalidateAttributes(shopId);
      },
    });
  }

  private insertCreatedAttribute(shopId: string, createdAttribute: AttributeApiItem): void {
    const mappedAttribute = mapAttribute(createdAttribute, shopId);
    if (!matchesSearch(mappedAttribute.name, this.searchName())) {
      return;
    }

    this.queryClient.setQueryData<AttributeListResponse>(this.currentQueryKey(shopId), (data) =>
      prependPageItem<AttributeApiItem>(data, mappedAttribute),
    );
  }

  private invalidateAttributes(shopId: string): void {
    this.queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEYS.attributesScope(shopId) });
  }

  private currentQueryKey(shopId: string): readonly unknown[] {
    return SHOP_QUERY_KEYS.attributes(shopId, this.currentPage(), this.pageSize, this.searchName());
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedAttribute.set(null);
  }
}
