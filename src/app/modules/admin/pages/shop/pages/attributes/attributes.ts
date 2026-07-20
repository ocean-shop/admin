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
import {
  ATTRIBUTES_CREATE_ICON,
  ATTRIBUTES_PAGE_SIZE,
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
  imports: [Button, Table, Pagination, Modal, AttributeFormModal],
  templateUrl: './attributes.html',
  styleUrl: './attributes.scss',
})
export class Attributes implements OnInit {
  private readonly attributesService = inject(AttributesService);
  private readonly toasterService = inject(ToasterService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = ATTRIBUTES_TEXTS;
  protected readonly createAttributeIcon = ATTRIBUTES_CREATE_ICON;
  protected readonly pageSize = ATTRIBUTES_PAGE_SIZE;
  protected readonly tableColumns: TableColumn[] = [
    { key: 'name', header: ATTRIBUTES_TEXTS.TABLE_NAME_HEADER },
    { key: 'value', header: ATTRIBUTES_TEXTS.TABLE_VALUE_HEADER },
  ];

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly attributes = signal<Attribute[]>([]);
  protected readonly shopId = signal<string | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly selectedAttribute = signal<Attribute | null>(null);
  protected readonly modalMode = signal<AttributeModalMode>(null);
  protected readonly searchInput = signal('');
  protected readonly searchName = signal('');

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
    this.loadAttributes();
  }

  protected onSearchReset(): void {
    this.searchInput.set('');
    if (!this.searchName()) {
      return;
    }

    this.searchName.set('');
    this.currentPage.set(1);
    this.loadAttributes();
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
    this.loadAttributes();
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
      this.attributesService.createAttribute(createPayload),
      ATTRIBUTES_TEXTS.CREATE_SUCCESS_TITLE,
    );
  }

  protected onConfirmDelete(): void {
    const selectedAttribute = this.selectedAttribute();
    if (!selectedAttribute || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.attributesService.deleteAttribute(selectedAttribute.id),
      ATTRIBUTES_TEXTS.DELETE_SUCCESS_TITLE,
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
        this.loadAttributes();
      });
  }

  private loadAttributes(): void {
    const shopId = this.shopId();
    if (!shopId) {
      this.attributes.set([]);
      this.totalItems.set(0);
      this.totalPages.set(1);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.attributesService
      .getAttributes({
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
          this.attributes.set(response.items.map((item) => this.mapAttribute(item, shopId)));
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
          this.loadAttributes();
        },
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
      name: attribute.name?.trim() || 'Untitled attribute',
      value: attribute.value?.trim() || 'No value',
      ...(attribute.createdAt?.trim() ? { createdAt: attribute.createdAt } : {}),
      ...(attribute.updatedAt?.trim() ? { updatedAt: attribute.updatedAt } : {}),
    };
  }
}
