import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { buildShopBreadcrumb } from '../../constants/shop-breadcrumbs.constants';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { Pagination } from '@ui/pagination/pagination';
import { Table } from '@ui/table/table';
import { TableRowData } from '@ui/table/models/table-column.model';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import {
  USERS_EMAIL_FILTER_ID,
  USERS_PAGE_SIZE,
  USERS_PHONE_FILTER_ID,
  USERS_SORT_OPTIONS,
  USERS_TABLE_COLUMNS,
  USERS_TEXTS,
} from './constants/users.constants';
import { User, UserApiItem, UserListQueryParams } from './models/user.model';
import { UserSortValue } from './models/user-sort-value.type';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-users',
  imports: [Dropdown, Table, Pagination, Breadcrumbs],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly textData = USERS_TEXTS;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    { label: this.textData.PAGE_TITLE },
  ]);
  protected readonly pageSize = USERS_PAGE_SIZE;
  protected readonly sortOptions = USERS_SORT_OPTIONS;
  protected readonly emailFilterId = USERS_EMAIL_FILTER_ID;
  protected readonly phoneFilterId = USERS_PHONE_FILTER_ID;
  protected readonly tableColumns = USERS_TABLE_COLUMNS;

  protected readonly shopId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null,
  );
  protected readonly currentPage = signal(1);
  protected readonly selectedSort = signal<UserSortValue>('newest');
  protected readonly emailInput = signal('');
  protected readonly emailFilter = signal('');
  protected readonly phoneNumberInput = signal('');
  protected readonly phoneNumberFilter = signal('');

  protected readonly usersQuery = injectQuery(() => {
    const shopId = this.shopId();
    const page = this.currentPage();
    const sort = this.selectedSort();
    const query: UserListQueryParams = {
      page,
      limit: this.pageSize,
      shopId: shopId ?? '',
      sortOrder: this.resolveSortOrder(sort),
      ...(this.emailFilter() ? { email: this.emailFilter() } : {}),
      ...(this.phoneNumberFilter() ? { phoneNumber: this.phoneNumberFilter() } : {}),
    };

    return {
      queryKey: shopId
        ? SHOP_QUERY_KEYS.users(
            shopId,
            query.page,
            query.limit,
            sort,
            this.emailFilter(),
            this.phoneNumberFilter(),
          )
        : ['shop', 'users', 'missing-shop-id'],
      enabled: Boolean(shopId),
      queryFn: () => lastValueFrom(this.usersService.getUsers(query)),
    };
  });

  protected readonly isLoading = computed(
    () => this.usersQuery.isPending() || this.usersQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.usersQuery.isError());
  protected readonly isShopContextReady = computed(() => Boolean(this.shopId()));
  protected readonly totalItems = computed(() => Math.max(0, this.usersQuery.data()?.total ?? 0));
  protected readonly totalPages = computed(() =>
    Math.max(1, this.usersQuery.data()?.totalPages ?? 1),
  );
  protected readonly users = computed<User[]>(() => {
    const shopId = this.shopId();
    if (!shopId) {
      return [];
    }

    return (this.usersQuery.data()?.items ?? []).map((item) => this.mapUser(item));
  });
  protected readonly userRows = computed<TableRowData[]>(() =>
    this.users().map((user) => ({
      id: user.id,
      email: user.email,
      mobile_number: user.mobileNumber,
      is_active: user.isActive,
      created_at: user.createdAt,
    })),
  );

  ngOnInit(): void {
    this.watchShopId();
  }

  protected onShowUser(row: TableRowData): void {
    const shopId = this.shopId();
    const userId = this.resolveUserId(row);
    if (!shopId || !userId) {
      return;
    }

    this.router.navigate(['/admin/shop', shopId, 'users', userId]);
  }

  protected onEmailInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.emailInput.set(target?.value ?? '');
  }

  protected onPhoneNumberInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.phoneNumberInput.set(target?.value ?? '');
  }

  protected onSortSelected(option: DropdownOption): void {
    if (!this.isValidSortValue(option.value) || option.value === this.selectedSort()) {
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
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
  }

  private watchShopId(): void {
    this.shopId.set(this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null);
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

  private mapUser(user: UserApiItem): User {
    return {
      id: user.id?.trim() || crypto.randomUUID(),
      email: user.email?.trim() || '—',
      mobileNumber: this.resolveMobileNumber(user),
      isActive: this.resolveIsActiveLabel(user),
      createdAt: this.resolveDateLabel(user.createdAt ?? user.created_at),
    };
  }

  private resolveSortOrder(sort: UserSortValue): 'asc' | 'desc' {
    return sort === 'older' ? 'asc' : 'desc';
  }

  private resolveMobileNumber(user: UserApiItem): string {
    const value = user.mobileNumber ?? user.mobile_number ?? user.phoneNumber;
    if (typeof value !== 'string') {
      return '—';
    }

    const normalized = value.trim();
    return normalized || '—';
  }

  private resolveIsActiveLabel(user: UserApiItem): string {
    const value = user.isActive ?? user.is_active;
    if (typeof value !== 'boolean') {
      return '—';
    }

    return value ? 'true' : 'false';
  }

  private resolveDateLabel(value: string | null | undefined): string {
    if (!value?.trim()) {
      return '—';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value.trim();
    }

    return parsed.toLocaleString();
  }

  private resolveUserId(row: TableRowData): string | null {
    const rowId = row['id'];
    if (typeof rowId === 'string') {
      const normalized = rowId.trim();
      return normalized || null;
    }

    if (typeof rowId === 'number') {
      return String(rowId);
    }

    return null;
  }

  private isValidSortValue(value: string): value is UserSortValue {
    return value === 'newest' || value === 'older';
  }
}
