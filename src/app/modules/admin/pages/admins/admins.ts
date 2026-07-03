import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Button } from '@ui/button/button';
import { Pagination } from '@ui/pagination/pagination';
import { UserCard } from '@ui/user-card/user-card';
import { Admin, AdminApiItem, AdminsApiResponse, AdminsPagination } from './models/admin.model';
import { AdminsService } from './services/admins.service';
import {
  ADMINS_CREATE_ICON,
  ADMINS_CREATE_LABEL,
  ADMINS_DEFAULT_EMAIL,
  ADMINS_DEFAULT_NAME,
  ADMINS_DEFAULT_PHONE,
  ADMINS_DEFAULT_ROLE,
  ADMINS_EMPTY_STATE,
  ADMINS_PAGE_SIZE,
  ADMINS_PAGE_TITLE,
  ADMINS_PAGINATION_LABEL,
} from './constants/admins.constants';

@Component({
  selector: 'app-admins',
  imports: [Button, UserCard, Pagination],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class Admins implements OnInit {
  private readonly adminsService = inject(AdminsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = ADMINS_PAGE_TITLE;
  protected readonly createAdminLabel = ADMINS_CREATE_LABEL;
  protected readonly createAdminIcon = ADMINS_CREATE_ICON;
  protected readonly emptyState = ADMINS_EMPTY_STATE;

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly admins = signal<Admin[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(ADMINS_PAGE_SIZE);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly lastAction = signal<string | null>(null);
  protected readonly paginationLabel = ADMINS_PAGINATION_LABEL;
  protected readonly hasAdmins = computed(() => this.admins().length > 0);

  ngOnInit(): void {
    this.loadAdmins();
  }

  protected onCreateAdmin(): void {
    this.lastAction.set('create');
  }

  protected onEditAdmin(admin: Admin): void {
    this.lastAction.set(`edit:${admin.id}`);
  }

  protected onDeleteAdmin(admin: Admin): void {
    this.lastAction.set(`delete:${admin.id}`);
  }

  protected onPageChange(page: number): void {
    if (page === this.currentPage() || page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadAdmins();
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
      name: resolvedName || ADMINS_DEFAULT_NAME,
      email: admin.email || ADMINS_DEFAULT_EMAIL,
      phone: resolvedPhone || ADMINS_DEFAULT_PHONE,
      role: resolvedRole || ADMINS_DEFAULT_ROLE,
    };
  }

  protected readonly ADMINS_PAGE_SIZE = ADMINS_PAGE_SIZE;
}
