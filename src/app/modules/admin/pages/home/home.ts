import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '@core/services/auth/auth.service';
import { ShopOverviewCard } from '@ui/shop-overview-card/shop-overview-card';
import { StateMessage } from '@ui/state-message/state-message';
import { ADMINS_QUERY_KEYS } from '../admins/constants/admins-query-keys.constants';
import { AdminsService } from '../admins/services/admins.service';
import { HOME_TEXTS } from './constants/home.constants';
import { mapAdminShopsToCards } from './helpers/home-shop-cards.helper';

@Component({
  selector: 'app-home',
  imports: [ShopOverviewCard, StateMessage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly adminsService = inject(AdminsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly textData = HOME_TEXTS;

  private readonly userId = computed(() => this.authService.getUserId());

  protected readonly adminQuery = injectQuery(() => {
    const userId = this.userId();
    return {
      queryKey: userId ? ADMINS_QUERY_KEYS.byId(userId) : ADMINS_QUERY_KEYS.disabled,
      enabled: Boolean(userId),
      queryFn: () => lastValueFrom(this.adminsService.getAdminById(userId ?? '')),
    };
  });

  protected readonly cards = computed(() => mapAdminShopsToCards(this.adminQuery.data()));
  protected readonly isEmpty = computed(
    () => !this.adminQuery.isFetching() && !this.adminQuery.isError() && !this.cards().length,
  );

  protected onManageStore(shopId: string): void {
    void this.router.navigate([APP_ROUTES.ADMIN_SHOP, shopId]);
  }
}
