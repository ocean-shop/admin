import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Button } from '@ui/button/button';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { EntityCard, EntityCardData } from '@ui/entity-card/entity-card';
import { Modal } from '@ui/modal/modal';
import { Pagination } from '@ui/pagination/pagination';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { ShopApiItem, ShopsApiResponse } from '../shop/models/shop.model';
import { ShopsService } from '../shop/services/shops.service';
import { Admin, AdminApiItem, AdminsApiResponse, AdminsPagination } from './models/admin.model';
import { AdminCreatePayload } from './models/admin-payload.model';
import { AdminModalMode, AdminModalModeEnum } from './models/admin-modal-mode.type';
import { AdminFormModal } from './components/admin-form-modal/admin-form-modal';
import { AdminsService } from './services/admins.service';
import {
  ADMINS_TEXTS,
  ADMINS_CREATE_ICON,
  ADMINS_PAGE_SIZE,
  ADMINS_ROLE_OPTIONS,
} from './constants/admins.constants';

@Component({
  selector: 'app-admins',
  imports: [Button, EntityCard, Pagination, Modal, AdminFormModal],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins implements OnInit {
  private readonly adminsService = inject(AdminsService);
  private readonly shopsService = inject(ShopsService);
  private readonly toasterService = inject(ToasterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly SHOPS_OPTIONS_PAGE_SIZE = 100;

  protected readonly title = ADMINS_TEXTS.PAGE_TITLE;
  protected readonly createAdminLabel = ADMINS_TEXTS.CREATE_LABEL;
  protected readonly createAdminIcon = ADMINS_CREATE_ICON;
  protected readonly emptyState = ADMINS_TEXTS.EMPTY_STATE;
  protected readonly paginationLabel = ADMINS_TEXTS.PAGINATION_LABEL;
  protected readonly roleOptions = ADMINS_ROLE_OPTIONS;
  protected readonly ADMINS_PAGE_SIZE = ADMINS_PAGE_SIZE;
  protected readonly deleteModalTitle = ADMINS_TEXTS.MODAL_DELETE_TITLE;
  protected readonly deleteModalConfirmLabel = ADMINS_TEXTS.MODAL_DELETE_CONFIRM_LABEL;
  protected readonly deleteModalMessage = ADMINS_TEXTS.MODAL_DELETE_MESSAGE;

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly isActionLoading = signal(false);
  protected readonly admins = signal<Admin[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(ADMINS_PAGE_SIZE);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly selectedAdmin = signal<Admin | null>(null);
  protected readonly shopOptions = signal<DropdownOption[]>([]);
  protected readonly modalMode = signal<AdminModalMode>(null);
  protected readonly hasAdmins = computed(() => this.admins().length > 0);
  protected readonly adminCards = computed(() =>
    this.admins().map((admin) => ({
      id: admin.id,
      title: admin.name,
      subtitle: admin.email,
      detail: admin.phone,
      badge: admin.role,
    })),
  );
  protected readonly isFormModalOpen = computed(() => {
    const mode = this.modalMode();
    return mode === AdminModalModeEnum.Create || mode === AdminModalModeEnum.Update;
  });
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === AdminModalModeEnum.Delete,
  );
  protected readonly formModalMode = computed(() => {
    const mode = this.modalMode();
    return mode === AdminModalModeEnum.Create || mode === AdminModalModeEnum.Update
      ? mode
      : AdminModalModeEnum.Create;
  });

  ngOnInit(): void {
    this.loadAdmins();
    this.loadShopOptions();
  }

  protected onCreateAdmin(): void {
    this.selectedAdmin.set(null);
    this.modalMode.set(AdminModalModeEnum.Create);
  }

  protected onEditAdmin(adminCard: EntityCardData): void {
    const selectedAdmin = this.admins().find((admin) => admin.id === adminCard.id);
    if (!selectedAdmin) {
      return;
    }

    this.selectedAdmin.set(selectedAdmin);
    this.modalMode.set(AdminModalModeEnum.Update);
  }

  protected onDeleteAdmin(adminCard: EntityCardData): void {
    const selectedAdmin = this.admins().find((admin) => admin.id === adminCard.id);
    if (!selectedAdmin) {
      return;
    }

    this.selectedAdmin.set(selectedAdmin);
    this.modalMode.set(AdminModalModeEnum.Delete);
  }

  protected onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadAdmins();
  }

  protected onCloseModal(): void {
    if (this.isActionLoading()) {
      return;
    }

    this.closeModal();
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedAdmin.set(null);
  }

  protected onConfirmFormModal(payload: AdminCreatePayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const mode = this.modalMode();
    if (mode === AdminModalModeEnum.Create) {
      this.executeMutation(
        this.adminsService.createAdmin(payload),
        ADMINS_TEXTS.CREATE_SUCCESS_TITLE,
      );
      return;
    }

    const selectedAdmin = this.selectedAdmin();
    if (mode === AdminModalModeEnum.Update && selectedAdmin) {
      this.executeMutation(
        this.adminsService.updateAdmin(selectedAdmin.id, payload),
        ADMINS_TEXTS.UPDATE_SUCCESS_TITLE,
      );
    }
  }

  protected onConfirmDelete(): void {
    const selectedAdmin = this.selectedAdmin();
    if (!selectedAdmin || this.isActionLoading()) {
      return;
    }

    this.executeMutation(
      this.adminsService.deleteAdmin(selectedAdmin.id),
      ADMINS_TEXTS.DELETE_SUCCESS_TITLE,
    );
  }

  private loadAdmins(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.adminsService
      .getAdmins({
        page: this.currentPage(),
        limit: this.pageSize(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          const mappedResponse = this.mapAdminsResponse(response);
          this.admins.set(mappedResponse.admins);
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
          this.loadAdmins();
        },
      });
  }

  private mapAdminsResponse(response: AdminsApiResponse | AdminApiItem[]): {
    admins: Admin[];
    pagination: AdminsPagination;
  } {
    const admins = Array.isArray(response)
      ? response
      : (response.items ?? response.admins ?? response.data ?? []);
    const mappedAdmins = admins.map((admin) => this.mapAdmin(admin));

    return {
      admins: mappedAdmins,
      pagination: this.mapPagination(response, mappedAdmins.length),
    };
  }

  private mapPagination(
    response: AdminsApiResponse | AdminApiItem[],
    fallbackTotal: number,
  ): AdminsPagination {
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

  private mapAdmin(admin: AdminApiItem): Admin {
    const mergedName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = admin.fullName ?? admin.name ?? mergedName;
    const resolvedPhone = admin.phone ?? admin.mobileNumber;
    const resolvedRole = typeof admin.role === 'string' ? admin.role : admin.role?.name;

    return {
      id: String(admin.id ?? crypto.randomUUID()),
      name: resolvedName || ADMINS_TEXTS.DEFAULT_NAME,
      email: admin.email || ADMINS_TEXTS.DEFAULT_EMAIL,
      phone: resolvedPhone || ADMINS_TEXTS.DEFAULT_PHONE,
      role: resolvedRole || ADMINS_TEXTS.DEFAULT_ROLE,
      shopIds: this.resolveAdminShopIds(admin),
    };
  }

  private loadShopOptions(): void {
    this.shopsService
      .getShops({
        page: 1,
        limit: this.SHOPS_OPTIONS_PAGE_SIZE,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((firstResponse) => {
          const firstPageItems = this.extractShopItems(firstResponse);
          const totalPages = Array.isArray(firstResponse)
            ? 1
            : Math.max(1, firstResponse.totalPages ?? 1);

          if (totalPages <= 1) {
            return of(firstPageItems);
          }

          const requests = Array.from({ length: totalPages - 1 }, (_, index) =>
            this.shopsService.getShops({
              page: index + 2,
              limit: this.SHOPS_OPTIONS_PAGE_SIZE,
            }),
          );

          return forkJoin(requests).pipe(
            map((responses) => {
              const nextPageItems = responses.flatMap((response) =>
                this.extractShopItems(response),
              );
              return [...firstPageItems, ...nextPageItems];
            }),
          );
        }),
        map((shops) => this.mapShopOptions(shops)),
      )
      .subscribe({
        next: (options) => {
          this.shopOptions.set(options);
        },
      });
  }

  private extractShopItems(response: ShopsApiResponse | ShopApiItem[]): ShopApiItem[] {
    return Array.isArray(response)
      ? response
      : (response.items ?? response.shops ?? response.data ?? []);
  }

  private mapShopOptions(shops: ShopApiItem[]): DropdownOption[] {
    const optionMap = new Map<string, DropdownOption>();

    shops.forEach((shop) => {
      const id = String(shop.id ?? '').trim();
      if (!id) {
        return;
      }

      const label = (shop.name ?? '').trim() || `Shop ${id}`;
      optionMap.set(id, { value: id, label });
    });

    return Array.from(optionMap.values()).sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }

  private resolveAdminShopIds(admin: AdminApiItem): string[] {
    const idsFromShopIds = (admin.shopIds ?? [])
      .map((shopId) => String(shopId).trim())
      .filter(Boolean);
    const idsFromShops = (admin.shops ?? [])
      .map((shop) => {
        if (typeof shop === 'string' || typeof shop === 'number') {
          return String(shop).trim();
        }

        return String(shop.id ?? '').trim();
      })
      .filter(Boolean);

    return Array.from(new Set([...idsFromShopIds, ...idsFromShops]));
  }
}
