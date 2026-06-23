import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  readonly isSidebarOpen = signal<boolean>(true);

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
  }

  setSidebarState(isOpen: boolean): void {
    this.isSidebarOpen.set(isOpen);
  }
}
