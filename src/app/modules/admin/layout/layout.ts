import { Component, inject, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Menu } from './components/menu/menu';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, Header, Menu],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly layoutService = inject(LayoutService);

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        this.layoutService.setSidebarState(false);
      } else {
        this.layoutService.setSidebarState(true);
      }
    }
  }
}
