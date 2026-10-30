import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import {
  isPageChangeAllowed,
  resolveTotalItems,
  resolveTotalPages,
} from '@core/helpers/pagination/pagination.helper';
import { injectRouteParam } from '@core/helpers/route-param/route-param.helper';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { isDropdownOptionValue } from '@ui/dropdown/helpers/dropdown-option.helper';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { FilterActions } from '@ui/filter-actions/filter-actions';
import { FilterBar } from '@ui/filter-bar/filter-bar';
import { FilterDropdown } from '@ui/filter-dropdown/filter-dropdown';
import { FilterInput } from '@ui/filter-input/filter-input';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { Pagination } from '@ui/pagination/pagination';
import { StateMessage } from '@ui/state-message/state-message';
import { resolveTableRowId } from '@ui/table/helpers/table-row.helper';
import { TableRowData } from '@ui/table/models/table-column.model';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopPageBreadcrumbs } from '../../helpers/shop-breadcrumbs/shop-breadcrumbs.helper';
import {
  USERS_EMAIL_FILTER_ID,
  USERS_PAGE_SIZE,
  USERS_PHONE_FILTER_ID,
  USERS_SECTION_PATH,
  USERS_SHOW_ICON,
  USERS_SORT_ICON,
  USERS_SORT_OPTIONS,
  USERS_TABLE_COLUMNS,
  USERS_TEXTS,
} from './constants/users.constants';
import { mapUser, resolveUserSortOrder } from './helpers/user-mapping/user-mapping.helper';
import { User } from './models/user.model';
import { UserSortValue } from './models/user-sort-value.type';
import { UsersService } from './services/users/users.service';

@Component({
  selector: 'app-users',
  imports: [
    PageLayout,
    PageHeader,
    Breadcrumbs,
    StateMessage,
    FilterBar,
    FilterInput,
    FilterDropdown,
    FilterActions,
    Table,
    Pagination,
  ],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  protected readonly textData = USERS_TEXTS;
  protected readonly pageSize = USERS_PAGE_SIZE;
  protected readonly sortOptions = USERS_SORT_OPTIONS;
  protected readonly sortIcon = USERS_SORT_ICON;
  protected readonly showIcon = USERS_SHOW_ICON;
  protected readonly emailFilterId = USERS_EMAIL_FILTER_ID;
  protected readonly phoneFilterId = USERS_PHONE_FILTER_ID;
  protected readonly tableColumns = USERS_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly currentPage = linkedSignal({ source: this.shopId, computation: () => 1 });
  protected readonly selectedSort = signal<UserSortValue>('newest');
  protected readonly emailInput = signal('');
  protected readonly emailFilter = signal('');
  protected readonly phoneNumberInput = signal('');
  protected readonly phoneNumberFilter = signal('');

  protected readonly breadcrumbItems = computed(() =>
    buildShopPageBreadcrumbs(this.shopId(), USERS_TEXTS.PAGE_TITLE),
  );

  protected readonly usersQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const sort = this.selectedSort();
    const email = this.emailFilter();
    const phoneNumber = this.phoneNumberFilter();
    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.users(shopId, page, this.pageSize, sort, email, phoneNumber)
        : SHOP_QUERY_KEYS.disabled('users'),
      enabled: Boolean(shopId),
      queryFn: () =>
        lastValueFrom(
          this.usersService.getUsers({
            page,
            limit: this.pageSize,
            shopId: shopId ?? '',
            sortOrder: resolveUserSortOrder(sort),
            ...(email ? { email } : {}),
            ...(phoneNumber ? { phoneNumber } : {}),
          }),
        ),
    };
  });

  protected readonly isLoading = computed(
    () => this.usersQuery.isPending() || this.usersQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.usersQuery.isError());
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly isFilterDisabled = computed(
    () => !this.isShopContextReady() || this.isLoading(),
  );
  protected readonly totalItems = computed(() => resolveTotalItems(this.usersQuery.data()));
  protected readonly totalPages = computed(() => resolveTotalPages(this.usersQuery.data()));
  protected readonly users = computed<User[]>(() =>
    this.shopId() ? (this.usersQuery.data()?.items ?? []).map(mapUser) : [],
  );
  protected readonly userRows = computed<TableRowData[]>(() =>
    this.users().map(({ id, email, mobileNumber, isActive, createdAt }) => ({
      id,
      email,
      mobileNumber,
      isActive,
      createdAt,
    })),
  );

  protected onShowUser(row: TableRowData): void {
    const shopId = this.shopId();
    const userId = resolveTableRowId(row);
    if (shopId && userId) {
      this.router.navigate([APP_ROUTES.ADMIN_SHOP, shopId, USERS_SECTION_PATH, userId]);
    }
  }

  protected onSortSelected(option: DropdownOption): void {
    if (
      !isDropdownOptionValue<UserSortValue>(option.value, this.sortOptions) ||
      option.value === this.selectedSort()
    ) {
      return;
    }

    this.selectedSort.set(option.value);
    this.currentPage.set(1);
  }

  protected onApplyFilters(): void {
    const nextEmail = this.emailInput().trim();
    const nextPhoneNumber = this.phoneNumberInput().trim();
    if (nextEmail === this.emailFilter() && nextPhoneNumber === this.phoneNumberFilter()) {
      return;
    }

    this.emailFilter.set(nextEmail);
    this.phoneNumberFilter.set(nextPhoneNumber);
    this.currentPage.set(1);
  }

  protected onResetFilters(): void {
    this.emailInput.set('');
    this.phoneNumberInput.set('');
    if (!this.emailFilter() && !this.phoneNumberFilter()) {
      return;
    }

    this.emailFilter.set('');
    this.phoneNumberFilter.set('');
    this.currentPage.set(1);
  }

  protected onPageChange(page: number): void {
    if (isPageChangeAllowed(page, this.currentPage(), this.totalPages())) {
      this.currentPage.set(page);
    }
  }
}
