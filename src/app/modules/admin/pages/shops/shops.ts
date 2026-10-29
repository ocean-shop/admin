import { Component, computed, inject, signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Button } from '@ui/button/button';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { EntityCard } from '@ui/entity-card/entity-card';
import { EntityCardData } from '@ui/entity-card/models/entity-card.model';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { ShopsFormModal } from './components/shops-form-modal/shops-form-modal';
import { SHOPS_QUERY_KEYS } from './constants/shops-query-keys.constants';
import {
  SHOPS_CARD_ICON,
  SHOPS_CREATE_ICON,
  SHOPS_PAGE_SIZE,
  SHOPS_TEXTS,
} from './constants/shops.constants';
import { mapShopsResponse, mapShopToCard } from './helpers/shop-mapping.helper';
import { ShopFormModalMode } from './models/shop-form-modal-mode.type';
import { ShopModalMode, ShopModalModeEnum } from './models/shop-modal-mode.type';
import { Shop } from './models/shop.model';
import { ShopCreatePayload } from './models/shop-payload.model';
import { ShopUpdateVariables } from './models/shop-update-variables.model';
import { ShopsService } from './services/shops.service';

@Component({
  selector: 'app-shops',
  imports: [
    PageLayout,
    PageHeader,
    Button,
    StateMessage,
    EntityCard,
    Pagination,
    ShopsFormModal,
    ConfirmModal,
  ],
  templateUrl: './shops.html',
  styleUrl: './shops.scss',
})
export class Shops {
  private readonly shopsService = inject(ShopsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = SHOPS_TEXTS;
  protected readonly createShopIcon = SHOPS_CREATE_ICON;
  protected readonly cardIcon = SHOPS_CARD_ICON;
  protected readonly pageSize = SHOPS_PAGE_SIZE;

  protected readonly currentPage = signal(1);
  protected readonly selectedShop = signal<Shop | null>(null);
  protected readonly modalMode = signal<ShopModalMode>(null);

  protected readonly shopsQuery = injectQuery(() => {
    const query = { page: this.currentPage(), limit: this.pageSize };
    return {
      queryKey: SHOPS_QUERY_KEYS.list(query.page, query.limit),
      queryFn: () =>
        lastValueFrom(
          this.shopsService
            .getShops(query)
            .pipe(map((response) => mapShopsResponse(response, query))),
        ),
    };
  });

  private readonly createShopMutation = injectMutation(() => ({
    mutationFn: (payload: ShopCreatePayload) =>
      lastValueFrom(this.shopsService.createShop(payload)),
  }));

  private readonly updateShopMutation = injectMutation(() => ({
    mutationFn: ({ id, payload }: ShopUpdateVariables) =>
      lastValueFrom(this.shopsService.updateShop(id, payload)),
  }));

  private readonly deleteShopMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.shopsService.deleteShop(id)),
  }));

  protected readonly shops = computed(() => this.shopsQuery.data()?.items ?? []);
  protected readonly shopCards = computed(() => this.shops().map(mapShopToCard));
  protected readonly isEmpty = computed(() => this.shopsQuery.isSuccess() && !this.shops().length);
  protected readonly totalItems = computed(() => resolveTotalItems(this.shopsQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.shopsQuery.data()));
  protected readonly hasPagination = computed(() => this.totalItems() > this.pageSize);
  protected readonly isActionLoading = computed(
    () =>
      this.createShopMutation.isPending() ||
      this.updateShopMutation.isPending() ||
      this.deleteShopMutation.isPending(),
  );
  protected readonly isFormModalOpen = computed(
    () =>
      this.modalMode() === ShopModalModeEnum.Create ||
      this.modalMode() === ShopModalModeEnum.Update,
  );
  protected readonly formModalMode = computed<ShopFormModalMode>(() =>
    this.modalMode() === ShopModalModeEnum.Update
      ? ShopModalModeEnum.Update
      : ShopModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === ShopModalModeEnum.Delete,
  );
  protected readonly selectedShopName = computed(() => this.selectedShop()?.name ?? '');

  protected onCreateShop(): void {
    this.openModal(ShopModalModeEnum.Create, null);
  }

  protected onEditShop(card: EntityCardData): void {
    this.openModalForCard(ShopModalModeEnum.Update, card);
  }

  protected onDeleteShop(card: EntityCardData): void {
    this.openModalForCard(ShopModalModeEnum.Delete, card);
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

  protected onConfirmFormModal(payload: ShopCreatePayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const selectedShop = this.selectedShop();
    if (this.modalMode() === ShopModalModeEnum.Update && selectedShop) {
      this.updateShopMutation.mutate(
        { id: selectedShop.id, payload },
        { onSuccess: () => this.onMutationSuccess(SHOPS_TEXTS.UPDATE_SUCCESS_TITLE) },
      );
      return;
    }

    if (this.modalMode() === ShopModalModeEnum.Create) {
      this.createShopMutation.mutate(payload, {
        onSuccess: () => this.onMutationSuccess(SHOPS_TEXTS.CREATE_SUCCESS_TITLE),
      });
    }
  }

  protected onConfirmDelete(): void {
    const selectedShop = this.selectedShop();
    if (!selectedShop || this.isActionLoading()) {
      return;
    }

    this.deleteShopMutation.mutate(selectedShop.id, {
      onSuccess: () => {
        if (this.shops().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
        }
        this.onMutationSuccess(SHOPS_TEXTS.DELETE_SUCCESS_TITLE);
      },
    });
  }

  private onMutationSuccess(successTitle: string): void {
    this.toasterService.success(successTitle);
    this.closeModal();
    void this.queryClient.invalidateQueries({ queryKey: SHOPS_QUERY_KEYS.scope });
  }

  private openModalForCard(mode: ShopModalModeEnum, card: EntityCardData): void {
    const shop = this.shops().find((item) => item.id === card.id);
    if (shop) {
      this.openModal(mode, shop);
    }
  }

  private openModal(mode: ShopModalModeEnum, shop: Shop | null): void {
    this.selectedShop.set(shop);
    this.modalMode.set(mode);
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedShop.set(null);
  }
}
