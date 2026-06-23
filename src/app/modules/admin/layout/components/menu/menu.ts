import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { LayoutService } from '../../services/layout.service';
import {
  ADMIN_HOME_ROUTE,
  ADMIN_MENU_FOOTER_ITEMS,
  ADMIN_MENU_ITEMS,
} from '../../constants/menu.constants';
import { MenuFooterItem } from '../../models/menu.model';

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
  protected readonly adminHomeRoute = ADMIN_HOME_ROUTE;
  protected readonly menuItems = ADMIN_MENU_ITEMS;
  protected readonly menuFooterItems = ADMIN_MENU_FOOTER_ITEMS;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.normalizeUrl(this.router.url)),
      startWith(this.normalizeUrl(this.router.url)),
    ),
    { initialValue: this.normalizeUrl(this.router.url) },
  );

  protected readonly isAdminHome = computed(() => this.currentUrl() === ADMIN_HOME_ROUTE);

  protected onFooterItemClick(item: MenuFooterItem): void {
    if (item.value === 'logout') {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }
}
