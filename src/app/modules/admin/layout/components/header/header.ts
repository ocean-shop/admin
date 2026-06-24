import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { SimpleMenu } from '@ui/simple-menu/simple-menu';
import { SimpleMenuItem } from '@ui/simple-menu/models/simple-menu.type';
import { ACCOUNT_MENU_ITEMS } from '../../constants/header.constants';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  imports: [SimpleMenu],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly layoutService = inject(LayoutService);
  protected readonly accountMenuItems = ACCOUNT_MENU_ITEMS;

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
      this.router.navigate(['/login']);
    } else if (item.link) {
      this.router.navigate([item.link]);
    }
  }

  @HostListener('document:click')
  protected closeAccountMenu(): void {
    this.isAccountMenuOpen.set(false);
  }
}
