import { Component, inject } from '@angular/core';
import { ToastType } from './models/toaster.type';
import {
  DEFAULT_TOAST_ICON,
  DEFAULT_TOAST_ICON_FILL,
  TOAST_ICONS,
  TOAST_ICON_FILLS,
} from './constants/toaster.constant';
import { ToasterService } from '@core/services/toaster/toaster.service';

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
  styleUrl: './toaster.scss',
})
export class Toaster {
  public readonly toasts = inject(ToasterService).toasts;

  public getIcon(type: ToastType): string {
    return TOAST_ICONS[type] ?? DEFAULT_TOAST_ICON;
  }

  public getIconFill(type: ToastType): string {
    return TOAST_ICON_FILLS[type] ?? DEFAULT_TOAST_ICON_FILL;
  }

  public close(id: string): void {
    this.toasterService.remove(id);
  }

  public handleAction(id: string, action?: () => void): void {
    if (action) {
      action();
    }
    this.close(id);
  }

  private readonly toasterService = inject(ToasterService);
}
