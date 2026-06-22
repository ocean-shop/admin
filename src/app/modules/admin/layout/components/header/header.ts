import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly layoutService = inject(LayoutService);

  protected toggleMenu(): void {
    this.layoutService.toggleSidebar();
  }
}
