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
} from '@core/helpers/pagination/pagination.helper';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { Button } from '@ui/button/button';
import { ConfirmModal } from '@ui/confirm-modal/confirm-modal';
import { EntityCard } from '@ui/entity-card/entity-card';
import { EntityCardData } from '@ui/entity-card/models/entity-card.model';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { SHOPS_QUERY_KEYS } from '../shops/constants/shops-query-keys.constants';
import { SHOPS_ALL_PAGE_SIZE } from '../shops/constants/shops.constants';
import { mapShopOptions } from '../shops/helpers/shop-mapping.helper';
import { ShopsService } from '../shops/services/shops.service';
import { AdminFormModal } from './components/admin-form-modal/admin-form-modal';
import { ADMINS_QUERY_KEYS } from './constants/admins-query-keys.constants';
import {
  ADMINS_CARD_ICON,
  ADMINS_CREATE_ICON,
  ADMINS_PAGE_SIZE,
  ADMINS_ROLE_OPTIONS,
  ADMINS_TEXTS,
} from './constants/admins.constants';
import { mapAdminsResponse, mapAdminToCard } from './helpers/admin-mapping.helper';
import { AdminFormModalMode } from './models/admin-form-modal-mode.type';
import { AdminModalMode, AdminModalModeEnum } from './models/admin-modal-mode.type';
import { Admin } from './models/admin.model';
import { AdminCreatePayload } from './models/admin-payload.model';
import { AdminUpdateVariables } from './models/admin-update-variables.model';
import { AdminsService } from './services/admins.service';

@Component({
  selector: 'app-admins',
  imports: [
    PageLayout,
    PageHeader,
    Button,
    StateMessage,
    EntityCard,
    Pagination,
    AdminFormModal,
    ConfirmModal,
  ],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins {
  private readonly adminsService = inject(AdminsService);
  private readonly shopsService = inject(ShopsService);
  private readonly toasterService = inject(ToasterService);
  private readonly queryClient = injectQueryClient();

  protected readonly textData = ADMINS_TEXTS;
  protected readonly createAdminIcon = ADMINS_CREATE_ICON;
  protected readonly cardIcon = ADMINS_CARD_ICON;
  protected readonly roleOptions = ADMINS_ROLE_OPTIONS;
  protected readonly pageSize = ADMINS_PAGE_SIZE;

  protected readonly currentPage = signal(1);
  protected readonly selectedAdmin = signal<Admin | null>(null);
  protected readonly modalMode = signal<AdminModalMode>(null);

  protected readonly adminsQuery = injectQuery(() => {
    const query = { page: this.currentPage(), limit: this.pageSize };
    return {
      queryKey: ADMINS_QUERY_KEYS.list(query.page, query.limit),
      queryFn: () =>
        lastValueFrom(
          this.adminsService
            .getAdmins(query)
            .pipe(map((response) => mapAdminsResponse(response, query))),
        ),
    };
  });

  private readonly shopsQuery = injectQuery(() => ({
    queryKey: SHOPS_QUERY_KEYS.all,
    queryFn: () => lastValueFrom(this.shopsService.getAllShops(SHOPS_ALL_PAGE_SIZE)),
  }));

  private readonly createAdminMutation = injectMutation(() => ({
    mutationFn: (payload: AdminCreatePayload) =>
      lastValueFrom(this.adminsService.createAdmin(payload)),
  }));

  private readonly updateAdminMutation = injectMutation(() => ({
    mutationFn: ({ id, payload }: AdminUpdateVariables) =>
      lastValueFrom(this.adminsService.updateAdmin(id, payload)),
  }));

  private readonly deleteAdminMutation = injectMutation(() => ({
    mutationFn: (id: string) => lastValueFrom(this.adminsService.deleteAdmin(id)),
  }));

  protected readonly admins = computed(() => this.adminsQuery.data()?.items ?? []);
  protected readonly adminCards = computed(() => this.admins().map(mapAdminToCard));
  protected readonly shopOptions = computed(() => mapShopOptions(this.shopsQuery.data() ?? []));
  protected readonly isEmpty = computed(
    () => this.adminsQuery.isSuccess() && !this.admins().length,
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.adminsQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.adminsQuery.data()));
  protected readonly hasPagination = computed(() => this.totalItems() > this.pageSize);
  protected readonly isActionLoading = computed(
    () =>
      this.createAdminMutation.isPending() ||
      this.updateAdminMutation.isPending() ||
      this.deleteAdminMutation.isPending(),
  );
  protected readonly isFormModalOpen = computed(
    () =>
      this.modalMode() === AdminModalModeEnum.Create ||
      this.modalMode() === AdminModalModeEnum.Update,
  );
  protected readonly formModalMode = computed<AdminFormModalMode>(() =>
    this.modalMode() === AdminModalModeEnum.Update
      ? AdminModalModeEnum.Update
      : AdminModalModeEnum.Create,
  );
  protected readonly isDeleteModalOpen = computed(
    () => this.modalMode() === AdminModalModeEnum.Delete,
  );
  protected readonly selectedAdminName = computed(() => {
    const admin = this.selectedAdmin();
    return admin ? mapAdminToCard(admin).title : '';
  });

  protected onCreateAdmin(): void {
    this.openModal(AdminModalModeEnum.Create, null);
  }

  protected onEditAdmin(card: EntityCardData): void {
    this.openModalForCard(AdminModalModeEnum.Update, card);
  }

  protected onDeleteAdmin(card: EntityCardData): void {
    this.openModalForCard(AdminModalModeEnum.Delete, card);
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

  protected onConfirmFormModal(payload: AdminCreatePayload): void {
    if (this.isActionLoading()) {
      return;
    }

    const selectedAdmin = this.selectedAdmin();
    if (this.modalMode() === AdminModalModeEnum.Update && selectedAdmin) {
      this.updateAdminMutation.mutate(
        { id: selectedAdmin.id, payload },
        { onSuccess: () => this.onMutationSuccess(ADMINS_TEXTS.UPDATE_SUCCESS_TITLE) },
      );
      return;
    }

    if (this.modalMode() === AdminModalModeEnum.Create) {
      this.createAdminMutation.mutate(payload, {
        onSuccess: () => this.onMutationSuccess(ADMINS_TEXTS.CREATE_SUCCESS_TITLE),
      });
    }
  }

  protected onConfirmDelete(): void {
    const selectedAdmin = this.selectedAdmin();
    if (!selectedAdmin || this.isActionLoading()) {
      return;
    }

    this.deleteAdminMutation.mutate(selectedAdmin.id, {
      onSuccess: () => {
        if (this.admins().length === 1 && this.currentPage() > 1) {
          this.currentPage.update((page) => page - 1);
        }
        this.onMutationSuccess(ADMINS_TEXTS.DELETE_SUCCESS_TITLE);
      },
    });
  }

  private onMutationSuccess(successTitle: string): void {
    this.toasterService.success(successTitle);
    this.closeModal();
    void this.queryClient.invalidateQueries({ queryKey: ADMINS_QUERY_KEYS.scope });
  }

  private openModalForCard(mode: AdminModalModeEnum, card: EntityCardData): void {
    const admin = this.admins().find((item) => item.id === card.id);
    if (admin) {
      this.openModal(mode, admin);
    }
  }

  private openModal(mode: AdminModalModeEnum, admin: Admin | null): void {
    this.selectedAdmin.set(admin);
    this.modalMode.set(mode);
  }

  private closeModal(): void {
    this.modalMode.set(null);
    this.selectedAdmin.set(null);
  }
}
