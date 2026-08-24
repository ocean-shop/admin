import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom, map } from 'rxjs';
import { DASHBOARD_BREADCRUMB } from '@ui/breadcrumbs/constants/breadcrumbs.constants';
import { BreadcrumbItem } from '@ui/breadcrumbs/models/breadcrumb-item.model';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { Table } from '@ui/table/table';
import { TableRowData } from '@ui/table/models/table-column.model';
import {
  buildShopBreadcrumb,
  buildShopSectionBreadcrumb,
} from '../../constants/shop-breadcrumbs.constants';
import { USER_OTP_COLUMNS, USER_SESSION_COLUMNS } from '../../constants/user.constants';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { DetailInfoRow } from '../../models/detail-info-row.model';
import { USERS_TEXTS } from '../users/constants/users.constants';
import {
  UserApiItem,
  UserOtpApiItem,
  UserRoleApiItem,
  UserSessionApiItem,
} from '../users/models/user.model';
import { UsersService } from '../users/services/users.service';

@Component({
  selector: 'app-users-detail',
  imports: [Table, Breadcrumbs],
  templateUrl: './users-detail.html',
  styleUrl: './users-detail.scss',
})
export class UsersDetail implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly textData = USERS_TEXTS;
  protected readonly otpColumns = USER_OTP_COLUMNS;
  protected readonly sessionColumns = USER_SESSION_COLUMNS;
  protected readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    DASHBOARD_BREADCRUMB,
    buildShopBreadcrumb(this.shopId()),
    buildShopSectionBreadcrumb(this.shopId(), 'users', this.textData.PAGE_TITLE),
    { label: this.textData.DETAILS_TITLE },
  ]);

  protected readonly shopId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null,
  );
  protected readonly userId = signal<string | null>(
    this.activatedRoute.snapshot?.paramMap?.get('userId') ?? null,
  );

  protected readonly userQuery = injectQuery(() => {
    const userId = this.userId();
    return {
      queryKey: userId ? SHOP_QUERY_KEYS.userById(userId) : ['shop', 'users', 'missing-user-id'],
      enabled: Boolean(this.shopId() && userId),
      queryFn: () => lastValueFrom(this.usersService.getUserById(userId ?? '')),
    };
  });

  protected readonly isLoading = computed(
    () => this.userQuery.isPending() || this.userQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.userQuery.isError());
  protected readonly user = computed(() => this.userQuery.data() ?? null);
  protected readonly userInfoRows = computed<DetailInfoRow[]>(() => {
    const user = this.user();
    if (!user) {
      return [];
    }

    return [
      { label: 'email', value: user.email?.trim() || '—' },
      { label: 'mobile_number', value: this.resolveMobileNumber(user) },
      { label: 'is_active', value: this.resolveIsActiveLabel(user) },
      { label: 'created_at', value: this.resolveDateLabel(user.createdAt ?? user.created_at) },
    ];
  });
  protected readonly otpRows = computed<TableRowData[]>(() =>
    this.resolveOtps(this.user()).map((otp) => ({
      channel: this.resolveStringValue(otp.channel),
      purpose: this.resolveStringValue(otp.purpose),
      attempts: this.resolveNumberValue(otp.attempts),
    })),
  );
  protected readonly sessionRows = computed<TableRowData[]>(() =>
    this.resolveSessions(this.user()).map((session) => ({
      user_agent: this.resolveStringValue(session.userAgent ?? session.user_agent),
      ip_address: this.resolveStringValue(session.ipAddress ?? session.ip_address),
      device_name: this.resolveStringValue(session.deviceName ?? session.device_name),
    })),
  );
  protected readonly roleRows = computed<DetailInfoRow[]>(() => this.resolveRoleRows(this.user()));

  ngOnInit(): void {
    this.watchRouteContext();
  }

  private watchRouteContext(): void {
    this.shopId.set(this.activatedRoute.snapshot?.paramMap?.get('shopId') ?? null);
    this.userId.set(this.activatedRoute.snapshot?.paramMap?.get('userId') ?? null);

    this.activatedRoute.paramMap
      .pipe(
        map((params) => ({
          shopId: params.get('shopId'),
          userId: params.get('userId'),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ shopId, userId }) => {
        this.shopId.set(shopId);
        this.userId.set(userId);
      });
  }

  private resolveOtps(user: UserApiItem | null): UserOtpApiItem[] {
    if (!user || !Array.isArray(user.otps)) {
      return [];
    }

    return user.otps;
  }

  private resolveSessions(user: UserApiItem | null): UserSessionApiItem[] {
    if (!user || !Array.isArray(user.sessions)) {
      return [];
    }

    return user.sessions;
  }

  private resolveRoleRows(user: UserApiItem | null): DetailInfoRow[] {
    if (!user?.role) {
      return [];
    }

    if (typeof user.role === 'string') {
      return [{ label: 'value', value: this.resolveStringValue(user.role) }];
    }

    return Object.entries(user.role as UserRoleApiItem)
      .filter(([key]) => key !== 'id')
      .map(([key, value]) => ({
        label: key,
        value: this.stringifyValue(value),
      }));
  }

  private resolveMobileNumber(user: UserApiItem): string {
    const value = user.mobileNumber ?? user.mobile_number ?? user.phoneNumber;
    return this.resolveStringValue(value);
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

  private resolveStringValue(value: unknown): string {
    if (typeof value !== 'string') {
      return '—';
    }

    const normalized = value.trim();
    return normalized || '—';
  }

  private resolveNumberValue(value: unknown): string {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return '—';
  }

  private stringifyValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }

    if (typeof value === 'string') {
      return this.resolveStringValue(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
}
