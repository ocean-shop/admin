import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Menu } from './components/menu/menu';
import { isCompactScreen } from './helpers/viewport/viewport.helper';
import { LayoutService } from './services/layout/layout.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Header, Menu],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class Layout {
  protected readonly layoutService = inject(LayoutService);

  protected onResize(): void {
    this.layoutService.setSidebarState(!isCompactScreen());
  }
}
