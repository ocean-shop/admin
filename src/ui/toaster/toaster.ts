import { Component, inject } from '@angular/core';
import { ToasterService } from './toaster.service';
import { ToastType } from './models/toaster.type';
import {
  DEFAULT_TOAST_ICON,
  DEFAULT_TOAST_ICON_FILL,
  TOAST_ICONS,
  TOAST_ICON_FILLS,
} from './constants/toaster.constant';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
  standalone: true,
})
export class Toaster {
  private toasterService = inject(ToasterService);

  toasts = this.toasterService.toasts;

  getIcon(type: ToastType): string {
    return TOAST_ICONS[type] ?? DEFAULT_TOAST_ICON;
  }

  getIconFill(type: ToastType): string {
    return TOAST_ICON_FILLS[type] ?? DEFAULT_TOAST_ICON_FILL;
  }

  close(id: string): void {
    this.toasterService.remove(id);
  }

  handleAction(id: string, action?: () => void): void {
    if (action) {
      action();
    }
    this.close(id);
  }
}
