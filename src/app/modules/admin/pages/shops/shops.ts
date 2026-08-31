import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Observable } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Button } from '@ui/button/button';
import { EntityCard, EntityCardData } from '@ui/entity-card/entity-card';
import { Modal } from '@ui/modal/modal';
import { Pagination } from '@ui/pagination/pagination';
import { ShopsFormModal } from './components/shops-form-modal/shops-form-modal';
import { SHOPS_CREATE_ICON, SHOPS_PAGE_SIZE, SHOPS_TEXTS } from './constants/shops.constants';
import {
  Shop as ShopModel,
  ShopApiItem,
  ShopsApiResponse,
  ShopsPagination,
} from './models/shop.model';
import { ShopsMappedResponse } from './models/shops-mapped-response.model';
import { ShopModalMode, ShopModalModeEnum } from './models/shop-modal-mode.type';
import { ShopCreatePayload } from './models/shop-payload.model';
import { ShopsService } from './services/shops.service';

@Component({
  selector: 'app-shops',
  imports: [Button, EntityCard, Pagination, Modal, ShopsFormModal],
  templateUrl: './shops.html',
  styleUrl: './shops.scss',
})
export class Shops implements OnInit {
  private readonly shopsService = inject(ShopsService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = SHOPS_TEXTS;
  protected readonly createShopIcon = SHOPS_CREATE_ICON;
  protected readonly SHOPS_PAGE_SIZE = SHOPS_PAGE_SIZE;

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly shops = signal<ShopModel[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(SHOPS_PAGE_SIZE);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly selectedShop = signal<ShopModel | null>(null);
  protected readonly modalMode = signal<ShopModalMode>(null);
  protected readonly hasShops = computed(() => this.shops().length > 0);
  protected readonly shopCards = computed(() =>
    this.shops().map((shop) => ({
      id: shop.id,
      title: shop.name,
      subtitle: shop.description || '',
      detail: shop.url || '',
      badge: this.resolveUpdatedBadge(shop.createdAt || ''),
    })),
  );
  protected readonly isFormModalOpen = computed(() => {
    const mode = this.modalMode();
    return mode === ShopModalModeEnum.Create || mode === ShopModalModeEnum.Update;
  });
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === ShopModalModeEnum.Delete,
  );
  protected readonly formModalMode = computed(() => {
    const mode = this.modalMode();
    return mode === ShopModalModeEnum.Create || mode === ShopModalModeEnum.Update
      ? mode
      : ShopModalModeEnum.Create;
  });

  ngOnInit(): void {
    this.loadShops();
  }

  protected onCreateShop(): void {
    this.selectedShop.set(null);
    this.modalMode.set(ShopModalModeEnum.Create);
  }

  protected onEditShop(shopCard: EntityCardData): void {
    const selectedShop = this.shops().find((shop) => shop.id === shopCard.id);
    if (!selectedShop) {
      return;
    }

    this.selectedShop.set(selectedShop);
    this.modalMode.set(ShopModalModeEnum.Update);
  }

  protected onDeleteShop(shopCard: EntityCardData): void {
    const selectedShop = this.shops().find((shop) => shop.id === shopCard.id);
    if (!selectedShop) {
      return;
    }

    this.selectedShop.set(selectedShop);
    this.modalMode.set(ShopModalModeEnum.Delete);
  }

  protected onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadShops();
  }

  protected onCloseModal(): void {
    if (this.isActionLoading()) {
      return;
    }

    this.closeModal();
  }

  protected onConfirmFormModal(payload: ShopCreatePayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const mode = this.modalMode();
    if (mode === ShopModalModeEnum.Create) {
      this.executeMutation(this.shopsService.createShop(payload), SHOPS_TEXTS.CREATE_SUCCESS_TITLE);
      return;
    }

    const selectedShop = this.selectedShop();
    if (mode === ShopModalModeEnum.Update && selectedShop) {
      this.executeMutation(
        this.shopsService.updateShop(selectedShop.id, payload),
        SHOPS_TEXTS.UPDATE_SUCCESS_TITLE,
      );
    }
  }

  protected onConfirmDelete(): void {
    const selectedShop = this.selectedShop();
    if (!selectedShop || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.shopsService.deleteShop(selectedShop.id),
      SHOPS_TEXTS.DELETE_SUCCESS_TITLE,
    );
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedShop.set(null);
  }

  private loadShops(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.shopsService
      .getShops({
        page: this.currentPage(),
        limit: this.pageSize(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const mappedResponse = this.mapShopsResponse(response);
          this.shops.set(mappedResponse.shops);
          this.currentPage.set(mappedResponse.pagination.page);
          this.pageSize.set(mappedResponse.pagination.limit);
          this.totalItems.set(mappedResponse.pagination.total);
          this.totalPages.set(mappedResponse.pagination.totalPages);
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
          this.loadShops();
        },
      });
  }

  private mapShopsResponse(response: ShopsApiResponse | ShopApiItem[]): ShopsMappedResponse {
    const shops = Array.isArray(response)
      ? response
      : (response.items ?? response.shops ?? response.data ?? []);
    const mappedShops = shops.map((shop) => this.mapShop(shop));

    return {
      shops: mappedShops,
      pagination: this.mapPagination(response, mappedShops.length),
    };
  }

  private mapPagination(
    response: ShopsApiResponse | ShopApiItem[],
    fallbackTotal: number,
  ): ShopsPagination {
    if (Array.isArray(response)) {
      return {
        page: this.currentPage(),
        limit: this.pageSize(),
        total: response.length,
        totalPages: Math.max(1, Math.ceil(response.length / this.pageSize())),
      };
    }

    const page = Math.max(1, response.page ?? this.currentPage());
    const limit = Math.max(1, response.limit ?? this.pageSize());
    const total = Math.max(0, response.total ?? fallbackTotal);
    const totalPages = Math.max(1, response.totalPages ?? Math.ceil(total / limit));

    return {
      page,
      limit,
      total,
      totalPages,
    };
  }

  private mapShop(shop: ShopApiItem): ShopModel {
    return {
      id: String(shop.id ?? crypto.randomUUID()),
      name: shop.name || '',
      description: shop.description || '',
      url: shop.url || '',
      createdAt: shop.createdAt || '',
    };
  }

  private resolveUpdatedBadge(created: string): string {
    return created && created !== SHOPS_TEXTS.DEFAULT_UPDATED
      ? `Created: ${new Date(created).toISOString().split('T')[0]}`
      : '';
  }
}
