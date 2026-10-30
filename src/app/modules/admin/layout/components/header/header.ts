import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { AuthService } from '@core/services/auth/auth.service';
import { SimpleMenu } from '@ui/simple-menu/simple-menu';
import { SimpleMenuItem } from '@ui/simple-menu/models/simple-menu.type';
import { ACCOUNT_MENU_ITEMS, HEADER_TEXTS } from '../../constants/header.constants';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  imports: [SimpleMenu, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:click)': 'closeAccountMenu()',
  },
})
export class Header {
  protected readonly layoutService = inject(LayoutService);
  protected readonly accountMenuItems = ACCOUNT_MENU_ITEMS;
  protected readonly textData = HEADER_TEXTS;
  protected readonly adminRoute = APP_ROUTES.ADMIN;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isAccountMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.layoutService.toggleSidebar();
  }

  protected toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.isAccountMenuOpen.update((open) => !open);
  }

  protected onMenuItemSelected(item: SimpleMenuItem): void {
    this.isAccountMenuOpen.set(false);

    if (item.value === 'logout') {
      this.authService.logout();
    } else if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  protected closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }
}
