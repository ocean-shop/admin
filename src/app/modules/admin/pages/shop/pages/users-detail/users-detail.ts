import { Component, computed, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { injectRouteParam } from '@core/helpers/route-param.helper';
import { Breadcrumbs } from '@ui/breadcrumbs/breadcrumbs';
import { InfoList } from '@ui/info-list/info-list';
import { PageHeader } from '@ui/page-header/page-header';
import { PageLayout } from '@ui/page-layout/page-layout';
import { SectionCard } from '@ui/section-card/section-card';
import { StateMessage } from '@ui/state-message/state-message';
import { Table } from '@ui/table/table';
import { SHOP_QUERY_KEYS } from '../../constants/shop-query-keys.constants';
import { buildShopSectionPageBreadcrumbs } from '../../helpers/shop-breadcrumbs.helper';
import {
  USER_OTP_TABLE_COLUMNS,
  USER_SESSION_TABLE_COLUMNS,
  USERS_SECTION_PATH,
  USERS_TEXTS,
} from '../users/constants/users.constants';
import {
  buildUserInfoRows,
  buildUserOtpRows,
  buildUserRoleRows,
  buildUserSessionRows,
} from '../users/helpers/user-mapping.helper';
import { UsersService } from '../users/services/users.service';

@Component({
  selector: 'app-users-detail',
  imports: [PageLayout, PageHeader, Breadcrumbs, StateMessage, SectionCard, InfoList, Table],
  templateUrl: './users-detail.html',
  styleUrl: './users-detail.scss',
})
export class UsersDetail {
  private readonly usersService = inject(UsersService);

  protected readonly textData = USERS_TEXTS;
  protected readonly otpColumns = USER_OTP_TABLE_COLUMNS;
  protected readonly sessionColumns = USER_SESSION_TABLE_COLUMNS;

  protected readonly shopId = injectRouteParam('shopId');
  protected readonly userId = injectRouteParam('userId');

  protected readonly breadcrumbItems = computed(() =>
    buildShopSectionPageBreadcrumbs(
      this.shopId(),
      USERS_SECTION_PATH,
      USERS_TEXTS.PAGE_TITLE,
      USERS_TEXTS.DETAILS_TITLE,
    ),
  );

  protected readonly userQuery = injectQuery(() => {
    const userId = this.userId();
    return {
      queryKey: userId ? SHOP_QUERY_KEYS.userById(userId) : SHOP_QUERY_KEYS.disabled('user'),
      enabled: Boolean(this.shopId() && userId),
      queryFn: () => lastValueFrom(this.usersService.getUserById(userId ?? '')),
    };
  });

  protected readonly isLoading = computed(
    () => this.userQuery.isPending() || this.userQuery.isFetching(),
  );
  protected readonly hasError = computed(() => this.userQuery.isError());
  protected readonly user = computed(() => this.userQuery.data() ?? null);
  protected readonly userInfoRows = computed(() => {
    const user = this.user();
    return user ? buildUserInfoRows(user) : [];
  });
  protected readonly otpRows = computed(() => buildUserOtpRows(this.user()));
  protected readonly sessionRows = computed(() => buildUserSessionRows(this.user()));
  protected readonly roleRows = computed(() => buildUserRoleRows(this.user()));
}
