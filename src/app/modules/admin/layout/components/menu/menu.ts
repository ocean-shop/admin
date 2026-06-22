import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { ADMIN_MENU_ITEMS } from '../../constants/menu.constants';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  protected readonly layoutService = inject(LayoutService);
  protected readonly menuItems = ADMIN_MENU_ITEMS;
}
