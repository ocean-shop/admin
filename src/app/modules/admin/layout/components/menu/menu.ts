import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import {
  ADMIN_MENU_FOOTER_ITEMS,
  ADMIN_MENU_ITEMS,
  ADMIN_PRIMARY_ROUTES,
  MENU_LOGOUT_ACTION,
} from '../../constants/menu.constants';
import {
  extractShopIdFromUrl,
  isShopRootRoute,
  resolveShopMenuItems,
  stripUrlQueryAndHash,
} from '../../helpers/menu-url/menu-url.helper';
import { isCompactScreen } from '../../helpers/viewport/viewport.helper';
import { MenuFooterItem } from '../../models/menu.model';
import { LayoutService } from '../../services/layout/layout.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly layoutService = inject(LayoutService);
  protected readonly menuFooterItems = ADMIN_MENU_FOOTER_ITEMS;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => stripUrlQueryAndHash(this.router.url)),
    ),
    { initialValue: stripUrlQueryAndHash(this.router.url) },
  );

  protected readonly isAdminHome = computed(() => ADMIN_PRIMARY_ROUTES.includes(this.currentUrl()));
  protected readonly resolvedMenuItems = computed(() =>
    resolveShopMenuItems(ADMIN_MENU_ITEMS, extractShopIdFromUrl(this.currentUrl())),
  );

  protected onFooterItemClick(item: MenuFooterItem): void {
    this.closeSidebarOnCompactScreens();

    if (item.value === MENU_LOGOUT_ACTION) {
      this.authService.logout();
      return;
    }

    if (item.route) {
      void this.router.navigate([item.route]);
    }
  }

  protected useExactMatch(route: string): boolean {
    return isShopRootRoute(route);
  }

  protected onMenuItemClick(): void {
    this.closeSidebarOnCompactScreens();
  }

  private closeSidebarOnCompactScreens(): void {
    if (isCompactScreen()) {
      this.layoutService.setSidebarState(false);
    }
  }
}
